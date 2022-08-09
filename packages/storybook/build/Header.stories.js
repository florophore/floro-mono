"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggedOut = exports.LoggedIn = void 0;
const react_1 = __importDefault(require("react"));
const Header_1 = __importDefault(require("./Header"));
exports.default = {
    title: 'Example/Header',
    component: Header_1.default,
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'fullscreen',
    },
};
const Template = (args) => react_1.default.createElement(Header_1.default, { ...args });
exports.LoggedIn = Template.bind({});
exports.LoggedIn.args = {
    user: {
        name: 'Jane Doe',
    },
};
exports.LoggedOut = Template.bind({});
exports.LoggedOut.args = {};
//# sourceMappingURL=Header.stories.js.map