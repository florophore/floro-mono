import { useState } from "react";
import CreateOrgInputs from "./index";

export default {
  title: "floro-app/common-components/CreateOrgInputs",
  component: CreateOrgInputs,
  argTypes: {},
};

const Template = (args) => {
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [agreedToCustomerServiceAgreement, setAgreedToCustomerServiceAgreement] = useState(false);
  return (
    <div style={{ padding: 24, display: 'flex', flex: 1, height: 500, width: '100vw', justifyContent: 'flex-start', alignItems: 'center'}}>
      <CreateOrgInputs
      {...args}
      name={name}
      legalName={legalName}
      contactEmail={contactEmail}
      handle={handle}
      onUpdateName={setName}
      onUpdateLegalName={setLegalName}
      onUpdateContactEmail={setContactEmail}
      onUpdateHandle={setHandle}
      agreedToCustomerServiceAgreement={agreedToCustomerServiceAgreement}
      onUpdateAgreedToCustomerServiceAgreement={setAgreedToCustomerServiceAgreement}
      onOpenTOS={() => alert("show TOS")}
      />
    </div>
  );
};

export const Primary: any = Template.bind({});
Primary.args = {
};