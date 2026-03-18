const database = {
    "1900": {
        title: "A Fonográf kora",
        theme: "c/era-1900.css",
        video: "https://www.youtube.com/embed/S_I8v_p0V_k",
        text: "<p>A zene rögzítésének hajnala. Ebben az évtizedben a technológia még csak kísérletezett a hang tárolásával.</p><p>Thomas Edison fonográfja és az első hengerek megnyitották az utat a rögzített zene előtt.</p>"
    },
    "1910": {
        title: "A Ragtime Aranykora",
        theme: "c/era-1910.css",
        video: "https://www.youtube.com/embed/fPmruHc4S9Q",
        text: "<p>Scott Joplin és a szinkópás ritmusok világa. A zene kezdett eltávolodni a szigorú klasszikus formáktól.</p><p>A New Orleans-i jazz első csírái megjelentek.</p>"
    },
    "1920": {
        title: "Jazz és Szesztilalom",
        theme: "c/era-1920.css",
        video: "https://www.youtube.com/embed/TRgeoo3hS_Y",
        text: "<p>A 'Roaring Twenties'. A rádió és a hanglemez elterjedése globális sztárokat teremtett.</p><p>A jazz improvizatív jellege alapjaiban változtatta meg a zenei közízlést.</p>"
    },
    "1930": {
        title: "A Swing korszaka",
        theme: "c/era-1930.css",
        video: "https://www.youtube.com/embed/r2S1iHsc6fo",
        text: "<p>A nagy gazdasági világválság idején a Swing Big Bandek adtak reményt az embereknek.</p>"
    },
    "1940": {
        title: "A Bebop születése",
        theme: "c/era-1940.css",
        video: "https://www.youtube.com/embed/09BB1pci8_o",
        text: "<p>A II. világháború után a jazz művészibb és komplexebb lett. Megszületett a Bebop.</p>"
    },
    "1950": {
        title: "Rock 'n' Roll Láz",
        theme: "c/era-1950.css",
        video: "https://www.youtube.com/embed/gj0Rz-uP4Mk",
        text: "<p>Elvis Presley és az elektromos gitár forradalma. A fiatalok saját kultúrát teremtettek.</p>"
    },
    "1960": {
        title: "Pszichedélia és Soul",
        theme: "c/era-1960.css",
        video: "https://www.youtube.com/embed/6_Y77vsvI6s",
        text: "<p>A Beatles, a Rolling Stones és a Motown korszaka. A stúdiótechnika fejlődése új hangzásokat hozott.</p>"
    },
    "1970": {
        title: "Bronx: A Hip-Hop gyökerei",
        theme: "c/era-1970.css",
        video: "https://www.youtube.com/embed/PobrSpMwKk4",
        text: "<p>New York utcáin megszületett valami új: a DJ kultúra, a loopolás és a rap.</p>"
    },
    "1980": {
        title: "Szintetizátorok és MTV",
        theme: "c/era-1980.css",
        video: "https://www.youtube.com/embed/YpS8V_wGv8A",
        text: "<p>A digitális hangszerek és a videóklip korszaka. Michael Jackson és Madonna uralta a listákat.</p>"
    },
    "1990": {
        title: "Aranykor és Grunge",
        theme: "c/era-1990.css",
        video: "https://www.youtube.com/embed/XW_N_9xOls4",
        text: "<p>A Hip-Hop aranykora és a grunge nyers ereje. Tupac, Biggie és a Nirvana korszaka.</p>"
    },
    "2000": {
        title: "A Digitális Áttörés",
        theme: "c/era-2000.css",
        video: "https://www.youtube.com/embed/k92yK6vGk8A",
        text: "<p>Az MP3 és a fájlcserélők kora. A pop és a hip-hop végleg összefonódott.</p>"
    },
    "2010": {
        title: "Streaming és Trap",
        theme: "c/era-2010.css",
        video: "https://www.youtube.com/embed/1W9lS90n1H0",
        text: "<p>A Spotify és a SoundCloud generációja. A Trap ütemek lettek a popzene alapjai.</p>"
    },
    "2020": {
        title: "Modern Dominancia",
        theme: "c/era-2020.css",
        video: "https://www.youtube.com/embed/3W_uLvi90Cw",
        text: "<p>A hip-hop a világ legnépszerűbb műfaja. A zene végtelen adatfolyammá vált.</p>"
    }
};

window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const year = params.get('year') || "1900";
    const entry = database[year] || database["1900"];

    // 1. Dinamikus CSS betöltése (ez húzza be a külön fájlt)
    const themeLink = document.getElementById('dynamic-style');
    if (themeLink) {
        themeLink.href = entry.theme;
    }

    // 2. Tartalom betöltése
    document.getElementById('year-display').textContent = year;
    if(document.getElementById('year-bg')) document.getElementById('year-bg').textContent = year;
    document.getElementById('title-display').textContent = entry.title;
    document.getElementById('text-display').innerHTML = entry.text;
    document.getElementById('video-frame').src = entry.video + "?autoplay=1&mute=0";

    // 3. Megjelenítés (Fade in)
    const bodyContent = document.getElementById('body-content');
    if (bodyContent) {
        bodyContent.classList.remove('opacity-0');
    }

    initThreeBackground();
};

function initThreeBackground() {
    const canvas = document.getElementById('data-stream-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(1000 * 3);
    for(let i=0; i<3000; i++) pos[i] = (Math.random()-0.5) * 100;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.1 }));
    scene.add(points);
    camera.position.z = 50;

    function anim() { 
        requestAnimationFrame(anim); 
        points.rotation.y += 0.001; 
        renderer.render(scene, camera); 
    }
    anim();
}