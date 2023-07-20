export enum Direction {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

// SDK DEFAULTS
export const sdkVideosFace: Direction = Direction.NORTH;
export const sdkImagesFace: Direction = Direction.NORTH;
export const sdkVideosAreFlipped: boolean = false;
export const sdkImagesAreFlipped: boolean = true;
export const sdkVideoFlippedDimension: "x" | "y" | "z" | null = null;
export const sdkImageFlippedDimension: "x" | "y" | "z" = "x";
export const parcelSize: number = 16;

// VLM DEFAULTS
export const vlmVideosFace: Direction = Direction.SOUTH;
export const vlmImagesFace: Direction = Direction.SOUTH;
