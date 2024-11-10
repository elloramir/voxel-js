const TILE_SIZE = 16;

export default
class Blocks {
    static EMPTY = 0;
    static GRASS = 1;
    static DIRTY = 2;
    static WATER = 3;

    static blocks = new Map();
    static atlas = null;

    static uv(id) {
        const cols = Blocks.atlas.width / TILE_SIZE;
        const rows = Blocks.atlas.height / TILE_SIZE;

        // Add a small offset to avoid texture bleeding
        const tinyX = 0.001;
        const tinyY = 0.001;
        
        const x = (id % cols);
        const y = Math.floor(id / cols);

        const u0 = x / cols + tinyX;
        const u1 = (x + 1) / cols - tinyX;

        // Flip the texture vertically
        const v0 = (y + 1) / rows - tinyY;
        const v1 = y / rows + tinyY;

        return [u0, v0, u1, v1];
    }

    static add(name, topId, sideId, bottomId) {
        const top = Blocks.uv(topId);
        const side = Blocks.uv(sideId);
        const bottom = Blocks.uv(bottomId);

        Blocks.blocks.set(name, { top, side, bottom });
    }
}