precision mediump float;

varying vec2 v_texcoords;
varying vec3 v_normal;
varying vec3 v_position;

uniform sampler2D u_texture;

void main() {
    vec2 uv = vec2(v_texcoords.x, 1.0 - v_texcoords.y);
    vec4 color = texture2D(u_texture, uv);

    vec3 light = normalize(vec3(16, -32, 16));
    const float ambient = 0.4;
    const float diffuse = 0.6;
    const float specular = 3.0;

    vec3 normal = normalize(v_normal);
    float intensity = max(dot(normal, light), 0.0);
    vec3 diffuseColor = color.rgb * intensity * diffuse;

    vec3 reflectDir = reflect(-light, normal);
    vec3 viewDir = normalize(-v_position);
    float spec = pow(max(dot(reflectDir, viewDir), 0.0), 32.0);

    vec3 specularColor = vec3(1, 1, 1) * spec * specular;

    vec3 finalColor = (ambient + diffuseColor + specularColor) * color.rgb;
    
    gl_FragColor = vec4(finalColor, color.a);
}