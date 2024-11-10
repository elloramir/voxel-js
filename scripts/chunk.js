import Mesh from './mesh.js';
import Simplex from "./simplex.js";
import Blocks from './blocks.js';
import { mat4, vec4 } from './math.js';

const NOISE_SMOOTHNESS = 20;
const WATER_HEIGHT = 4;

export default
class Chunk {
    static HEIGHT = 10;
    static SIZE = 16;
    static AREA = Chunk.SIZE * Chunk.HEIGHT * Chunk.SIZE;

    static simplex = Simplex(0xdeadbeef);

    constructor(x, z, world) {
        this.x = x;
        this.z = z;
        this.world = world;

        this.absX = x * Chunk.SIZE;
        this.absZ = z * Chunk.SIZE;
        this.centerX = this.absX + Chunk.SIZE / 2;
        this.centerZ = this.absZ + Chunk.SIZE / 2;
        this.data = new Uint8Array(Chunk.AREA).fill(Blocks.EMPTY);

        // Meshes
        this.groundMesh = new Mesh();
        this.waterMesh = new Mesh();

        mat4.translate(this.groundMesh.model, this.groundMesh.model, [this.absX, 0, this.absZ]);
        mat4.translate(this.waterMesh.model, this.waterMesh.model, [this.absX, -0.2, this.absZ]);

        this.generateTerrain();
    }

    static index(x, y, z) {
        return x + z * Chunk.SIZE + y * Chunk.SIZE * Chunk.SIZE;
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= Chunk.HEIGHT) {
            return Blocks.EMPTY;
        }

        // Check if the block is outside the chunk
        if (x < 0 || x >= Chunk.SIZE || z < 0 || z >= Chunk.SIZE) {
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
        for (let x = 0; x < Chunk.SIZE; x++) {
            for (let z = 0; z < Chunk.SIZE; z++) {
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

        for (let x = 0; x < Chunk.SIZE; x++) {
            for (let z = 0; z < Chunk.SIZE; z++) {
                for (let y = 0; y < Chunk.HEIGHT; y++) {
                    const block = this.getBlock(x, y, z);

                    // Skip empty blocks
                    if (block === Blocks.EMPTY) {
                        continue;
                    } else if (block === Blocks.WATER) {
                        this.waterMesh.blockFace("top", block, x, y, z, vec4.zero);
                        continue;
                    }

                    // All other visible faces
                    if (this.isTransparent(x, y, z-1)) {
                        this.groundMesh.blockFace("north", block, x, y, z, this.calculateAO("north", x, y, z));
                    }
                    if (this.isTransparent(x, y, z+1)) {
                        this.groundMesh.blockFace("south", block, x, y, z, this.calculateAO("south", x, y, z));
                    }
                    if (this.isTransparent(x+1, y, z)) {
                        this.groundMesh.blockFace("east", block, x, y, z, this.calculateAO("east", x, y, z));
                    }
                    if (this.isTransparent(x-1, y, z)) {
                        this.groundMesh.blockFace("west", block, x, y, z, this.calculateAO("west", x, y, z));
                    }
                    if (this.isTransparent(x, y+1, z)) {
                        this.groundMesh.blockFace("top", block, x, y, z, this.calculateAO("top", x, y, z));
                    }
                    if (this.isTransparent(x, y-1, z)) {
                        this.groundMesh.blockFace("bottom", block, x, y, z, this.calculateAO("bottom", x, y, z));
                    }
                }
            }
        }

        this.groundMesh.upload();
        this.waterMesh.upload();
    }

    // @todo: Refactor this function and bring a better solution for AO calculation
    calculateAO(face, x, y, z) {
        const ao = [];

        switch(face) {
        case "north":
            ao[0] = aoLevel(this.isTransparent(x+1, y, z-1), this.isTransparent(x, y+1, z-1), this.isTransparent(x+1, y+1, z-1));
            ao[1] = aoLevel(this.isTransparent(x+1, y, z-1), this.isTransparent(x, y-1, z-1), this.isTransparent(x+1, y-1, z-1));
            ao[2] = aoLevel(this.isTransparent(x-1, y, z-1), this.isTransparent(x, y-1, z-1), this.isTransparent(x-1, y-1, z-1));
            ao[3] = aoLevel(this.isTransparent(x-1, y, z-1), this.isTransparent(x, y+1, z-1), this.isTransparent(x-1, y+1, z-1));
        break;
        case "east":
            ao[0] = aoLevel(this.isTransparent(x+1, y, z-1), this.isTransparent(x+1, y-1, z), this.isTransparent(x+1, y-1, z-1));
            ao[1] = aoLevel(this.isTransparent(x+1, y, z+1), this.isTransparent(x+1, y-1, z), this.isTransparent(x+1, y-1, z+1));
            ao[2] = aoLevel(this.isTransparent(x+1, y, z-1), this.isTransparent(x+1, y-1, z), this.isTransparent(x+1, y-1, z-1));
            ao[3] = aoLevel(this.isTransparent(x+1, y, z+1), this.isTransparent(x+1, y-1, z), this.isTransparent(x+1, y-1, z+1));
        break;
        case "south":
            ao[0] = aoLevel(this.isTransparent(x-1, y, z+1), this.isTransparent(x, y+1, z+1), this.isTransparent(x-1, y+1, z+1));
            ao[1] = aoLevel(this.isTransparent(x-1, y, z+1), this.isTransparent(x, y-1, z+1), this.isTransparent(x-1, y-1, z+1));
            ao[2] = aoLevel(this.isTransparent(x+1, y, z+1), this.isTransparent(x, y-1, z+1), this.isTransparent(x+1, y-1, z+1));
            ao[3] = aoLevel(this.isTransparent(x+1, y, z+1), this.isTransparent(x, y+1, z+1), this.isTransparent(x+1, y+1, z+1));
        break;
        case "west":
            ao[0] = aoLevel(this.isTransparent(x-1, y, z-1), this.isTransparent(x-1, y-1, z), this.isTransparent(x-1, y-1, z-1));
            ao[1] = aoLevel(this.isTransparent(x-1, y, z-1), this.isTransparent(x-1, y-1, z), this.isTransparent(x-1, y-1, z-1));
            ao[2] = aoLevel(this.isTransparent(x-1, y, z+1), this.isTransparent(x-1, y-1, z), this.isTransparent(x-1, y-1, z+1));
            ao[3] = aoLevel(this.isTransparent(x-1, y, z+1), this.isTransparent(x-1, y-1, z), this.isTransparent(x-1, y-1, z+1));
        break;
        case "top":
            ao[0] = aoLevel(this.isTransparent(x-1, y+1, z), this.isTransparent(x, y+1, z+1), this.isTransparent(x-1, y+1, z+1));
            ao[1] = aoLevel(this.isTransparent(x+1, y+1, z), this.isTransparent(x, y+1, z+1), this.isTransparent(x+1, y+1, z+1));
            ao[2] = aoLevel(this.isTransparent(x-1, y+1, z), this.isTransparent(x, y+1, z-1), this.isTransparent(x-1, y+1, z-1));
            ao[3] = aoLevel(this.isTransparent(x+1, y+1, z), this.isTransparent(x, y+1, z-1), this.isTransparent(x+1, y+1, z-1));
        break;
        case "bottom":
            ao[0] = aoLevel(this.isTransparent(x-1, y-1, z), this.isTransparent(x-1, y-1, z-1), this.isTransparent(x, y-1, z-1));
            ao[1] = aoLevel(this.isTransparent(x-1, y-1, z), this.isTransparent(x-1, y-1, z+1), this.isTransparent(x, y-1, z+1));
            ao[2] = aoLevel(this.isTransparent(x+1, y-1, z), this.isTransparent(x+1, y-1, z-1), this.isTransparent(x, y-1, z-1));
            ao[3] = aoLevel(this.isTransparent(x+1, y-1, z), this.isTransparent(x+1, y-1, z+1), this.isTransparent(x, y-1, z+1));
        break;
        }

        return ao;
    }
}

function aoLevel(side1, side2, corner) {
    if (side1 && side2) return 0.0;
    
    return 3 - (side1 + side2 + corner);
}
