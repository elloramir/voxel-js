precision mediump float;

varying vec4 worldPosition;
varying vec4 viewPosition;
varying vec4 screenPosition;
varying vec2 texcoords;
varying vec3 normal;
varying float ao;

uniform sampler2D texture;

const vec4 sunColor = vec4(1.0, 0.6, 0.3, 1.0);

void main() {
    vec4 pixel = texture2D(texture, texcoords);

    // float fogDensity = 0.005;
	// float dist = length(viewPosition - screenPosition);
	// vec4 fogColor = vec4(0.3, 0.6, 0.9, 1.0);
    // float fogFactor = 1.0 / exp((dist * fogDensity) * (dist * fogDensity));
    // fogFactor = 1.0 - clamp(fogFactor, 0.0, 1.0);

    // sun light
    const float ambient = 0.4;
    const float diffuse = 0.9;
    const float specular = 0.3;
    // const float shininess = 0.00;

    vec3 lightDir = normalize(vec3(0.5, 0.5, 0.5));
    vec3 normalDir = normalize(normal);
    vec3 viewDir = normalize(-viewPosition.xyz);
    vec3 reflectDir = reflect(-lightDir, normalDir);

    float diff = max(dot(normalDir, lightDir), 0.0);
    float spec = 1.0;

    float light = ambient + diffuse * diff + specular * spec;
    pixel *= vec4(light, light, light, 1.0) * sunColor;


    // ambient occlusion
    const float aoStrength = 0.23;
    pixel.rgb *= (1.0 - ao * aoStrength);
 

    gl_FragColor = pixel;
}
