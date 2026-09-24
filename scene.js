import * as THREE from './vendor/three.module.js';
// The image is projected onto a gently layered 3D mesh. Camera movement and
// particles at different depths give the skyline a restrained spatial parallax.
const host=document.querySelector('#city-scene');
try {
 const renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.z=10;
 const uniforms={uImage:{value:null},uAspect:{value:1},uImageAspect:{value:1672/941},uTime:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.z+=pow(1.0-uv.y,3.0)*0.35;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,fragmentShader:`uniform sampler2D uImage;uniform float uAspect;uniform float uImageAspect;uniform float uTime;varying vec2 vUv;void main(){vec2 uv=vUv;float ratio=uAspect/uImageAspect;if(ratio<1.0){uv.x=(uv.x-0.5)*ratio+0.5;}else{uv.y=(uv.y-0.5)/ratio+0.5;}vec4 col=texture2D(uImage,uv);float horizon=exp(-pow((uv.y-0.27)*9.0,2.0));col.rgb+=vec3(0.008,0.007,0.011)*horizon*(sin(uTime*0.35)*0.5+0.5);gl_FragColor=col;}`});
 const skyline=new THREE.Mesh(new THREE.PlaneGeometry(1,1,50,24),material);scene.add(skyline);
 const pointsCount=70,positions=new Float32Array(pointsCount*3);let seed=17;function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}for(let i=0;i<pointsCount;i++){positions[i*3]=(random()-.5)*22;positions[i*3+1]=(random()-.5)*12;positions[i*3+2]=1+random()*3;}
 const pointsGeo=new THREE.BufferGeometry();pointsGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const particles=new THREE.Points(pointsGeo,new THREE.PointsMaterial({color:0xb8cdfc,size:.011,transparent:true,opacity:.26,depthWrite:false}));scene.add(particles);
 let loaded=false,visible=true,raf=0,last=0,elapsed=0;const target=new THREE.Vector2(),pointer=new THREE.Vector2();
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();uniforms.uAspect.value=w/h;const worldH=2*Math.tan(THREE.MathUtils.degToRad(42)/2)*10;skyline.scale.set(worldH*camera.aspect*1.065,worldH*1.065,1);if(loaded)renderer.render(scene,camera);}
 const paused=()=>window.portfolioMotion?.paused??matchMedia('(prefers-reduced-motion: reduce)').matches;
 function render(now){raf=0;if(!loaded)return;const dt=Math.min((now-last)/1000,.05);last=now;if(!paused()){elapsed+=dt;pointer.lerp(target,.035);camera.position.x=pointer.x*.16+Math.sin(elapsed*.10)*.024;camera.position.y=pointer.y*.10;camera.lookAt(0,0,0);uniforms.uTime.value=elapsed;particles.rotation.z=Math.sin(elapsed*.04)*.008;particles.position.y=Math.sin(elapsed*.15)*.065;}renderer.render(scene,camera);if(!paused()&&visible&&!document.hidden)raf=requestAnimationFrame(render);}
 function start(){if(!raf&&loaded&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(render);}}
 new THREE.TextureLoader().load('./assets/skyline.png',texture=>{uniforms.uImage.value=texture;loaded=true;resize();host.classList.add('ready');start();},undefined,()=>{host.remove();});
 new ResizeObserver(resize).observe(host);new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start();}).observe(host);document.addEventListener('visibilitychange',start);window.addEventListener('portfolio-motion',()=>{if(paused()){target.set(0,0);pointer.set(0,0);camera.position.set(0,0,10);camera.lookAt(0,0,0);if(loaded)renderer.render(scene,camera);}start();});
 host.parentElement.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();target.set((e.clientX-r.left)/r.width-.5,-((e.clientY-r.top)/r.height-.5));});host.parentElement.addEventListener('pointerleave',()=>target.set(0,0));
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);host.classList.remove('ready');});resize();
} catch (error) { host.remove(); /* The static skyline remains fully usable. */ }
