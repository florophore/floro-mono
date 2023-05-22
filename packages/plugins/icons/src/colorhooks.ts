import { useEffect, useMemo, useState } from "react";
import {
  PointerTypes,
  SchemaRoot,
  getReferencedObject,
  makeQueryRef,
} from "./floro-schema-api";

const rgbPattern = /rgb\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?\)/g;
const rgbaPattern =
  /rgba\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?(,\s?\d{1,3}(\.\d+)?\s?)?\)/g;
const hexPattern = /\#[0-9A-F]{3,8}/gi;
const hslPattern = /hsl\(\s?\d{1,3}\s?,\s?\d{1,3}%\s?,\s?\d{1,3}%\s?\)/g;
const hslaPattern =
  /hsla\(\s?\d{1,3}\s?,\s?\d{1,3}%\s?,\s?\d{1,3}%\s?,?\s?(,\s?\d{1,3}(\.\d+)?\s?)?\)/g;
const currentColor = /currentColor/;

const stringToSVGHTML = (str: string): SVGSVGElement => {
  const dom = document.createElement("div");
  dom.innerHTML = str;
  return (
    dom.getElementsByTagName("svg") as HTMLCollectionOf<SVGSVGElement>
  )[0];
};

export const extractHexvalue = (svgData: string) => {
  const colors = Array.from(
    new Set(
      [...(svgData?.matchAll?.(/\#[0-9A-F]{8}/g) ?? [])]?.map?.((v) => v[0])
    )
  ).sort((a, b) => {
    const aDistance = getColorDistance(a, "#FFFFFF");
    const bDistance = getColorDistance(b, "#FFFFFF");
    return aDistance - bDistance;
  });
  return getThetaSort(colors);
};

export const getHexColorDotProduct = (hexA: string, hexB: string): number => {
  const parsedColorsA = [
    parseInt(hexA[1] + hexA[2], 16),
    parseInt(hexA[3] + hexA[4], 16),
    parseInt(hexA[5] + hexA[6], 16),
  ];

  const parsedColorsB = [
    parseInt(hexB[1] + hexB[2], 16),
    parseInt(hexB[3] + hexB[4], 16),
    parseInt(hexB[5] + hexB[6], 16),
  ];
  return (
    parsedColorsA[0] * parsedColorsB[0] +
    parsedColorsA[1] * parsedColorsB[1] +
    parsedColorsA[2] * parsedColorsB[2]
  );
};

const getThetaSort = (colors: Array<string>) => {
  const graph: Array<Array<number>> = [];

  for (let i = 0; i < colors.length; ++i) {
    graph.push([]);
    for (let j = 0; j < colors.length; ++j) {
      const aDistance = getColorDistance(colors[i], "#000000");
      const bDistance = getColorDistance(colors[j], "#000000");
      if (aDistance == 0 || bDistance == 0) {
        graph[i].push(0);
      } else {
        const cosineTheta =
          getHexColorDotProduct(colors[i], colors[j]) / (aDistance * bDistance);
        // higher cos(θ) means the color slopes are more linear (meaning they should be grouped together)
        graph[i].push(cosineTheta);
      }
    }
  }
  const poorMansClustering: Array<string> = [];
  const filter = 0.9;
  for (let i = 0; i < colors.length; ++i) {
    graph.push([]);
    if (!poorMansClustering.includes(colors[i])) {
      for (let j = 0; j < colors.length; ++j) {
        if (graph[i][j] > filter && !poorMansClustering.includes(colors[j])) {
          poorMansClustering.push(colors[j]);
        }
      }
    }
  }
  for (const color of colors) {
    if (!poorMansClustering.includes(color)) {
      poorMansClustering.push(color);
    }
  }
  return poorMansClustering;
};

export const getAverageHex = (colors: Array<string>): string => {
  const parsedColors = colors.map((c) => {
    return [
      parseInt(c[1] + c[2], 16),
      parseInt(c[3] + c[4], 16),
      parseInt(c[5] + c[6], 16),
    ];
  });
  const summedColors = parsedColors.reduce(
    (a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]],
    [0, 0, 0]
  );
  const avgColor = [
    Math.round(summedColors[0] / parsedColors.length),
    Math.round(summedColors[1] / parsedColors.length),
    Math.round(summedColors[2] / parsedColors.length),
  ];
  return `#${avgColor[0].toString(16)}${avgColor[1].toString(
    16
  )}${avgColor[2].toString(16)}FF`.toUpperCase();
};

export const useSVGRemap = (
  svgData: string,
  remap: { [color: string]: string }
) => {
  return useMemo(() => {
    return Object.keys(remap).reduce((s, key) => {
      return s.replaceAll(key, remap[key]);
    }, svgData);
  }, [svgData, remap]);
};

export const containsBlack = async (svgData: string) => {
  if (!svgData) {
    return false;
  }

  const img = document.createElement("img");
  const svgData64 = `data:image/svg+xml,${encodeURIComponent(svgData)}`;
  img.src = svgData64;
  return await new Promise((resolve) => {
    img.onload = () => {
      const DIM = 128;
      const canvas = document.createElement("canvas");
      canvas.width = DIM;
      canvas.height = DIM;
      const context = canvas.getContext?.("2d");
      context?.drawImage?.(img, 0, 0, DIM, DIM);
      const imgData = context?.getImageData(0, 0, DIM, DIM);
      const data = imgData?.data;

      if (data) {
        for (let i = 0; i < data?.length; i += 4) {
          if (data[i + 3] == 255) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r == 0 && g == 0 && b == 0) {
              resolve(true);
              return;
            }
          }
        }
      }
      resolve(false);
    };
  });
};

export const useAvgColorSVGOut = (svgData: string) => {
  const [avg, setAvg] = useState("#000000FF");

  useEffect(() => {
    if (!svgData) {
      return;
    }
    const img = document.createElement("img");
    const svgData64 = `data:image/svg+xml,${encodeURIComponent(svgData)}`;
    img.src = svgData64;
    let mounted = true;
    img.onload = () => {
      const DIM = 64;
      const canvas = document.createElement("canvas");
      canvas.width = DIM;
      canvas.height = DIM;
      const context = canvas.getContext?.("2d");
      context?.drawImage?.(img, 0, 0, DIM, DIM);
      const imgData = context?.getImageData(0, 0, DIM, DIM);
      const data = imgData?.data;
      // enumerate all pixels
      let redSum = 0;
      let blueSum = 0;
      let greenSum = 0;

      let iterations = 0;
      if (data) {
        for (let i = 0; i < data?.length; i += 4) {
          // this only averages perimeter values
          const row = Math.floor(i / (DIM * 4));
          const col = Math.floor((i - row * 4) / (DIM * 4));
          const top = row - 1 < 0 ? null : row - 1;
          const left = col - 1 < 0 ? null : col - 1;
          const right = col + 1 > DIM - 1 ? null : col + 1;
          const bottom = row + 1 > DIM - 1 ? null : row + 1;
          // diagnols aren't really necessary, this is good enough

          if (data[i + 3] > 0) {
            if (
              top == null ||
              bottom == null ||
              left == null ||
              right == null
            ) {
              redSum += data[i];
              greenSum += data[i + 1];
              blueSum += data[i + 2];
              iterations++;
              continue;
            }
            const topIndex = top * DIM * 4 + col * 4;
            if (data[topIndex + 3] == 0) {
              redSum += data[i];
              greenSum += data[i + 1];
              blueSum += data[i + 2];
              iterations++;
              continue;
            }

            const bottomIndex = bottom * DIM * 4 + col * 4;
            if (data[bottomIndex + 3] == 0) {
              redSum += data[i];
              greenSum += data[i + 1];
              blueSum += data[i + 2];
              iterations++;
              continue;
            }
            const leftIndex = row * DIM * 4 + left * 4;
            if (data[leftIndex + 3] == 0) {
              redSum += data[i];
              greenSum += data[i + 1];
              blueSum += data[i + 2];
              iterations++;
              continue;
            }
            const rightIndex = row * DIM * 4 + right * 4;
            if (data[rightIndex + 3] == 0) {
              redSum += data[i];
              greenSum += data[i + 1];
              blueSum += data[i + 2];
              iterations++;
              continue;
            }
          }
        }
      }

      const avg = [
        Math.round(redSum / iterations),
        Math.round(greenSum / iterations),
        Math.round(blueSum / iterations),
      ];
      const hex =
        "#" +
        avg
          ?.map((i) => {
            return Math.min(255, i).toString(16).toUpperCase().padStart(2, "0");
          })
          .join("") +
        "FF";
      if (mounted) {
        setAvg(hex);
      }
    };
    return () => {
      mounted = false;
    };
  }, [svgData]);

  return avg;
};

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export const useStandardizeToHex = (svgData: string) => {
  let result = svgData.replace(hexPattern, (match, _offset, string) => {
    if (match.length == 4) {
      return (
        "#" +
        (
          match[1] +
          match[1] +
          match[2] +
          match[2] +
          match[3] +
          match[3] +
          "FF"
        ).toUpperCase()
      );
    }

    if (match.length == 5) {
      return (
        "#" +
        (
          match[1] +
          match[2] +
          match[3] +
          match[4] +
          match[1] +
          match[2] +
          match[3] +
          match[4]
        ).toUpperCase()
      );
    }
    if (match.length == 6 || match.length == 8) {
      return string;
    }
    if (match.length == 7) {
      return match.toUpperCase() + "FF";
    }

    return match.toUpperCase();
  });

  result = result.replace(rgbPattern, (match) => {
    return (
      "#" +
      match
        ?.match(/\d+(\.\d+)?/g)
        ?.map((s) => {
          return Math.min(255, Math.max(0, parseInt(s)))
            .toString(16)
            .toUpperCase()
            .padStart(2, "0");
        })
        .join("") +
      "FF"
    );
  });

  result = result.replace(rgbaPattern, (match) => {
    const values = match.match(/\d+(\.\d+)?/g);
    if (values?.length == 3) {
      return (
        "#" +
        values
          ?.map((s) => {
            return Math.min(255, Math.max(0, parseInt(s)))
              .toString(16)
              .toUpperCase()
              .padStart(2, "0");
          })
          .join("") +
        "FF"
      );
    }
    const alphaValue = values?.[3] ?? "1";
    const alphaFloat = Math.min(1, Math.max(0, parseFloat(alphaValue)));
    const alphaHex = Math.round(255 * alphaFloat)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");

    return (
      "#" +
      values
        ?.slice(0, 3)
        ?.map((s) => {
          return Math.min(255, Math.max(0, parseInt(s)))
            .toString(16)
            .toUpperCase()
            .padStart(2, "0");
        })
        .join("") +
      alphaHex
    );
  });
  result = result.replace(hslPattern, (match) => {
    const [h, s, l] = (match?.match(/\d+(\.\d+)?/g) ?? [])?.map(
      (v: string): number => {
        if (v === undefined) {
          return 0;
        }
        return parseInt(v);
      }
    );
    return hslToHex(h, s, l) + "FF";
  });

  result = result.replace(hslaPattern, (match) => {
    const values = match?.match(/\d+(\.\d+)?/g);
    const [h, s, l] = (values ?? [])?.map((v: string): number => {
      if (v === undefined) {
        return 0;
      }
      return parseInt(v);
    });

    const alphaValue = values?.[3] ?? "1";
    const alphaFloat = Math.min(1, Math.max(0, parseFloat(alphaValue)));
    const alphaHex = Math.round(255 * alphaFloat)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");

    return hslToHex(h, s, l) + alphaHex;
  });
  result = result.replace(currentColor, () => {
    return "#000000FF";
  });

  const [remappedSVG, setRemappedSVG] = useState(result);
  useEffect(() => {
    setRemappedSVG(result);
    const svgHTML = stringToSVGHTML(result);
    if (svgHTML) {
      // check if black is in image
      let hasUnmounted = false;
      containsBlack(result).then((hasBlack) => {
        if (hasUnmounted) {
          return;
        }
        if (hasBlack) {
          const fill = svgHTML.getAttribute("fill");
          if (!fill) {
            svgHTML.setAttribute("fill", "#000000FF");
            result = svgHTML.outerHTML;
            setRemappedSVG(result);
          }
        }
      });
      return () => {
        hasUnmounted = true;
      };
    }
  }, [result]);
  return remappedSVG;
};

export const getColorDistance = (staticHex: string, comparedHex: string) => {
  try {
    if (staticHex[0] != "#" || comparedHex[0] != "#") {
      return 0;
    }
    const r1 = parseInt((staticHex?.[1] ?? "F") + (staticHex?.[2] ?? "F"), 16);
    const r2 = parseInt(
      (comparedHex?.[1] ?? "F") + (comparedHex?.[2] ?? "F"),
      16
    );
    const g1 = parseInt((staticHex?.[3] ?? "F") + (staticHex?.[4] ?? "F"), 16);
    const g2 = parseInt(
      (comparedHex?.[3] ?? "F") + (comparedHex?.[4] ?? "F"),
      16
    );
    const b1 = parseInt((staticHex?.[5] ?? "F") + (staticHex?.[6] ?? "F"), 16);
    const b2 = parseInt(
      (comparedHex?.[5] ?? "F") + (comparedHex?.[6] ?? "F"),
      16
    );
    return Math.sqrt(
      Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    );
  } catch (e) {
    return 0;
  }
};

export const findHexIndicesInSvg = (svg: string, hexcode: string) => {
  const out: Array<number> = [];
  for (let i = 0; i < svg.length; ++i) {
    if (
      svg[i] == hexcode[0] &&
      svg.substring(i, i + hexcode.length) == hexcode
    ) {
      out.push(i);
    }
  }
  return out;
};

export const replaceHexIndicesInSvg = (
  svg: string,
  indices: Array<number>,
  replacementHex: string
) => {
  const outSvg = svg.split("");
  for (const index of indices) {
    for (let i = 0; i < replacementHex.length; ++i) {
      outSvg[index + i] = replacementHex[i];
    }
  }
  return outSvg.join("");
};

export const rethemeSvg = (
  applicationState: SchemaRoot,
  svg: string,
  appliedThemes: { [key: string]: PointerTypes["$(theme).themeColors.id<?>"] },
  themeRef: PointerTypes["$(theme).themes.id<?>"],
  themeColorRef?: PointerTypes["$(theme).themeColors.id<?>"]|null,
  themingHex?: string|null,
  stateVariantRef?: PointerTypes["$(theme).stateVariants.id<?>"],
  alpha: number = 255
): string => {
  const alphaHex = alpha.toString(16).toUpperCase().padStart(2, "0");
  const rethemedSvg = Object.keys(appliedThemes).reduce((s, hexcode) => {
    if (themingHex && hexcode == themingHex) {
      return s;
    }
    const appliedTheme = getReferencedObject(
      applicationState,
      appliedThemes[hexcode]
    );

    if (!appliedTheme) {
      return s;
    }
    if (stateVariantRef && appliedTheme.includeVariants) {
      const themedVariantRef = makeQueryRef(
        "$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>",
        appliedTheme.id,
        stateVariantRef,
        themeRef
      );
      const themedVariant = getReferencedObject(
        applicationState,
        themedVariantRef
      );
      const paletteColor = getReferencedObject(
        applicationState,
        themedVariant?.paletteColorShade
      );
      if (paletteColor?.hexcode) {
        // TODO: should address hexcodes here
        const indices = findHexIndicesInSvg(svg, hexcode);
        return replaceHexIndicesInSvg(s, indices, paletteColor?.hexcode + "FF");
      }
      return s;
    }
    const themeDefRef = makeQueryRef(
      "$(theme).themeColors.id<?>.themeDefinitions.id<?>",
      appliedTheme.id,
      themeRef
    );
    const themeDef = getReferencedObject(applicationState, themeDefRef);
    const paletteColor = getReferencedObject(
      applicationState,
      themeDef?.paletteColorShade
    );
    if (paletteColor?.hexcode) {
      // TODO: should address hexcodes here
      const indices = findHexIndicesInSvg(svg, hexcode);
      return replaceHexIndicesInSvg(s, indices, paletteColor?.hexcode + "FF");
    }
    return s;
  }, svg);

  if (themingHex && themeColorRef) {
    const appliedTheme = getReferencedObject(
      applicationState,
      themeColorRef
    );
    if (appliedTheme) {
      if (stateVariantRef) {
        if (!appliedTheme) {
          return rethemedSvg
        }
        const themedVariantRef = makeQueryRef(
          "$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>",
          appliedTheme?.id,
          stateVariantRef,
          themeRef
        );
        if (!appliedTheme.includeVariants) {
          return rethemedSvg;
        }
        const themedVariant = getReferencedObject(
          applicationState,
          themedVariantRef
        );
        const paletteColor = getReferencedObject(
          applicationState,
          themedVariant?.paletteColorShade
        );
        if (paletteColor?.hexcode) {
          const indices = findHexIndicesInSvg(svg, themingHex);
          return replaceHexIndicesInSvg(
            rethemedSvg,
            indices,
            paletteColor?.hexcode + alphaHex
          );
        }
        return rethemedSvg;
      }

      const themeDefRef = makeQueryRef(
        "$(theme).themeColors.id<?>.themeDefinitions.id<?>",
        appliedTheme.id,
        themeRef
      );
      const themeDef = getReferencedObject(applicationState, themeDefRef);
      const paletteColor = getReferencedObject(
        applicationState,
        themeDef?.paletteColorShade
      );
      if (paletteColor?.hexcode) {
        const indices = findHexIndicesInSvg(svg, themingHex);
        return replaceHexIndicesInSvg(
          rethemedSvg,
          indices,
          paletteColor?.hexcode + alphaHex
        );
      }
    }
  }
  return rethemedSvg;
};
