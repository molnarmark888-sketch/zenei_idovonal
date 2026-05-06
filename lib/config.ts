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
};

export type StageManagerEntry = {
  name: string;
  hatter: string;
  tavolsag: number;
  oldal: string;
  blurRadius: number;
  opacityBase: number;
  magassag: number;
  fuggoleges: 'fold' | 'kozep' | 'felso';
  eltolas: number;
  yEltolas: number;
  parallaxIntenzitas: number;
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
  stageManager: StageManagerEntry[];
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
  radioModelPath: '/3d/radio.glb',
  trackBoxes: {
    Box006: {
      src: '/zene/zene1.mp3',
      title: 'TAF1111 TAF',
      artist: 'Simba La Rue',
      year: 2023,
      description: 'Olasz newcommer.'
    },
    Box007: {
      src: '/zene/zene2.mp3',
      title: 'MAGIE',
      artist: 'MAES',
      year: 2024,
      description: 'French newcommer.'
    },
    Box008: {
      src: '/zene/zene3.mp3',
      title: "X Gon' Give It To Ya",
      artist: 'DMX',
      year: 2003,
      description: ''
    },
    Box009: {
      src: '/zene/zene4.mp3',
      title: 'Mivel Játszol',
      artist: 'Akkezdet Phiai',
      year: 2003,
      description: ''
    },
    Box010: {
      src: '/zene/zene5.mp3',
      title: 'In Da Club',
      artist: '50 Cent',
      year: 2009,
      description: ''
    }
  },
  meshNames: {
    display: 'Box005',
    hang1: 'HANG1',
    hang2: 'HANG2',
    ledPattern: /^LED\d+$/,
    kittScannerLeds: ['LED8', 'LED9', 'LED10', 'LED11'],
    trackBoxNames: ['Box006', 'Box007', 'Box008', 'Box009', 'Box010'],
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
    parallaxAnchorSelector: '#section-parallax'
  },
  stageManager: [
    {
      name: 'hatter',
      hatter: 'img/stage-metro-station/bg.png',
      tavolsag: 100,
      oldal: 'bal',
      blurRadius: 2,
      opacityBase: 0.75,
      magassag: 100,
      fuggoleges: 'fold',
      eltolas: 0,
      yEltolas: 0,
      parallaxIntenzitas: 1.0
    },
    {
      name: 'graffiti',
      hatter: 'img/stage-metro-station/graff.png',
      tavolsag: 95,
      oldal: 'jobb',
      blurRadius: 1.5,
      opacityBase: 0.85,
      magassag: 16,
      fuggoleges: 'kozep',
      eltolas: -180,
      yEltolas: -60,
      parallaxIntenzitas: 1.0
    },
    {
      name: 'tábla',
      hatter: 'img/stage-metro-station/sign.png',
      tavolsag: 80,
      oldal: 'kozep',
      blurRadius: 0.8,
      opacityBase: 0.9,
      magassag: 20,
      fuggoleges: 'felso',
      eltolas: -100,
      yEltolas: -60,
      parallaxIntenzitas: 1.0
    },
    {
      name: 'kuka',
      hatter: 'img/stage-metro-station/kuka.png',
      tavolsag: 70,
      oldal: 'jobb',
      blurRadius: 0.4,
      opacityBase: 0.95,
      magassag: 70,
      fuggoleges: 'fold',
      eltolas: -100,
      yEltolas: 200,
      parallaxIntenzitas: 1.0
    },
    {
      name: 'oszlop',
      hatter: 'img/stage-metro-station/oszlop.png',
      tavolsag: 10,
      oldal: 'bal',
      blurRadius: 0,
      opacityBase: 1.0,
      magassag: 150,
      fuggoleges: 'fold',
      eltolas: 150,
      yEltolas: 200,
      parallaxIntenzitas: 0.3
    }
  ]
};
