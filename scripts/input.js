import { Vec2 } from "./math.js";

export default
class Input {
    constructor() {
        this.keyStates = new Map();
        this.buttonStates = new Map();
        this.mouse = new Vec2(0, 0);

        window.addEventListener("keydown", (e) => this.keyStates.set(e.key.toLowerCase(), true));
        window.addEventListener("keyup", (e) => this.keyStates.set(e.key.toLowerCase(), false));

        canvas.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        canvas.addEventListener("mousedown", (e) => this.buttonStates.set(e.button, true));
        window.addEventListener("mouseup", (e) => this.buttonStates.set(e.button, false));
    }

    isKeyDown(key) {
        return this.keyStates.get(key) || false;
    }

    keyDelta(k1, k2) {
        return (this.isKeyDown(k1) ? 1 : 0) - (this.isKeyDown(k2) ? 1 : 0);
    }

    isButtonDown(button) {
        return this.buttonStates.get(button) || false;
    }
}