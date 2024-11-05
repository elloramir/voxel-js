import { Mat4, Vec3, Vec2, degToRad } from './math.js';

const NEAR = 0.01;
const FAR = 1000;

export default
class Camera {
    constructor(x, y, z) {
        this.viewMat = new Mat4();
        this.projMat = new Mat4();

        this.position = new Vec3(x, y, z);
        this.target = new Vec3(0, 0, 0);
        this.up = new Vec3(0, 1, 0);

        this.fov = degToRad(60);
        this.yaw = degToRad(270);
        this.pitch = 0;

        this.isDragging = false;
        this.mouseOffset = new Vec2(0, 0);
    }

    update() {
        const cosYaw = Math.cos(this.yaw);
        const sinYaw = Math.sin(this.yaw);
        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
    
        // Convert Euler angles to a target vector
        const direction = new Vec3(
            cosPitch * cosYaw,
            sinPitch,
            cosPitch * sinYaw
        );
    
        // Where camera is looking
        this.target = new Vec3(
            this.position.x + direction.x,
            this.position.y + direction.y,
            this.position.z + direction.z
        );
    
        const aspect = window.canvas.width / window.canvas.height;
    
        // Recalculate the view and projection matrices
        this.projMat.perspective(this.fov, aspect, NEAR, FAR);
        this.viewMat.lookAt(this.position, this.target, this.up);
    }
    
    relativeMouse(dx, dy) {
        const sens = 1 / 500;

        this.yaw += dx * sens;
        this.pitch -= dy * sens;
    }

    goFoward(spdx, spdy) {
        if (spdx !== 0 || spdy !== 0) {
            const angle = Math.atan2(spdx, spdy);

            this.position.x += Math.sin(this.yaw + angle) * 0.1;
            this.position.z -= Math.cos(this.yaw + angle) * 0.1;
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
            this.position.y += 0.1;
        }
        if (input.isKeyDown("shift")) {
            this.position.y -= 0.1;
        }
    }

    bind(shader) {
        gl.useProgram(shader.id);
        gl.uniformMatrix4fv(shader.getUniform("u_view"), false, this.viewMat.data);
        gl.uniformMatrix4fv(shader.getUniform("u_proj"), false, this.projMat.data);
    }
}