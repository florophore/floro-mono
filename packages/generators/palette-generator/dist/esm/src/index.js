import { getReferencedObject, makeQueryRef, } from "./floro-generator-schema-api";
import floroGeneratorFile from '../floro/floro.generator.json';
import path from "path";
import fs from "fs";
import { quicktype, InputData, JSONSchemaInput, TypeScriptTargetLanguage } from "quicktype-core";
export function filename() {
    return __filename;
}
export function getFloroGenerator() {
    return floroGeneratorFile;
}
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
export async function getJSON(state) {
    const paletteJson = {};
    const colorPalettes = getReferencedObject(state, "$(palette).colorPalettes");
    const shades = getReferencedObject(state, "$(palette).shades");
    for (const colorPalette of colorPalettes) {
        paletteJson[colorPalette.id] = {};
        for (const shade of shades) {
            const shadeRef = makeQueryRef("$(palette).shades.id<?>", shade.id);
            const colorShade = getReferencedObject(state, `$(palette).colorPalettes.id<${colorPalette.id}>.colorShades.id<${shadeRef}>`);
            paletteJson[colorPalette.id][shade.id] = colorShade.hexcode ?? null;
        }
    }
    return paletteJson;
}
export async function generate(state, outDir, args = { lang: "typescript" }) {
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
    const colorPalettes = getReferencedObject(state, "$(palette).colorPalettes");
    const shades = getReferencedObject(state, "$(palette).shades");
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
    const inputData = new InputData();
    const source = { name: "Palette", schema: JSON.stringify(SCHEMA) };
    await inputData.addSource("schema", source, () => new JSONSchemaInput(undefined));
    if (args.lang == 'typescript') {
        const lang = new TypeScriptTargetLanguage();
        const runtimeTypecheck = lang.optionDefinitions.find(option => option.name == 'runtime-typecheck');
        if (runtimeTypecheck) {
            runtimeTypecheck.defaultValue = false;
        }
        const { lines } = await quicktype({ lang, inputData });
        const code = lines.join("\n");
        const tsFile = path.join(outDir, 'index.ts');
        let tsCode = `import paletteJSON from './palette.json';\n\n`;
        tsCode += code + '\n';
        tsCode += GET_PALETTE_COLOR + '\n\n';
        tsCode += `export default paletteJSON as Palette;`;
        await fs.promises.writeFile(tsFile, tsCode, 'utf-8');
        const paletteJson = await getJSON(state);
        const jsonFile = path.join(outDir, 'palette.json');
        await fs.promises.writeFile(jsonFile, JSON.stringify(paletteJson, null, 2), 'utf-8');
    }
}
//# sourceMappingURL=index.js.map