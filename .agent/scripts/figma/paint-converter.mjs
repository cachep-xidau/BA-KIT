/**
 * Paint/color conversion: Figma → CSS hex/rgba/gradient.
 */

export function parsePaint(paint, hasChildren) {
  if (paint.type === "SOLID") {
    const { hex, opacity } = convertColor(paint.color, paint.opacity);
    return opacity === 1 ? hex : formatRGBA(paint.color, paint.opacity);
  }

  if (paint.type === "IMAGE") {
    const fill = {
      type: "IMAGE",
      imageRef: paint.imageRef,
      scaleMode: paint.scaleMode || "FILL",
    };
    if (hasChildren) {
      fill.backgroundSize = paint.scaleMode === "FIT" ? "contain" : "cover";
    } else {
      fill.objectFit = paint.scaleMode === "FIT" ? "contain" : "cover";
    }
    return fill;
  }

  if (paint.type?.startsWith("GRADIENT_")) {
    return { type: paint.type, gradient: convertGradientCSS(paint) };
  }

  return { type: paint.type };
}

export function convertColor(color, opacity = 1) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(opacity * (color.a ?? 1) * 100) / 100;
  const hex =
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  return { hex, opacity: a };
}

export function formatRGBA(color, opacity = 1) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(opacity * (color.a ?? 1) * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function convertGradientCSS(paint) {
  if (!paint.gradientStops) return "";
  const stops = [...paint.gradientStops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${formatRGBA(s.color)} ${Math.round(s.position * 100)}%`)
    .join(", ");

  if (paint.type === "GRADIENT_LINEAR") {
    let angle = 180;
    if (paint.gradientHandlePositions?.length >= 2) {
      const [h1, h2] = paint.gradientHandlePositions;
      angle = Math.round(
        Math.atan2(h2.y - h1.y, h2.x - h1.x) * (180 / Math.PI) + 90
      );
    }
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  if (paint.type === "GRADIENT_RADIAL") {
    let center = "50% 50%";
    if (paint.gradientHandlePositions?.length >= 1) {
      const h = paint.gradientHandlePositions[0];
      center = `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%`;
    }
    return `radial-gradient(circle at ${center}, ${stops})`;
  }
  if (paint.type === "GRADIENT_ANGULAR") {
    return `conic-gradient(${stops})`;
  }
  return `linear-gradient(${stops})`;
}
