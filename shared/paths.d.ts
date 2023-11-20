export interface ModuleConfig {
    modelFolder?: string;
    soundFolder?: string;
}
export declare function configurePaths(newConfig: ModuleConfig): void;
export declare function getModelPath(): string | undefined;
export declare function getSoundPath(): string | undefined;
