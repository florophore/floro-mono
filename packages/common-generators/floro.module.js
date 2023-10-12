//const paletteGenerator = require("../generators/palette-generator/dist/src");
const themeGenerator = require("../generators/theme-generator/dist/src");
const iconGenerator = require("../generators/icon-generator/dist/src");
const paletteGenerator = require("floro-palette-generator");

module.exports = function () {
  return {
    repository: "@jamiesunderland/test-repo",
    //assetHost: "http://localhost:9000/private-cdn",
    generators: [
      {
        generator: paletteGenerator,
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
        generator: iconGenerator,
        args: {
          lang: "typescript",
        },
      },
    ],
  };
};
