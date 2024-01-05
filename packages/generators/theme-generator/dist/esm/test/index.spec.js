import path from "path";
import mock from "./mock_state.json";
import { fs, vol } from "memfs";
import { generate } from "../src/index";
const mockState = mock;
const outDir = path.join(__dirname, "..", "exports");
jest.mock("fs");
jest.mock("fs/promises");
describe("generate", () => {
    beforeEach(async () => {
        fs.mkdirSync(outDir, { recursive: true });
    });
    afterEach(() => {
        vol.reset();
    });
    test("produces themes script", async () => {
        await generate(mockState, outDir);
        const files = fs.readdirSync(outDir);
        expect(files).toEqual(["index.ts", "themes.json"]);
        const jsonString = fs.readFileSync(path.join(outDir, "themes.json"), "utf8");
        const json = JSON.parse(jsonString);
        expect(json).toEqual({
            themeDefinitions: {
                light: {
                    name: "light",
                    background: "#FFFFFFFF",
                },
                dark: {
                    name: "dark",
                    background: "#000000FF",
                },
            },
            themeColors: {
                "new-theme": {
                    default: {
                        light: "#7C7C7CFF",
                        dark: "#FFFFFFFF",
                    },
                    variants: {
                        hovered: {
                            light: "#5445C4FF",
                            dark: "#9B8FF7FF",
                        },
                        selected: {
                            light: "#E52A2AFF",
                            dark: null,
                        },
                        focused: {
                            light: null,
                            dark: null,
                        },
                    },
                },
                "main-theme": {
                    default: {
                        light: "#FFFFFFFF",
                        dark: "#23C2B9FF",
                    },
                    variants: {},
                },
                "main-background": {
                    default: {
                        light: "#FFFFFFFF",
                        dark: "#414141FF",
                    },
                    variants: {},
                },
                "primary-negative": {
                    default: {
                        light: "#000000FF",
                        dark: "#7C7C7CFF",
                    },
                    variants: {
                        hovered: {
                            light: "#23C2B9FF",
                            dark: "#3DD43AFF",
                        },
                        selected: {
                            light: null,
                            dark: null,
                        },
                        focused: {
                            light: null,
                            dark: null,
                        },
                    },
                },
                "primary-color": {
                    default: {
                        light: "#F93D44FF",
                        dark: "#CC2F35FF",
                    },
                    variants: {},
                },
                "primary-font-color": {
                    default: {
                        light: "#3DD43AFF",
                        dark: "#77F075FF",
                    },
                    variants: {},
                },
                "secondary-color": {
                    default: {
                        light: "#3D65DBFF",
                        dark: "#7E91ECFF",
                    },
                    variants: {},
                },
                "secondary-font-color": {
                    default: {
                        light: "#000000FF",
                        dark: "#FFFFFFFF",
                    },
                    variants: {},
                },
            },
        });
    });
});
//# sourceMappingURL=index.spec.js.map