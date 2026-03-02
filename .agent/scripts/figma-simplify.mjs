#!/usr/bin/env node
/**
 * Figma Simplification Layer
 * Converts raw Figma API JSON into simplified, CSS-ready output.
 *
 * Usage:
 *   cat raw-figma.json | node figma-simplify.mjs
 *   node figma-simplify.mjs --file raw-figma.json
 *   node figma-simplify.mjs --format json  (default: yaml)
 */

import { readFileSync } from "fs";
import { isVisible } from "./figma/utils.mjs";
import { extractLayout } from "./figma/layout-extractor.mjs";
import { extractText, extractVisuals, extractComponent } from "./figma/node-extractors.mjs";
import { toYAML } from "./figma/yaml-serializer.mjs";

// --- CLI ---
const args = process.argv.slice(2);
const fileIdx = args.indexOf("--file");
const fmtIdx = args.indexOf("--format");
const outputFormat = fmtIdx !== -1 ? args[fmtIdx + 1] : "yaml";

let rawInput;
if (fileIdx !== -1 && args[fileIdx + 1]) {
  rawInput = readFileSync(args[fileIdx + 1], "utf-8");
} else {
  rawInput = readFileSync("/dev/stdin", "utf-8");
}

const data = JSON.parse(rawInput);
const result = simplifyFigmaResponse(data);

if (outputFormat === "json") {
  process.stdout.write(JSON.stringify(result, null, 2));
} else {
  process.stdout.write(toYAML(result));
}

// --- Main ---

function simplifyFigmaResponse(apiResponse) {
  const { metadata, rawNodes, components, componentSets, styles } =
    parseAPIResponse(apiResponse);

  const globalVars = { styles: {} };
  const nodes = [];

  for (const node of rawNodes) {
    const simplified = processNode(node, null, globalVars, styles);
    if (simplified) nodes.push(simplified);
  }

  return {
    metadata,
    nodes,
    globalVars,
    components: simplifyMap(components),
    componentSets: simplifyMap(componentSets),
  };
}

function parseAPIResponse(data) {
  const components = {};
  const componentSets = {};
  let styles = {};
  let rawNodes;

  if (data.nodes) {
    for (const nr of Object.values(data.nodes)) {
      if (nr.components) Object.assign(components, nr.components);
      if (nr.componentSets) Object.assign(componentSets, nr.componentSets);
      if (nr.styles) Object.assign(styles, nr.styles);
    }
    rawNodes = Object.values(data.nodes).map((n) => n.document).filter(isVisible);
  } else {
    Object.assign(components, data.components || {});
    Object.assign(componentSets, data.componentSets || {});
    Object.assign(styles, data.styles || {});
    rawNodes = (data.document?.children || []).filter(isVisible);
  }

  return {
    metadata: { name: data.name, lastModified: data.lastModified },
    rawNodes,
    components,
    componentSets,
    styles,
  };
}

function processNode(node, parent, globalVars, extraStyles) {
  if (!isVisible(node)) return null;

  const result = {
    id: node.id,
    name: node.name,
    type: node.type === "VECTOR" ? "IMAGE-SVG" : node.type,
  };

  extractLayout(node, parent, result, globalVars);
  extractText(node, result, globalVars, extraStyles);
  extractVisuals(node, result, globalVars, extraStyles);
  extractComponent(node, result);

  if (node.children && node.children.length > 0) {
    const children = node.children
      .map((c) => processNode(c, node, globalVars, extraStyles))
      .filter(Boolean);

    if (children.length > 0 && children.every((c) => c.type === "IMAGE-SVG" && !c.children)) {
      result.type = "IMAGE-SVG";
    } else if (children.length > 0) {
      result.children = children;
    }
  }

  return result;
}

function simplifyMap(map) {
  const result = {};
  for (const [id, item] of Object.entries(map)) {
    result[id] = { name: item.name, description: item.description || undefined };
  }
  return Object.keys(result).length ? result : undefined;
}
