"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
require("./button.css");
/**
 * Primary UI component for user interaction
 */
const Button = ({ primary, backgroundColor, size, label, ...props }) => {
    const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
    return (react_1.default.createElement("button", { type: "button", className: ['storybook-button', `storybook-button--${size}`, mode].join(' '), style: backgroundColor && { backgroundColor }, ...props }, label));
};
exports.default = Button;
//# sourceMappingURL=Button.js.map