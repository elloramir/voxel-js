import Chunk from "./chunk.js";
import Blocks from "./blocks.js";

export default
class World {
    constructor() {
        this.chunks = new Map();

        // Intialized the map
        for (let i = -1; i < 2; i++) {
            for (let k = -1; k < 2; k++) {
                const chunk = new Chunk(i, k, this);
                this.chunks.set(this.index(i, k), chunk);
            }
        }

        // As we don't have any chunk generated yet, we can
        // update all the chunks mesh at once (wich is faster).
        for (const chunk of this.chunks.values()) {
            chunk.updateMeshs();
        }
    }

    index(i, k) {
        return i + k * 1e7;
    }

    getChunk(i, k) {
        return this.chunks.get(this.index(i, k));
    }

    getBlockAt(x, j, z) {
        const cx = Math.floor(x / Chunk.WIDTH);
        const cz = Math.floor(z / Chunk.LENGTH);
        const chunk = this.getChunk(cx, cz);

        if (!chunk) {
            return Blocks.EMPTY;
        }

        const i = x - cx * Chunk.WIDTH;
        const k = z - cz * Chunk.LENGTH;

        return chunk.getBlock(i, j, k);
    }

    generateChunk(i, k) {
        if (!this.getChunk(i, k)) {
            const chunk = new Chunk(i, k, this);
            this.chunks.set(this.index(i, k), chunk);
            chunk.updateMeshs();
            
            // Update the neighbors
            this.getChunk(i - 1, k)?.updateMeshs();
            this.getChunk(i + 1, k)?.updateMeshs();
            this.getChunk(i, k - 1)?.updateMeshs();
            this.getChunk(i, k + 1)?.updateMeshs();
        }
    }

    *visibleChunks(camera) {
        const cx = Math.floor(camera.position.x / Chunk.WIDTH);
        const cz = Math.floor(camera.position.z / Chunk.LENGTH);

        for (let i = cx - 3; i < cx + 3; i++) {
            for (let k = cz - 3; k < cz + 3; k++) {
                const chunk = this.getChunk(i, k);

                if (chunk) {
                    yield chunk;
                } else {
                    this.generateChunk(i, k);
                }
            }
        }
    }


    render(shader, camera) {
        for (const chunk of this.visibleChunks(camera)) {
            chunk.groundMesh.render(shader);
        }

        for (const chunk of this.visibleChunks(camera)) {
            chunk.waterMesh.render(shader);
        }
    }
}