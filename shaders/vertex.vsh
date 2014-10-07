varying vec2 vUv;
uniform sampler2D texture;
uniform float depth;
void main() {
    vUv = uv;
    vec4 color = texture2D(texture, vUv);
    float brighness = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b);
    float zpos = brighness * depth * -1.0;
    vec3 displacement = vec3(0.0, 0.0, zpos);
    gl_Position = (projectionMatrix * modelViewMatrix * vec4(position + displacement, 1.0));
}
