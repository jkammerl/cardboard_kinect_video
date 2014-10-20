uniform sampler2D texture;
uniform float border_cut;
uniform float resolution;

varying vec2 vUvP;

/*
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

float variance(float d1, float d2, float d3, float d4, float d5, float d6, float d7, float d8, float d9)
{
	float mean = (d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8 + d9) / 9.0;
	float t1 = (d1-mean);
	float t2 = (d2-mean);
	float t3 = (d3-mean);
	float t4 = (d4-mean);
	float t5 = (d5-mean);
	float t6 = (d6-mean);
	float t7 = (d7-mean);
	float t8 = (d8-mean);
	float t9 = (d9-mean);
	float v = (t1*t1+t2*t2+t3*t3+t4*t4+t5*t5+t6*t6+t7*t7+t8*t8+t9*t9)/9.0;
	return v;
 }

float sampleDepthVariance(vec2 uv) {
	float pixel_step = resolution;
	float depth1 = sampleDepth(vec2(uv.x-pixel_step, uv.y-pixel_step));
	float depth2 = sampleDepth(vec2(uv.x-pixel_step, uv.y));
	float depth3 = sampleDepth(vec2(uv.x-pixel_step, uv.y+pixel_step));
	float depth4 = sampleDepth(vec2(uv.x, uv.y-pixel_step));
	float depth5 = sampleDepth(vec2(uv.x, uv.y));
	float depth6 = sampleDepth(vec2(uv.x, uv.y+pixel_step));
	float depth7 = sampleDepth(vec2(uv.x+pixel_step, uv.y-pixel_step));
	float depth8 = sampleDepth(vec2(uv.x+pixel_step, uv.y));
	float depth9 = sampleDepth(vec2(uv.x+pixel_step, uv.y+pixel_step));

	return variance(depth1, depth2, depth3, depth4, depth5, depth6, depth7, depth8, depth9);
}

*/
vec4 sampleColor(vec2 uv) {
    vec2 color_pos = vec2(uv.x/2.0+0.5, uv.y/2.0);
    vec4 color_smp = texture2D(texture, color_pos);
    vec2 alpha_pos = vec2(uv.x/2.0, uv.y/2.0);
    vec4 alpha_smp = texture2D(texture, alpha_pos);
    float alpha_val = 0.0;
    if (alpha_smp.r+alpha_smp.g+alpha_smp.b<1.5) {
       alpha_val = 1.0;
    }
    color_smp.a = alpha_val;
    return color_smp;
}

void main(void) {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    if (!(vUvP.x<border_cut || vUvP.x>(1.0-border_cut) || 
          vUvP.y<border_cut || vUvP.y>(1.0-border_cut))) {
       //float sample_variance = sampleDepthVariance(vUvP);
       //if (sample_variance<20.0) {   
          color = sampleColor(vUvP); 
       //}
    }
    gl_FragColor = color;
}
