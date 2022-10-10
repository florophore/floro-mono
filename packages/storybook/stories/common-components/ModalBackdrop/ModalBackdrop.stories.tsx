import { useState } from 'react';
import ModalBackdrop from './index';

export default {
  title: 'floro-app/common-components/ModalBackdrop',
  component: ModalBackdrop,
  argTypes: {},
};

const Template = (args) => {
    const [show, setShow] = useState(args?.show);

    return (
        <div style={{position: 'relative'}}>
            <div style={{padding: 24}}>
                <h1>Testing background</h1>
                <button onClick={() => setShow(true)}>show</button>
            </div>
            <ModalBackdrop onDismiss={() => setShow(false)} show={show} disableBackgroundDismiss={args.disableBackgroundDismiss} >
                <div style={{width: 200, height: 200, background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <button onClick={() => setShow(false)}>close</button>
                </div>
            </ModalBackdrop>
        </div>
    );
};

export const Primary: any = Template.bind({});
Primary.args = {
  disableBackgroundDismiss: false,
};