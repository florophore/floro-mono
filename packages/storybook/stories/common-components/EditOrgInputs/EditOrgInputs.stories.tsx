import { useState } from "react";
import EditOrgInputs from "./index";

export default {
  title: "floro-app/common-components/EditOrgInputs",
  component: EditOrgInputs,
  argTypes: {},
};

const Template = (args) => {
  const [contactEmail, setContactEmail] = useState('');
  return (
    <div style={{ padding: 24, display: 'flex', flex: 1, height: 500, width: '100vw', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
      <EditOrgInputs
        {...args}
        contactEmail={contactEmail}
        onUpdateContactEmail={setContactEmail}
      />
    </div>
  );
};

export const Primary: any = Template.bind({});
Primary.args = {
};