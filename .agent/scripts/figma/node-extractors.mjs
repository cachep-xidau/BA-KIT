/**
 * Text, visuals, and component extractors.
 */

import { round2, findOrCreateVar, getStyleName, isVisible } from "./utils.mjs";
import { parsePaint, formatRGBA } from "./paint-converter.mjs";

// --- TEXT ---

export function extractText(node, result, globalVars, extraStyles) {
  if (node.type === "TEXT" && node.characters) {
    result.text = node.characters;
  }

  if (node.style && Object.keys(node.style).length) {
    const s = node.style;
    const textStyle = {};
    if (s.fontFamily) textStyle.fontFamily = s.fontFamily;
    if (s.fontWeight) textStyle.fontWeight = s.fontWeight;
    if (s.fontSize) textStyle.fontSize = s.fontSize;
    if (s.lineHeightPx && s.fontSize)
      textStyle.lineHeight = `${round2(s.lineHeightPx / s.fontSize)}em`;
    if (s.letterSpacing && s.letterSpacing !== 0 && s.fontSize)
      textStyle.letterSpacing = `${round2((s.letterSpacing / s.fontSize) * 100)}%`;
    if (s.textCase) textStyle.textCase = s.textCase;
    if (s.textAlignHorizontal) textStyle.textAlignHorizontal = s.textAlignHorizontal;

    if (Object.keys(textStyle).length) {
      const styleName = getStyleName(node, extraStyles, ["text", "typography"]);
      if (styleName) {
        globalVars.styles[styleName] = textStyle;
        result.textStyle = styleName;
      } else {
        result.textStyle = findOrCreateVar(globalVars, textStyle, "text");
      }
    }
  }
}

// --- VISUALS ---

export function extractVisuals(node, result, globalVars, extraStyles) {
  const hasChildren =
    node.children && Array.isArray(node.children) && node.children.length > 0;

  // Fills
  if (Array.isArray(node.fills) && node.fills.length) {
    const fills = node.fills
      .filter(isVisible)
      .map((f) => parsePaint(f, hasChildren))
      .reverse();
    if (fills.length) {
      const styleName = getStyleName(node, extraStyles, ["fill", "fills"]);
      if (styleName) {
        globalVars.styles[styleName] = fills;
        result.fills = styleName;
      } else {
        result.fills = findOrCreateVar(globalVars, fills, "fill");
      }
    }
  }

  // Strokes
  if (Array.isArray(node.strokes) && node.strokes.length) {
    const colors = node.strokes.filter(isVisible).map((s) => parsePaint(s, hasChildren));
    if (colors.length) {
      const stroke = { colors };
      if (node.strokeWeight && node.strokeWeight > 0)
        stroke.strokeWeight = `${node.strokeWeight}px`;
      if (Array.isArray(node.strokeDashes) && node.strokeDashes.length)
        stroke.strokeDashes = node.strokeDashes;

      const styleName = getStyleName(node, extraStyles, ["stroke", "strokes"]);
      if (styleName) {
        globalVars.styles[styleName] = colors;
        result.strokes = styleName;
        if (stroke.strokeWeight) result.strokeWeight = stroke.strokeWeight;
      } else {
        result.strokes = findOrCreateVar(globalVars, stroke, "stroke");
      }
    }
  }

  // Effects → CSS
  if (Array.isArray(node.effects) && node.effects.length) {
    const visibleFx = node.effects.filter((e) => e.visible !== false);
    const effects = {};

    const shadows = visibleFx
      .filter((e) => e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW")
      .map((e) => {
        const inset = e.type === "INNER_SHADOW" ? "inset " : "";
        return `${inset}${e.offset.x}px ${e.offset.y}px ${e.radius}px ${e.spread || 0}px ${formatRGBA(e.color)}`;
      });
    if (shadows.length) {
      effects[node.type === "TEXT" ? "textShadow" : "boxShadow"] = shadows.join(", ");
    }

    const layerBlurs = visibleFx.filter((e) => e.type === "LAYER_BLUR").map((e) => `blur(${e.radius}px)`);
    if (layerBlurs.length) effects.filter = layerBlurs.join(" ");

    const bgBlurs = visibleFx.filter((e) => e.type === "BACKGROUND_BLUR").map((e) => `blur(${e.radius}px)`);
    if (bgBlurs.length) effects.backdropFilter = bgBlurs.join(" ");

    if (Object.keys(effects).length) {
      const styleName = getStyleName(node, extraStyles, ["effect", "effects"]);
      if (styleName) {
        globalVars.styles[styleName] = effects;
        result.effects = styleName;
      } else {
        result.effects = findOrCreateVar(globalVars, effects, "effect");
      }
    }
  }

  // Opacity
  if (typeof node.opacity === "number" && node.opacity !== 1) {
    result.opacity = node.opacity;
  }

  // Border radius
  if (typeof node.cornerRadius === "number" && node.cornerRadius > 0) {
    result.borderRadius = `${node.cornerRadius}px`;
  }
  if (Array.isArray(node.rectangleCornerRadii) && node.rectangleCornerRadii.length === 4) {
    const [tl, tr, br, bl] = node.rectangleCornerRadii;
    result.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
  }
}

// --- COMPONENT ---

export function extractComponent(node, result) {
  if (node.type !== "INSTANCE") return;
  if (node.componentId) result.componentId = node.componentId;
  if (node.componentProperties) {
    result.componentProperties = Object.entries(node.componentProperties).map(
      ([name, { value, type }]) => ({ name, value: String(value), type })
    );
  }
}
