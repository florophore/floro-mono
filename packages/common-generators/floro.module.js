const paletteGenerator = require("../generators/palette-generator");
const themeGenerator = require("../generators/theme-generator");
const iconGenerator = require("../generators/icon-generator");
const textGenerator = require("../generators/text-generator");

module.exports = function () {
  return {
    repository: "@floro/floro-mono",
    generators: [
      {
        generator: textGenerator,
        args: {
          lang: "typescript",
        },
      },
      {
        generator: iconGenerator,
        args: {
          lang: "typescript",
        },
      },
      {
        generator: themeGenerator,
        args: {
          lang: "typescript",
        },
      },
      {
        generator: paletteGenerator,
        args: {
          lang: "typescript",
        },
      }
    ],
  };
};
