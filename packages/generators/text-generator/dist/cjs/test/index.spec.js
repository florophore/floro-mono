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
        //const files = fs.readdirSync(outDir);
        //expect(files).toEqual(["index.ts", "text.json"]);
        //const jsonString = fs.readFileSync(path.join(outDir, "text.json"), "utf8") as string;
    }));
});
//# sourceMappingURL=index.spec.js.map