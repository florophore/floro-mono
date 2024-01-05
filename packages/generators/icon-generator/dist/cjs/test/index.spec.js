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
const fs_1 = __importDefault(require("fs"));
const images = {
    "2fef7c3fc7e55034b2c382422d2be83905149947d89327bb9c04173e38f74692.svg": fs_1.default.readFileSync(path_1.default.join(__dirname, "./images/2fef7c3fc7e55034b2c382422d2be83905149947d89327bb9c04173e38f74692.svg"), "utf8"),
    "4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e.svg": fs_1.default.readFileSync(path_1.default.join(__dirname, "./images/4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e.svg"), "utf8"),
};
const memfs_1 = require("memfs");
const index_1 = require("../src/index");
const mockState = mock_state_json_1.default;
const outDir = path_1.default.join(__dirname, "..", "exports");
const assetAccessor = (binaryRef) => {
    return Promise.resolve(images[binaryRef]);
};
jest.mock("fs/promises");
describe("getJSON", () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.mock("fs");
        memfs_1.fs.mkdirSync(outDir, { recursive: true });
    }));
    afterEach(() => {
        memfs_1.vol.reset();
    });
    test("produces asset referenced icons when live-update", () => __awaiter(void 0, void 0, void 0, function* () {
        const json = yield (0, index_1.getJSON)(mockState, { assetHost: "https://example.com/assets/icons" }, "live-update", assetAccessor);
        expect(json).toEqual({
            "main.discard": {
                default: {
                    light: "https://example.com/assets/icons/main.discard.default.light.53054e9b.svg",
                    dark: "https://example.com/assets/icons/main.discard.default.dark.8df9b323.svg",
                },
                variants: {
                    hovered: {
                        light: "https://example.com/assets/icons/main.discard.hovered.light.87bfed69.svg",
                        dark: "https://example.com/assets/icons/main.discard.hovered.dark.fa1ea3f9.svg",
                    },
                },
            },
            "main.billing": {
                default: {
                    light: "https://example.com/assets/icons/main.billing.default.light.1e5732fa.svg",
                    dark: "https://example.com/assets/icons/main.billing.default.dark.62dda3b1.svg",
                },
                variants: {
                    hovered: {
                        light: "https://example.com/assets/icons/main.billing.hovered.light.1e5732fa.svg",
                        dark: "https://example.com/assets/icons/main.billing.hovered.dark.62dda3b1.svg",
                    },
                    selected: {
                        light: "https://example.com/assets/icons/main.billing.selected.light.1e5732fa.svg",
                        dark: "https://example.com/assets/icons/main.billing.selected.dark.62dda3b1.svg",
                    },
                    focused: {
                        light: "https://example.com/assets/icons/main.billing.focused.light.1e5732fa.svg",
                        dark: "https://example.com/assets/icons/main.billing.focused.dark.62dda3b1.svg",
                    },
                },
            },
        });
    }));
});
//# sourceMappingURL=index.spec.js.map