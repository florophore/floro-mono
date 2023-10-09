import path from "path";
import { FileRef, SchemaRoot } from "../src/floro-generator-schema-api";
import mock from "./mock_state.json";
import ofs from 'fs';

const images = {
  "2fef7c3fc7e55034b2c382422d2be83905149947d89327bb9c04173e38f74692.svg":
    ofs.readFileSync(path.join(
      __dirname,
      "./images/2fef7c3fc7e55034b2c382422d2be83905149947d89327bb9c04173e38f74692.svg"
    ), "utf8"),
  "4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e.svg":
    ofs.readFileSync(path.join(
      __dirname,
      "./images/4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e.svg"
    ), "utf8"),
};

import { fs, vol } from "memfs";
import { getJSON } from "../src/index";

const mockState: SchemaRoot = mock as SchemaRoot;
const outDir = path.join(__dirname, "..", "exports");

const assetAccessor = (binaryRef: FileRef): Promise<string|Buffer> => {
  return Promise.resolve(images[binaryRef] as string);
}

jest.mock("fs/promises");
describe("getJSON", () => {
  beforeEach(async () => {
    jest.mock("fs");
    fs.mkdirSync(outDir, { recursive: true });
  });

  afterEach(() => {
    vol.reset();
  });

  test("produces asset referenced icons when live-update", async () => {
    const json = await getJSON(
      mockState,
      { assetHost: "https://example.com/assets/icons" },
      "live-update",
      assetAccessor
    );
    expect(json).toEqual({
      "main.discard": {
        default: {
          light:
            "https://example.com/assets/icons/main.discard.default.light.53054e9b.svg",
          dark: "https://example.com/assets/icons/main.discard.default.dark.8df9b323.svg",
        },
        variants: {
          hovered: {
            light:
              "https://example.com/assets/icons/main.discard.hovered.light.87bfed69.svg",
            dark: "https://example.com/assets/icons/main.discard.hovered.dark.fa1ea3f9.svg",
          },
        },
      },
      "main.billing": {
        default: {
          light:
            "https://example.com/assets/icons/main.billing.default.light.1e5732fa.svg",
          dark: "https://example.com/assets/icons/main.billing.default.dark.62dda3b1.svg",
        },
        variants: {
          hovered: {
            light:
              "https://example.com/assets/icons/main.billing.hovered.light.1e5732fa.svg",
            dark: "https://example.com/assets/icons/main.billing.hovered.dark.62dda3b1.svg",
          },
          selected: {
            light:
              "https://example.com/assets/icons/main.billing.selected.light.1e5732fa.svg",
            dark: "https://example.com/assets/icons/main.billing.selected.dark.62dda3b1.svg",
          },
          focused: {
            light:
              "https://example.com/assets/icons/main.billing.focused.light.1e5732fa.svg",
            dark: "https://example.com/assets/icons/main.billing.focused.dark.62dda3b1.svg",
          },
        },
      },
    });
  });
});
