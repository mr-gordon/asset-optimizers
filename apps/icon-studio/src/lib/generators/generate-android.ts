import { IconConfig, AssetFile } from '../../types/icon';
import {
  renderIconCanvas,
  renderSteppedDownsample,
  canvasToBlob,
} from '../canvas-utils';

interface DensityConfig {
  folder: string;
  iconSize: number;
  foregroundSize: number; // 108dp base (x1, x1.5, x2, x3, x4)
}

const ANDROID_DENSITIES: DensityConfig[] = [
  { folder: 'mipmap-mdpi', iconSize: 48, foregroundSize: 108 },
  { folder: 'mipmap-hdpi', iconSize: 72, foregroundSize: 162 },
  { folder: 'mipmap-xhdpi', iconSize: 96, foregroundSize: 216 },
  { folder: 'mipmap-xxhdpi', iconSize: 144, foregroundSize: 324 },
  { folder: 'mipmap-xxxhdpi', iconSize: 192, foregroundSize: 432 },
];

/**
 * Generates the full Android res directory structure with Adaptive Icon support
 */
export async function generateAndroidAssets(
  img: HTMLImageElement,
  config: IconConfig
): Promise<AssetFile[]> {
  const assets: AssetFile[] = [];

  // Master base icons:
  // 1. Full square icon with background
  const masterSquare = renderIconCanvas(img, config, 1024, { forceOpaque: true });
  // 2. Round icon (legacy circle)
  const masterRound = renderIconCanvas(img, config, 1024, {
    forceOpaque: true,
    maskShape: 'circle',
  });
  // 3. Adaptive Icon Foreground (transparent background, padded to 72dp inside 108dp)
  const masterForeground = renderIconCanvas(img, config, 1024, {
    overrideBg: 'transparent',
    customPadding: 33.3, // 72dp inside 108dp viewport = ~33% inset
  });

  for (const d of ANDROID_DENSITIES) {
    // 1. Standard legacy launcher
    const iconCanvas = renderSteppedDownsample(masterSquare, d.iconSize, d.iconSize);
    const iconBlob = await canvasToBlob(iconCanvas);
    assets.push({
      path: `android/res/${d.folder}/ic_launcher.png`,
      blob: iconBlob,
    });

    // 2. Round legacy launcher
    const roundCanvas = renderSteppedDownsample(masterRound, d.iconSize, d.iconSize);
    const roundBlob = await canvasToBlob(roundCanvas);
    assets.push({
      path: `android/res/${d.folder}/ic_launcher_round.png`,
      blob: roundBlob,
    });

    // 3. Adaptive Icon Foreground
    const fgCanvas = renderSteppedDownsample(masterForeground, d.foregroundSize, d.foregroundSize);
    const fgBlob = await canvasToBlob(fgCanvas);
    assets.push({
      path: `android/res/${d.folder}/ic_launcher_foreground.png`,
      blob: fgBlob,
    });
  }

  // 4. Adaptive Icon XMLs in mipmap-anydpi-v26
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;

  const xmlBlob = new Blob([adaptiveXml], { type: 'application/xml' });
  assets.push({
    path: 'android/res/mipmap-anydpi-v26/ic_launcher.xml',
    blob: xmlBlob,
  });
  assets.push({
    path: 'android/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    blob: xmlBlob,
  });

  // 5. Background Color definition
  const colorXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${config.backgroundColor || '#FFFFFF'}</color>
</resources>`;
  assets.push({
    path: 'android/res/values/ic_launcher_background.xml',
    blob: new Blob([colorXml], { type: 'application/xml' }),
  });

  // 6. Google Play Store 512x512 high-res icon
  const playStoreCanvas = renderSteppedDownsample(masterSquare, 512, 512);
  const playStoreBlob = await canvasToBlob(playStoreCanvas);
  assets.push({
    path: 'android/play-store-512.png',
    blob: playStoreBlob,
  });

  return assets;
}
