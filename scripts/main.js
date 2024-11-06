import Shader from "./shader.js";
import Camera from "./camera.js";
import Texture from "./texture.js";
import Input from "./input.js";
import Chunk from "./chunk.js";
import Blocks from "./blocks.js";
import World from "./world.js";

window.onload = async function() {
    window.canvas = document.getElementById("screen");
    window.canvas.width = window.innerWidth;
    window.canvas.height = window.innerHeight;

    // WebGL context
    window.gl = window.canvas.getContext("webgl");

    const camera = new Camera(0, 20, 10);
    const input = new Input();

    // Make the camera look down
    camera.pitch = -0.8;

    const shader = await Shader.loadFromFile(
        "assets/basic.vert",
        "assets/basic.frag"
    );

    Blocks.atlas = await Texture.loadFromFile("assets/atlas.png");
    Blocks.add(Blocks.GRASS, 2, 1, 0);
    Blocks.add(Blocks.DIRTY, 0, 0, 0);
    Blocks.add(Blocks.WATER, 18, 18, 18);

    // Create world chunk
    const world = new World();

    function render() {
        gl.clearColor(0.2, 0.5, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        camera.updateFreeView(input);
        camera.update();
        camera.bind(shader);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Blocks.atlas.id);

        world.render(shader);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}
