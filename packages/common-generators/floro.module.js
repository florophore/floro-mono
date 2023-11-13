const paletteGenerator = require("../generators/palette-generator");
const themeGenerator = require("../generators/theme-generator");
const iconGenerator = require("../generators/icon-generator");
const textGenerator = require("../generators/text-generator");
const todoGenerator = require("../generators/todo-generator");

module.exports = function () {
  return {
    repository: "@jamiesunderland/test-repo",
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
      {
        generator: textGenerator,
        args: {
          lang: "typescript",
        },
      },
      {
        generator: todoGenerator,
        args: {
          lang: "typescript",
        },
      },
    ],
  };
};
