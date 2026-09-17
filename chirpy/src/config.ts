import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

function errOrThrow(key: string): string {
    const value = process.env[key];
    
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
}

type APIConfig = {
    fileserverHits: number;
    port: number;
    platform: string;
    jwtSecret: string;
    polkaKey: string;
    db: DBConfig;
}

export type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export const config: APIConfig = {
    fileserverHits: 0,
    port: Number(errOrThrow("PORT")),
    platform: errOrThrow("PLATFORM"),
    jwtSecret: errOrThrow("JWT_SECRET"),
    polkaKey: errOrThrow("POLKA_KEY"),
    db: {
        url: errOrThrow("DB_URL"),
        migrationConfig,
    }
};


