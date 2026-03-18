// Adatbázis
const database = {
    "1900": { title: "A Fonográf kora", theme: "c/era-1900.css", video: "https://www.youtube.com/embed/S_I8v_p0V_k", text: "A zene rögzítésének hajnala..." },
    "1920": { title: "A Jazz Aranykora", theme: "c/era-1920.css", video: "https://www.youtube.com/embed/TRgeoo3hS_Y", text: "A húszas években a zene felszabadult..." },
    "2020": { title: "Modern Dominancia", theme: "c/era-2020.css", video: "https://www.youtube.com/embed/3W_uLvi90Cw", text: "A digitális éra végtelen adatfolyama..." }
};

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const year = params.get('year') || "1920";
    const entry = database[year] || database["1920"];

    // Adatok betöltése
    document.getElementById('year-display').textContent = year;
    document.getElementById('title-display').textContent = entry.title;
    document.getElementById('text-display').innerHTML = entry.text;
    document.getElementById('video-frame').src = entry.video + "?autoplay=0&mute=0&rel=0";
    document.getElementById('dynamic-style').href = entry.theme;

    // Funkciók indítása
    initThreeBackground();
    initScrollAnimations();
};

// --- GSAP GÖRGETÉSI ANIMÁCIÓ (0:29 -> 0:50) ---
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero kép eltorzulása és kizoomolása
    gsap.to("#main-visual-container", {
        scrollTrigger: {
            trigger: "#hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        scale: 0.5,
        opacity: 0,
        filter: "blur(20px)",
        y: -100
    });

    // 2. Végső panel beúsztatása
    gsap.from("#final-panel-section", {
        scrollTrigger: {
            trigger: "#final-panel-section",
            start: "top bottom",
            end: "center center",
            scrub: true
        },
        y: 300,
        opacity: 0,
        scale: 0.8
    });
}

// --- THREE.JS VÍZ-TORZÍTÁS HÁTTÉR ---
function initThreeBackground() {
    const canvas = document.getElementById('data-stream-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const mouse = new THREE.Vector2(0.5, 0.5);
    const targetMouse = new THREE.Vector2(0.5, 0.5);

    const fragmentShader = `
        uniform float uTime;
        uniform vec2 uMouse;
        varying vec2 vUv;
        void main() {
            vec2 uv = vUv;
            vec2 gridUv = fract(uv * 40.0);
            float grid = step(0.98, gridUv.x) + step(0.98, gridUv.y);
            float dist = distance(uv, uMouse);
            float strength = smoothstep(0.4, 0.0, dist);
            float wave = sin(dist * 20.0 - uTime * 2.0) * 0.01 * strength;
            vec3 color = vec3(0.13, 0.82, 0.93);
            gl_FragColor = vec4(color, grid * 0.15 + strength * 0.05);
        }
    `;

    const material = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uMouse: { value: mouse } },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragmentShader,
        transparent: true
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    window.addEventListener('mousemove', (e) => {
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
    });

    function anim(time) {
        requestAnimationFrame(anim);
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;
        material.uniforms.uTime.value = time * 0.001;
        material.uniforms.uMouse.value = mouse;
        renderer.render(scene, camera);
    }
    anim(0);
}