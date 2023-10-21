export interface ModuleConfig {
    modelFolder?: string;
    soundFolder?: string;
}

let config: ModuleConfig = {
    modelFolder: "models",
    soundFolder: "sounds"
};

export function configurePaths(newConfig: ModuleConfig): void {
    config = { ...config, ...newConfig };
}

export function getModelPath(): string | undefined {
    return `${config.modelFolder}/`;
}

export function getSoundPath(): string | undefined {
    return `${config.soundFolder}/`;
}