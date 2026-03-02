/**
 * Shared utilities for Figma simplification.
 */

export function round2(n) {
  return Math.round(n * 100) / 100;
}

export function cssShorthand(top, right, bottom, left, unit = "px") {
  if (top === right && right === bottom && bottom === left) {
    return `${top}${unit}`;
  }
  if (top === bottom && right === left) {
    return `${top}${unit} ${right}${unit}`;
  }
  return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
}

export function isVisible(node) {
  return node.visible !== false;
}

export function isFrame(node) {
  return (
    node.type === "FRAME" ||
    node.type === "COMPONENT" ||
    node.type === "COMPONENT_SET" ||
    node.type === "INSTANCE" ||
    node.type === "SECTION"
  );
}

export function getLayoutMode(node) {
  if (!node.layoutMode || node.layoutMode === "NONE") return "none";
  return node.layoutMode === "HORIZONTAL" ? "row" : "column";
}

export function isInAutoLayoutFlow(node, parent) {
  if (!parent || !isFrame(parent)) return false;
  if (getLayoutMode(parent) === "none") return false;
  if (node.layoutPositioning === "ABSOLUTE") return false;
  return true;
}

// --- Style deduplication ---

let varCounter = 0;

export function findOrCreateVar(globalVars, value, prefix) {
  const json = JSON.stringify(value);
  for (const [existingId, existingVal] of Object.entries(globalVars.styles)) {
    if (JSON.stringify(existingVal) === json) return existingId;
  }
  const varId = `${prefix}_${++varCounter}`;
  globalVars.styles[varId] = value;
  return varId;
}

export function getStyleName(node, extraStyles, keys) {
  if (!node.styles || !extraStyles) return undefined;
  for (const key of keys) {
    const styleId = node.styles[key];
    if (styleId && extraStyles[styleId]?.name) {
      return extraStyles[styleId].name;
    }
  }
  return undefined;
}
