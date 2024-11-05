precision mediump float;

varying vec2 v_texcoords;
varying vec3 v_normal;
varying vec3 v_position;

uniform sampler2D u_texture;

void main() {
    vec2 uv = vec2(v_texcoords.x, v_texcoords.y);
    vec4 color = texture2D(u_texture, uv);

    // simple lighting coming from (0, 1, 0)
    vec3 light = normalize(vec3(0, 1, 0));
    const float ambient = 0.6;
    const float diffuse = 0.4;

    float intensity = max(dot(v_normal, light), 0.0) * diffuse + ambient;
    color.rgb *= intensity;
    
    gl_FragColor = color;
}