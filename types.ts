
export interface PhotoData {
  id: string;
  dataUrl: string;
}

export enum AppStep {
  START = 'START',
  CAPTURE = 'CAPTURE',
  EDIT = 'EDIT',
}

export interface FrameConfig {
  color: string;
  gradient?: string[]; // Optional gradient colors
  textColor: string;
  layout: 'strip' | 'grid' | 'polaroid' | 'grid3x3';
}

export const FRAME_COLORS = [
  // Solid Colors
  { name: 'Black', hex: '#000000', text: '#ffffff' },
  { name: 'White', hex: '#ffffff', text: '#000000' },
  { name: 'Pink', hex: '#fce7f3', text: '#be185d' }, // pink-100, pink-700
  { name: 'Blue', hex: '#dbeafe', text: '#1e40af' }, // blue-100, blue-800
  { name: 'Purple', hex: '#f3e8ff', text: '#7e22ce' }, // purple-100, purple-700
  { name: 'Cream', hex: '#fef3c7', text: '#92400e' }, // amber-100, amber-800
  
  // Gradient Colors
  { name: 'Sunset', hex: '#ff9a9e', gradient: ['#ff9a9e', '#fecfef'], text: '#ffffff' },
  { name: 'Ocean', hex: '#a1c4fd', gradient: ['#a1c4fd', '#c2e9fb'], text: '#0055ff' },
  { name: 'Galaxy', hex: '#30cfd0', gradient: ['#30cfd0', '#330867'], text: '#ffffff' },
  { name: 'Peach', hex: '#f6d365', gradient: ['#f6d365', '#fda085'], text: '#ffffff' },
  { name: 'Lavender', hex: '#e0c3fc', gradient: ['#e0c3fc', '#8ec5fc'], text: '#5e4b8b' }, // Purple gradient
  { name: 'Mint', hex: '#d4fc79', gradient: ['#d4fc79', '#96e6a1'], text: '#386641' }, // Green gradient
];
