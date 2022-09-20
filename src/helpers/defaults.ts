export enum Directions {
    NORTH,
    EAST,
    SOUTH,
    WEST
}

// SDK DEFAULTS
export const sdkVideosFace = Directions.NORTH;
export const sdkImagesFace = Directions.NORTH;
export const sdkVideosAreFlipped = false;
export const sdkImagesAreFlipped = true;
export const sdkVideoFlippedDimension = null;
export const sdkImageFlippedDimension = 'x';

// VLM DEFAULTS
export const vlmVideosFace = Directions.SOUTH;
export const vlmImagesFace = Directions.SOUTH;