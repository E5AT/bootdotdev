import fs from 'fs';
import os from 'os';
import path from 'path';

export type Config = {
    dbUrl: string;
    currentUserName?: string;
};

function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json");
};

function writeConfig(cfg: Config): void {
    const filePath = getConfigFilePath();
    const data = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

function validateConfig(rawConfig: any): Config {
    if (!rawConfig || typeof rawConfig !== "object") {
        throw new Error("Invalid config format: expected an object");
    }
    if (typeof rawConfig.db_url !== "string") {
        throw new Error("Invalid config format: db_url must be a string");
    }

    return {
        dbUrl: rawConfig.db_url,
        currentUserName:
            typeof rawConfig.current_user_name === "string"
                ? rawConfig.current_user_name
                : undefined,
    };
};

export function setUser(username: string): void {
    const config = readConfig();
    config.currentUserName = username;
    writeConfig(config);
}

export function readConfig(): Config {
    const filePath = getConfigFilePath();
    if (!fs.existsSync(filePath)) {
        throw new Error(`Config file not found at ${filePath}`);
    }
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const rawData = JSON.parse(fileContents);
    return validateConfig(rawData);
}
