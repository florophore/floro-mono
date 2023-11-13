import initText from "@floro/common-generators/floro_modules/text-generator";

console.log("TEST", window, import.meta?.['env'])
//export default window.__FLORO_TEXT__ ?? initText;
export default initText;
