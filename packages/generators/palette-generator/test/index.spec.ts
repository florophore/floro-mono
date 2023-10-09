import path from "path";
import { SchemaRoot } from "../src/floro-generator-schema-api";
import mock from "./mock_state.json";
import { fs, vol } from "memfs";
import { generate } from "../src/index";

jest.mock("fs");
jest.mock("fs/promises");

const mockState: SchemaRoot = mock as SchemaRoot;
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
    const files = fs.readdirSync(outDir);
    expect(files).toEqual(["index.ts", "palette.json"]);
    const jsonString = fs.readFileSync(path.join(outDir, "palette.json"), "utf8") as string;
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
  });
});
