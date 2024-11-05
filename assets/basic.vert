attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texcoords;

varying vec2 v_texcoords;
varying vec3 v_normal;
varying vec3 v_position;

uniform mat4 u_view;
uniform mat4 u_proj;

void main() {
    gl_Position = u_proj * u_view * vec4(a_position, 1.0);
    // gl_Position = vec4(a_position, 1.0);
    v_texcoords = a_texcoords;
    v_normal = a_normal;
    v_position = a_position;
}