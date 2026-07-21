export const TILE_WIDTH = 128;
export const TILE_HEIGHT = 64;
export const WORLD_WIDTH_TILES = 200;
export const WORLD_HEIGHT_TILES = 200;
export const ZONES_X = 5;
export const ZONES_Y = 5;
export const ZONE_SIZE = 40; // 40x40 tiles per zone to make 200x200 total

export const wrapCoord = (v, max) => ((v % max) + max) % max;

export const normalizeWorldCoord = (value, max, isWrappedWorld) =>
    isWrappedWorld ? wrapCoord(value, max) : value;

export const getCardinalNeighborTiles = (x, y, isWrappedWorld) => [
    { x: x + 1, y, dx: 1, dy: 0 },
    { x: x - 1, y, dx: -1, dy: 0 },
    { x, y: y + 1, dx: 0, dy: 1 },
    { x, y: y - 1, dx: 0, dy: -1 }
].map((neighbor) => ({
    ...neighbor,
    x: normalizeWorldCoord(neighbor.x, WORLD_WIDTH_TILES, isWrappedWorld),
    y: normalizeWorldCoord(neighbor.y, WORLD_HEIGHT_TILES, isWrappedWorld)
}));

export const getWrappedDelta = (from, to, size, isWrappedWorld) => {
    let delta = to - from;
    if (!isWrappedWorld) return delta;
    if (delta > size / 2) delta -= size;
    else if (delta < -size / 2) delta += size;
    return delta;
};

export const getWrappedDirectionToTarget = (from, to, isWrappedWorld) => ({
    dx: getWrappedDelta(from.x, to.x, WORLD_WIDTH_TILES, isWrappedWorld),
    dy: getWrappedDelta(from.y, to.y, WORLD_HEIGHT_TILES, isWrappedWorld)
});

export const getWrappedManhattanDistance = (from, to, isWrappedWorld) =>
    Math.abs(getWrappedDelta(from.x, to.x, WORLD_WIDTH_TILES, isWrappedWorld)) +
    Math.abs(getWrappedDelta(from.y, to.y, WORLD_HEIGHT_TILES, isWrappedWorld));

export const getWrappedChebyshevDistance = (from, to, isWrappedWorld) =>
    Math.max(
        Math.abs(getWrappedDelta(from.x, to.x, WORLD_WIDTH_TILES, isWrappedWorld)),
        Math.abs(getWrappedDelta(from.y, to.y, WORLD_HEIGHT_TILES, isWrappedWorld))
    );

export const getZoneId = (x, y) => `${Math.floor(x / ZONE_SIZE)}_${Math.floor(y / ZONE_SIZE)}`;

export const getClosestWrappedWorldCoords = (x, y, refX, refY, isWrappedWorld) => ({
    x: isWrappedWorld ? x + Math.round((refX - x) / WORLD_WIDTH_TILES) * WORLD_WIDTH_TILES : x,
    y: isWrappedWorld ? y + Math.round((refY - y) / WORLD_HEIGHT_TILES) * WORLD_HEIGHT_TILES : y
});
