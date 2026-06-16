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
  // Az utolsó overlap-kép és az újság megjelenése közti várakozás (mp)
  overlapHoldSeconds: number;
  overlapAnchorSelector: string;
  newspaperAnchorSelector: string;
  radioAnchorSelector: string;
};

export type SectionConfig = {
  // Az F8 utáni overlap-intró fullscreen képei (egymásra csúsznak, auto-play)
  bevezeto: string[];
  // A lapozható újság lap-képei (FullHD JPG/PNG); üres = még nincs lap
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
  // Lapozáskor lejátszott papír-hang (a zene közben szól tovább)
  flipSound: string;
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
    overlapHoldSeconds: 3,
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
    flippingTime: 800,
    flipSound: '/sound/papir.wav'
  },
  sections: {
    S1: {
      bevezeto: [
        '/img/overlap1/1.png',
        '/img/overlap1/2.png',
        '/img/overlap1/3.png',
        '/img/overlap1/4.png',
        '/img/overlap1/5.png'
      ],
      oldalak: ['/img/section1/elso.png', '/img/section1/masodik.png', '/img/section1/harmadik.png', '/img/section1/negyedik.png', '/img/section1/otodik.png', '/img/section1/hatodik.png', '/img/section1/hetedik.png', '/img/section1/nyolcadik.png']
    },
    S2: {
      bevezeto: [
        '/img/overlap2/1.png',
        '/img/overlap2/2.png',
        '/img/overlap2/3.png',
        '/img/overlap2/4.png',
        '/img/overlap2/5.png'
      ],
      oldalak: ['/img/section2/elso.png', '/img/section2/masodik.png', '/img/section2/harmadik.png', '/img/section2/negyedik.png', '/img/section2/otodik.png', '/img/section2/hatodik.png', '/img/section2/hetedik.png', '/img/section2/nyolcadik.png']
    },
    S3: {
      bevezeto: [
        '/img/overlap3/1.png',
        '/img/overlap3/2.png',
        '/img/overlap3/3.png',
        '/img/overlap3/4.png',
        '/img/overlap3/5.png'
      ],
      oldalak: ['/img/section3/elso.png', '/img/section3/masodik.png', '/img/section3/harmadik.png', '/img/section3/negyedik.png', '/img/section3/otodik.png', '/img/section3/hatodik.png', '/img/section3/oldal7.png', '/img/section3/oldal8.png']
    },
    S4: {
      bevezeto: [
        '/img/overlap4/1.png',
        '/img/overlap4/2.png',
        '/img/overlap4/3.png',
        '/img/overlap4/4.png',
        '/img/overlap4/5.png'
      ],
      oldalak: ['/img/section4/elso.png', '/img/section4/masodik.png', '/img/section4/harmadik.png', '/img/section4/negyedik.png', '/img/section4/otodik.png', '/img/section4/hatodik.png', '/img/section4/hetedik.png', '/img/section4/nyolcadik.png']
    },
    S5: {
      bevezeto: [
        '/img/overlap5/1.png',
        '/img/overlap5/2.png',
        '/img/overlap5/3.png',
        '/img/overlap5/4.png',
        '/img/overlap5/5.png'
      ],
      oldalak: ['/img/section5/elso.png', '/img/section5/masodik.png', '/img/section5/harmadik.png', '/img/section5/negyedik.png', '/img/section5/otodik.png', '/img/section5/hatodik.png', '/img/section5/oldal7.png', '/img/section5/oldal8.png']
    }
  }
};
