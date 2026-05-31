export type PanelMedia =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster?: string };

export type Track = {
  src: string;
  title: string;
  artist: string;
  year: number;
  description: string;
};

export type RadioMeshConfig = {
  display: string;
  hang1: string;
  hang2: string;
  ledPattern: RegExp;
  kittScannerLeds: string[];
  trackBoxNames: string[];
  ignore: string[];
};

export type CameraOrbitConfig = {
  baseZ: number;
  zoomedZ: number;
  amplitudeX: number;
  amplitudeY: number;
  amplitudeZ: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  lookAtY: number;
  radioY: number;
  dragSensitivity: number;
  dragYawLimit: number;
  dragPitchMin: number;
  dragPitchMax: number;
};

export type AudioControlConfig = {
  rewindSlow: number;
  rewindFast: number;
  forwardSlow: number;
  forwardFast: number;
};

export type KnobConfig = {
  rotationAxis: 'x' | 'y' | 'z';
  rotationFactor: number;
  volumeSensitivity: number;
  pitchSensitivity: number;
  pitchMin: number;
  pitchMax: number;
  initialVolume: number;
  initialPitch: number;
};

export type F8TransitionConfig = {
  duration: number;
  radioFlyZ: number;
  parallaxAnchorSelector: string;
  overlapAnchorSelector: string;
  newspaperAnchorSelector: string;
  radioAnchorSelector: string;
};

export type SectionEntryAnim = {
  fromX?: number;
  fromY?: number;
  fromScale?: number;
  fromRotate?: number;
  fromOpacity?: number;
  duration: number;
  ease: string;
  sorrend: number;
};

export type SectionLayer = {
  name: string;
  src: string;
  tavolsag: number;
  oldal: 'bal' | 'jobb' | 'kozep';
  fuggoleges: 'fold' | 'kozep' | 'felso';
  magassag: number;
  eltolas: number;
  yEltolas: number;
  blurRadius: number;
  opacityBase: number;
  parallaxIntenzitas: number;
  belepo: SectionEntryAnim;
};

export type SectionConfig = {
  // Rövid parallax intró rétegei (a section-asset-ekből)
  hatter: { src: string; blurRadius: number; opacityBase: number; scale: number } | null;
  retegek: SectionLayer[];
  // Az F8 utáni overlap-intró fullscreen képei (egymásra csúsznak, auto-play)
  bevezeto: string[];
  // A lapozható újság lap-képei (FullHD JPG-k), pl. ['/img/section1/oldal1.jpg', ...]; üres = még nincs lap
  oldalak: string[];
};

export type SectionId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export type NewspaperConfig = {
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  flippingTime: number;
};

export type AppConfig = {
  scrollPanels: PanelMedia[];
  defaultMusic: { src: string; volume: number; loop: boolean };
  radioModelPath: string;
  trackBoxes: Record<string, Track>;
  meshNames: RadioMeshConfig;
  cameraOrbit: CameraOrbitConfig;
  ledColors: number[];
  kittScanner: {
    cycleSeconds: number;
    baseEmissive: number;
    peakEmissive: number;
    color: number;
  };
  audioControls: AudioControlConfig;
  knob: KnobConfig;
  f8Transition: F8TransitionConfig;
  newspaper: NewspaperConfig;
  sections: Record<SectionId, SectionConfig>;
};

export const defaultTrack: Track = {
  src: '/zene/cello.wav',
  title: 'Cello',
  artist: 'Cello Artist',
  year: 2023,
  description: 'Nice cello music.'
};

export const config: AppConfig = {
  scrollPanels: [
    { kind: 'image', src: '/img/1.jpg', alt: 'Panel 1' },
    { kind: 'image', src: '/img/2.jpg', alt: 'Panel 2' },
    { kind: 'image', src: '/img/3.jpg', alt: 'Panel 3' },
    { kind: 'image', src: '/img/4.jpg', alt: 'Panel 4' },
    { kind: 'image', src: '/img/5.jpg', alt: 'Panel 5' }
  ],
  defaultMusic: { src: '/zene/westcoast.mp3', volume: 0.3, loop: true },
  radioModelPath: '/3d/radio_1.glb',
  trackBoxes: {
    S1: {
      src: '/zene/1970.mp3',
      title: "Rapper's Delight ",
      artist: 'The Sugarhill Gang',
      year: 1979,
      description: ''
    },
    S2: {
      src: '/zene/1980.mp3',
      title: ' Straight Outta Compton',
      artist: 'N.W.A.',
      year: 1989,
      description: ''
    },
    S3: {
      src: '/zene/1990.mp3',
      title: "Gangsta's Paradise (feat. L.V.)",
      artist: 'Coolio',
      year: 1995,
      description: ''
    },
    S4: {
      src: '/zene/2000.mp3',
      title: 'In Da Club',
      artist: '50 Cent',
      year: 2003,
      description: ''
    },
    S5: {
      src: '/zene/2010.mp3',
      title: 'Travis Scott',
      artist: 'SICKO MODE',
      year: 2018,
      description: 'featuring Drake'
    }
  },
  meshNames: {
    display: 'display',
    hang1: 'HANG1',
    hang2: 'HANG2',
    ledPattern: /^LED\d+$/,
    kittScannerLeds: ['LED8', 'LED9', 'LED10', 'LED11'],
    trackBoxNames: ['S1', 'S2', 'S3', 'S4', 'S5'],
    ignore: ['Scene', 'Box']
  },
  cameraOrbit: {
    baseZ: 10,
    zoomedZ: 7.2,
    amplitudeX: 0.18,
    amplitudeY: 0.08,
    amplitudeZ: 0.05,
    speedX: 0.12,
    speedY: 0.17,
    speedZ: 0.08,
    lookAtY: -1.0,
    radioY: -2.0,
    dragSensitivity: 0.003,
    dragYawLimit: 0.35,
    dragPitchMin: -0.75,
    dragPitchMax: 0.3
  },
  ledColors: [0xff0033, 0x00ff66, 0xffaa00, 0x00aaff, 0xff00ff],
  kittScanner: {
    cycleSeconds: 0.9,
    baseEmissive: 0.15,
    peakEmissive: 6,
    color: 0xff1a1a
  },
  audioControls: {
    rewindSlow: 0.5,
    rewindFast: 4,
    forwardSlow: 1.5,
    forwardFast: 4
  },
  knob: {
    rotationAxis: 'x',
    rotationFactor: 0.012,
    volumeSensitivity: 0.005,
    pitchSensitivity: 0.005,
    pitchMin: 0.5,
    pitchMax: 2.0,
    initialVolume: 0.3,
    initialPitch: 1.0
  },
  f8Transition: {
    duration: 1.5,
    radioFlyZ: -25,
    parallaxAnchorSelector: '#section-parallax',
    overlapAnchorSelector: '#section-overlap',
    newspaperAnchorSelector: '#section-ujsag',
    radioAnchorSelector: '#section-radio'
  },
  // FullHD fullscreen újság: egy lap = a képernyő fele (960×1080), két lap = teljes FullHD (1920×1080)
  newspaper: {
    width: 960,
    height: 1080,
    minWidth: 320,
    maxWidth: 960,
    minHeight: 360,
    maxHeight: 1080,
    flippingTime: 800
  },
  sections: {
    S1: {
      hatter: { src: '/img/section1/also.png', blurRadius: 1, opacityBase: 1, scale: 1.05 },
      retegek: [
        {
          name: 'felso',
          src: '/img/section1/felso.png',
          tavolsag: 90,
          oldal: 'kozep',
          fuggoleges: 'felso',
          magassag: 35,
          eltolas: 0,
          yEltolas: 0,
          blurRadius: 1.5,
          opacityBase: 1,
          parallaxIntenzitas: 0.6,
          belepo: { fromY: -120, fromOpacity: 0, duration: 0.6, ease: 'power2.out', sorrend: 0 }
        },
        {
          name: 'tabla_bal',
          src: '/img/section1/tabla_bal.png',
          tavolsag: 50,
          oldal: 'bal',
          fuggoleges: 'kozep',
          magassag: 22,
          eltolas: 40,
          yEltolas: -40,
          blurRadius: 0.5,
          opacityBase: 1,
          parallaxIntenzitas: 1.0,
          belepo: { fromX: -200, fromOpacity: 0, duration: 0.5, ease: 'power3.out', sorrend: 1 }
        },
        {
          name: 'jobbsarok',
          src: '/img/section1/jobbsarok.png',
          tavolsag: 40,
          oldal: 'jobb',
          fuggoleges: 'kozep',
          magassag: 30,
          eltolas: -30,
          yEltolas: 0,
          blurRadius: 0.3,
          opacityBase: 1,
          parallaxIntenzitas: 1.1,
          belepo: { fromX: 200, fromOpacity: 0, duration: 0.5, ease: 'power3.out', sorrend: 1 }
        },
        {
          name: 'kuka',
          src: '/img/section1/kuka.png',
          tavolsag: 20,
          oldal: 'kozep',
          fuggoleges: 'fold',
          magassag: 35,
          eltolas: 0,
          yEltolas: 0,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.3,
          belepo: { fromY: 300, fromOpacity: 0, fromScale: 0.9, duration: 0.6, ease: 'power4.out', sorrend: 2 }
        }
      ],
      bevezeto: [
        '/img/section1/overlay1.png',
        '/img/section1/overlay2.png',
        '/img/section1/overlay3.png',
        '/img/section1/overlay4.png',
        '/img/section1/overlay5.png'
      ],
      oldalak: ['/img/section1/elso.png', '/img/section1/masodik.png', '/img/section1/harmadik.png', '/img/section1/negyedik.png', '/img/section1/otodik.png', '/img/section1/hatodik.png']
    },
    S2: {
      hatter: { src: '/img/section2/hatter2.png', blurRadius: 1.5, opacityBase: 1, scale: 1.05 },
      retegek: [
        {
          name: 'lampak',
          src: '/img/section2/lampak.png',
          tavolsag: 80,
          oldal: 'kozep',
          fuggoleges: 'felso',
          magassag: 40,
          eltolas: 0,
          yEltolas: 0,
          blurRadius: 1,
          opacityBase: 1,
          parallaxIntenzitas: 0.7,
          belepo: { fromY: -150, fromOpacity: 0, duration: 0.6, ease: 'power2.out', sorrend: 0 }
        },
        {
          name: 'bench',
          src: '/img/section2/bench.png',
          tavolsag: 45,
          oldal: 'kozep',
          fuggoleges: 'fold',
          magassag: 30,
          eltolas: 0,
          yEltolas: 0,
          blurRadius: 0.3,
          opacityBase: 1,
          parallaxIntenzitas: 1.0,
          belepo: { fromY: 200, fromOpacity: 0, duration: 0.5, ease: 'power3.out', sorrend: 1 }
        },
        {
          name: 'boom',
          src: '/img/section2/boom.png',
          tavolsag: 30,
          oldal: 'kozep',
          fuggoleges: 'fold',
          magassag: 16,
          eltolas: 0,
          yEltolas: -80,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.2,
          belepo: { fromScale: 0.6, fromOpacity: 0, duration: 0.5, ease: 'back.out(1.6)', sorrend: 2 }
        },
        {
          name: 'cipo',
          src: '/img/section2/cipo.png',
          tavolsag: 10,
          oldal: 'jobb',
          fuggoleges: 'fold',
          magassag: 25,
          eltolas: -40,
          yEltolas: 40,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.4,
          belepo: { fromX: 250, fromY: 100, fromOpacity: 0, duration: 0.5, ease: 'power4.out', sorrend: 2 }
        }
      ],
      bevezeto: [
        '/img/section2/overlay1.png',
        '/img/section2/overlay2.png',
        '/img/section2/overlay3.png',
        '/img/section2/overlay4.png',
        '/img/section2/overlay5.png'
      ],
      oldalak: ['/img/section2/elso.png', '/img/section2/masodik.png', '/img/section2/harmadik.png', '/img/section2/negyedik.png', '/img/section2/otodik.png', '/img/section2/hatodik.png']
    },
    S3: {
      hatter: { src: '/img/section3/hatter3.png', blurRadius: 2, opacityBase: 1, scale: 1.08 },
      retegek: [
        {
          name: 'autohat',
          src: '/img/section3/autohat.png',
          tavolsag: 55,
          oldal: 'bal',
          fuggoleges: 'fold',
          magassag: 45,
          eltolas: -40,
          yEltolas: 0,
          blurRadius: 0.5,
          opacityBase: 1,
          parallaxIntenzitas: 0.9,
          belepo: { fromX: -300, fromOpacity: 0, duration: 0.7, ease: 'power3.out', sorrend: 0 }
        },
        {
          name: 'autoelso',
          src: '/img/section3/autoelso.png',
          tavolsag: 35,
          oldal: 'jobb',
          fuggoleges: 'fold',
          magassag: 50,
          eltolas: 40,
          yEltolas: 0,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.1,
          belepo: { fromX: 300, fromOpacity: 0, duration: 0.7, ease: 'power3.out', sorrend: 0 }
        },
        {
          name: 'felirat',
          src: '/img/section3/felirat.png',
          tavolsag: 25,
          oldal: 'kozep',
          fuggoleges: 'kozep',
          magassag: 18,
          eltolas: 0,
          yEltolas: 60,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.2,
          belepo: { fromScale: 1.4, fromOpacity: 0, duration: 0.5, ease: 'power2.out', sorrend: 1 }
        },
        {
          name: 'cipo',
          src: '/img/section3/cipo.png',
          tavolsag: 10,
          oldal: 'bal',
          fuggoleges: 'fold',
          magassag: 24,
          eltolas: 60,
          yEltolas: 40,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.4,
          belepo: { fromY: 250, fromOpacity: 0, duration: 0.5, ease: 'power4.out', sorrend: 2 }
        }
      ],
      bevezeto: [
        '/img/section3/overlay1.png',
        '/img/section3/overlay2.png',
        '/img/section3/overlay3.png',
        '/img/section3/overlay4.png',
        '/img/section3/overlay5.png'
      ],
      oldalak: ['/img/section3/elso.png', '/img/section3/masodik.png', '/img/section3/harmadik.png', '/img/section3/negyedik.png', '/img/section3/otodik.png', '/img/section3/hatodik.png']
    },
    S4: {
      hatter: { src: '/img/section4/hatter4.png', blurRadius: 2, opacityBase: 1, scale: 1.06 },
      retegek: [
        {
          name: 'lancb',
          src: '/img/section4/lancb.png',
          tavolsag: 70,
          oldal: 'bal',
          fuggoleges: 'felso',
          magassag: 55,
          eltolas: 0,
          yEltolas: 0,
          blurRadius: 1,
          opacityBase: 1,
          parallaxIntenzitas: 0.8,
          belepo: { fromY: -200, fromOpacity: 0, duration: 0.6, ease: 'power2.out', sorrend: 0 }
        },
        {
          name: 'lancj',
          src: '/img/section4/lancj.png',
          tavolsag: 70,
          oldal: 'jobb',
          fuggoleges: 'felso',
          magassag: 55,
          eltolas: 0,
          yEltolas: 0,
          blurRadius: 1,
          opacityBase: 1,
          parallaxIntenzitas: 0.8,
          belepo: { fromY: -200, fromOpacity: 0, duration: 0.6, ease: 'power2.out', sorrend: 0 }
        },
        {
          name: 'ember',
          src: '/img/section4/ember.png',
          tavolsag: 35,
          oldal: 'kozep',
          fuggoleges: 'fold',
          magassag: 75,
          eltolas: 0,
          yEltolas: 0,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.0,
          belepo: { fromY: 250, fromScale: 0.85, fromOpacity: 0, duration: 0.7, ease: 'power4.out', sorrend: 1 }
        },
        {
          name: 'kar',
          src: '/img/section4/kar.png',
          tavolsag: 10,
          oldal: 'jobb',
          fuggoleges: 'fold',
          magassag: 40,
          eltolas: -20,
          yEltolas: 60,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.4,
          belepo: { fromX: 200, fromOpacity: 0, duration: 0.5, ease: 'power4.out', sorrend: 2 }
        }
      ],
      bevezeto: [
        '/img/section4/overlay1.png',
        '/img/section4/overlay2.png',
        '/img/section4/overlay3.png',
        '/img/section4/overlay4.png',
        '/img/section4/overlay5.png'
      ],
      oldalak: ['/img/section4/elso.png', '/img/section4/masodik.png', '/img/section4/harmadik.png', '/img/section4/negyedik.png', '/img/section4/otodik.png', '/img/section4/hatodik.png']
    },
    S5: {
      hatter: { src: '/img/section5/hatter5.png', blurRadius: 1.5, opacityBase: 1, scale: 1.05 },
      retegek: [
        {
          name: 'kep1',
          src: '/img/section5/kep1.png',
          tavolsag: 55,
          oldal: 'bal',
          fuggoleges: 'felso',
          magassag: 28,
          eltolas: 60,
          yEltolas: 60,
          blurRadius: 0.4,
          opacityBase: 1,
          parallaxIntenzitas: 0.9,
          belepo: { fromX: -180, fromOpacity: 0, duration: 0.5, ease: 'power3.out', sorrend: 0 }
        },
        {
          name: 'kep2',
          src: '/img/section5/kep2.png',
          tavolsag: 50,
          oldal: 'bal',
          fuggoleges: 'fold',
          magassag: 26,
          eltolas: 80,
          yEltolas: -60,
          blurRadius: 0.4,
          opacityBase: 1,
          parallaxIntenzitas: 1.0,
          belepo: { fromX: -180, fromOpacity: 0, duration: 0.5, ease: 'power3.out', sorrend: 1 }
        },
        {
          name: 'fust',
          src: '/img/section5/fust.png',
          tavolsag: 30,
          oldal: 'kozep',
          fuggoleges: 'kozep',
          magassag: 50,
          eltolas: 0,
          yEltolas: 0,
          blurRadius: 2,
          opacityBase: 0.7,
          parallaxIntenzitas: 1.1,
          belepo: { fromScale: 0.8, fromOpacity: 0, duration: 0.8, ease: 'power1.out', sorrend: 1 }
        },
        {
          name: 'beugro',
          src: '/img/section5/beugro.png',
          tavolsag: 10,
          oldal: 'jobb',
          fuggoleges: 'fold',
          magassag: 70,
          eltolas: -20,
          yEltolas: 0,
          blurRadius: 0,
          opacityBase: 1,
          parallaxIntenzitas: 1.3,
          belepo: { fromX: 250, fromOpacity: 0, duration: 0.6, ease: 'power4.out', sorrend: 2 }
        }
      ],
      bevezeto: [
        '/img/section5/overlay1.png',
        '/img/section5/overlay2.png',
        '/img/section5/overlay3.png',
        '/img/section5/overlay4.png',
        '/img/section5/overlay5.png'
      ],
      oldalak: ['/img/section5/elso.png', '/img/section5/masodik.png', '/img/section5/harmadik.png', '/img/section5/negyedik.png', '/img/section5/otodik.png', '/img/section5/hatodik.png']
    }
  }
};
