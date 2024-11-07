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
        const cx = Math.floor(x / Chunk.SIZE);
        const cz = Math.floor(z / Chunk.SIZE);
        const chunk = this.getChunk(cx, cz);

        if (!chunk) {
            return Blocks.EMPTY;
        }

        const i = x - cx * Chunk.SIZE;
        const k = z - cz * Chunk.SIZE;

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
        const cx = Math.floor(camera.position[0] / Chunk.SIZE);
        const cz = Math.floor(camera.position[2] / Chunk.SIZE);

        let total = 0;
        let passes = 0;
        for (let i = cx - 3; i < cx + 3; i++) {
            for (let k = cz - 3; k < cz + 3; k++) {
                total++;
                const chunk = this.getChunk(i, k);

                if (chunk) {
                    if (camera.frustum.isChunkInside(chunk)) {
                        passes++;
                        yield chunk;
                    }
                } else {
                    this.generateChunk(i, k);
                }
            }
        }

        console.log(`Visible chunks: ${passes}/${total}`);
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