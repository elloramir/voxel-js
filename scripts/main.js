import Shader from "./shader.js";
import Camera from "./camera.js";
import Texture from "./texture.js";
import Input from "./input.js";
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

    const shader = await Shader.loadFromFile(
        "assets/basic.vert",
        "assets/basic.frag"
    );

    Blocks.atlas = await Texture.loadFromFile("assets/atlas.png");
    Blocks.add(Blocks.GRASS, 2, 1, 0);
    Blocks.add(Blocks.DIRTY, 0, 0, 0);
    Blocks.add(Blocks.WATER, 18, 0, 0);

    // Create world chunk
    const world = new World();

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


    function render(time) {
        gl.clearColor(0.2, 0.5, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Blocks.atlas.id);

        camera.updateFreeView(input);
        camera.update();
        camera.bind(shader);

        world.render(shader, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}
