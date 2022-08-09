"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggedIn = exports.LoggedOut = void 0;
const react_1 = __importDefault(require("react"));
const testing_library_1 = require("@storybook/testing-library");
const Page_1 = __importDefault(require("./Page"));
exports.default = {
    title: 'Example/Page',
    component: Page_1.default,
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'fullscreen',
    },
};
const Template = (args) => react_1.default.createElement(Page_1.default, { ...args });
// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
exports.LoggedOut = Template.bind({});
exports.LoggedIn = Template.bind({});
exports.LoggedIn.play = async ({ canvasElement }) => {
    const canvas = (0, testing_library_1.within)(canvasElement);
    const loginButton = await canvas.getByRole('button', { name: /Log in/i });
    await testing_library_1.userEvent.click(loginButton);
};
//# sourceMappingURL=Page.stories.js.map