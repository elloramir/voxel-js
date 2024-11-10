precision mediump float;

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoords;
attribute float a_ao;

uniform mat4 projectionMatrix; // handled by the camera
uniform mat4 viewMatrix;       // handled by the camera
uniform mat4 modelMatrix;      // models send their own model matrices when drawn

// define some varying vectors that are useful for writing custom fragment shaders
varying vec4 worldPosition;
varying vec4 viewPosition;
varying vec4 screenPosition;
varying vec2 texcoords;
varying vec3 normal;
varying float ao;

void main() {
    vec4 vertexPosition = vec4(a_position, 1.0);

    // calculate the positions of the transformed coordinates on the screen
    // save each step of the process, as these are often useful when writing custom fragment shaders
    worldPosition = modelMatrix * vertexPosition;
    viewPosition = viewMatrix * worldPosition;
    screenPosition = projectionMatrix * viewPosition;
    texcoords = a_texcoords;
    normal = a_normal;
    ao = a_ao;

    gl_Position = screenPosition;
}