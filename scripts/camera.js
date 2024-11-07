import { mat4, vec3, vec2, common } from './math.js';

const NEAR = 0.01;
const FAR = 1000;

export default
class Camera {
    constructor(x, y, z) {
        this.viewMat = mat4.create();
        this.projMat = mat4.create();

        this.position = vec3.fromValues(x, y, z);
        this.target = vec3.fromValues(0, 0, 0);
        this.up = vec3.fromValues(0, 1, 0);

        this.fov = common.toRadian(60);
        this.yaw = common.toRadian(270);
        this.pitch = common.toRadian(-35);

        this.isDragging = false;
        this.mouseOffset = vec2.fromValues(0, 0);
    }

    update() {
        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
    
        // Convert Euler angles to a target vector
        const direction = vec3.fromValues(
            cosPitch * cosYaw,
            sinPitch,
            cosPitch * sinYaw
        );
    
        // Where camera is looking
        this.target = vec3.add(vec3.create(), this.position, direction);
    
        const aspect = window.canvas.width / window.canvas.height;
    
        // Recalculate the view and projection matrices
        mat4.perspective(this.projMat, this.fov, aspect, NEAR, FAR);
        mat4.lookAt(this.viewMat, this.position, this.target, this.up);
    }
    
    relativeMouse(dx, dy) {
        const sens = 1 / 500;

        this.yaw += dx * sens;
        this.pitch -= dy * sens;
    }

    goFoward(spdx, spdy) {
        if (spdx !== 0 || spdy !== 0) {
            const angle = Math.atan2(spdx, spdy);

            this.position[0] += Math.sin(this.yaw + angle) * 0.3;
            this.position[2] -= Math.cos(this.yaw + angle) * 0.3;
        }
    }

    updateFreeView(input) {
        const isDragging = input.isButtonDown(0);

        if (isDragging && !this.isDragging) {
            this.mouseOffset.x = input.mouse.x;
            this.mouseOffset.y = input.mouse.y;
        }

        if (this.isDragging) {
            const dx = input.mouse.x - this.mouseOffset.x;
            const dy = input.mouse.y - this.mouseOffset.y;

            this.relativeMouse(dx, dy);

            this.mouseOffset.x = input.mouse.x;
            this.mouseOffset.y = input.mouse.y;
        }

        this.isDragging = isDragging;
        this.goFoward(
            input.keyDelta("w", "s"),
            input.keyDelta("a", "d"));

        // up and down
        if (input.isKeyDown(" ")) {
            this.position[1] += 0.3;
        }
        if (input.isKeyDown("shift")) {
            this.position[1] -= 0.3;
        }
    }

    bind(shader) {
        gl.useProgram(shader.id);
        gl.uniformMatrix4fv(shader.getUniform("u_view"), false, this.viewMat);
        gl.uniformMatrix4fv(shader.getUniform("u_proj"), false, this.projMat);
    }
}