const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Központi 3D alakzat
const geometry = new THREE.IcosahedronGeometry(2.5, 0);
const material = new THREE.MeshStandardMaterial({ 
    color: 0x22d3ee, 
    wireframe: true,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.5 
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

scene.add(new THREE.PointLight(0xffffff, 1, 100));
scene.add(new THREE.AmbientLight(0x202020));
camera.position.z = 8;

const menuItems = document.querySelectorAll('.menu-item');
const titles = ["SYSTEM START", "DATA GALLERY", "GLOBAL FREQUENCY"];

menuItems.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
        document.getElementById('item-title').innerText = titles[index];
        new TWEEN.Tween(mesh.rotation).to({ y: mesh.rotation.y + Math.PI, z: index }, 800).start();
        new TWEEN.Tween(mesh.scale).to({ x: 1.4, y: 1.4, z: 1.4 }, 400).start();
    });
    item.addEventListener('mouseleave', () => {
        new TWEEN.Tween(mesh.scale).to({ x: 1, y: 1, z: 1 }, 400).start();
    });
    
    // Most már a MAP (index 2) visz az alagútba
    item.addEventListener('click', () => {
        if(index === 2) { 
            window.location.href = 'index.html'; 
        }
    });
});

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    mesh.rotation.x += 0.003;
    mesh.rotation.y += 0.003;
    renderer.render(scene, camera);
}
animate();