import { useState } from "react";
import SignupInputs from "./index";

export default {
  title: "floro-app/common-components/SignupInputs",
  component: SignupInputs,
  argTypes: {},
};

const Template = (args) => {
  const [firstName, setFirstName] = useState('foo');
  const [lastName, setLastName] = useState('bar');
  const [username, setUsername] = useState('test.user');
  const [agreeToTOS, setAgreeToTOS] = useState(false);
  return (
    <div style={{ display: 'flex', flex: 1, height: 500, width: '100vw', justifyContent: 'center', alignItems: 'center'}}>
      <SignupInputs
      {...args}
      firstName={firstName}
      lastName={lastName}
      username={username}
      onUpdateFirstName={setFirstName}
      onUpdateLastName={setLastName}
      onUpdateUsername={setUsername}
      agreedToTOS={agreeToTOS}
      onUpdateAgreedToTOS={setAgreeToTOS}
      onOpenTOS={() => alert("show TOS")}
      />
    </div>
  );
};

export const Primary: any = Template.bind({});
Primary.args = {
};

