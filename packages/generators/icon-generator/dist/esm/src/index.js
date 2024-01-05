import { getReferencedObject, makeQueryRef, } from "./floro-generator-schema-api";
import floroGeneratorFile from "../floro/floro.generator.json";
import path from "path";
import fs from "fs";
import { quicktype, InputData, JSONSchemaInput, TypeScriptTargetLanguage, } from "quicktype-core";
export function filename() {
    return __filename;
}
export function getFloroGenerator() {
    return floroGeneratorFile;
}
export async function getJSON(state, args, mode, assetAccessor) {
    const themes = getReferencedObject(state, "$(theme).themes");
    const iconGroups = getReferencedObject(state, "$(icons).iconGroups");
    const iconsObject = {};
    for (const iconGroup of iconGroups) {
        const iconGroupId = iconGroup.id;
        for (const icon of iconGroup.icons) {
            const iconId = icon.id;
            const iconKey = `${iconGroupId}.${iconId}`;
            iconsObject[iconKey] = {
                default: {},
                variants: {},
            };
            const svgData = (await assetAccessor?.(icon.svg));
            const appliedThemes = icon.appliedThemes.reduce((acc, appliedTheme) => {
                return {
                    ...acc,
                    [appliedTheme.hexcode]: appliedTheme.themeDefinition,
                };
            }, {});
            for (const theme of themes) {
                const themeRef = makeQueryRef("$(theme).themes.id<?>", theme.id);
                const themedSvg = rethemeSvg(state, svgData, appliedThemes, themeRef);
                const preprocessedSvg = (await args?.svgPreprocessor?.(themedSvg)) ?? themedSvg;
                const hash = shortHash(preprocessedSvg);
                const iconFileName = `${iconKey}.default.${theme.id}.${hash}.svg`;
                if (mode == "live-update") {
                    iconsObject[iconKey].default[theme.id] = `${args?.assetHost ?? ""}/${iconFileName}`;
                }
                if (mode == "hot") {
                    iconsObject[iconKey].default[theme.id] = encodeToSvg(preprocessedSvg);
                }
            }
            const enabledVariantIds = icon.enabledVariants
                ?.filter((ev) => ev.enabled)
                .map((ev) => {
                return getReferencedObject(state, ev.id);
            })
                .map((s) => s.id);
            for (const variantId of enabledVariantIds) {
                const variantRef = makeQueryRef("$(theme).stateVariants.id<?>", variantId);
                for (const variantId of enabledVariantIds) {
                    iconsObject[iconKey].variants[variantId] = {};
                    for (const theme of themes) {
                        const themeRef = makeQueryRef("$(theme).themes.id<?>", theme.id);
                        const variantSvg = rethemeSvg(state, svgData, appliedThemes, themeRef, null, null, variantRef);
                        const preprocessedSvg = (await args?.svgPreprocessor?.(variantSvg)) ?? variantSvg;
                        const hash = shortHash(preprocessedSvg);
                        const iconFileName = `${iconKey}.${variantId}.${theme.id}.${hash}.svg`;
                        if (mode == "live-update") {
                            iconsObject[iconKey].variants[variantId][theme.id] = `${args?.assetHost ?? ""}/${iconFileName}`;
                        }
                        if (mode == "hot") {
                            iconsObject[iconKey].variants[variantId][theme.id] =
                                encodeToSvg(preprocessedSvg);
                        }
                    }
                }
            }
        }
    }
    return iconsObject;
}
const findHexIndicesInSvg = (svg, hexcode) => {
    const out = [];
    for (let i = 0; i < svg.length; ++i) {
        if (svg[i] == hexcode[0] &&
            svg.substring(i, i + hexcode.length) == hexcode) {
            out.push(i);
        }
    }
    return out;
};
const replaceHexIndicesInSvg = (svg, indices, replacementHex) => {
    const outSvg = svg.split("");
    for (const index of indices) {
        for (let i = 0; i < replacementHex.length; ++i) {
            outSvg[index + i] = replacementHex[i];
        }
    }
    return outSvg.join("");
};
const rethemeSvg = (applicationState, svg, appliedThemes, themeRef, themeColorRef, themingHex, stateVariantRef, alpha = 255) => {
    const alphaHex = alpha.toString(16).toUpperCase().padStart(2, "0");
    const rethemedSvg = Object.keys(appliedThemes).reduce((s, hexcode) => {
        if (themingHex && hexcode == themingHex) {
            return s;
        }
        const appliedTheme = getReferencedObject(applicationState, appliedThemes[hexcode]);
        if (!appliedTheme) {
            return s;
        }
        if (stateVariantRef && appliedTheme.includeVariants) {
            const themedVariantRef = makeQueryRef("$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>", appliedTheme.id, stateVariantRef, themeRef);
            const themedVariant = getReferencedObject(applicationState, themedVariantRef);
            const paletteColor = getReferencedObject(applicationState, themedVariant?.paletteColorShade);
            if (paletteColor?.hexcode) {
                const alphaHex = Math.round(themedVariant?.alpha ?? 255)
                    .toString(16)
                    .padStart(2, "0");
                const indices = findHexIndicesInSvg(svg, hexcode);
                return replaceHexIndicesInSvg(s, indices, paletteColor?.hexcode + alphaHex);
            }
        }
        const themeDefRef = makeQueryRef("$(theme).themeColors.id<?>.themeDefinitions.id<?>", appliedTheme.id, themeRef);
        const themeDef = getReferencedObject(applicationState, themeDefRef);
        const paletteColor = getReferencedObject(applicationState, themeDef?.paletteColorShade);
        if (paletteColor?.hexcode) {
            const alphaHex = Math.round(themeDef?.alpha ?? 255)
                .toString(16)
                .padStart(2, "0");
            const indices = findHexIndicesInSvg(svg, hexcode);
            return replaceHexIndicesInSvg(s, indices, paletteColor?.hexcode + alphaHex);
        }
        return s;
    }, svg);
    if (themingHex && themeColorRef) {
        const appliedTheme = getReferencedObject(applicationState, themeColorRef);
        if (appliedTheme) {
            if (stateVariantRef) {
                if (!appliedTheme) {
                    return rethemedSvg;
                }
                const themedVariantRef = makeQueryRef("$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>", appliedTheme?.id, stateVariantRef, themeRef);
                if (!appliedTheme.includeVariants) {
                    return rethemedSvg;
                }
                const themedVariant = getReferencedObject(applicationState, themedVariantRef);
                const paletteColor = getReferencedObject(applicationState, themedVariant?.paletteColorShade);
                if (paletteColor?.hexcode) {
                    const indices = findHexIndicesInSvg(svg, themingHex);
                    return replaceHexIndicesInSvg(rethemedSvg, indices, paletteColor?.hexcode + alphaHex);
                }
            }
            const themeDefRef = makeQueryRef("$(theme).themeColors.id<?>.themeDefinitions.id<?>", appliedTheme.id, themeRef);
            const themeDef = getReferencedObject(applicationState, themeDefRef);
            const paletteColor = getReferencedObject(applicationState, themeDef?.paletteColorShade);
            if (paletteColor?.hexcode) {
                const indices = findHexIndicesInSvg(svg, themingHex);
                return replaceHexIndicesInSvg(rethemedSvg, indices, paletteColor?.hexcode + alphaHex);
            }
        }
    }
    return rethemedSvg;
};
const shortHash = (str) => {
    let hash = 0;
    str = str.padEnd(8, "0");
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash &= hash;
    }
    return new Uint32Array([hash])[0].toString(16);
};
const encodeToSvg = (svg) => {
    return `data:image/svg+xml,${encodeURIComponent(svg ?? "")}`;
};
const GET_ICON = `
export const getIcon = <
  T extends keyof Icons,
  U extends keyof Theme,
  K extends keyof Icons[T]["variants"] | "default"
>(
  icons: Icons,
  themeName: U,
  iconKey: T,
  variant?: K
): string => {
  const defaultIcon = icons[iconKey].default[themeName];
  if (!variant || variant == "default") {
    return defaultIcon;
  }
  const icon = icons[iconKey] as Icons[T];
  return (
    icon.variants[variant as keyof typeof icon.variants][themeName] ??
    defaultIcon
  );
};
`.trim();
export async function generate(state, outDir, args = { lang: "typescript" }, assetAccessor) {
    const themes = getReferencedObject(state, "$(theme).themes");
    const iconGroups = getReferencedObject(state, "$(icons).iconGroups");
    const SCHEMA = {
        $schema: "http://json-schema.org/draft-06/schema#",
        $ref: "#/definitions/Icons",
        definitions: {
            Theme: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
            },
            Icons: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
            },
        },
    };
    const requiredThemes = [];
    for (const theme of themes) {
        SCHEMA.definitions.Theme.properties[theme.id] = {
            type: ["string"],
        };
        requiredThemes.push(theme.id);
    }
    SCHEMA.definitions.Theme.required = requiredThemes;
    const requiredIcons = [];
    for (const iconGroup of iconGroups) {
        const iconGroupId = iconGroup.id;
        for (const icon of iconGroup.icons) {
            const iconId = icon.id;
            const iconKey = `${iconGroupId}.${iconId}`;
            SCHEMA.definitions.Icons.properties[iconKey] = {
                type: "object",
                additionalProperties: false,
                required: ["default", "variants"],
                properties: {
                    default: {
                        $ref: "#/definitions/Theme",
                    },
                    variants: {
                        type: "object",
                        required: [],
                        additionalProperties: false,
                        properties: {},
                    },
                },
            };
            const enabledVariantIds = icon.enabledVariants
                ?.filter((ev) => ev.enabled)
                .map((ev) => {
                return getReferencedObject(state, ev.id);
            })
                .map((s) => s.id);
            for (const enabledVariantId of enabledVariantIds) {
                SCHEMA.definitions.Icons.properties[iconKey].properties.variants.properties[enabledVariantId] = {
                    $ref: "#/definitions/Theme",
                };
                SCHEMA.definitions.Icons.properties[iconKey].properties.variants.required.push(enabledVariantId);
            }
            requiredIcons.push(iconKey);
        }
    }
    SCHEMA.definitions.Icons.required = requiredIcons;
    const inputData = new InputData();
    const source = { name: "Icons", schema: JSON.stringify(SCHEMA) };
    await inputData.addSource("schema", source, () => new JSONSchemaInput(undefined));
    const iconsDir = path.join(outDir, "icons");
    await fs.promises.mkdir(iconsDir, { recursive: true });
    if (args.lang == "typescript") {
        let headTSCode = `import { Icons, Theme } from "./types";\n\n`;
        let bodyTSCode = `export default {\n`;
        let iconIndex = 0;
        const unlinkList = [];
        const safeFiles = new Set();
        for (const iconGroup of iconGroups) {
            const iconGroupId = iconGroup.id;
            for (const icon of iconGroup.icons) {
                const iconId = icon.id;
                const iconKey = `${iconGroupId}.${iconId}`;
                const svgData = (await assetAccessor(icon.svg));
                const appliedThemes = icon.appliedThemes.reduce((acc, appliedTheme) => {
                    return {
                        ...acc,
                        [appliedTheme.hexcode]: appliedTheme.themeDefinition,
                    };
                }, {});
                bodyTSCode += `  ["${iconKey}"]: {\n`;
                bodyTSCode += `    default: {\n`;
                for (const theme of themes) {
                    const themeRef = makeQueryRef("$(theme).themes.id<?>", theme.id);
                    const themedSvg = rethemeSvg(state, svgData, appliedThemes, themeRef);
                    const preprocessedSvg = (await args?.svgPreprocessor?.(themedSvg)) ?? themedSvg;
                    const hash = shortHash(preprocessedSvg);
                    const iconFileName = `${iconKey}.default.${theme.id}.${hash}.svg`;
                    const iconFilePath = path.join(iconsDir, iconFileName);
                    await fs.promises.writeFile(iconFilePath, preprocessedSvg, "utf8");
                    const iconName = `icon${iconIndex}`;
                    const icons = await fs.promises.readdir(iconsDir);
                    const regex = new RegExp(`${iconKey}.default.${theme.id}.[a-z0-9]+.svg`);
                    const staleIcons = icons.filter(v => {
                        if (regex.test(v) && v != iconFileName) {
                            return true;
                        }
                        return false;
                    }).map(f => path.join(iconsDir, f));
                    safeFiles.add(iconFileName);
                    unlinkList.push(...staleIcons);
                    headTSCode += `import ${iconName} from './icons/${iconFileName}';\n`;
                    bodyTSCode += `      ["${theme.id}"]: ${iconName},\n`;
                    iconIndex++;
                }
                bodyTSCode += `    },\n`; // end defaults
                bodyTSCode += `    variants: {\n`;
                const enabledVariantIds = icon.enabledVariants
                    ?.filter((ev) => ev.enabled)
                    .map((ev) => {
                    return getReferencedObject(state, ev.id);
                })
                    .map((s) => s.id);
                for (const variantId of enabledVariantIds) {
                    const variantRef = makeQueryRef("$(theme).stateVariants.id<?>", variantId);
                    bodyTSCode += `      ["${variantId}"]: {\n`;
                    for (const theme of themes) {
                        const themeRef = makeQueryRef("$(theme).themes.id<?>", theme.id);
                        const variantSvg = rethemeSvg(state, svgData, appliedThemes, themeRef, null, null, variantRef);
                        const preprocessedSvg = (await args?.svgPreprocessor?.(variantSvg)) ?? variantSvg;
                        const hash = shortHash(preprocessedSvg);
                        const iconFileName = `${iconKey}.${variantId}.${theme.id}.${hash}.svg`;
                        const iconFilePath = path.join(iconsDir, iconFileName);
                        await fs.promises.writeFile(iconFilePath, preprocessedSvg, "utf8");
                        const icons = await fs.promises.readdir(iconsDir);
                        const regex = new RegExp(`${iconKey}.${variantId}.${theme.id}.[a-z0-9]+.svg`);
                        const staleIcons = icons.filter(v => {
                            if (regex.test(v) && v != iconFileName) {
                                return true;
                            }
                            return false;
                        }).map(f => path.join(iconsDir, f));
                        safeFiles.add(iconFileName);
                        unlinkList.push(...staleIcons);
                        const iconName = `icon${iconIndex}`;
                        headTSCode += `import ${iconName} from './icons/${iconFileName}';\n`;
                        bodyTSCode += `        ["${theme.id}"]: ${iconName},\n`;
                        iconIndex++;
                    }
                    bodyTSCode += `      },\n`;
                }
                bodyTSCode += `    },\n`; // end variants
                bodyTSCode += `  },\n`;
            }
        }
        bodyTSCode += `} as Icons;`;
        const tsCode = `${headTSCode}\n${bodyTSCode}\n\n${GET_ICON}`;
        const indexFilePath = path.join(outDir, "index.ts");
        await fs.promises.writeFile(indexFilePath, tsCode, "utf-8");
        const lang = new TypeScriptTargetLanguage();
        const runtimeTypecheck = lang.optionDefinitions.find((option) => option.name == "runtime-typecheck");
        if (runtimeTypecheck) {
            runtimeTypecheck.defaultValue = false;
        }
        const { lines } = await quicktype({ lang, inputData });
        const typesCode = lines.join("\n");
        const typesFilePath = path.join(outDir, "types.ts");
        await fs.promises.writeFile(typesFilePath, typesCode, "utf-8");
        for (const file of unlinkList) {
            await fs.promises.rm(file);
        }
        const allIcons = await fs.promises.readdir(iconsDir);
        for (const file of allIcons) {
            if (!safeFiles.has(file)) {
                await fs.promises.rm(path.join(iconsDir, file));
            }
        }
    }
}
//# sourceMappingURL=index.js.map