/**
 * Minimal YAML serializer (zero dependencies).
 */

export function toYAML(obj, indent = 0) {
  if (obj === null || obj === undefined) return "null\n";
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#") || obj.startsWith("'") || obj.startsWith('"')) {
      return JSON.stringify(obj) + "\n";
    }
    return obj + "\n";
  }
  if (typeof obj === "number" || typeof obj === "boolean") return String(obj) + "\n";

  const pad = "  ".repeat(indent);

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]\n";
    if (obj.every((v) => typeof v !== "object" || v === null)) {
      return "[" + obj.map((v) => (typeof v === "string" ? JSON.stringify(v) : String(v))).join(", ") + "]\n";
    }
    let out = "\n";
    for (const item of obj) {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const entries = Object.entries(item).filter(([, v]) => v !== undefined);
        if (entries.length === 0) {
          out += `${pad}- {}\n`;
        } else {
          const [firstKey, firstVal] = entries[0];
          const fv = typeof firstVal === "object" && firstVal !== null
            ? "\n" + toYAMLInner(firstVal, indent + 2)
            : " " + toYAML(firstVal, indent + 2);
          out += `${pad}- ${firstKey}:${fv}`;
          for (let i = 1; i < entries.length; i++) {
            const [k, v] = entries[i];
            const vStr = typeof v === "object" && v !== null
              ? "\n" + toYAMLInner(v, indent + 2)
              : " " + toYAML(v, indent + 2);
            out += `${pad}  ${k}:${vStr}`;
          }
        }
      } else {
        out += `${pad}- ${toYAML(item, indent + 1).trimStart()}`;
      }
    }
    return out;
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "{}\n";
    let out = "\n";
    for (const [key, val] of entries) {
      if (typeof val === "object" && val !== null) {
        out += `${pad}${key}:${toYAML(val, indent + 1)}`;
      } else {
        out += `${pad}${key}: ${toYAML(val, indent + 1).trimStart()}`;
      }
    }
    return out;
  }

  return String(obj) + "\n";
}

function toYAMLInner(obj, indent) {
  const pad = "  ".repeat(indent);
  if (Array.isArray(obj)) {
    let out = "";
    for (const item of obj) {
      out += `${pad}- ${typeof item === "object" ? toYAML(item, indent + 1).trimStart() : toYAML(item).trimStart()}`;
    }
    return out;
  }
  let out = "";
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === "object" && v !== null) {
      out += `${pad}${k}:${toYAML(v, indent + 1)}`;
    } else {
      out += `${pad}${k}: ${toYAML(v, indent + 1).trimStart()}`;
    }
  }
  return out;
}
