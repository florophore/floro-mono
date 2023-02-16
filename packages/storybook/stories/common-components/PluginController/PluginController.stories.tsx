import PluginController from "./index";
import { BrowserRouter } from 'react-router-dom';

export default {
  title: "floro-app/common-components/PluginController",
  component: PluginController,
  argTypes: {},
};

const MOCK_PLUGIN_1 = {
  "id": "b4c0b6ce-d24a-424d-bd27-26f2bab2656f",
  "name": "palette",
  "isPrivate": false,
  "createdAt": "2023-02-10T19:22:02.403Z",
  "updatedAt": "2023-02-10T19:22:02.403Z",
  "displayName": "Palette",
  "lightIcon": "http://localhost:9000/assets/images/icons/plugin_default.unselected.light.svg",
  "darkIcon": "http://localhost:9000/assets/images/icons/plugin_default.unselected.dark.svg",
  "selectedLightIcon": "http://localhost:9000/assets/images/icons/plugin_default.selected.svg",
  "selectedDarkIcon": "http://localhost:9000/assets/images/icons/plugin_default.selected.svg",
  "createdByUser": {
      "id": "3edbc450-7e78-40db-895e-5eed8de73fcf",
      "username": "jamiesunderland",
      "__typename": "User"
  },
  "user": {
      "id": "3edbc450-7e78-40db-895e-5eed8de73fcf",
      "username": "jamiesunderland",
      "__typename": "User"
  },
  "organization": null,
  "lastReleasedPublicVersion": null,
  "lastReleasedPrivateVersion": null,
  "versions": [],
  "__typename": "Plugin"
}

const MOCK_PLUGIN_2 = {
  "id": "a4c0b6ce-d24a-424d-bd27-26f2bab2656f",
  "name": "theme",
  "isPrivate": false,
  "createdAt": "2023-02-10T19:22:02.403Z",
  "updatedAt": "2023-02-10T19:22:02.403Z",
  "displayName": "Theme With Real Long Name",
  "lightIcon": "http://localhost:9000/assets/images/icons/plugin_default.unselected.light.svg",
  "darkIcon": "http://localhost:9000/assets/images/icons/plugin_default.unselected.dark.svg",
  "selectedLightIcon": "http://localhost:9000/assets/images/icons/plugin_default.selected.svg",
  "selectedDarkIcon": "http://localhost:9000/assets/images/icons/plugin_default.selected.svg",
  "createdByUser": {
      "id": "3edbc450-7e78-40db-895e-5eed8de73fcf",
      "username": "jamiesunderland",
      "__typename": "User"
  },
  "user": {
      "id": "3edbc450-7e78-40db-895e-5eed8de73fcf",
      "username": "jamiesunderland",
      "__typename": "User"
  },
  "organization": null,
  "lastReleasedPublicVersion": null,
  "lastReleasedPrivateVersion": null,
  "versions": [],
  "__typename": "Plugin"
}

const plugins = [MOCK_PLUGIN_1, MOCK_PLUGIN_2]

const Template = (args) => (
  <BrowserRouter>
    <div style={{ width: "100%", height: 800, border: "1px solid lightgray" }}>
      <PluginController {...args} plugins={plugins} icons={{}} />
    </div>
  </BrowserRouter>
);

export const Primary: any = Template.bind({});
Primary.args = {
};