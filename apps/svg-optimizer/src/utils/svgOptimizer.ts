export interface OptimizeResult {
  optimizedSvg: string;
  width: number;
  height: number;
}

/**
 * Checks if a <rect> element is a transparent bounding box
 */
function isBoundingBoxRect(rect: Element, svgWidth: number, svgHeight: number): boolean {
  const fill = rect.getAttribute('fill');
  const style = rect.getAttribute('style') || '';

  if (fill === 'none' || style.includes('fill:none') || style.includes('fill: none')) {
    return true;
  }

  const w = parseFloat(rect.getAttribute('width') || '0');
  const h = parseFloat(rect.getAttribute('height') || '0');

  if (w === svgWidth && h === svgHeight && !rect.getAttribute('stroke')) {
    return true;
  }

  return false;
}

/**
 * Optimizes an SVG string according to corporate SVG standards:
 * - Cleanly parses original SVG, determines artboard dimensions (origW, origH) and viewBox origin (minX, minY)
 * - Removes <defs>, <style>, <title>, <desc>, <metadata>, comments, and pre-existing bounding box <rect>s
 * - Handles non-zero viewBox origins (e.g. minX/minY) via translate(-minX, -minY)
 * - Scales and centers shape group onto final target dimensions (targetW, targetH)
 * - Wraps shapes in a single <g fill="{color}" transform="...">
 * - Appends a single transparent bounding box <rect width="{w}" height="{h}" style="fill:none;"/> if includeBoundingBox is true
 * - Optionally strips element IDs and class attributes if stripIdsAndClasses is true
 */
export function optimizeSvgString(
  rawSvg: string,
  fillColor: string = 'currentColor',
  targetWidth?: number,
  targetHeight?: number,
  includeBoundingBox: boolean = true,
  stripIdsAndClasses: boolean = true
): OptimizeResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, 'image/svg+xml');

  // Handle parse errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid SVG file structure');
  }

  const svgEl = doc.querySelector('svg');
  if (!svgEl) {
    throw new Error('No <svg> root element found');
  }

  // 1. Determine Original minX, minY, Width, Height from viewBox or width/height attributes
  let minX = 0;
  let minY = 0;
  let origW = 24;
  let origH = 24;

  let viewBoxAttr = svgEl.getAttribute('viewBox') || svgEl.getAttribute('viewbox');
  const rawWidth = svgEl.getAttribute('width');
  const rawHeight = svgEl.getAttribute('height');

  if (viewBoxAttr) {
    const parts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3]) && parts[2] > 0 && parts[3] > 0) {
      minX = parts[0] || 0;
      minY = parts[1] || 0;
      origW = parts[2];
      origH = parts[3];
    }
  } else if (rawWidth && rawHeight) {
    const parsedW = parseFloat(rawWidth.replace(/[^\d.]/g, ''));
    const parsedH = parseFloat(rawHeight.replace(/[^\d.]/g, ''));
    if (!isNaN(parsedW) && parsedW > 0) origW = parsedW;
    if (!isNaN(parsedH) && parsedH > 0) origH = parsedH;
  }

  origW = Math.round(origW * 100) / 100;
  origH = Math.round(origH * 100) / 100;

  const finalW = targetWidth && targetWidth > 0 ? targetWidth : origW;
  const finalH = targetHeight && targetHeight > 0 ? targetHeight : origH;

  // 2. Remove unwanted tags (<defs>, <style>, <title>, <desc>, <metadata>)
  const tagsToRemove = doc.querySelectorAll('defs, style, title, desc, metadata');
  tagsToRemove.forEach((node) => node.remove());

  // 3. Remove all XML / HTML comments
  const removeComments = (parent: Node) => {
    const childNodes = Array.from(parent.childNodes);
    for (const child of childNodes) {
      if (child.nodeType === Node.COMMENT_NODE) {
        parent.removeChild(child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        removeComments(child);
      }
    }
  };
  removeComments(doc);

  // 4. Strip root <svg> attributes except viewBox and xmlns
  const rootAttrsToRemove = ['width', 'height', 'fill', 'id', 'class', 'style', 'version', 'xml:space', 'x', 'y'];
  rootAttrsToRemove.forEach((attr) => svgEl.removeAttribute(attr));

  svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgEl.setAttribute('viewBox', `0 0 ${finalW} ${finalH}`);

  // 5. Collect shape elements & filter out pre-existing bounding box <rect> elements
  const allRects = Array.from(doc.querySelectorAll('rect'));
  allRects.forEach((rect) => {
    if (isBoundingBoxRect(rect, origW, origH)) {
      rect.remove();
    }
  });

  // Extract all remaining elements inside svg
  const collectShapeElements = (parent: Element): Element[] => {
    const elements: Element[] = [];
    Array.from(parent.children).forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (tag === 'g') {
        elements.push(...collectShapeElements(child));
      } else if (['path', 'circle', 'ellipse', 'polygon', 'polyline', 'line', 'rect'].includes(tag)) {
        elements.push(child);
      }
    });
    return elements;
  };

  const shapes = collectShapeElements(svgEl);

  // Clean shape attributes (remove fill, style, and optionally class & id)
  shapes.forEach((shape) => {
    shape.removeAttribute('fill');
    shape.removeAttribute('style');
    if (stripIdsAndClasses) {
      shape.removeAttribute('class');
      shape.removeAttribute('id');
    }
  });

  // Clear svg root content
  while (svgEl.firstChild) {
    svgEl.removeChild(svgEl.firstChild);
  }

  // 6. Calculate scale factor & offsets to map (minX, minY, origW, origH) onto (0, 0, finalW, finalH)
  const scale = Math.min(finalW / origW, finalH / origH);
  const scaledW = origW * scale;
  const scaledH = origH * scale;

  const tx = Math.round(((finalW - scaledW) / 2) * 10000) / 10000;
  const ty = Math.round(((finalH - scaledH) / 2) * 10000) / 10000;
  const roundedScale = Math.round(scale * 10000) / 10000;
  const roundedMinX = Math.round(minX * 10000) / 10000;
  const roundedMinY = Math.round(minY * 10000) / 10000;

  // 7. Create <g fill="{color}" transform="...">
  const group = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.setAttribute('fill', fillColor || 'currentColor');

  const transformParts: string[] = [];

  if (Math.abs(tx) > 0.001 || Math.abs(ty) > 0.001) {
    transformParts.push(`translate(${tx},${ty})`);
  }
  if (Math.abs(roundedScale - 1) > 0.001) {
    transformParts.push(`scale(${roundedScale})`);
  }
  if (Math.abs(roundedMinX) > 0.001 || Math.abs(roundedMinY) > 0.001) {
    transformParts.push(`translate(${-roundedMinX},${-roundedMinY})`);
  }

  if (transformParts.length > 0) {
    group.setAttribute('transform', transformParts.join(' '));
  }

  shapes.forEach((shape) => {
    group.appendChild(shape);
  });

  svgEl.appendChild(group);

  // 8. Optionally append transparent bounding box <rect width="finalW" height="finalH" style="fill:none;"/> outside <g> at root level
  if (includeBoundingBox) {
    const boundRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
    boundRect.setAttribute('width', String(finalW));
    boundRect.setAttribute('height', String(finalH));
    boundRect.setAttribute('style', 'fill:none;');
    svgEl.appendChild(boundRect);
  }

  // 9. Minify & Serialize to single line
  const serializer = new XMLSerializer();
  let minified = serializer.serializeToString(svgEl);

  minified = minified
    .replace(/>\s+</g, '><') // remove whitespace between tags
    .replace(/\s{2,}/g, ' ') // collapse multi-spaces
    .replace(/\n|\r/g, '') // remove linebreaks
    .trim();

  return {
    optimizedSvg: minified,
    width: finalW,
    height: finalH,
  };
}
