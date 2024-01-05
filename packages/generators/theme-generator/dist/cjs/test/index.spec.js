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
const path_1 = __importDefault(require("path"));
const mock_state_json_1 = __importDefault(require("./mock_state.json"));
const memfs_1 = require("memfs");
const index_1 = require("../src/index");
const mockState = mock_state_json_1.default;
const outDir = path_1.default.join(__dirname, "..", "exports");
jest.mock("fs");
jest.mock("fs/promises");
describe("generate", () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        memfs_1.fs.mkdirSync(outDir, { recursive: true });
    }));
    afterEach(() => {
        memfs_1.vol.reset();
    });
    test("produces themes script", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.generate)(mockState, outDir);
        const files = memfs_1.fs.readdirSync(outDir);
        expect(files).toEqual(["index.ts", "themes.json"]);
        const jsonString = memfs_1.fs.readFileSync(path_1.default.join(outDir, "themes.json"), "utf8");
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
    }));
});
//# sourceMappingURL=index.spec.js.map