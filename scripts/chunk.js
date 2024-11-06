import Mesh from './mesh.js';
import Simplex from "./simplex.js";
import Blocks from './blocks.js';
import { Mat4 } from './math.js';

const NOISE_SMOOTHNESS = 20;
const WATER_HEIGHT = 4;

export default
class Chunk {
    static WIDTH = 16;
    static HEIGHT = 10;
    static LENGTH = 16;
    static AREA = Chunk.WIDTH * Chunk.HEIGHT * Chunk.LENGTH;

    static simplex = Simplex(0xdeadbeef);

    constructor(x, z, world) {
        this.x = x;
        this.z = z;
        this.world = world;

        this.absX = x * Chunk.WIDTH;
        this.absZ = z * Chunk.LENGTH;
        this.data = new Uint8Array(Chunk.AREA).fill(Blocks.EMPTY);

        // Meshes
        this.groundMesh = new Mesh();
        this.waterMesh = new Mesh();

        this.groundMesh.model.translate(this.absX, 0, this.absZ);
        this.waterMesh.model.translate(this.absX, -0.2, this.absZ);

        this.generateTerrain();
    }

    static index(x, y, z) {
        return x + z * Chunk.WIDTH + y * Chunk.WIDTH * Chunk.LENGTH;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= Chunk.HEIGHT) {
            return Blocks.EMPTY;
        }

        // Check if the block is outside the chunk
        if (x < 0 || x >= Chunk.WIDTH || z < 0 || z >= Chunk.LENGTH) {
            return this.world.getBlockAt(this.absX + x, y, this.absZ + z);
        }

        return this.data[Chunk.index(x, y, z)];
    }

    isTransparent(x, y, z) {
        // Avoid render bottom
        if (y < 0) {
            return false;
        }

        // For the rest of the blocks, we can check if they are empty or water
        const block = this.getBlock(x, y, z);

        return block === Blocks.EMPTY || block === Blocks.WATER;
    }

    generateTerrain() {
        for (let x = 0; x < Chunk.WIDTH; x++) {
            for (let z = 0; z < Chunk.LENGTH; z++) {
                const noiseX = (this.absX + x) / NOISE_SMOOTHNESS;
                const noiseZ = (this.absZ + z) / NOISE_SMOOTHNESS;

                // Normalize from [-1, 1] to [0, 1]
                const value = (Chunk.simplex.noise2D(noiseX, noiseZ) + 1) * 0.5;
                const height = Math.floor(value * Chunk.HEIGHT);

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
        this.groundMesh.unload();
        this.waterMesh.unload();

        for (let x = 0; x < Chunk.WIDTH; x++) {
            for (let z = 0; z < Chunk.LENGTH; z++) {
                for (let y = 0; y < Chunk.HEIGHT; y++) {
                    const block = this.getBlock(x, y, z);

                    // Skip empty blocks
                    if (block === Blocks.EMPTY) {
                        continue;
                    } else if (block === Blocks.WATER) {
                        this.waterMesh.blockFace("top", block, x, y, z);
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