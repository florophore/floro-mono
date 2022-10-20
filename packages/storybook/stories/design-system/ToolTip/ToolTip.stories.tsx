import ToolTip from './index';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'floro-app/design-system/ToolTip',
  component: ToolTip,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    label: { control: 'text' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
    return (
        <div>
            <h1 style={{marginTop: 24, fontSize: 32}}>
                {'testing'}
            </h1>
            <ToolTip {...args} inner={(
                <div style={{width: 120, height: 60}}>
                    <p style={{margin: 0, padding: 0}}>
                        {"Testing"}
                    </p>
                    <p style={{marginTop: 12, padding: 0}}>
                        {"Testing more"}
                    </p>
                </div>
            )}>
                <p style={{width: 100, height: 30, background: 'red', borderRadius: 8, margin: 0, padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {'hover me'}
                </p>
            </ToolTip>
        </div>
    )
} ;

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  show: false,
};