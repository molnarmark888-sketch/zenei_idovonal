import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'; 
import TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/20.0.0/tween.esm.js';

// --- 1. JELENET ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005); 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const labelsContainer = document.getElementById('labels');

// --- 2. HANGOK ---
const listener = new THREE.AudioListener();
camera.add(listener);
const warpSound = new THREE.Audio(listener);
const music = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

audioLoader.load('./cello.wav', (b) => { warpSound.setBuffer(b); warpSound.setVolume(1.0); });
audioLoader.load('./westcoast.mp3', (b) => { music.setBuffer(b); music.setLoop(true); music.setVolume(0.5); });

// --- 3. EXTRÉM SŰRŰ CSILLAGMEZŐ ---
const starCount = 150000; 
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starCols = new Float32Array(starCount * 3);

for(let i=0; i<starCount; i++) {
    starPos[i*3] = (Math.random() - 0.5) * 60000;
    starPos[i*3+1] = (Math.random() - 0.5) * 60000;
    starPos[i*3+2] = (Math.random() - 0.5) * 250000;
    const mix = Math.random();
    starCols[i*3] = 0.8 + mix * 0.2;     
    starCols[i*3+1] = 0.8 + mix * 0.2;   
    starCols[i*3+2] = 1.0;               
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

const starMat = new THREE.PointsMaterial({ 
    size: 5, 
    vertexColors: true,
    transparent: true, 
    opacity: 0.1, // Alaphelyzetben halvány a küldetés alatt
    blending: THREE.AdditiveBlending 
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// --- 4. FÉREGLYUK (EXTRA ERŐS SZÍNEK) ---
const tubeRadius = 2500;
const tubeLength = 160000;
const tubeGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, tubeLength, 128, 512, true);
tubeGeo.rotateX(Math.PI / 2);
const tubeMat = new THREE.PointsMaterial({ size: 10, vertexColors: true, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending });
const wormhole = new THREE.Points(tubeGeo, tubeMat);
wormhole.position.z = -tubeLength / 2 + 2000;
wormhole.visible = false;
scene.add(wormhole);

const tubeColors = [];
for (let i = 0; i < tubeGeo.attributes.position.count; i++) {
    const c = new THREE.Color().setHSL(Math.random(), 1, 0.5);
    tubeColors.push(c.r, c.g, c.b);
}
tubeGeo.setAttribute('color', new THREE.Float32BufferAttribute(tubeColors, 3));

// --- 5. HAJÓ ÉS LÁNG ---
const playerGroup = new THREE.Group();
const shipMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 1, roughness: 0.1, emissive: 0xff0000, emissiveIntensity: 2 });

new FBXLoader().load('./Spaceship4.fbx', (obj) => {
    obj.scale.set(2.5, 2.5, 2.5);
    obj.rotation.y = Math.PI;
    obj.traverse(c => { if(c.isMesh) c.material = shipMat; });
    playerGroup.add(obj);
});

const particleCount = 600;
const particleGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
const pCol = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) pPos[i*3+2] = Math.random() * 3000; 
particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));

const fireTrail = new THREE.Points(particleGeo, new THREE.PointsMaterial({ size: 60, blending: THREE.AdditiveBlending, transparent: true, vertexColors: true, depthWrite: false }));
fireTrail.position.set(0, -20, 150); 
playerGroup.add(fireTrail); 
playerGroup.visible = false;
scene.add(playerGroup);

// --- 6. LOGIKA ---
const player = { velocity: new THREE.Vector3(), acceleration: 3.2, deceleration: 0.95, maxSpeed: 45 };
const dimensions = [];
const yearsData = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

yearsData.forEach((year, i) => {
    const portal = new THREE.Group();
    portal.position.set((i % 2 ? 1 : -1) * 1200, 0, -i * 7000);
    const gate = new THREE.Mesh(new THREE.TorusGeometry(450, 30, 16, 100), new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 4 })); // Erősebb emissive a láthatóságért
    gate.rotation.y = Math.PI / 2;
    portal.add(gate);
    scene.add(portal);
    const label = document.createElement('div');
    label.className = 'year-label hidden';
    label.textContent = year;
    labelsContainer.appendChild(label);
    dimensions.push({ group: portal, mesh: gate, label: label, z: portal.position.z });
});

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
camera.position.set(0, 5000, 10000);

let phase = "WAIT"; 
let hyperSpeed = 0;
const keys = {};

// --- 7. INDÍTÁS KATTINTÁSRA ---
window.addEventListener('mousedown', () => {
    if (phase === "WAIT") {
        phase = "HYPER";
        if (warpSound.buffer) warpSound.play();
        
        // --- HYPERJUMP ALATT KIVILÁGOSODIK ---
        new TWEEN.Tween(starMat).to({ opacity: 1.0 }, 500).start();
        new TWEEN.Tween({ s: 0 }).to({ s: 2500 }, 1500).easing(TWEEN.Easing.Exponential.In).onUpdate(o => hyperSpeed = o.s).start();
        
        setTimeout(() => {
            new TWEEN.Tween({ s: 2500 }).to({ s: 0 }, 1500).easing(TWEEN.Easing.Exponential.Out).onUpdate(o => hyperSpeed = o.s).onComplete(() => {
                phase = "MISSION";
                warpSound.stop(); if(music.buffer) music.play();
                
                // --- MEGÉRKEZÉSKOR LEHALVÁNYUL (0.15), HOGY LÁTSZÓDJANAK A KÖRÖK ---
                new TWEEN.Tween(starMat).to({ opacity: 0.15 }, 1000).start();
                
                playerGroup.visible = true; wormhole.visible = true;
                playerGroup.position.set(0, 0, 1000);
            }).start();
        }, 1500);
    }
});

window.addEventListener('keydown', (e) => keys[e.code.replace('Key', '')] = true);
window.addEventListener('keyup', (e) => keys[e.code.replace('Key', '')] = false);

// --- 8. FŐ CIKLUS ---
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();

    if (phase === "HYPER") {
        stars.position.z += hyperSpeed;
        if (stars.position.z > 60000) stars.position.z = -120000;
        starMat.size = 5 + (hyperSpeed / 40); 
    } else {
        stars.position.z += 10; 
        if(stars.position.z > 60000) stars.position.z = -120000;
        starMat.size = 3; // Kisebb csillagok a küldetés alatt
    }

    if(phase === "MISSION") {
        if(keys.W) player.velocity.z -= player.acceleration;
        if(keys.S) player.velocity.z += player.acceleration;
        if(keys.A) { player.velocity.x -= player.acceleration; playerGroup.rotation.z = THREE.MathUtils.lerp(playerGroup.rotation.z, 0.5, 0.1); }
        else if(keys.D) { player.velocity.x += player.acceleration; playerGroup.rotation.z = THREE.MathUtils.lerp(playerGroup.rotation.z, -0.5, 0.1); }
        else { playerGroup.rotation.z = THREE.MathUtils.lerp(playerGroup.rotation.z, 0, 0.1); }

        player.velocity.clampLength(0, player.maxSpeed);
        playerGroup.position.add(player.velocity);
        player.velocity.multiplyScalar(player.deceleration);

        const dist = Math.sqrt(playerGroup.position.x**2 + playerGroup.position.y**2);
        if (dist > tubeRadius - 350) {
            const angle = Math.atan2(playerGroup.position.y, playerGroup.position.x);
            playerGroup.position.x = Math.cos(angle) * (tubeRadius - 350);
            playerGroup.position.y = Math.sin(angle) * (tubeRadius - 350);
        }

        const endZ = -((yearsData.length - 1) * 7000) - 200;
        if (playerGroup.position.z < endZ) { playerGroup.position.z = endZ; player.velocity.z = 0; }

        const pos = fireTrail.geometry.attributes.position.array;
        const col = fireTrail.geometry.attributes.color.array;
        for (let i = 0; i < particleCount; i++) {
            pos[i*3+2] += 40; 
            if (pos[i*3+2] > 3500) pos[i*3+2] = 0;  
            const life = pos[i*3+2] / 3500;
            col[i*3] = 1.0; col[i*3+1] = 1.0 - life * 2.5; col[i*3+2] = 0.5 - life;
        }
        fireTrail.geometry.attributes.position.needsUpdate = true;
        fireTrail.geometry.attributes.color.needsUpdate = true;

        wormhole.rotation.z += 0.02; 
        camera.position.lerp(playerGroup.position.clone().add(new THREE.Vector3(0, 950, 2900)), 0.1);
        camera.lookAt(playerGroup.position.x, playerGroup.position.y - 150, playerGroup.position.z - 1000);

        const currentIdx = dimensions.findIndex(d => d.z < playerGroup.position.z);
        dimensions.forEach((dim, idx) => {
            if (idx === currentIdx) {
                const vec = dim.group.position.clone().add(new THREE.Vector3(0, 800, 0)).project(camera);
                if (vec.z < 1) {
                    dim.label.classList.remove('hidden');
                    dim.label.style.left = `${(vec.x * 0.5 + 0.5) * window.innerWidth}px`;
                    dim.label.style.top = `${(vec.y * -0.5 + 0.5) * window.innerHeight}px`;
                }
            } else dim.label.classList.add('hidden');
        });
    }
    renderer.render(scene, camera);
}
animate();