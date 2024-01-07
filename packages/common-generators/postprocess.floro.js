const fs = require('fs');
const path = require('path');
require("./static-analysis"); // run static analysis
const localesStatic = require('./floro_modules/text-generator/locales.static.json');
const localesSet = new Set(localesStatic);
const localesJSON = require('./floro_modules/text-generator/text.json');

const localesStaticStructure = {};

for (const localeCode in localesJSON.locales) {
  for (let phraseKey in localesJSON.localizedPhraseKeys[localeCode]) {
    if (!localesSet.has(phraseKey)) {
      delete localesJSON.localizedPhraseKeys[localeCode][phraseKey]
      delete localesJSON.phraseKeyDebugInfo[phraseKey]
    } else {
      const argKeys = Object.keys(localesJSON.localizedPhraseKeys[localeCode][phraseKey].args).sort();
      const args = {};
      for (const key of argKeys) {
        args[key] = localesJSON.localizedPhraseKeys[localeCode][phraseKey].args[key];
      }
      localesStaticStructure[phraseKey] = args;
    }
  }
}

const shortHash = (str) => {
    let hash = 0;
    str = str.padEnd(8, "0");
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return new Uint32Array([hash])[0].toString(16);
  };

const globalDefaultLocale = Object.values(localesJSON.locales).find(l => l.isGlobalDefault);

const localizedPhraseKeysGlobalDefault = localesJSON.localizedPhraseKeys[globalDefaultLocale.localeCode];

const defaultJSON = {
    locales: localesJSON.locales,
    localizedPhraseKeys: {
        [globalDefaultLocale.localeCode]: localizedPhraseKeysGlobalDefault
    },
    phraseKeyDebugInfo: localesJSON.phraseKeyDebugInfo
}

fs.writeFileSync(
  path.join(__dirname, "./floro_modules/text-generator/server-text.json"),
  JSON.stringify(localesJSON),
  "utf-8"
);

// write default locale json
fs.writeFileSync(
  path.join(__dirname, "./floro_modules/text-generator/default.locale.json"),
  JSON.stringify(defaultJSON),
  "utf-8"
);

const localesDirPath = path.join(__dirname, '../main/public/locales');
const localesDirExists = fs.existsSync(localesDirPath);
if (localesDirExists) {
    fs.rmSync(localesDirPath, {recursive: true});
}
fs.mkdirSync(localesDirPath);

const localeJSONs = {};

for (const localeCode in localesJSON.locales) {
    const locale = localesJSON.locales[localeCode];
  if (locale.isGlobalDefault) {
    continue;
  }
  const jsonString = JSON.stringify(localesJSON.localizedPhraseKeys[locale.localeCode]);
  const sha = shortHash(jsonString);
  const fileName = `${locale.localeCode}.${sha}.json`;
  const filePath = path.join(localesDirPath, fileName)
    fs.writeFileSync(
    filePath,
    jsonString,
    "utf-8"
    );
  localeJSONs[locale.localeCode] = fileName;
}

fs.writeFileSync(
  path.join(__dirname, "./floro_modules/text-generator/locale.loads.json"),
  JSON.stringify(localeJSONs),
  "utf-8"
);


const hash = shortHash(JSON.stringify(localesStaticStructure, null, 2));

const staticStructure = {
  structure: localesStaticStructure,
  hash
}

fs.writeFileSync(
  path.join(__dirname, "./floro_modules/text-generator/static-structure.json"),
  JSON.stringify(staticStructure),
  "utf-8"
);