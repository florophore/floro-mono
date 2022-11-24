import { useState } from "react";
import CreateRepoInputs from "./index";

export default {
  title: "floro-app/common-components/CreateRepoInputs",
  component: CreateRepoInputs,
  argTypes: {},
};

const Template = (args) => {
  const [name, setName] = useState('');
  return (
    <div style={{ padding: 24, display: 'flex', flex: 1, height: 500, width: '100vw', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
      <CreateRepoInputs
      {...args}
         name={name}
         onUpdateName={setName}
      />
    </div>
  );
};

export const Primary: any = Template.bind({});
Primary.args = {
  repoNameInUse: false
};