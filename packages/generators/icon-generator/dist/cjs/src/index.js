"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.getJSON = exports.getFloroGenerator = exports.filename = void 0;
const floro_generator_schema_api_1 = require("./floro-generator-schema-api");
const floro_generator_json_1 = __importDefault(require("../floro/floro.generator.json"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const quicktype_core_1 = require("quicktype-core");
function filename() {
    return __filename;
}
exports.filename = filename;
function getFloroGenerator() {
    return floro_generator_json_1.default;
}
exports.getFloroGenerator = getFloroGenerator;
function getJSON(state, args, mode, assetAccessor) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        const themes = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(theme).themes");
        const iconGroups = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(icons).iconGroups");
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
                const svgData = (yield (assetAccessor === null || assetAccessor === void 0 ? void 0 : assetAccessor(icon.svg)));
                const appliedThemes = icon.appliedThemes.reduce((acc, appliedTheme) => {
                    return Object.assign(Object.assign({}, acc), { [appliedTheme.hexcode]: appliedTheme.themeDefinition });
                }, {});
                for (const theme of themes) {
                    const themeRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).themes.id<?>", theme.id);
                    const themedSvg = rethemeSvg(state, svgData, appliedThemes, themeRef);
                    const preprocessedSvg = (_b = (yield ((_a = args === null || args === void 0 ? void 0 : args.svgPreprocessor) === null || _a === void 0 ? void 0 : _a.call(args, themedSvg)))) !== null && _b !== void 0 ? _b : themedSvg;
                    const hash = shortHash(preprocessedSvg);
                    const iconFileName = `${iconKey}.default.${theme.id}.${hash}.svg`;
                    if (mode == "live-update") {
                        iconsObject[iconKey].default[theme.id] = `${(_c = args === null || args === void 0 ? void 0 : args.assetHost) !== null && _c !== void 0 ? _c : ""}/${iconFileName}`;
                    }
                    if (mode == "hot") {
                        iconsObject[iconKey].default[theme.id] = encodeToSvg(preprocessedSvg);
                    }
                }
                const enabledVariantIds = (_d = icon.enabledVariants) === null || _d === void 0 ? void 0 : _d.filter((ev) => ev.enabled).map((ev) => {
                    return (0, floro_generator_schema_api_1.getReferencedObject)(state, ev.id);
                }).map((s) => s.id);
                for (const variantId of enabledVariantIds) {
                    const variantRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).stateVariants.id<?>", variantId);
                    for (const variantId of enabledVariantIds) {
                        iconsObject[iconKey].variants[variantId] = {};
                        for (const theme of themes) {
                            const themeRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).themes.id<?>", theme.id);
                            const variantSvg = rethemeSvg(state, svgData, appliedThemes, themeRef, null, null, variantRef);
                            const preprocessedSvg = (_f = (yield ((_e = args === null || args === void 0 ? void 0 : args.svgPreprocessor) === null || _e === void 0 ? void 0 : _e.call(args, variantSvg)))) !== null && _f !== void 0 ? _f : variantSvg;
                            const hash = shortHash(preprocessedSvg);
                            const iconFileName = `${iconKey}.${variantId}.${theme.id}.${hash}.svg`;
                            if (mode == "live-update") {
                                iconsObject[iconKey].variants[variantId][theme.id] = `${(_g = args === null || args === void 0 ? void 0 : args.assetHost) !== null && _g !== void 0 ? _g : ""}/${iconFileName}`;
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
    });
}
exports.getJSON = getJSON;
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
        var _a, _b;
        if (themingHex && hexcode == themingHex) {
            return s;
        }
        const appliedTheme = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, appliedThemes[hexcode]);
        if (!appliedTheme) {
            return s;
        }
        if (stateVariantRef && appliedTheme.includeVariants) {
            const themedVariantRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>", appliedTheme.id, stateVariantRef, themeRef);
            const themedVariant = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themedVariantRef);
            const paletteColor = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themedVariant === null || themedVariant === void 0 ? void 0 : themedVariant.paletteColorShade);
            if (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) {
                const alphaHex = Math.round((_a = themedVariant === null || themedVariant === void 0 ? void 0 : themedVariant.alpha) !== null && _a !== void 0 ? _a : 255)
                    .toString(16)
                    .padStart(2, "0");
                const indices = findHexIndicesInSvg(svg, hexcode);
                return replaceHexIndicesInSvg(s, indices, (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) + alphaHex);
            }
        }
        const themeDefRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).themeColors.id<?>.themeDefinitions.id<?>", appliedTheme.id, themeRef);
        const themeDef = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themeDefRef);
        const paletteColor = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themeDef === null || themeDef === void 0 ? void 0 : themeDef.paletteColorShade);
        if (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) {
            const alphaHex = Math.round((_b = themeDef === null || themeDef === void 0 ? void 0 : themeDef.alpha) !== null && _b !== void 0 ? _b : 255)
                .toString(16)
                .padStart(2, "0");
            const indices = findHexIndicesInSvg(svg, hexcode);
            return replaceHexIndicesInSvg(s, indices, (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) + alphaHex);
        }
        return s;
    }, svg);
    if (themingHex && themeColorRef) {
        const appliedTheme = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themeColorRef);
        if (appliedTheme) {
            if (stateVariantRef) {
                if (!appliedTheme) {
                    return rethemedSvg;
                }
                const themedVariantRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>", appliedTheme === null || appliedTheme === void 0 ? void 0 : appliedTheme.id, stateVariantRef, themeRef);
                if (!appliedTheme.includeVariants) {
                    return rethemedSvg;
                }
                const themedVariant = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themedVariantRef);
                const paletteColor = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themedVariant === null || themedVariant === void 0 ? void 0 : themedVariant.paletteColorShade);
                if (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) {
                    const indices = findHexIndicesInSvg(svg, themingHex);
                    return replaceHexIndicesInSvg(rethemedSvg, indices, (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) + alphaHex);
                }
            }
            const themeDefRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).themeColors.id<?>.themeDefinitions.id<?>", appliedTheme.id, themeRef);
            const themeDef = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themeDefRef);
            const paletteColor = (0, floro_generator_schema_api_1.getReferencedObject)(applicationState, themeDef === null || themeDef === void 0 ? void 0 : themeDef.paletteColorShade);
            if (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) {
                const indices = findHexIndicesInSvg(svg, themingHex);
                return replaceHexIndicesInSvg(rethemedSvg, indices, (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) + alphaHex);
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
    return `data:image/svg+xml,${encodeURIComponent(svg !== null && svg !== void 0 ? svg : "")}`;
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
function generate(state, outDir, args = { lang: "typescript" }, assetAccessor) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const themes = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(theme).themes");
        const iconGroups = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(icons).iconGroups");
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
                const enabledVariantIds = (_a = icon.enabledVariants) === null || _a === void 0 ? void 0 : _a.filter((ev) => ev.enabled).map((ev) => {
                    return (0, floro_generator_schema_api_1.getReferencedObject)(state, ev.id);
                }).map((s) => s.id);
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
        const inputData = new quicktype_core_1.InputData();
        const source = { name: "Icons", schema: JSON.stringify(SCHEMA) };
        yield inputData.addSource("schema", source, () => new quicktype_core_1.JSONSchemaInput(undefined));
        const iconsDir = path_1.default.join(outDir, "icons");
        yield fs_1.default.promises.mkdir(iconsDir, { recursive: true });
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
                    const svgData = (yield assetAccessor(icon.svg));
                    const appliedThemes = icon.appliedThemes.reduce((acc, appliedTheme) => {
                        return Object.assign(Object.assign({}, acc), { [appliedTheme.hexcode]: appliedTheme.themeDefinition });
                    }, {});
                    bodyTSCode += `  ["${iconKey}"]: {\n`;
                    bodyTSCode += `    default: {\n`;
                    for (const theme of themes) {
                        const themeRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).themes.id<?>", theme.id);
                        const themedSvg = rethemeSvg(state, svgData, appliedThemes, themeRef);
                        const preprocessedSvg = (_c = (yield ((_b = args === null || args === void 0 ? void 0 : args.svgPreprocessor) === null || _b === void 0 ? void 0 : _b.call(args, themedSvg)))) !== null && _c !== void 0 ? _c : themedSvg;
                        const hash = shortHash(preprocessedSvg);
                        const iconFileName = `${iconKey}.default.${theme.id}.${hash}.svg`;
                        const iconFilePath = path_1.default.join(iconsDir, iconFileName);
                        yield fs_1.default.promises.writeFile(iconFilePath, preprocessedSvg, "utf8");
                        const iconName = `icon${iconIndex}`;
                        const icons = yield fs_1.default.promises.readdir(iconsDir);
                        const regex = new RegExp(`${iconKey}.default.${theme.id}.[a-z0-9]+.svg`);
                        const staleIcons = icons.filter(v => {
                            if (regex.test(v) && v != iconFileName) {
                                return true;
                            }
                            return false;
                        }).map(f => path_1.default.join(iconsDir, f));
                        safeFiles.add(iconFileName);
                        unlinkList.push(...staleIcons);
                        headTSCode += `import ${iconName} from './icons/${iconFileName}';\n`;
                        bodyTSCode += `      ["${theme.id}"]: ${iconName},\n`;
                        iconIndex++;
                    }
                    bodyTSCode += `    },\n`; // end defaults
                    bodyTSCode += `    variants: {\n`;
                    const enabledVariantIds = (_d = icon.enabledVariants) === null || _d === void 0 ? void 0 : _d.filter((ev) => ev.enabled).map((ev) => {
                        return (0, floro_generator_schema_api_1.getReferencedObject)(state, ev.id);
                    }).map((s) => s.id);
                    for (const variantId of enabledVariantIds) {
                        const variantRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).stateVariants.id<?>", variantId);
                        bodyTSCode += `      ["${variantId}"]: {\n`;
                        for (const theme of themes) {
                            const themeRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(theme).themes.id<?>", theme.id);
                            const variantSvg = rethemeSvg(state, svgData, appliedThemes, themeRef, null, null, variantRef);
                            const preprocessedSvg = (_f = (yield ((_e = args === null || args === void 0 ? void 0 : args.svgPreprocessor) === null || _e === void 0 ? void 0 : _e.call(args, variantSvg)))) !== null && _f !== void 0 ? _f : variantSvg;
                            const hash = shortHash(preprocessedSvg);
                            const iconFileName = `${iconKey}.${variantId}.${theme.id}.${hash}.svg`;
                            const iconFilePath = path_1.default.join(iconsDir, iconFileName);
                            yield fs_1.default.promises.writeFile(iconFilePath, preprocessedSvg, "utf8");
                            const icons = yield fs_1.default.promises.readdir(iconsDir);
                            const regex = new RegExp(`${iconKey}.${variantId}.${theme.id}.[a-z0-9]+.svg`);
                            const staleIcons = icons.filter(v => {
                                if (regex.test(v) && v != iconFileName) {
                                    return true;
                                }
                                return false;
                            }).map(f => path_1.default.join(iconsDir, f));
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
            const indexFilePath = path_1.default.join(outDir, "index.ts");
            yield fs_1.default.promises.writeFile(indexFilePath, tsCode, "utf-8");
            const lang = new quicktype_core_1.TypeScriptTargetLanguage();
            const runtimeTypecheck = lang.optionDefinitions.find((option) => option.name == "runtime-typecheck");
            if (runtimeTypecheck) {
                runtimeTypecheck.defaultValue = false;
            }
            const { lines } = yield (0, quicktype_core_1.quicktype)({ lang, inputData });
            const typesCode = lines.join("\n");
            const typesFilePath = path_1.default.join(outDir, "types.ts");
            yield fs_1.default.promises.writeFile(typesFilePath, typesCode, "utf-8");
            for (const file of unlinkList) {
                yield fs_1.default.promises.rm(file);
            }
            const allIcons = yield fs_1.default.promises.readdir(iconsDir);
            for (const file of allIcons) {
                if (!safeFiles.has(file)) {
                    yield fs_1.default.promises.rm(path_1.default.join(iconsDir, file));
                }
            }
        }
    });
}
exports.generate = generate;
//# sourceMappingURL=index.js.map