export type ThemeName = 'Classic' | 'Midnight' | 'Indigo';

export type Palette = {
  bg: string;
  surface: string;
  ink: string;
  ink2: string;
  muted: string;
  line: string;
  line2: string;
  lineStrong: string;
  fill: string;
  accent: string;
  onAccent: string;
  soft: string;
  softInk: string;
  deep: string;
  deepInk: string;
  deepInk2: string;
  link: string;
  wall: string;
  bubbleIn: string;
  bubbleOut: string;
  notice: string;
  danger: string;
  dangerFill: string;
  overlay: string;
  /** Sender-name colours in group chats, readable on bubbleIn. */
  names: string[];
  statusBar: 'dark' | 'light';
};

export const palettes: Record<ThemeName, Palette> = {
  Classic: {
    bg: '#FCF5EB',
    surface: '#FFFFFF',
    ink: '#1C1E21',
    ink2: '#54595F',
    muted: '#8E9399',
    line: '#E9E1D3',
    line2: '#F0EAE0',
    lineStrong: '#C9C0B1',
    fill: '#F3F1EC',
    accent: '#25D366',
    onAccent: '#1C1E21',
    soft: '#D9FDD3',
    softInk: '#103928',
    deep: '#103928',
    deepInk: '#FCF5EB',
    deepInk2: '#D7E3DA',
    link: '#00715C',
    wall: '#EFEAE2',
    bubbleIn: '#FFFFFF',
    bubbleOut: '#D9FDD3',
    notice: '#FDF0D5',
    danger: '#B3261E',
    dangerFill: '#FBE9E7',
    overlay: 'rgba(28,30,33,0.5)',
    names: ['#8A4A0F', '#5B3FA8', '#00715C', '#A3245B'],
    statusBar: 'dark',
  },
  Midnight: {
    bg: '#0B141A',
    surface: '#1F2C34',
    ink: '#E9EDEF',
    ink2: '#9AA8B0',
    muted: '#6B7C85',
    line: '#2A3942',
    line2: '#222D34',
    lineStrong: '#3B4A54',
    fill: '#202C33',
    accent: '#25D366',
    onAccent: '#0B141A',
    soft: '#103529',
    softInk: '#25D366',
    deep: '#005C4B',
    deepInk: '#E9EDEF',
    deepInk2: '#CFE9E3',
    link: '#25D366',
    wall: '#0B141A',
    bubbleIn: '#202C33',
    bubbleOut: '#0A3D35',
    notice: '#222E35',
    danger: '#F15C6D',
    dangerFill: '#3A1F23',
    overlay: 'rgba(0,0,0,0.6)',
    names: ['#F0A35E', '#B9A3F0', '#53BDEB', '#F48FB1'],
    statusBar: 'light',
  },
  Indigo: {
    bg: '#F3F5FB',
    surface: '#FFFFFF',
    ink: '#141A2E',
    ink2: '#586079',
    muted: '#8A92A8',
    line: '#DFE4F2',
    line2: '#E9EDF7',
    lineStrong: '#B9C1D6',
    fill: '#E9EDF7',
    accent: '#3B55E6',
    onAccent: '#FFFFFF',
    soft: '#DFE6FF',
    softInk: '#22328F',
    deep: '#141B3D',
    deepInk: '#F3F5FB',
    deepInk2: '#C3CBEA',
    link: '#3B55E6',
    wall: '#E9EDF7',
    bubbleIn: '#FFFFFF',
    bubbleOut: '#DFE6FF',
    notice: '#FFF4D6',
    danger: '#B3261E',
    dangerFill: '#FBE9E7',
    overlay: 'rgba(20,26,46,0.5)',
    names: ['#8A4A0F', '#5B3FA8', '#0B6E63', '#A3245B'],
    statusBar: 'dark',
  },
};

export const fonts = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
} as const;

export const radius = { pill: 999, card: 28, sheet: 32, bubble: 18, tail: 6 } as const;
