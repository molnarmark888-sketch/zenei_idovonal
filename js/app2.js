import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// 1. LENIS & GSAP
const lenis = new Lenis({ duration: 1.2, wheelMultiplier: 1.5 });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
gsap.registerPlugin(ScrollTrigger);

// 2. SCENE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2.4;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// --- AUDIO SETUP (JAVÍTOTT) ---
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
const analyser = new THREE.AudioAnalyser(sound, 32);
let isAudioLoaded = false;

const startAudio = () => {
    if (!isAudioLoaded) {
        audioLoader.load('zene/westcoast.mp3', (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.2); 
            sound.play();
            isAudioLoaded = true;
        });
    }
};
window.addEventListener('wheel', startAudio, { once: true });
window.addEventListener('click', startAudio, { once: true });
window.addEventListener('mousemove', startAudio, { once: true });

// 3. HÁTTÉR (CSILLAGOK)
const starField = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(4000 * 3).map(() => (Math.random() - 0.5) * 25), 3)),
    new THREE.PointsMaterial({ color: 0x00ffff, size: 0.012, transparent: true, opacity: 0.7 })
);
scene.add(starField);

// 4. FÉNYEK
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const mainSpot = new THREE.SpotLight(0xffffff, 0);
mainSpot.position.set(0, 2, 5);
scene.add(mainSpot);

// 5. MODELL & ASSEMBLE ANIMÁCIÓ
const textureLoader = new THREE.TextureLoader();
const diffMap = textureLoader.load('./textures/boombox_diff_4k.jpg');

let boombox, speakers = [];
const loader = new FBXLoader();

loader.load('3d/boombox_4k.fbx', (fbx) => {
    boombox = fbx;
    fbx.scale.set(0.026, 0.026, 0.026);
    fbx.position.set(0, -5, 0);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    tl.to(fbx.position, { y: -0.35, duration: 2 }, 0);
    tl.to(mainSpot, { intensity: 100, duration: 2 }, 0);

    fbx.traverse(c => {
        if(c.isMesh) {
            c.material = new THREE.MeshStandardMaterial({ 
                map: diffMap,
                metalness: 0.8,
                roughness: 0.2,
                color: 0xffffff 
            });

            // ASSEMBLE: Darabok robbanásszerű beúszása
            tl.from(c.position, {
                x: (Math.random() - 0.5) * 15, 
                y: (Math.random() - 0.5) * 15,
                z: (Math.random() - 0.5) * 15,
                duration: 2,
                ease: "power2.out"
            }, 0);

            // Megjelenés a semmiből
            tl.from(c.scale, { x: 0, y: 0, z: 0, duration: 1 }, 0);

            if (c.name.toLowerCase().includes('speaker') || c.name.toLowerCase().includes('mesh')) {
                speakers.push(c);
                c.userData.originalZ = c.position.z;
            }
        }
    });
    
    scene.add(fbx);
    mainSpot.target = fbx;

    // Videók és Hangerő szabályzás
    tl.to("#video-tape-container", { opacity: 0.7, duration: 0.5 }, 0)
      .to("#video-tape", { x: "-100%", duration: 2, ease: "none" }, 0)
      .to("#video-tape-container", { opacity: 0, duration: 0.4 }, 1.6);

    ScrollTrigger.create({
        trigger: "#scroll-wrapper",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
            if (isAudioLoaded) {
                let vol = 0.2 + (self.progress * 0.6); 
                sound.setVolume(vol);
            }
        }
    });
});

// 6. ANIMÁCIÓS CIKLUS
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    starField.rotation.y += 0.0003;

    if (boombox) {
        boombox.rotation.y += (mouseX * 0.15 - boombox.rotation.y) * 0.05;
        boombox.rotation.x += (-mouseY * 0.1 - boombox.rotation.x) * 0.05;
    }

    if (isAudioLoaded && sound.isPlaying) {
        const freq = analyser.getAverageFrequency();
        const intensity = freq / 255;
        speakers.forEach(s => {
            s.scale.setScalar(1 + (intensity * 0.15));
            s.position.z = s.userData.originalZ + (intensity * 8);
        });
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener('click', () => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
    if (boombox && raycaster.intersectObject(boombox, true).length > 0) {
        window.location.href = "map.html";
    }
});