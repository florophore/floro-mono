import { Plugin } from "@floro/graphql-schemas/build/generated/main-graphql";
import FindPluginSearchDropdown from "./index";
import PluginDefaultSelectedLight from '@floro/common-assets/assets/images/icons/plugin_default.selected.light.svg';
import PluginDefaultSelectedDark from '@floro/common-assets/assets/images/icons/plugin_default.selected.dark.svg';

export default {
  title: "floro-app/common-components/FindPluginSearchDropdown",
  component: FindPluginSearchDropdown,
  argTypes: {},
};

const plugins: Array<Plugin> = [
    {
        id: "abc",
        ownerType: "user_plugin",
        user: {
            id: "abc",
            username: "jamiesunderland",
        },
        name: "my-plugin",
        displayName: "My Plugin",
        selectedLightIcon: PluginDefaultSelectedLight,
        selectedDarkIcon: PluginDefaultSelectedDark,
    },
    {
        id: "abc",
        ownerType: "org_plugin",
        organization: {
            id: "abc",
            handle: "floro-org",
        },
        name: "theme",
        displayName: "Theme",
        selectedLightIcon: PluginDefaultSelectedLight,
        selectedDarkIcon: PluginDefaultSelectedDark,
    },
    {
        id: "abc",
        ownerType: "org_plugin",
        organization: {
            id: "abc",
            handle: "floro-org",
        },
        name: "icons",
        displayName: "Icons",
        selectedLightIcon: PluginDefaultSelectedLight,
        selectedDarkIcon: PluginDefaultSelectedDark,
    },
];

const Template = (args) => <div style={{maxWidth: 263}}><FindPluginSearchDropdown {...args} plugins={plugins}/></div>

export const Primary: any = Template.bind({});
Primary.args = {
};