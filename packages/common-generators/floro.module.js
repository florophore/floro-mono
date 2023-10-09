const paletteGenerator = require('../generators/palette-generator/dist/src/index.js');


module.exports = function() {
    return {
        repository: "@jamiesunderland/test-repo",
        //branch: "main",
        //moduleDir: "floro_modules",
        //assetHost: "http://localhost:9000/private-cdn",
        generators: [
            {
                generator: paletteGenerator,
                args: {
                    lang: 'typescript'
                }
            }
        ]
    }
}