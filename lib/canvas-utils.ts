import getStroke from 'perfect-freehand';

export type Point = { x: number; y: number; pressure: number };

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );
  d.push('Z');
  return d.join(' ');
}

export function getBoundingBox(points: {x: number, y: number}[]) {
  if (!points.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  points.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export async function createStrokeImage(points: Point[], size: number): Promise<{ dataUrl: string, bbox: { x: number, y: number, width: number, height: number } } | null> {
  const bbox = getBoundingBox(points);
  if (!bbox) return null;

  const padding = 20;
  const SCALE = 3; // Scale up 3x for high-resolution OCR input

  const canvas = document.createElement('canvas');
  canvas.width = (bbox.width + padding * 2) * SCALE;
  canvas.height = (bbox.height + padding * 2) * SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Fill with white background for better OCR contrast
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.scale(SCALE, SCALE); // Apply scaling to context

  const input = points.map(p => [p.x - bbox.x + padding, p.y - bbox.y + padding, p.pressure]);
  // Use a minimum stroke size so the text doesn't become too thin when scaled
  const strokeData = getStroke(input, { size: Math.max(size, 4), thinning: 0.2, streamline: 0.5 });
  const pathData = getSvgPathFromStroke(strokeData);
  const path = new Path2D(pathData);
  
  // Use black for best OCR contrast
  ctx.fillStyle = '#000000';
  ctx.fill(path);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    bbox
  };
}
