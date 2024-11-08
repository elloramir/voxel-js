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

    // sun light
    vec3 sunPosition = vec3(0.0, 200.0, 0.0);
    const float ambient = 0.3;
    const float diffuse = 0.8;
    vec3 lightDir = normalize(sunPosition - worldPosition.xyz);
    float intensity = max(dot(normal, lightDir), 0.0) * diffuse + ambient;
    // color.rgb *= intensity;
    vec3 sunColor = vec3(1.0, 0.9, 0.6);
    vec3 ambientColor = vec3(0.2, 0.2, 0.2);
    vec3 diffuseColor = vec3(0.8, 0.8, 0.8);
    vec3 lightColor = ambientColor + diffuseColor * intensity;
    color.rgb *= lightColor;


    gl_FragColor = mix(color, fogColor, fogFactor);
}
