import sanitizeHtml from "sanitize-html";
const tags = [
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "defs",
  "clipPath",
  "mask",
  "linearGradient",
  "radialGradient",
  "stop",
  "title",
  "desc",
  "use",
];
const attributes = [
  "id",
  "xmlns",
  "viewBox",
  "width",
  "height",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "d",
  "points",
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-opacity",
  "opacity",
  "transform",
  "preserveAspectRatio",
  "offset",
  "stop-color",
  "stop-opacity",
  "gradientUnits",
  "gradientTransform",
  "clip-path",
  "mask",
  "font-size",
  "text-anchor",
  "href",
];
export function sanitizeSvg(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length > 100000 ||
    /<!DOCTYPE|<!ENTITY/i.test(value) ||
    !/^\s*<svg[\s>]/i.test(value)
  )
    throw new Error("Use an SVG smaller than 100 KB without external entities");
  const output = sanitizeHtml(value, {
    allowedTags: tags,
    allowedAttributes: { "*": attributes },
    parser: { lowerCaseTags: false, lowerCaseAttributeNames: false },
    transformTags: {
      "*": (tagName, attribs) => {
        const safe = Object.fromEntries(
          Object.entries(attribs).filter(([key, val]) => {
            if (key === "href") return /^#[\w-]+$/.test(val);
            if (key === "xmlns") return val === "http://www.w3.org/2000/svg";
            return !/url\(/i.test(val) || /^url\(#[\w-]+\)$/.test(val);
          }),
        );
        return { tagName, attribs: safe };
      },
    },
  });
  if (!output.startsWith("<svg")) throw new Error("Invalid SVG");
  return output;
}
