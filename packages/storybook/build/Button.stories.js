"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Small = exports.Large = exports.Secondary = exports.Primary = void 0;
const react_1 = __importDefault(require("react"));
const Button_1 = __importDefault(require("./Button"));
// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
exports.default = {
    title: 'Example/Button',
    component: Button_1.default,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        backgroundColor: { control: 'color' },
    },
};
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => react_1.default.createElement(Button_1.default, { ...args });
exports.Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
exports.Primary.args = {
    primary: true,
    label: 'Button',
};
exports.Secondary = Template.bind({});
exports.Secondary.args = {
    label: 'Button',
};
exports.Large = Template.bind({});
exports.Large.args = {
    primary: true,
    size: 'large',
    label: 'Button',
};
exports.Small = Template.bind({});
exports.Small.args = {
    size: 'small',
    label: 'Button',
};
//# sourceMappingURL=Button.stories.js.map