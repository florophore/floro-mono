import path from "path";
import mock from "./mock_state.json";
import { fs, vol } from "memfs";
import { generate } from "../src/index";
jest.mock("fs");
jest.mock("fs/promises");
const mockState = mock;
const outDir = path.join(__dirname, "..", "exports");
describe("generate", () => {
    beforeEach(async () => {
        fs.mkdirSync(outDir, { recursive: true });
    });
    afterEach(() => {
        vol.reset();
    });
    test("generates json and typescript mocks", async () => {
        await generate(mockState, outDir, { lang: "typescript" });
        //const files = fs.readdirSync(outDir);
        //expect(files).toEqual(["index.ts", "text.json"]);
        //const jsonString = fs.readFileSync(path.join(outDir, "text.json"), "utf8") as string;
    });
});
//# sourceMappingURL=index.spec.js.map