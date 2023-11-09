const getCounterArrowBalanance = (str) => {
    let counter = 0;
    for (let i = 0; i < str.length; ++i) {
        if (str[i] == "<")
            counter++;
        if (str[i] == ">")
            counter--;
    }
    return counter;
};
const extractKeyValueFromRefString = (str) => {
    let key = "";
    let i = 0;
    while (str[i] != "<") {
        key += str[i++];
    }
    let value = "";
    let counter = 1;
    i++;
    while (i < str.length) {
        if (str[i] == "<")
            counter++;
        if (str[i] == ">")
            counter--;
        if (counter >= 1) {
            value += str[i];
        }
        i++;
    }
    return {
        key,
        value,
    };
};
const splitPath = (str) => {
    let out = [];
    let arrowBalance = 0;
    let curr = "";
    for (let i = 0; i <= str.length; ++i) {
        if (i == str.length) {
            out.push(curr);
            continue;
        }
        if (arrowBalance == 0 && str[i] == ".") {
            out.push(curr);
            curr = "";
            continue;
        }
        if (str[i] == "<") {
            arrowBalance++;
        }
        if (str[i] == ">") {
            arrowBalance--;
        }
        curr += str[i];
    }
    return out;
};
const decodeSchemaPathWithArrays = (pathString) => {
    return splitPath(pathString).map((part) => {
        if (/^\[(\d+)\]$/.test(part)) {
            return parseInt((/^\[(\d+)\]$/.exec(part)[1]));
        }
        if (/^(.+)<(.+)>$/.test(part) && getCounterArrowBalanance(part) == 0) {
            const { key, value } = extractKeyValueFromRefString(part);
            return {
                key,
                value,
            };
        }
        return part;
    });
};
const getObjectInStateMap = (stateMap, path) => {
    let current = null;
    const [pluginWrapper, ...decodedPath] = decodeSchemaPathWithArrays(path);
    const pluginName = /^\$\((.+)\)$/.exec(pluginWrapper)?.[1] ?? null;
    if (pluginName == null) {
        return null;
    }
    current = stateMap[pluginName];
    for (const part of decodedPath) {
        if (!current) {
            return null;
        }
        if (typeof part == "number") {
            current = current[part];
        }
        else if (typeof part != "string") {
            const { key, value } = part;
            if (Array.isArray(current)) {
                const element = current?.find?.((v) => v?.[key] == value);
                current = element;
            }
            else {
                return null;
            }
        }
        else {
            current = current[part];
        }
    }
    return current ?? null;
};
export function makeQueryRef(query, arg0, arg1, arg2, arg3, arg4) {
    if ((arg0 != null && arg0 != undefined) && query == '$(text).phraseGroups.id<?>') {
        return `$(text).phraseGroups.id<${arg0}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.interpolationVariants.name<${arg2}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.interpolationVariants.name<${arg2}>.localeRules.id<${arg3}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.linkVariables.linkName<${arg2}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.linkVariables.linkName<${arg2}>.translations.id<${arg3}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.phraseTranslations.id<${arg2}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.testCases.id<${arg2}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.testCases.id<${arg2}>.localeTests.description<${arg3}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && (arg3 != null && arg3 != undefined) && (arg4 != null && arg4 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.testCases.id<${arg2}>.localeTests.description<${arg3}>.mockValues.variableRef<${arg4}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>') {
        return `$(text).phraseGroups.id<${arg0}>.phrases.id<${arg1}>.variables.id<${arg2}>`;
    }
    if ((arg0 != null && arg0 != undefined) && query == '$(text).terms.id<?>') {
        return `$(text).terms.id<${arg0}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(text).terms.id<?>.localizedTerms.id<?>') {
        return `$(text).terms.id<${arg0}>.localizedTerms.id<${arg1}>`;
    }
    if ((arg0 != null && arg0 != undefined) && query == '$(text).localeSettings.locales.localeCode<?>') {
        return `$(text).localeSettings.locales.localeCode<${arg0}>`;
    }
    return null;
}
;
export function extractQueryArgs(query) {
    if (!query) {
        return [];
    }
    return (decodeSchemaPathWithArrays(query)
        ?.filter((v) => typeof v != "string")
        ?.map((v) => v.value) ?? []);
}
;
export function getReferencedObject(root, query) {
    if (!query) {
        return null;
    }
    const existingObj = getObjectInStateMap(root, query);
    if (existingObj) {
        return existingObj;
    }
    return null;
}
;
//# sourceMappingURL=floro-generator-schema-api.js.map