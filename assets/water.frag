precision mediump float;

varying vec4 worldPosition;
varying vec4 viewPosition;
varying vec4 screenPosition;
varying vec3 normal;

uniform sampler2D depthTexture;

const float chunkSize = 16.0;

const vec4 light_blue = vec4(0.2, 0.5, 0.9, 1);
const vec4 dark_blue = vec4(0.2, 0.3, 0, 1);

void main() {
    // Calcule as coordenadas UV para acessar a textura de profundidade
    vec2 uv = (worldPosition.zx + 0.5);
    uv.x = mod(uv.x, chunkSize) / chunkSize;
    uv.y = mod(uv.y, chunkSize) / chunkSize;
    
    // Obtenha o valor de profundidade da textura de profundidade
    float depth = texture2D(depthTexture, uv).r;
    depth = pow(depth, 1.7);
    
    // Water color
    vec4 color = vec4(0, 0.3, 0.5, 1.0 - depth);

    // exponential fog
    float fogDensity = 0.005;
    float dist = length(viewPosition - screenPosition);
    vec4 fogColor = vec4(0.3, 0.6, 0.9, 1.0);
    float fogFactor = 1.0 / exp((dist * fogDensity) * (dist * fogDensity));
    fogFactor = 1.0 - clamp(fogFactor, 0.0, 1.0);

    color = mix(color, fogColor, fogFactor);

    gl_FragColor = color;
}
