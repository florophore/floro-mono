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
const GET_PALETTE_COLOR = `
export const getPaletteColor = <
  T extends keyof Palette,
  U extends keyof Shade,
>(
  palette: Palette,
  color: T,
  shade: U,
): string | null => {
  return palette[color][shade];
};
`.trim();
function getJSON(state) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const paletteJson = {};
        const colorPalettes = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(palette).colorPalettes");
        const shades = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(palette).shades");
        for (const colorPalette of colorPalettes) {
            paletteJson[colorPalette.id] = {};
            for (const shade of shades) {
                const shadeRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(palette).shades.id<?>", shade.id);
                const colorShade = (0, floro_generator_schema_api_1.getReferencedObject)(state, `$(palette).colorPalettes.id<${colorPalette.id}>.colorShades.id<${shadeRef}>`);
                paletteJson[colorPalette.id][shade.id] = (_a = colorShade.hexcode) !== null && _a !== void 0 ? _a : null;
            }
        }
        return paletteJson;
    });
}
exports.getJSON = getJSON;
function generate(state, outDir, args = { lang: "typescript" }) {
    return __awaiter(this, void 0, void 0, function* () {
        const SCHEMA = {
            $schema: "http://json-schema.org/draft-06/schema#",
            $ref: "#/definitions/Palette",
            definitions: {
                Palette: {
                    type: "object",
                    properties: {},
                    required: [],
                    additionalProperties: false,
                },
                Shade: {
                    type: "object",
                    properties: {},
                    required: [],
                    additionalProperties: false,
                },
            },
        };
        const colorPalettes = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(palette).colorPalettes");
        const shades = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(palette).shades");
        const requiredShades = [];
        for (const shade of shades) {
            SCHEMA.definitions.Shade.properties[shade.id] = {
                'type': ["string", "null"],
            };
            requiredShades.push(shade.id);
        }
        SCHEMA.definitions.Shade.required = requiredShades;
        const requiredPaletteColors = [];
        for (const color of colorPalettes) {
            SCHEMA.definitions.Palette.properties[color.id] = {
                '$ref': "#/definitions/Shade",
            };
            requiredPaletteColors.push(color.id);
        }
        SCHEMA.definitions.Palette.required = requiredPaletteColors;
        const inputData = new quicktype_core_1.InputData();
        const source = { name: "Palette", schema: JSON.stringify(SCHEMA) };
        yield inputData.addSource("schema", source, () => new quicktype_core_1.JSONSchemaInput(undefined));
        if (args.lang == 'typescript') {
            const lang = new quicktype_core_1.TypeScriptTargetLanguage();
            const runtimeTypecheck = lang.optionDefinitions.find(option => option.name == 'runtime-typecheck');
            if (runtimeTypecheck) {
                runtimeTypecheck.defaultValue = false;
            }
            const { lines } = yield (0, quicktype_core_1.quicktype)({ lang, inputData });
            const code = lines.join("\n");
            const tsFile = path_1.default.join(outDir, 'index.ts');
            let tsCode = `import paletteJSON from './palette.json';\n\n`;
            tsCode += code + '\n';
            tsCode += GET_PALETTE_COLOR + '\n\n';
            tsCode += `export default paletteJSON as Palette;`;
            yield fs_1.default.promises.writeFile(tsFile, tsCode, 'utf-8');
            const paletteJson = yield getJSON(state);
            const jsonFile = path_1.default.join(outDir, 'palette.json');
            yield fs_1.default.promises.writeFile(jsonFile, JSON.stringify(paletteJson, null, 2), 'utf-8');
        }
    });
}
exports.generate = generate;
//# sourceMappingURL=index.js.map