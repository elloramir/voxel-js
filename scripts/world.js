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

    // Returns the chunks that are visible by the camera
    visibleChunks(camera) {
        const cx = Math.floor(camera.position[0] / Chunk.SIZE);
        const cz = Math.floor(camera.position[2] / Chunk.SIZE);
        const viewDist = 10;
        const viewSqrDist = viewDist * viewDist * Chunk.SIZE * Chunk.SIZE;

        const visibleChunks = [];
        for (let i = cx - viewDist; i < cx + viewDist; i++) {
            for (let k = cz - viewDist; k < cz + viewDist; k++) {
                const chunk = this.getChunk(i, k);

                if (chunk) {
                    const distX = chunk.centerX - camera.position[0];
                    const distZ = chunk.centerZ - camera.position[2];
                    const chunkSqrDist = distX * distX + distZ * distZ;
                    const isOnView = chunkSqrDist < viewSqrDist;

                    if (isOnView && camera.frustum.isChunkInside(chunk)) {
                        visibleChunks.push(chunk);
                    }
                } else {
                    this.generateChunk(i, k);
                }
            }
        }

        return visibleChunks;
    }

    render(shader, camera) {
        const visibleChunks = this.visibleChunks(camera);

        for (const chunk of visibleChunks) {
            chunk.groundMesh.render(shader);
        }

        // for (const chunk of visibleChunks) {
        //     chunk.waterMesh.render(shader);
        // }
    }
}