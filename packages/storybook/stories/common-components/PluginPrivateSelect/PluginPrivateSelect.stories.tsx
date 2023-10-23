import { useState } from 'react';
import PluginPrivateSelect from './index';

export default {
  title: 'floro-app/common-components/PluginPrivateSelect',
  component: PluginPrivateSelect,
  argTypes: {},
};

const Template = (args) => {
    const [isPrivate, setIsPrivate] = useState(true);

    return <PluginPrivateSelect {...args} isPrivate={isPrivate} onChange={setIsPrivate} />
};

export const Primary: any = Template.bind({});
Primary.args = {
}