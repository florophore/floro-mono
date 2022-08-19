module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@react-theming/storybook-addon"
  ],
  "framework": "@storybook/react",
  "staticDirs": ['../stories/assets', "../fonts"],
  "core": {
    "builder": "@storybook/builder-webpack5"
  }
}