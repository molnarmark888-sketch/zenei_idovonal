import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

window.onbeforeunload = () => window.scrollTo(0, 0);
if (history.scrollRestoration) history.scrollRestoration = 'manual';

const topNav = document.getElementById('top-nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) topNav.style.transform = 'translateX(-50%) translateY(0)';
    else topNav.style.transform = 'translateX(-50%) translateY(-150%)';
});

const lenis = new Lenis({ duration: 1.2, wheelMultiplier: 1.3 });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
gsap.registerPlugin(ScrollTrigger);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2.4;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// AUDIO
const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
let isAudioLoaded = false;

const startAudio = () => {
    if (!isAudioLoaded) {
        audioLoader.load('zene/westcoast.mp3', (buffer) => {
            sound.setBuffer(buffer); sound.setLoop(true); sound.setVolume(0.2); sound.play();
            isAudioLoaded = true;
        });
    }
};
window.addEventListener('wheel', startAudio, { once: true });
window.addEventListener('click', startAudio, { once: true });

// CSILLAGOK
const starsPos = new Float32Array(4000 * 3).map(() => (Math.random() - 0.5) * 25);
const starField = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(starsPos, 3)),
    new THREE.PointsMaterial({ color: 0x00ffff, size: 0.012, transparent: true, opacity: 0.7 })
);
scene.add(starField);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const mainSpot = new THREE.SpotLight(0xffffff, 0);
mainSpot.position.set(0, 2, 5);
scene.add(mainSpot);

// BOOMBOX MODELL
const textureLoader = new THREE.TextureLoader();
const diffMap = textureLoader.load('textures/boombox_diff_4k.jpg');
const loader = new FBXLoader();
let boombox;

loader.load('3d/boombox_4k.fbx', (fbx) => {
    boombox = fbx;
    fbx.scale.set(0.026, 0.026, 0.026);
    fbx.position.set(0, -5, 0);

    const tl = gsap.timeline({
        scrollTrigger: { trigger: "#scroll-wrapper", start: "top top", end: "bottom bottom", scrub: 1 }
    });

    tl.to(fbx.position, { y: -0.35, duration: 2 }, 0);
    tl.to(mainSpot, { intensity: 100, duration: 2 }, 0);

    fbx.traverse(c => {
        if(c.isMesh) {
            c.material = new THREE.MeshStandardMaterial({ map: diffMap, metalness: 0.8, roughness: 0.2, color: 0xffffff });
            tl.from(c.position, { x: (Math.random()-0.5)*15, y: (Math.random()-0.5)*15, z: (Math.random()-0.5)*15, duration: 2 }, 0);
        }
    });
    scene.add(fbx);
    mainSpot.target = fbx;

    // VIDEÓSZALAG ANIMÁCIÓ (Itt úsznak el a videók)
    tl.to("#video-tape-container", { opacity: 0.7, duration: 0.5 }, 0)
      .to("#video-tape", { x: "-100%", duration: 2, ease: "none" }, 0);
});

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    starField.rotation.y += 0.0003;
    if (boombox) {
        boombox.rotation.y += (mouseX * 0.1 - boombox.rotation.y) * 0.05;
        boombox.rotation.x += (-mouseY * 0.05 - boombox.rotation.x) * 0.05;
    }
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// MAP ÁTLÉPÉS
window.addEventListener('click', () => {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
    if (boombox && raycaster.intersectObject(boombox, true).length > 0) {
        window.location.href = "map.html";
    }
});
