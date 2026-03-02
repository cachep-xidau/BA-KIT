/**
 * Layout extractor: Figma layout properties → CSS flex.
 */

import {
  isFrame, getLayoutMode, isInAutoLayoutFlow,
  cssShorthand, findOrCreateVar,
} from "./utils.mjs";

export function extractLayout(node, parent, result, globalVars) {
  const layout = {};

  // Frame layout mode
  if (isFrame(node)) {
    layout.mode = getLayoutMode(node);

    if (layout.mode !== "none") {
      layout.justifyContent = convertAlign(node.primaryAxisAlignItems);
      layout.alignItems = convertAlign(node.counterAxisAlignItems);

      if (node.layoutWrap === "WRAP") layout.wrap = true;
      if (node.itemSpacing) layout.gap = `${node.itemSpacing}px`;

      const pt = node.paddingTop || 0;
      const pr = node.paddingRight || 0;
      const pb = node.paddingBottom || 0;
      const pl = node.paddingLeft || 0;
      if (pt || pr || pb || pl) {
        layout.padding = cssShorthand(pt, pr, pb, pl);
      }
    }

    const scroll = [];
    if (node.overflowDirection?.includes("HORIZONTAL")) scroll.push("x");
    if (node.overflowDirection?.includes("VERTICAL")) scroll.push("y");
    if (scroll.length) layout.overflowScroll = scroll;
  } else {
    layout.mode = "none";
  }

  // Sizing
  const hSizing = convertSizing(node.layoutSizingHorizontal);
  const vSizing = convertSizing(node.layoutSizingVertical);
  if (hSizing || vSizing) {
    layout.sizing = {};
    if (hSizing) layout.sizing.horizontal = hSizing;
    if (vSizing) layout.sizing.vertical = vSizing;
  }

  // Self alignment
  const selfAlign = convertSelfAlign(node.layoutAlign);
  if (selfAlign) layout.alignSelf = selfAlign;

  // Absolute positioning
  if (node.layoutPositioning === "ABSOLUTE") layout.position = "absolute";

  // Dimensions
  if (node.absoluteBoundingBox) {
    const bb = node.absoluteBoundingBox;
    const dims = {};
    const parentMode = parent && isFrame(parent) ? getLayoutMode(parent) : "none";

    if (parentMode === "row") {
      if (!node.layoutGrow && node.layoutSizingHorizontal === "FIXED")
        dims.width = Math.round(bb.width);
      if (node.layoutAlign !== "STRETCH" && node.layoutSizingVertical === "FIXED")
        dims.height = Math.round(bb.height);
    } else if (parentMode === "column") {
      if (node.layoutAlign !== "STRETCH" && node.layoutSizingHorizontal === "FIXED")
        dims.width = Math.round(bb.width);
      if (!node.layoutGrow && node.layoutSizingVertical === "FIXED")
        dims.height = Math.round(bb.height);
    } else {
      if (!node.layoutSizingHorizontal || node.layoutSizingHorizontal === "FIXED")
        dims.width = Math.round(bb.width);
      if (!node.layoutSizingVertical || node.layoutSizingVertical === "FIXED")
        dims.height = Math.round(bb.height);
    }

    if (Object.keys(dims).length) layout.dimensions = dims;

    if (
      parent && isFrame(parent) &&
      !isInAutoLayoutFlow(node, parent) &&
      parent.absoluteBoundingBox
    ) {
      layout.locationRelativeToParent = {
        x: Math.round(bb.x - parent.absoluteBoundingBox.x),
        y: Math.round(bb.y - parent.absoluteBoundingBox.y),
      };
    }
  }

  // Only store if meaningful
  if (Object.keys(layout).length > 1 || layout.mode !== "none") {
    result.layout = findOrCreateVar(globalVars, layout, "layout");
  }
}

// --- helpers ---

function convertAlign(val) {
  switch (val) {
    case "MAX": return "flex-end";
    case "CENTER": return "center";
    case "SPACE_BETWEEN": return "space-between";
    case "BASELINE": return "baseline";
    default: return undefined; // MIN = flex-start (default)
  }
}

function convertSelfAlign(val) {
  switch (val) {
    case "MAX": return "flex-end";
    case "CENTER": return "center";
    case "STRETCH": return "stretch";
    default: return undefined;
  }
}

function convertSizing(val) {
  if (val === "FIXED") return "fixed";
  if (val === "FILL") return "fill";
  if (val === "HUG") return "hug";
  return undefined;
}
