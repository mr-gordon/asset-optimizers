import { IconConfig, AssetFile } from '../../types/icon';
import {
  renderIconCanvas,
  renderSteppedDownsample,
  canvasToBlob,
} from '../canvas-utils';

interface IosIconDefinition {
  size: string;
  idiom: 'iphone' | 'ipad' | 'ios-marketing';
  filename: string;
  scale: string;
  px: number;
}

const IOS_ICONS: IosIconDefinition[] = [
  // iPhone
  { size: '20x20', idiom: 'iphone', filename: 'icon-20@2x.png', scale: '2x', px: 40 },
  { size: '20x20', idiom: 'iphone', filename: 'icon-20@3x.png', scale: '3x', px: 60 },
  { size: '29x29', idiom: 'iphone', filename: 'icon-29@2x.png', scale: '2x', px: 58 },
  { size: '29x29', idiom: 'iphone', filename: 'icon-29@3x.png', scale: '3x', px: 87 },
  { size: '40x40', idiom: 'iphone', filename: 'icon-40@2x.png', scale: '2x', px: 80 },
  { size: '40x40', idiom: 'iphone', filename: 'icon-40@3x.png', scale: '3x', px: 120 },
  { size: '60x60', idiom: 'iphone', filename: 'icon-60@2x.png', scale: '2x', px: 120 },
  { size: '60x60', idiom: 'iphone', filename: 'icon-60@3x.png', scale: '3x', px: 180 },

  // iPad
  { size: '20x20', idiom: 'ipad', filename: 'icon-20@1x.png', scale: '1x', px: 20 },
  { size: '20x20', idiom: 'ipad', filename: 'icon-20@2x-ipad.png', scale: '2x', px: 40 },
  { size: '29x29', idiom: 'ipad', filename: 'icon-29@1x.png', scale: '1x', px: 29 },
  { size: '29x29', idiom: 'ipad', filename: 'icon-29@2x-ipad.png', scale: '2x', px: 58 },
  { size: '40x40', idiom: 'ipad', filename: 'icon-40@1x.png', scale: '1x', px: 40 },
  { size: '40x40', idiom: 'ipad', filename: 'icon-40@2x-ipad.png', scale: '2x', px: 80 },
  { size: '76x76', idiom: 'ipad', filename: 'icon-76@1x.png', scale: '1x', px: 76 },
  { size: '76x76', idiom: 'ipad', filename: 'icon-76@2x.png', scale: '2x', px: 152 },
  { size: '83.5x83.5', idiom: 'ipad', filename: 'icon-83.5@2x.png', scale: '2x', px: 167 },

  // App Store Marketing
  { size: '1024x1024', idiom: 'ios-marketing', filename: 'icon-1024.png', scale: '1x', px: 1024 },
];

/**
 * Generates the full Xcode AppIcon.appiconset directory including Contents.json
 */
export async function generateIosAssets(
  img: HTMLImageElement,
  config: IconConfig
): Promise<AssetFile[]> {
  const assets: AssetFile[] = [];

  // Master 1024 square canvas with opaque background (iOS requirement)
  const master1024 = renderIconCanvas(img, config, 1024, { forceOpaque: true });

  // Map to cache already rendered sizes to avoid redundant canvas operations
  const renderedBlobs = new Map<number, Blob>();

  for (const item of IOS_ICONS) {
    let blob = renderedBlobs.get(item.px);
    if (!blob) {
      const canvas = item.px === 1024 ? master1024 : renderSteppedDownsample(master1024, item.px, item.px);
      blob = await canvasToBlob(canvas);
      renderedBlobs.set(item.px, blob);
    }

    assets.push({
      path: `ios/AppIcon.appiconset/${item.filename}`,
      blob,
    });
  }

  // Create Contents.json
  const contentsJson = {
    images: IOS_ICONS.map((i) => ({
      size: i.size,
      idiom: i.idiom,
      filename: i.filename,
      scale: i.scale,
    })),
    info: {
      version: 1,
      author: 'xcode',
    },
  };

  const contentsBlob = new Blob([JSON.stringify(contentsJson, null, 2)], {
    type: 'application/json',
  });

  assets.push({
    path: 'ios/AppIcon.appiconset/Contents.json',
    blob: contentsBlob,
  });

  return assets;
}
