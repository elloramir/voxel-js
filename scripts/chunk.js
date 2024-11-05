import Mesh from './mesh.js';
import Simplex from "./simplex.js";

const CHUNK_WIDTH = 16;
const CHUNK_HEIGHT = 16;
const CHUNK_LENGTH = 16;
const CHUNK_AREA = CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_LENGTH;

const NOISE_SMOOTHNESS = 20;
const WATER_HEIGHT = 4;

const BLOCK_EMPTY = 0;
const BLOCK_GRASS = 1;
const BLOCK_WATER = 2;

export default
class Chunk {
    static simplex = Simplex(0xdeadbeef);

    constructor(x, z) {
        this.x = x;
        this.z = z;

        this.data = new Uint8Array(CHUNK_AREA);
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
            return BLOCK_EMPTY;
        }

        // @todo: Neighbouring chunks
        if (x < 0 || x >= CHUNK_WIDTH || z < 0 || z >= CHUNK_LENGTH) {
            return BLOCK_EMPTY;
        }

        return this.data[Chunk.index(x, y, z)];
    }

    isTransparent(x, y, z) {
        const block = this.getBlock(x, y, z);

        return block === BLOCK_EMPTY || block === BLOCK_WATER;
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
                let height = Math.floor(value * CHUNK_HEIGHT);

                while (height > 0) {
                    this.data[Chunk.index(x, height, z)] = BLOCK_GRASS;
                    height--;
                }

                // Water block on empty spaces around water level
                if (this.getBlock(x, WATER_HEIGHT, z) === BLOCK_EMPTY) {
                    this.data[Chunk.index(x, WATER_HEIGHT, z)] = BLOCK_WATER;
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
                    if (block === BLOCK_EMPTY) {
                        continue;
                    } else if (block === BLOCK_WATER) {
                        this.waterMesh.addFace("bottom", x, y, z);
                        continue;
                    }

                    // All other visible faces
                    if (this.isTransparent(x, y, z-1)) {
                        this.groundMesh.addFace("north", x, y, z);
                    }
                    if (this.isTransparent(x, y, z+1)) {
                        this.groundMesh.addFace("south", x, y, z);
                    }
                    if (this.isTransparent(x+1, y, z)) {
                        this.groundMesh.addFace("east", x, y, z);
                    }
                    if (this.isTransparent(x-1, y, z)) {
                        this.groundMesh.addFace("west", x, y, z);
                    }
                    if (this.isTransparent(x, y+1, z)) {
                        this.groundMesh.addFace("top", x, y, z);
                    }
                    if (this.isTransparent(x, y-1, z)) {
                        this.groundMesh.addFace("bottom", x, y, z);
                    }
                }
            }
        }

        this.groundMesh.upload();
        this.waterMesh.upload();
    }
}