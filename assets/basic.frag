precision mediump float;

varying vec4 worldPosition;
varying vec4 viewPosition;
varying vec4 screenPosition;
varying vec2 texcoords;
varying vec3 normal;

uniform sampler2D texture;

void main() {
    vec4 color = texture2D(texture, texcoords);

    float fogDensity = 0.005;
	float dist = length(viewPosition - screenPosition);
	vec4 fogColor = vec4(0.3, 0.6, 0.9, 1.0);
    float fogFactor = 1.0 / exp((dist * fogDensity) * (dist * fogDensity));
    fogFactor = 1.0 - clamp(fogFactor, 0.0, 1.0);


    gl_FragColor = mix(color, fogColor, fogFactor);
}
