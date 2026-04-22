import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// 1. SMOOTH SCROLL (Lenis)
const lenis = new Lenis({ 
    lerp: 0.1,
    wheelMultiplier: 1.2,
    infinite: false 
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// --- CÍM ÉS PANELEK ---
const title = document.getElementById('chrono-title');
if (title) {
    const text = title.textContent; title.textContent = '';
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.classList.add('char');
        title.appendChild(span);
    });
    gsap.to(".char", { opacity: 1, y: 0, stagger: 0.05, duration: 0.8 });
}

const container = document.getElementById('dynamic-panels-container');
const panels = [];
const coords = [{x:0,y:0},{x:0,y:-380},{x:0,y:380},{x:-280,y:0},{x:280,y:0}];
for (let i = 0; i < 5; i++) {
    const panel = document.createElement('div');
    panel.className = 'gallery-panel';
    const img = document.createElement('img');
    img.src = `https://picsum.photos/400/600?random=${i}`;
    panel.appendChild(img);
    container.appendChild(panel);
    panels.push(panel);
    gsap.set(panel, { z: -1500, opacity: 0 });
}

// --- THREE.JS JELENET ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// --- FÉNYEK ---
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const l1 = new THREE.PointLight(0xffffff, 120); l1.position.set(-5, 5, 5); scene.add(l1);
const l2 = new THREE.PointLight(0xffffff, 150); l2.position.set(5, 5, 5); scene.add(l2);
const topLight = new THREE.SpotLight(0xffffff, 200); topLight.position.set(0, 8, 2); scene.add(topLight);
const bottomLight = new THREE.PointLight(0xffffff, 150); bottomLight.position.set(0, -8, 4); scene.add(bottomLight);

// --- DINAMIKUS KIJELZŐ TEXTÚRA (A TRÜKK) ---
const displayCanvas = document.createElement('canvas');
displayCanvas.width = 512; 
displayCanvas.height = 256;
const ctx = displayCanvas.getContext('2d');
const displayTexture = new THREE.CanvasTexture(displayCanvas);

function updateDisplay(txt) {
    // Fekete háttér
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 512, 256);
    
    // Zöld neon szöveg
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 60px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Ragyogás effekt
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff00';
    
    ctx.fillText(txt, 256, 128);
    displayTexture.needsUpdate = true;
}

// Kezdetben üres a kijelző
updateDisplay(""); 

let radio;
let isPowerOn = false;

new GLTFLoader().load('./3d/textures/Textures/NOALPHAglb.glb', (gltf) => {
    radio = gltf.scene;
    radio.scale.set(7.8, 7.8, 7.8);
    radio.position.set(0, -1.2, 0);
    radio.rotation.x = 0.25;
    scene.add(radio);

    radio.traverse((child) => {
        // Keressük meg a középső részt (a kép alapján a Box.005 az)
        if (child.name === "Box.005") {
            child.material = new THREE.MeshStandardMaterial({ 
                map: displayTexture, 
                emissive: new THREE.Color(0x00ff00), 
                emissiveIntensity: 0, // Alapból sötét
                transparent: true,
                opacity: 0.95
            });
        }
    });
});

camera.position.z = 10;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
    if (!radio) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(radio.children, true);
    
    if (intersects.length > 0) {
        const obj = intersects[0].object;

        // Gombnyomás animáció
        if (!gsap.isTweening(obj.position) && obj.name !== "Scene") {
            gsap.to(obj.position, { 
                y: obj.position.y - 0.03, 
                duration: 0.12, 
                ease: "power2.inOut", 
                yoyo: true, 
                repeat: 1 
            });
        }
        
        // Bekapcsoláskor kiírjuk a szöveget a modellre
        if (!isPowerOn) {
            isPowerOn = true;
            updateDisplay("CHRONO BOOM");
            radio.traverse(c => { 
                if(c.name === "Box.005") {
                    gsap.to(c.material, { emissiveIntensity: 3.5, duration: 0.5 }); 
                }
            });
        }
    }
});

// --- SCROLL ÉS ZOOM STOP ---
gsap.registerPlugin(ScrollTrigger);
const tl = gsap.timeline({ 
    scrollTrigger: { 
        trigger: "#scroll-wrapper", 
        start: "top top", 
        end: "bottom bottom", 
        scrub: 1,
    } 
});

tl.to("#chrono-title-wrapper", { opacity: 0, scale: 0.8, duration: 1 });
panels.forEach((p, i) => { 
    tl.to(p, { opacity: 1, z: 0, x: coords[i].x, y: coords[i].y, duration: 2 }, "-=1.5"); 
});
tl.to(panels, { z: 1200, opacity: 0, stagger: 0.1, duration: 1.5 }, "+=0.5");
tl.to(canvas, { opacity: 1, onStart: () => canvas.classList.add('visible'), duration: 1 }, "-=0.5");

tl.to(camera.position, { 
    z: 5.5, 
    duration: 3, 
    ease: "none" 
}, "-=1");

function animate(t) {
    requestAnimationFrame(animate);
    if (radio && canvas.classList.contains('visible')) {
        radio.position.y = -1.2 + Math.sin(t * 0.002) * 0.04;
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});