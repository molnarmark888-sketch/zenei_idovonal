// js/era-data.js

const database = {
    "1900": { title: "A Fonográf kora", theme: "c/era-1900.css", video: "https://www.youtube.com/embed/S_I8v_p0V_k", text: "<p>A zene rögzítésének hajnala...</p>" },
    "1920": { title: "A Jazz Aranykora", theme: "c/era-1920.css", video: "https://www.youtube.com/embed/TRgeoo3hS_Y", text: "<p>A húszas években a zene felszabadult...</p>" },
    "2020": { title: "Modern Dominancia", theme: "c/era-2020.css", video: "https://www.youtube.com/embed/3W_uLvi90Cw", text: "<p>A digitális éra végtelen adatfolyama...</p>" }
};

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const year = params.get('year') || "1920";
    const entry = database[year] || database["1920"];

    document.getElementById('year-display').textContent = year;
    document.getElementById('title-display').textContent = entry.title;
    document.getElementById('text-display').innerHTML = entry.text;
    document.getElementById('video-frame').src = entry.video + "?autoplay=0&rel=0";
    if(entry.theme) document.getElementById('dynamic-style').href = entry.theme;

    document.getElementById('body-content').classList.remove('opacity-0');

    initThreeBackground();
    initScrollAnimations();
    animateLogoOnStart();
};

function animateLogoOnStart() {
    const paths = document.querySelectorAll('.chrono-boom-path path, .chrono-boom-path rect, .chrono-boom-path circle');
    paths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
    });

    gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 2.5,
        stagger: 0.1,
        ease: "power2.inOut",
        delay: 0.5
    });
}

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to("#main-visual-container, #logo-svg-container", {
        scrollTrigger: {
            trigger: "#hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1
        },
        scale: 0.5,
        opacity: 0,
        y: -100,
        filter: "blur(20px)"
    });

    const hudPaths = document.querySelectorAll('.hud-path path');
    hudPaths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
    });

    gsap.timeline({
        scrollTrigger: {
            trigger: "#final-panel-section",
            start: "top bottom",
            end: "center center",
            scrub: 1
        }
    })
    .from("#final-panel-section", { y: 300, opacity: 0, scale: 0.8 })
    .to(hudPaths, { strokeDashoffset: 0, duration: 1, stagger: 0.1 });
}

function initThreeBackground() {
    const canvas = document.getElementById('data-stream-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const mouse = new THREE.Vector2(0.5, 0.5);
    const targetMouse = new THREE.Vector2(0.5, 0.5);

    const material = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uMouse: { value: mouse } },
        vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
        fragmentShader: `
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
                gl_FragColor = vec4(color, grid * 0.15 + strength * 0.08);
            }
        `,
        transparent: true
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    window.addEventListener('mousemove', (e) => {
        targetMouse.x = e.clientX / window.innerWidth;
        targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
    });

    function animate(t) {
        requestAnimationFrame(animate);
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;
        material.uniforms.uTime.value = t * 0.001;
        material.uniforms.uMouse.value = mouse;
        renderer.render(scene, camera);
    }
    animate(0);
}