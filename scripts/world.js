import Chunk from "./chunk.js";
import Blocks from "./blocks.js";

export default
class World {
    constructor() {
        this.chunks = new Map();
        this.lastTimeChunkGenerated = 0;
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

    tryGenerateChunk(i, k) {
        const delta = Date.now() - this.lastTimeChunkGenerated;
        const timeGap = 30; // time in ms to enable chunk generation

        if (delta > timeGap) {
            this.generateChunk(i, k);
            this.lastTimeChunkGenerated = Date.now();
        }
    }

    // Returns the chunks that are visible by the camera
    visibleChunks(camera) {
        const cx = Math.floor(camera.position[0] / Chunk.SIZE);
        const cz = Math.floor(camera.position[2] / Chunk.SIZE);
        const viewDist = 16;
        const halfViewDist = viewDist / 2;
        const viewSqrDist = viewDist * viewDist * Chunk.SIZE * Chunk.SIZE;

        const visibleChunks = [];
        for (let i = cx - halfViewDist; i < cx + halfViewDist; i++) {
            for (let k = cz - halfViewDist; k < cz + halfViewDist; k++) {
                // Chunk bounds
                const x0 = i * Chunk.SIZE;
                const z0 = k * Chunk.SIZE;
                const x1 = x0 + Chunk.SIZE;
                const z1 = z0 + Chunk.SIZE;
                const y0 = 0;
                const y1 = Chunk.HEIGHT;

                // Chunk distance to the camera
                const distX = (x0 + Chunk.SIZE / 2) - camera.position[0];
                const distZ = (z0 + Chunk.SIZE / 2) - camera.position[2];
                const chunkSqrDist = distX * distX + distZ * distZ;
                const isOnView = chunkSqrDist < viewSqrDist;

                if (isOnView) {
                    // Let's only append or generate the chunk if it's inside the camera frustum
                    if (camera.frustum.isAABBInside(x0, y0, z0, x1, y1, z1)) {
                        const chunk = this.getChunk(i, k);
                        
                        if (chunk) {
                            visibleChunks.push(chunk);
                        } else {
                            this.tryGenerateChunk(i, k);
                        }
                    }
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