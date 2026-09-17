import express, { NextFunction, type Request, type Response } from 'express';
import { config } from './config.js';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from './errors.js';
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUser, deleteAllUsers, getUserByEmail, updateUserCredentials, upgradeUserToChirpyRed } from './db/queries/users.js';
import { createChirp, deleteChirpById, getChirps, getChirpById } from './db/queries/chirps.js';
import { User } from "./db/schema.js"
import { checkPasswordHash, getAPIKey, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from './auth.js';
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from './db/queries/refreshTokens.js';

const app = express();

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);


function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });

    next();
}

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++;
    next();
}

function handlerHealthz(req: Request, res: Response) {
    res.set({
        "Content-Type": "text/plain; charset=utf-8"
    });
    res.send("OK");
}

function handlerMetrics(req: Request, res: Response) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.fileserverHits} times!</p>
            </body>
        </html>
        `);
}

async function handlerReset(req: Request, res: Response, next: NextFunction) {
    try {
        if (config.platform !== "dev") {
                throw new ForbiddenError("Forbidden");
        }

        config.fileserverHits = 0;
        await deleteAllUsers();

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.send("OK");
    } catch (err) {
        next(err);
    }
}

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof UnauthorizedError) {
        res.status(401).json({ error: err.message });
        return;
    }

    if (err instanceof ForbiddenError) {
        res.status(403).json({ error: err.message });
        return;
    }

    if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
    }

    console.log(err.message);
    res.status(500).json({ error: "Something went wrong on our end" });
}

export type UserResponse = Omit<User, "hashedPassword">;

async function handlerCreateUser(req: Request, res: Response, next: NextFunction) {
    try {
        type Parameters = {
            email: string;
            password: string;
        }

        const params: Parameters = req.body;

        if (!params || typeof params.email !== "string" || typeof params.password !== "string") {
            throw new BadRequestError("Invalid email or password");
        }

        const hashedPassword = await hashPassword(params.password);

        const newUser = await createUser({
            email: params.email,
            hashedPassword,
        });

        if (!newUser) {
            throw new BadRequestError("User already exists");
        }

        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            isChirpyRed: newUser.isChirpyRed,
        })
    } catch (err) {
        next(err);
    }
}

async function handlerCreateChirps(req: Request, res: Response, next: NextFunction) {
    try {
        const token = getBearerToken(req);
        
        let userId: string;
        try {
            userId = validateJWT(token, config.jwtSecret);
        } catch (err) {
            throw new UnauthorizedError("Unauthorized");
        }

        type Parameters = {
            body: string;
        }

        const params: Parameters = req.body;

        if (!params || typeof params.body !== "string") {
          throw new BadRequestError("Invalid request body");
        }

        if (params.body.length > 140) {
            throw new BadRequestError("Chirp is too long. Max length is 140");
        }

        const badWords = ["kerfuffle", "sharbert", "fornax"];
        const cleanedWords = params.body.split(" ").map((word) => {
            if (badWords.includes(word.toLowerCase())) {
                return "****";
            }
            return word;
        });

        const cleanedBody = cleanedWords.join(" ");

        const chirp = await createChirp({
            body: cleanedBody,
            userId
        });
        
        res.status(201).json({
            id: chirp.id,
            createdAt: chirp.createdAt,
            updatedAt: chirp.updatedAt,
            body: chirp.body,
            userId: chirp.userId
        });
    } catch (err) {
        next(err);
    }
}

async function handlerGetChirps(req: Request, res: Response, next: NextFunction) {
    try {
        let authorId: string | undefined = undefined;
        const authorIdQuery = req.query.authorId;

        if (typeof authorIdQuery === "string") {
            authorId = authorIdQuery;
        }

        let sortOrder: "asc" | "desc" = "asc";
        const sortQuery = req.query.sort;

        if (typeof sortQuery === "string" && sortQuery.toLocaleLowerCase() === "desc") {
            sortOrder = "desc";
        }

        const chirpsList = await getChirps(authorId, sortOrder);

        const formattedChirps = chirpsList.map((chirp) => ({
            id: chirp.id,
            createdAt: chirp.createdAt,
            updatedAt: chirp.updatedAt,
            body: chirp.body,
            userId: chirp.userId,
        }));

        res.status(200).json(formattedChirps);
    } catch (err) {
        next(err);
    }
}

async function handlerGetChirpById(req: Request, res: Response, next: NextFunction) {
    try {
        const chirpId = Array.isArray(req.params.chirpId) ? req.params.chirpId[0] : req.params.chirpId;

        const chirp = await getChirpById(chirpId);

        if (!chirp) {
            throw new NotFoundError("Chirp not found");
        }

        res.status(200).json({
            id: chirp.id,
            createdAt: chirp.createdAt,
            updatedAt: chirp.updatedAt,
            body: chirp.body,
            userId: chirp.userId
        });
    } catch (err) {
        next(err);
    }
}

async function handlerLogin(req: Request, res: Response, next: NextFunction) {
    try{
        type Parameters = {
            email: string;
            password: string;
            expiresInSeconds?: number;
        }

        const params: Parameters = req.body;

        if (!params || typeof params.email !== "string" || typeof params.password !== "string") {
            throw new UnauthorizedError("incorrect email or password");
        }

        const user = await getUserByEmail(params.email);
        if (!user) {
            throw new UnauthorizedError("incorrect email of password")
        }

        const isValidPassword = await checkPasswordHash(params.password, user.hashedPassword);
        if (!isValidPassword) {
            throw new UnauthorizedError("incorrect email or password")
        }

        const accessTokenSeconds = 3600;
        const accessToken = makeJWT(user.id, accessTokenSeconds, config.jwtSecret);

        const refreshTokenString = makeRefreshToken();
        const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + sixtyDaysInMs);


        await createRefreshToken({
            token: refreshTokenString,
            userId: user.id,
            expiresAt,
        })

        res.status(200).json({
            id: user.id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            email: user.email,
            isChirpyRed: user.isChirpyRed,
            token: accessToken,
            refreshToken: refreshTokenString,
        });
    } catch (err) {
        next(err);
    }
}

async function handlerRefresh(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshTokenString = getBearerToken(req);
        const tokenRecord = await getRefreshToken(refreshTokenString);

        if (!tokenRecord) {
            throw new UnauthorizedError("Refresh token not found");
        }

        if (tokenRecord.revokedAt) {
            throw new UnauthorizedError("Refresh token has been revoked");
        }

        if (tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedError("Refresh token has expired");
        }

        const accessToken = makeJWT(tokenRecord.userId, 3600, config.jwtSecret);

        res.status(200).json({
            token: accessToken,
        });
    } catch (err) {
        next(err);
    }
}

async function handlerRevoke(req: Request, res: Response, next: NextFunction) {
    try {
        const refreshTokenString = getBearerToken(req);
        await revokeRefreshToken(refreshTokenString);

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

async function handlerUpdateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const token = getBearerToken(req);

        let userId: string;
        try {
            userId = validateJWT(token, config.jwtSecret);
        } catch (err) {
            throw new UnauthorizedError("Unauthorized");
        }

        type Parameters = {
            email: string;
            password: string;
        }

        const params: Parameters = req.body;

        if (!params || typeof params.email !== "string" || typeof params.password !== "string") {
            throw new BadRequestError("Invalid email or password");
        }

        const hashed_password = await hashPassword(params.password);

        const updatedUser = await updateUserCredentials(userId, params.email, hashed_password);

        if (!updatedUser) {
            throw new NotFoundError("User not found");
        }

        res.status(200).json({
            id: updatedUser.id,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            email: updatedUser.email,
            isChirpyRed: updatedUser.isChirpyRed,
        });
    } catch (err) {
        next(err);
    }
}

async function handlerDeleteChirp(req: Request, res: Response, next: NextFunction) {
    try {
        const token = getBearerToken(req);

        let userId: string;
        try {
            userId = validateJWT(token, config.jwtSecret);
        } catch (err) {
            throw new UnauthorizedError("Unauthorized")
        }

        const rawId = req.params.chirpId;
        const chirpId = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!chirpId || typeof chirpId !== "string") {
            throw new NotFoundError("Chirp not found");
        }

        const chirp = await getChirpById(chirpId);

        if (!chirp) {
            throw new NotFoundError("Chirp not found");
        }

        if (chirp.userId !== userId) {
            throw new ForbiddenError("You are not authorized to delete this chirp");
        }

        await deleteChirpById(chirpId);

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

async function handlerPolkaWebhook(req: Request, res: Response, next: NextFunction) {
    try {
        const apiKey = getAPIKey(req);
        
        if (apiKey !== config.polkaKey) {
            throw new UnauthorizedError("Invalid API key");
        }

        type Parameters = {
            event: string;
            data: {
                userId: string;
            };
        };

        const params: Parameters = req.body;

        if (!params || params.event !== "user.upgraded") {
            return res.status(204).send();
        }

        const userId = params.data?.userId;

        if (!userId || typeof userId !== "string") {
            return res.status(204).send();
        }

        const updatedUser = await upgradeUserToChirpyRed(userId);

        if (!updatedUser) {
            throw new NotFoundError("User not found");
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.use(middlewareLogResponses);
app.use(express.json());

app.get("/api/healthz", handlerHealthz);

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.post("/api/users", handlerCreateUser);
app.post("/api/chirps", handlerCreateChirps);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpId", handlerGetChirpById);
app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);
app.put("/api/users", handlerUpdateUser);
app.delete("/api/chirps/:chirpId", handlerDeleteChirp);
app.post("/api/polka/webhooks", handlerPolkaWebhook);

app.use(errorHandler);

app.listen(config.port, () => {
        console.log(`Server is running at http://localhost:${config.port}`);
});
