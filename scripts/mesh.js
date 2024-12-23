import { mat4 } from "./math.js";
import Blocks from "./blocks.js";

export default
class Mesh {
    constructor() {
        this.vbo = gl.createBuffer();
        this.ibo = gl.createBuffer();

        this.model = mat4.identity(mat4.create());
        
        this.vertices = [];
        this.indices = [];

        this.numIndices = 0;
        this.numVertices = 0;
    }

    vertex(x, y, z, n1, n2, n3, u, v, ao) {
        this.vertices.push(x, y, z, n1, n2, n3, u, v, ao);
        this.numVertices++;
    }

    // It will use the last 4 vertices added as reference to begin
    lastQuad(a, b, c, d, e, f) {
        const i = this.numVertices - 4;
        
        this.indices.push(i + a, i + b, i + c, i + d, i + e, i + f);
        this.numIndices += 6;
    }

    upload() {
        const data = new Float32Array(this.vertices);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        const indices = new Uint16Array(this.indices);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // Vanish the data from the CPU once it's on the GPU now
        this.vertices = [];
        this.indices = [];
    }

    unload() {
        this.numIndices = 0;
        this.numVertices = 0;
    }

    render(shader) {
        const aPosition = shader.getAttrib("a_position");
        const aNormal = shader.getAttrib("a_normal");
        const aTexture = shader.getAttrib("a_texcoords");
        const aAo = shader.getAttrib("a_ao");

        gl.useProgram(shader.id);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

        gl.enableVertexAttribArray(aPosition);
        gl.enableVertexAttribArray(aNormal);
        gl.enableVertexAttribArray(aTexture);
        gl.enableVertexAttribArray(aAo);

        const byte = Float32Array.BYTES_PER_ELEMENT;
        const stride = 9 * byte;

        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, stride, 3 * byte);
        gl.vertexAttribPointer(aTexture, 2, gl.FLOAT, false, stride, 6 * byte);
        gl.vertexAttribPointer(aAo, 1, gl.FLOAT, false, stride, 8 * byte);

        gl.uniformMatrix4fv(shader.getUniform("modelMatrix"), false, this.model);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }

    // As you can see, this class is not generic at all and
    // are made exclusively for the game's needs.
    blockFace(face, block, i, j, k, ao) {
        const xp =  0.5 + i;
        const xn = -0.5 + i;
        const yp =  0.5 + j;
        const yn = -0.5 + j;
        const zp =  0.5 + k;
        const zn = -0.5 + k;

        const dir = face !== "top" && face !== "bottom" ? "side" : face;
        const [u0, v0, u1, v1] = Blocks.blocks.get(block)[dir];

        switch(face) {
            case "north":
                this.vertex(xp, yp, zn, 0, 0, -1, u1, v1, ao[0]);
                this.vertex(xp, yn, zn, 0, 0, -1, u1, v0, ao[1]);
                this.vertex(xn, yn, zn, 0, 0, -1, u0, v0, ao[2]);
                this.vertex(xn, yp, zn, 0, 0, -1, u0, v1, ao[3]);
                this.lastQuad(0, 1, 2, 0, 2, 3);
            break;
            case "south":
                this.vertex(xn, yp, zp, 0, 0, 1, u0, v1, ao[0]);
                this.vertex(xn, yn, zp, 0, 0, 1, u0, v0, ao[1]);
                this.vertex(xp, yn, zp, 0, 0, 1, u1, v0, ao[2]);
                this.vertex(xp, yp, zp, 0, 0, 1, u1, v1, ao[3]);
                this.lastQuad(0, 1, 2, 0, 2, 3);
            break;
            case "east":
                this.vertex(xp, yp, zn, 1, 0, 0, u1, v1, ao[0]);
                this.vertex(xp, yn, zp, 1, 0, 0, u0, v0, ao[1]);
                this.vertex(xp, yn, zn, 1, 0, 0, u1, v0, ao[2]);
                this.vertex(xp, yp, zp, 1, 0, 0, u0, v1, ao[3]);
                this.lastQuad(0, 1, 2, 3, 1, 0);
            break;
            case "west":
                this.vertex(xn, yp, zn, -1, 0, 0, u0, v1, ao[0]);
                this.vertex(xn, yn, zn, -1, 0, 0, u0, v0, ao[1]);
                this.vertex(xn, yn, zp, -1, 0, 0, u1, v0, ao[2]);
                this.vertex(xn, yp, zp, -1, 0, 0, u1, v1, ao[3]);
                this.lastQuad(0, 1, 2, 3, 0, 2);
            break;
            case "top":
                this.vertex(xn, yp, zp, 0, 1, 0, u0, v0, ao[0]);
                this.vertex(xp, yp, zp, 0, 1, 0, u1, v0, ao[1]);
                this.vertex(xn, yp, zn, 0, 1, 0, u0, v1, ao[2]);
                this.vertex(xp, yp, zn, 0, 1, 0, u1, v1, ao[3]);
                this.lastQuad(0, 1, 2, 2, 1, 3);
            break;
            case "bottom":
                this.vertex(xn, yn, zp, 0, -1, 0, u0, v1, ao[0]);
                this.vertex(xn, yn, zn, 0, -1, 0, u0, v0, ao[1]);
                this.vertex(xp, yn, zp, 0, -1, 0, u1, v1, ao[2]);
                this.vertex(xp, yn, zn, 0, -1, 0, u1, v0, ao[3]);
                this.lastQuad(0, 1, 2, 1, 3, 2);
            break;
        }
    }
}

// @todo: Flip quads
// function shouldFlip(ao) {
//     return ao[0] + ao[2] > ao[1] + ao[3];
// }
