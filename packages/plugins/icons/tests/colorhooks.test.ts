import { findHexIndicesInSvg, replaceHexIndicesInSvg } from "../src/colorhooks";

test("findHexIndicesInSvg", () => {
    const str ="<svg><circle fill=\"#000000FF\"/><path stroke=\"#000000FF\"/></svg>"
    const indices = findHexIndicesInSvg(str, "#000000FF");
    const nextSvg = replaceHexIndicesInSvg(str, indices, "#999999FF")
    console.log(nextSvg);
});