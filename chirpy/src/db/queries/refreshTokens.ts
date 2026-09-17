import { NewRefreshToken, refreshTokens } from "../schema.js";
import { db } from "../index.js"
import { eq } from "drizzle-orm";

export async function createRefreshToken(data: NewRefreshToken) {
    const [result] = await db
        .insert(refreshTokens)
        .values(data)
        .returning();
    return result;
}

export async function getRefreshToken(token: string) {
    const [result] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, token));
    return result;
}

export async function revokeRefreshToken(token: string) {
    const [result] = await db
        .update(refreshTokens)
        .set({
            revokedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(refreshTokens.token, token))
        .returning();
    return result;
}