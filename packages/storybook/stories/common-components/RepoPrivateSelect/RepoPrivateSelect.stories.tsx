import { useState } from 'react';
import RepoPrivateSelect from './index';

export default {
  title: 'floro-app/common-components/RepoPrivateSelect',
  component: RepoPrivateSelect,
  argTypes: {},
};

const Template = (args) => {
    const [isPrivate, setIsPrivate] = useState(true);

    return <RepoPrivateSelect {...args} isPrivate={isPrivate} onChange={setIsPrivate} />
};

export const Primary: any = Template.bind({});
Primary.args = {
}