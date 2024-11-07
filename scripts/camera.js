import { mat4, vec3, vec2, common } from './math.js';
import Frustum from './frustum.js';

export default
class Camera {
    constructor(x, y, z) {
        this.viewMat = mat4.create();
        this.projMat = mat4.create();
        this.viewProjMat = mat4.create();

        this.near = 0.01;
        this.far = 1000;

        this.position = vec3.fromValues(x, y, z);
        this.target = vec3.fromValues(0, 0, 0);
        this.forward = vec3.fromValues(0, 0, 1);
        this.up = vec3.fromValues(0, 1, 0);

        this.aspect = 0;
        this.fov = common.toRadian(45);
        this.yaw = common.toRadian(270);
        this.pitch = common.toRadian(-35);

        this.isDragging = false;
        this.mouseOffset = vec2.fromValues(0, 0);

        this.frustum = new Frustum(this);
    }

    update() {
        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
    
        // Convert Euler angles to a target vector
        this.forward = vec3.fromValues(
            cosPitch * cosYaw,
            sinPitch,
            cosPitch * sinYaw);

        // Where camera is looking
        this.target = vec3.add(vec3.create(), this.position, this.forward);
            
        // Update the aspect ratio
        this.aspect = window.canvas.width / window.canvas.height;
    
        // Recalculate the view and projection matrices
        mat4.perspective(this.projMat, this.fov, this.aspect, this.near, this.far);
        mat4.lookAt(this.viewMat, this.position, this.target, this.up);
        mat4.multiply(this.viewProjMat, this.projMat, this.viewMat);
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

        this.frustum.updatePlanes();
    }

    bind(shader) {
        gl.useProgram(shader.id);
        // gl.uniformMatrix4fv(shader.getUniform("u_viewproj"), false, this.viewProjMat);
        gl.uniformMatrix4fv(shader.getUniform("viewMatrix"), false, this.viewMat);
        gl.uniformMatrix4fv(shader.getUniform("projectionMatrix"), false, this.projMat);
    }
}