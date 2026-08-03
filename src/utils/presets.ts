import { PresetProfile } from '../types';

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'web_performance',
    name: 'Web Performance',
    description: 'Auto-WebP, 1920px max, Strip EXIF, 80% Quality',
    iconName: 'Zap',
    settings: {
      targetFormat: 'image/webp',
      qualityMode: 'percentage',
      quality: 80,
      resize: {
        mode: 'fhd',
        maxWidth: 1920,
        maxHeight: 1080,
        maintainAspectRatio: true,
        aspectRatioPreset: 'original',
      },
      stripExif: true,
    },
  },
  {
    id: 'photographer_archive',
    name: 'Photographer Archive',
    description: 'Original Format, Keep EXIF, High 92% Quality',
    iconName: 'Camera',
    settings: {
      targetFormat: 'original',
      qualityMode: 'percentage',
      quality: 92,
      resize: {
        mode: 'original',
        maintainAspectRatio: true,
        aspectRatioPreset: 'original',
      },
      stripExif: false,
    },
  },
  {
    id: 'email_social',
    name: 'Email and Social',
    description: 'JPEG, Target ~500 KB, Max 1920px',
    iconName: 'Mail',
    settings: {
      targetFormat: 'image/jpeg',
      qualityMode: 'target_size',
      targetSizeKb: 500,
      resize: {
        mode: 'fhd',
        maxWidth: 1920,
        maxHeight: 1080,
        maintainAspectRatio: true,
        aspectRatioPreset: 'original',
      },
      stripExif: true,
    },
  },
  {
    id: 'lossless_clean',
    name: 'Clean and Sharp',
    description: 'High Quality PNG/WebP, Strip EXIF, 4:4:4 Subsampling',
    iconName: 'Sparkles',
    settings: {
      targetFormat: 'image/webp',
      qualityMode: 'percentage',
      quality: 95,
      chromaSubsampling: '4:4:4',
      stripExif: true,
    },
  },
];
