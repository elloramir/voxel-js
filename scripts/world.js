import Chunk from "./chunk.js";
import Blocks from "./blocks.js";

export default
class World {
    constructor() {
        this.chunks = new Map();

        // Intialized the map
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                this.chunks.set(this.index(x, z), new Chunk(x, z, this));
            }
        }

        for (const chunk of this.chunks.values()) {
            chunk.updateMeshs();
        }
    }

    index(x, z) {
        return x + z * 1e7;
    }

    getChunk(x, z) {
        return this.chunks.get(this.index(x, z));
    }

    // Returns a block from any chunk based on the global coordinates
    getBlock(x, y, z) {
        if (y >= Chunk.HEIGHT || y < 0) {
            return Blocks.EMPTY;
        }

        const cx = Math.floor(x / Chunk.WIDTH);
        const cz = Math.floor(z / Chunk.LENGTH);
        const chunk = this.getChunk(cx, cz);

        if (!chunk) {
            return Blocks.EMPTY;
        }

        return chunk.getBlock(x - cx * Chunk.WIDTH, y, z - cz * Chunk.LENGTH);
    }

    render(shader) {
        for (const chunk of this.chunks.values()) {
            chunk.groundMesh.render(shader);
        }

        for (const chunk of this.chunks.values()) {
            chunk.waterMesh.render(shader);
        }
    }
}