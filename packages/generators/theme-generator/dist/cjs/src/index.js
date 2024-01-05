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
const quicktype_core_1 = require("quicktype-core");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function filename() {
    return __filename;
}
exports.filename = filename;
function getFloroGenerator() {
    return floro_generator_json_1.default;
}
exports.getFloroGenerator = getFloroGenerator;
function getJSON(state) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const themes = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(theme).themes");
        const themeColors = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(theme).themeColors");
        const themesObject = {
            themeDefinitions: {},
            themeColors: {},
        };
        for (const theme of themes) {
            themesObject.themeDefinitions[theme.id] = {
                name: theme.id,
                background: ((_a = theme.backgroundColor) === null || _a === void 0 ? void 0 : _a.hexcode) + 'FF',
            };
        }
        for (const themeColor of themeColors) {
            themesObject.themeColors[themeColor.id] = {
                default: {},
                variants: {},
            };
            for (const themeDef of themeColor.themeDefinitions) {
                const [themeId] = (0, floro_generator_schema_api_1.extractQueryArgs)(themeDef.id);
                const paletteColor = (0, floro_generator_schema_api_1.getReferencedObject)(state, themeDef.paletteColorShade);
                if (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) {
                    const color = `${paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode}${((_b = themeDef === null || themeDef === void 0 ? void 0 : themeDef.alpha) !== null && _b !== void 0 ? _b : 255)
                        .toString(16)
                        .toUpperCase()
                        .padStart(2, "0")}`;
                    themesObject.themeColors[themeColor.id].default[themeId] = color;
                }
                else {
                    themesObject.themeColors[themeColor.id].default[themeId] = null;
                }
            }
            if (themeColor.includeVariants) {
                for (const themeVariant of themeColor.variants) {
                    const [variantId] = (0, floro_generator_schema_api_1.extractQueryArgs)(themeVariant.id);
                    themesObject.themeColors[themeColor.id].variants[variantId] = {};
                    for (const variantDefintion of themeVariant.variantDefinitions) {
                        const [themeId] = (0, floro_generator_schema_api_1.extractQueryArgs)(variantDefintion.id);
                        const paletteColor = (0, floro_generator_schema_api_1.getReferencedObject)(state, variantDefintion.paletteColorShade);
                        if (paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode) {
                            const color = `${paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.hexcode}${((_c = variantDefintion === null || variantDefintion === void 0 ? void 0 : variantDefintion.alpha) !== null && _c !== void 0 ? _c : 255)
                                .toString(16)
                                .toUpperCase()
                                .padStart(2, "0")}`;
                            themesObject.themeColors[themeColor.id].variants[variantId][themeId] = color;
                        }
                        else {
                            themesObject.themeColors[themeColor.id].variants[variantId][themeId] = null;
                        }
                    }
                }
            }
        }
        return themesObject;
    });
}
exports.getJSON = getJSON;
const GET_THEME_CODE = `
export const getThemeDefintion = <T extends keyof ThemeDefinitions>(
  themeDefintions: ThemeDefinitions,
  themeDefintionName: T
): ThemeDefinitions[T] => {
  return themeDefintions[themeDefintionName];
}

export const getThemeColor = <
  T extends keyof ThemeColors,
  U extends keyof ThemeSet,
  K extends keyof ThemeColors[T]["variants"]|"default"
>(
  themeColors: ThemeColors,
  themeName: U,
  themeColorKey: T,
  variant?: K
): string|null => {
  const themeColor = themeColors[themeColorKey];
  const defaultColor = themeColor.default[themeName];
  if (!variant || variant == "default") {
    return defaultColor;
  }
  return (
    themeColor.variants[variant as keyof typeof themeColor.variants][
      themeName
    ] ?? defaultColor
  );
};
`.trim();
function generate(state, outDir, args = { lang: 'typescript' }) {
    return __awaiter(this, void 0, void 0, function* () {
        const themes = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(theme).themes");
        const themeColors = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(theme).themeColors");
        const SCHEMA = {
            $schema: "http://json-schema.org/draft-06/schema#",
            $ref: "#/definitions/Themes",
            definitions: {
                Themes: {
                    type: "object",
                    properties: {
                        themeDefinitions: {
                            $ref: "#/definitions/ThemeDefinitions",
                        },
                        themeColors: {
                            $ref: "#/definitions/ThemeColors",
                        },
                    },
                    required: ["themeDefinitions", "themeColors"],
                    additionalProperties: false,
                },
                ThemeSet: {
                    type: "object",
                    properties: {},
                    required: [],
                    additionalProperties: false,
                },
                ThemeDefinitions: {
                    type: "object",
                    properties: {},
                    required: [],
                    additionalProperties: false,
                },
                ThemeColors: {
                    type: "object",
                    properties: {},
                    required: [],
                    additionalProperties: false,
                },
            },
        };
        const requiredThemeSet = [];
        const requiredThemeDefs = [];
        for (const theme of themes) {
            SCHEMA.definitions.ThemeSet.properties[theme.id] = {
                type: ["string", "null"],
            };
            requiredThemeSet.push(theme.id);
            SCHEMA.definitions.ThemeDefinitions.properties[theme.id] = {
                type: "object",
                properties: {
                    name: {
                        type: "string"
                    },
                    background: {
                        type: "string"
                    },
                },
                required: ["name", "background"],
                additionalProperties: false,
            };
            requiredThemeSet.push(theme.id);
            requiredThemeDefs.push(theme.id);
        }
        SCHEMA.definitions.ThemeSet.required = requiredThemeSet;
        SCHEMA.definitions.ThemeDefinitions.required = requiredThemeDefs;
        const themeColorKeys = [];
        for (const themeColor of themeColors) {
            SCHEMA.definitions.ThemeColors.properties[themeColor.id] = {
                type: "object",
                additionalProperties: false,
                required: ["default", "variants"],
                properties: {
                    default: {
                        $ref: "#/definitions/ThemeSet",
                    },
                    variants: {
                        type: "object",
                        required: [],
                        additionalProperties: false,
                        properties: {},
                    },
                },
            };
            const enabledVariantIds = (themeColor === null || themeColor === void 0 ? void 0 : themeColor.includeVariants) ? themeColor.variants
                .map((ev) => {
                return (0, floro_generator_schema_api_1.getReferencedObject)(state, ev.id);
            })
                .map((s) => s.id) : [];
            for (const variantId of enabledVariantIds) {
                SCHEMA.definitions.ThemeColors.properties[themeColor.id].properties.variants.properties[variantId] = {
                    $ref: "#/definitions/ThemeSet",
                };
                SCHEMA.definitions.ThemeColors.properties[themeColor.id].properties.variants.required.push(variantId);
            }
            themeColorKeys.push(themeColor.id);
        }
        SCHEMA.definitions.ThemeColors.required = themeColorKeys;
        const inputData = new quicktype_core_1.InputData();
        const source = { name: "Themes", schema: JSON.stringify(SCHEMA) };
        yield inputData.addSource("schema", source, () => new quicktype_core_1.JSONSchemaInput(undefined));
        if (args.lang == "typescript") {
            const lang = new quicktype_core_1.TypeScriptTargetLanguage();
            const runtimeTypecheck = lang.optionDefinitions.find((option) => option.name == "runtime-typecheck");
            if (runtimeTypecheck) {
                runtimeTypecheck.defaultValue = false;
            }
            const { lines } = yield (0, quicktype_core_1.quicktype)({ lang, inputData });
            const code = lines.join("\n");
            let tsCode = `import themesJSON from './themes.json';\n\n`;
            tsCode += code + '\n';
            tsCode += GET_THEME_CODE + '\n\n';
            tsCode += `export default themesJSON as Themes;`;
            const tsFile = path_1.default.join(outDir, 'index.ts');
            yield fs_1.default.promises.writeFile(tsFile, tsCode, 'utf-8');
            const themesJson = yield getJSON(state);
            const jsonFile = path_1.default.join(outDir, 'themes.json');
            yield fs_1.default.promises.writeFile(jsonFile, JSON.stringify(themesJson, null, 2), 'utf-8');
        }
    });
}
exports.generate = generate;
//# sourceMappingURL=index.js.map