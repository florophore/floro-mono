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
export function makeQueryRef(query, arg0, arg1, arg2) {
    if ((arg0 != null && arg0 != undefined) && query == '$(theme).stateVariants.id<?>') {
        return `$(theme).stateVariants.id<${arg0}>`;
    }
    if ((arg0 != null && arg0 != undefined) && query == '$(theme).themeColors.id<?>') {
        return `$(theme).themeColors.id<${arg0}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(theme).themeColors.id<?>.themeDefinitions.id<?>') {
        return `$(theme).themeColors.id<${arg0}>.themeDefinitions.id<${arg1}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(theme).themeColors.id<?>.variants.id<?>') {
        return `$(theme).themeColors.id<${arg0}>.variants.id<${arg1}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>') {
        return `$(theme).themeColors.id<${arg0}>.variants.id<${arg1}>.variantDefinitions.id<${arg2}>`;
    }
    if ((arg0 != null && arg0 != undefined) && query == '$(theme).themes.id<?>') {
        return `$(theme).themes.id<${arg0}>`;
    }
    if ((arg0 != null && arg0 != undefined) && query == '$(palette).colorPalettes.id<?>') {
        return `$(palette).colorPalettes.id<${arg0}>`;
    }
    if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(palette).colorPalettes.id<?>.colorShades.id<?>') {
        return `$(palette).colorPalettes.id<${arg0}>.colorShades.id<${arg1}>`;
    }
    if ((arg0 != null && arg0 != undefined) && query == '$(palette).shades.id<?>') {
        return `$(palette).shades.id<${arg0}>`;
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