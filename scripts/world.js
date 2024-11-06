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
    }

    index(x, z) {
        return x + z * 1e7;
    }

    getChunk(x, z) {
        return this.chunks.get(this.index(x, z));
    }

    getBlock(x, y, z) {
        const chunkX = Math.floor(x / Chunk.WIDTH);
        const chunkZ = Math.floor(z / Chunk.LENGTH);

        const chunk = this.getChunk(chunkX, chunkZ);

        if (!chunk) {
            return Blocks.EMPTY;
        }

        return chunk.getBlock(x - chunkX * Chunk.WIDTH, y, z - chunkZ * Chunk.LENGTH);
    }

    render(shader) {
        for (const chunk of this.chunks.values()) {
            gl.useProgram(shader.id);
            gl.uniformMatrix4fv(shader.getUniform("u_model"), false, chunk.model.data);

            chunk.groundMesh.render(shader);
        }
    }
}