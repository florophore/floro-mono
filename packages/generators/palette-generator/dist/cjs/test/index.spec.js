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
jest.mock("fs");
jest.mock("fs/promises");
const mockState = mock_state_json_1.default;
const outDir = path_1.default.join(__dirname, "..", "exports");
describe("generate", () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        memfs_1.fs.mkdirSync(outDir, { recursive: true });
    }));
    afterEach(() => {
        memfs_1.vol.reset();
    });
    test("generates json and typescript mocks", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.generate)(mockState, outDir, { lang: "typescript" });
        const files = memfs_1.fs.readdirSync(outDir);
        expect(files).toEqual(["index.ts", "palette.json"]);
        const jsonString = memfs_1.fs.readFileSync(path_1.default.join(outDir, "palette.json"), "utf8");
        const json = JSON.parse(jsonString);
        expect(json).toEqual({
            white: {
                light: null,
                regular: "#FFFFFF",
                dark: null,
            },
            black: {
                light: null,
                regular: "#000000",
                dark: null,
            },
            red: {
                light: "#F93D44",
                regular: "#CC2F35",
                dark: "#AA2227",
            },
            green: {
                light: "#77F075",
                regular: "#3DD43A",
                dark: "#26A324",
            },
            blue: {
                light: "#7E91EC",
                regular: "#3D65DB",
                dark: "#1F38B2",
            },
        });
    }));
});
//# sourceMappingURL=index.spec.js.map