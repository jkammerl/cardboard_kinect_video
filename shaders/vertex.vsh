uniform sampler2D texture;
uniform float depth;
uniform float offset;
uniform float focallength;

varying vec2 vUvP;

float sampleDepth(vec2 uv)
{
    float depth_smp;
    
    vec2 low_depth = vec2( uv.x/2.0, uv.y/2.0+0.5 );
    vec4 low_depth_color = texture2D( texture, low_depth );
    depth_smp = (low_depth_color.r + low_depth_color.g + low_depth_color.b)/3.0;
    
    if (depth_smp>0.95)
    {
      vec2 high_depth = vec2( uv.x/2.0+0.5, uv.y/2.0+0.5 );
      vec4 high_depth_color = texture2D( texture, high_depth );
      float depth_high = (high_depth_color.r + high_depth_color.g + high_depth_color.b)/3.0;
      depth_smp = 1.0 + depth_high;
    }
    
    return depth_smp;
}

void main() {
    vUvP = uv;
    float sample_depth = sampleDepth(uv);

    vec4 v_pos = vec4( ((uv.x-0.5) * sample_depth * focallength * -1.0),
                       ((uv.y-0.5) * sample_depth * focallength), 
                       sample_depth * depth * 2.0 + offset,
                       1.0
                     );    

    gl_Position = projectionMatrix * modelViewMatrix * v_pos;
}
