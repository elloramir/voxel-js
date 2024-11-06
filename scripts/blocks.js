const TILE_SIZE = 16;

export default
class Blocks {
    static EMPTY = 1;
    static GRASS = 2;
    static DIRTY = 3;
    static WATER = 4;

    static blocks = new Map();
    static atlas = null;

    static uv(id) {
        const cols = Blocks.atlas.width / TILE_SIZE;
        const rows = Blocks.atlas.height / TILE_SIZE;

        // Add a small offset to avoid texture bleeding
        const tinyX = 0.1 / cols;
        const tinyY = 0.1 / rows;
        
        const x = (id % cols);
        const y = Math.floor(id / cols);

        const u0 = x / cols + tinyX;
        const u1 = (x + 1) / cols - tinyX;

        // Invert y axis
        const v0 = (1/rows) - y / rows - tinyY;
        const v1 = (1/rows) - (y + 1) / rows + tinyY;

        return [u0, v0, u1, v1];
    }

    static add(name, topId, sideId, bottomId) {
        const top = Blocks.uv(topId);
        const side = Blocks.uv(sideId);
        const bottom = Blocks.uv(bottomId);

        Blocks.blocks.set(name, { top, side, bottom });
    }
}