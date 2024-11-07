import { mat4, vec3, vec4 } from "./math.js";
import Chunk from "./chunk.js";

export default class Frustum {
    constructor(camera) {
        this.camera = camera;
        this.planes = [];

        this.updatePlanes();
    }

    updatePlanes() {
        // for debugging
        // this.camera.fov -= 0.3;
        // this.camera.update();
        // this.camera.fov += 0.3;
        const m = this.camera.viewProjMat;

        this.planes = [
            vec4.fromValues(m[3] - m[0], m[7] - m[4], m[11] - m[8],  m[15] - m[12]), // Right
            vec4.fromValues(m[3] + m[0], m[7] + m[4], m[11] + m[8],  m[15] + m[12]), // Left
            vec4.fromValues(m[3] + m[1], m[7] + m[5], m[11] + m[9],  m[15] + m[13]), // Top
            vec4.fromValues(m[3] - m[1], m[7] - m[5], m[11] - m[9],  m[15] - m[13]), // Bottom
            vec4.fromValues(m[3] - m[2], m[7] - m[6], m[11] - m[10], m[15] - m[14]), // Back
            vec4.fromValues(m[3] + m[2], m[7] + m[6], m[11] + m[10], m[15] + m[14]) // Front
        ];

        // Normalize the planes
        this.planes.forEach(plane => {
            vec4.normalize(plane, plane);
        });
    }

    isChunkInside(chunk) {
        const x0 = chunk.absX;
        const x1 = chunk.absX + Chunk.SIZE;
        const z0 = chunk.absZ;
        const z1 = chunk.absZ + Chunk.SIZE;
        const y0 = 0;
        const y1 = Chunk.SIZE;
        
        return this.isAABBInside(x0, y0, z0, x1, y1, z1);
    }

    isPointInside(x, y, z) {
        for (const plane of this.planes) {
            if (plane[0] * x + plane[1] * y + plane[2] * z + plane[3] <= 0) {
                return false;
            }
        }

        return true;
    }

    isAABBInside(x0, y0, z0, x1, y1, z1) {
        for (const plane of this.planes) {
            if (plane[0] * x0 + plane[1] * y0 + plane[2] * z0 + plane[3] <= 0 &&
                plane[0] * x1 + plane[1] * y0 + plane[2] * z0 + plane[3] <= 0 &&
                plane[0] * x0 + plane[1] * y1 + plane[2] * z0 + plane[3] <= 0 &&
                plane[0] * x1 + plane[1] * y1 + plane[2] * z0 + plane[3] <= 0 &&
                plane[0] * x0 + plane[1] * y0 + plane[2] * z1 + plane[3] <= 0 &&
                plane[0] * x1 + plane[1] * y0 + plane[2] * z1 + plane[3] <= 0 &&
                plane[0] * x0 + plane[1] * y1 + plane[2] * z1 + plane[3] <= 0 &&
                plane[0] * x1 + plane[1] * y1 + plane[2] * z1 + plane[3] <= 0) {
                return false;
            }
        }

        return true;
    }
}
