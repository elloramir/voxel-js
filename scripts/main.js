import Shader from "./shader.js";
import Camera from "./camera.js";
import Texture from "./texture.js";
import Input from "./input.js";
import Chunk from "./chunk.js";
import Blocks from "./blocks.js";

window.onload = async function() {
    window.canvas = document.getElementById("screen");
    window.canvas.width = window.innerWidth;
    window.canvas.height = window.innerHeight
    window.gl = window.canvas.getContext("webgl");
    
    const camera = new Camera(0, 0, 50);
    const input = new Input();

    const shader = await Shader.loadFromFile(
        "assets/basic.vert",
        "assets/basic.frag"
    );

    const atlas = await Texture.loadFromFile("assets/atlas.png");

    Blocks.atlas = atlas;
    Blocks.add(Blocks.GRASS, 2, 1, 0);
    Blocks.add(Blocks.DIRTY, 0, 0, 0);

    // Create world chunk
    const chunk = new Chunk(0, 0);

    function render() {
        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        camera.updateFreeView(input);
        camera.update();
        camera.bind(shader);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, atlas.id);
        chunk.groundMesh.render(shader);
    }

    setInterval(render, 1/15);
    render();
}
