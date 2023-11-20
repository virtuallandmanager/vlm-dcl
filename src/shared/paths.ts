export interface ModuleConfig {
  modelFolder?: string
  soundFolder?: string
}

let config: ModuleConfig = {
  modelFolder: 'models',
  soundFolder: 'sounds',
}

export function configurePaths(newConfig: ModuleConfig): void {
  config = { ...config, ...newConfig }
}

export function getModelPath(fileName?: string): string {
  return `${config.modelFolder}/${fileName}`
}

export function getSoundPath(fileName?: string): string {
  return `${config.soundFolder}/${fileName}`
}
