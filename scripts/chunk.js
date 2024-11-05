import Mesh from './mesh.js';
import Simplex from "./simplex.js";
import Blocks from './blocks.js';

const CHUNK_WIDTH = 16;
const CHUNK_HEIGHT = 16;
const CHUNK_LENGTH = 16;
const CHUNK_AREA = CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_LENGTH;

const NOISE_SMOOTHNESS = 20;
const WATER_HEIGHT = 4;

export default
class Chunk {
    static simplex = Simplex(0xdeadbeef);

    constructor(x, z) {
        this.x = x;
        this.z = z;

        this.data = new Uint8Array(CHUNK_AREA).fill(Blocks.EMPTY);
        this.groundMesh = new Mesh();
        this.waterMesh = new Mesh();

        this.generateTerrain();
        this.updateMeshs();
    }

    static index(x, y, z) {
        return x + z * CHUNK_WIDTH + y * CHUNK_WIDTH * CHUNK_LENGTH;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= CHUNK_HEIGHT) {
            return Blocks.EMPTY;
        }

        // @todo: Neighbouring chunks
        if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_LENGTH) {
            return Blocks.EMPTY;
        }

        return this.data[Chunk.index(x, y, z)];
    }

    isTransparent(x, y, z) {
        const block = this.getBlock(x, y, z);

        return block === Blocks.EMPTY || block === Blocks.WATER;
    }

    generateTerrain() {
        const offX = this.x * CHUNK_WIDTH;
        const offZ = this.z * CHUNK_LENGTH;

        for (let x = 0; x < CHUNK_WIDTH; x++) {
            for (let z = 0; z < CHUNK_LENGTH; z++) {
                const noiseX = (offX + x) / NOISE_SMOOTHNESS;
                const noiseZ = (offZ + z) / NOISE_SMOOTHNESS;

                // Normalize from [-1, 1] to [0, 1]
                const value = (Chunk.simplex.noise2D(noiseX, noiseZ) + 1) * 0.5;
                const height = Math.floor(value * CHUNK_HEIGHT);

                for (let y = 0; y < height; y++) {
                    if (y === height - 1) {
                        this.data[Chunk.index(x, y, z)] = Blocks.GRASS;
                    } else {
                        this.data[Chunk.index(x, y, z)] = Blocks.DIRTY;
                    }
                }

                // Water block on empty spaces around water level
                if (this.getBlock(x, WATER_HEIGHT, z) === Blocks.EMPTY) {
                    this.data[Chunk.index(x, WATER_HEIGHT, z)] = Blocks.WATER;
                }
            }
        }
    }

    updateMeshs() {
        for (let x = 0; x < CHUNK_WIDTH; x++) {
            for (let z = 0; z < CHUNK_LENGTH; z++) {
                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    const block = this.getBlock(x, y, z);

                    // Skip empty blocks
                    if (block === Blocks.EMPTY) {
                        continue;
                    } else if (block === Blocks.WATER) {
                        this.waterMesh.blockFace("bottom", block, x, y, z);
                        continue;
                    }

                    // All other visible faces
                    if (this.isTransparent(x, y, z-1)) {
                        this.groundMesh.blockFace("north", block, x, y, z);
                    }
                    if (this.isTransparent(x, y, z+1)) {
                        this.groundMesh.blockFace("south", block, x, y, z);
                    }
                    if (this.isTransparent(x+1, y, z)) {
                        this.groundMesh.blockFace("east", block, x, y, z);
                    }
                    if (this.isTransparent(x-1, y, z)) {
                        this.groundMesh.blockFace("west", block, x, y, z);
                    }
                    if (this.isTransparent(x, y+1, z)) {
                        this.groundMesh.blockFace("top", block, x, y, z);
                    }
                    if (this.isTransparent(x, y-1, z)) {
                        this.groundMesh.blockFace("bottom", block, x, y, z);
                    }
                }
            }
        }

        this.groundMesh.upload();
        this.waterMesh.upload();
    }
}