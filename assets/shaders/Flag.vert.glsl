/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */


#ifdef GL_ES
precision highp float;
#endif


// attributes
attribute vec3 a_pos;
attribute vec2 texcoord;

// scalar uniforms
uniform float u_time;
uniform float u_speed;
uniform float u_waveWidth;
uniform float u_waveHeight;

// matrix uniforms
uniform mat4 u_mvMatrix;
uniform mat4 u_projMatrix;
uniform mat4 u_worldMatrix;

// varying variables
varying vec2 v_uv;


void main()
{
	float time = u_time * u_speed;
	const float pi = 3.14159;
	float angle = time;

    v_uv = texcoord;

	float x = 2.0*pi*texcoord.x/u_waveWidth;
	float y = 2.0*pi*texcoord.y;

    vec3 v = a_pos;
	v.z  = sin( x + angle );
	v.z += sin( 0.2*y + angle);
	v.z *= u_waveHeight;
	v.z -=  2.0*u_waveHeight;
	v.z *= x * 0.09;
	
    gl_Position = u_projMatrix * u_mvMatrix * vec4(v,1.0) ;
}
