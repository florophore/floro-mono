import SourceGraph from "./index";
import { SIMPLE_BRANCHES, SIMPLE_MAIN_HISTORY } from "./mocks";

export default {
  title: "floro-app/common-components/SourceGraph",
  component: SourceGraph,
  argTypes: {},
};

const Template = (args) => {
  return (
    <div>
      <div>
        <SourceGraph
          {...args}
          rootNodes={SIMPLE_MAIN_HISTORY}
          branches={SIMPLE_BRANCHES}
          startSha={"M0"}
        />
      </div>
    </div>
  );
}

export const Primary: any = Template.bind({});
Primary.args = {
  height: 500,
  width: 1000,
  isDebug: true,
  filterBranchlessNodes: true
};