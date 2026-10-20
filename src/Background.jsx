import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const FRAG = `
uniform float t; uniform vec2 res; uniform vec3 bg; uniform vec3 a; uniform vec3 b; uniform vec3 c;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,s=.5;for(int i=0;i<4;i++){v+=s*n(p);p*=2.;s*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/res; uv.x*=res.x/res.y;
 float q=fbm(uv*1.6+vec2(t*.05,-t*.03));
 float r=fbm(uv*2.2+q*2.+vec2(-t*.04,t*.06));
 vec3 col=bg;
 col=mix(col,a,smoothstep(.25,.9,q)*.8);
 col=mix(col,b,smoothstep(.35,.95,r)*.6);
 col=mix(col,c,smoothstep(.55,1.,q*r*1.8)*.5);
 col*=.55+.45*smoothstep(1.4,.2,length(uv-vec2(.6*res.x/res.y,.5)));
 gl_FragColor=vec4(col,1.);
}`;
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

export default function Background({ colors, speed }) {
  const canvas = useRef(), uni = useRef(null), spd = useRef(speed);
  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ canvas: canvas.current });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const u = { t: { value: 0 }, res: { value: new THREE.Vector2() }, bg: { value: new THREE.Vector3() }, a: { value: new THREE.Vector3() }, b: { value: new THREE.Vector3() }, c: { value: new THREE.Vector3() } };
    uni.current = u;
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: u, vertexShader: 'void main(){gl_Position=vec4(position,1.);}', fragmentShader: FRAG })));
    const size = () => { renderer.setSize(innerWidth, innerHeight, false); u.res.value.set(innerWidth, innerHeight); };
    size(); addEventListener('resize', size);
    let id, last = performance.now();
    const loop = () => { const now = performance.now(); u.t.value += ((now - last) / 1000) * spd.current; last = now; renderer.render(scene, cam); id = requestAnimationFrame(loop); };
    const vis = () => { cancelAnimationFrame(id); last = performance.now(); if (!document.hidden) loop(); };
    document.addEventListener('visibilitychange', vis); loop();
    return () => { cancelAnimationFrame(id); removeEventListener('resize', size); document.removeEventListener('visibilitychange', vis); renderer.dispose(); };
  }, []);
  useEffect(() => {
    const u = uni.current; if (!u) return;
    ['bg', 'a', 'b', 'c'].forEach((k, i) => u[k].value.set(...rgb(colors[i])));
    spd.current = speed;
  }, [colors, speed]);
  return <canvas ref={canvas} className="fixed inset-0 z-0 h-full w-full" />;
}
