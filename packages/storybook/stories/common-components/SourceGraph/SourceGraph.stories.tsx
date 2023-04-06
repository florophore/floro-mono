import { useState } from "react";
import SourceGraph from "./index";
import { BRANCHES, SOURCE_HISTORY } from "./mocks";
import ColorPalette from "@floro/styles/ColorPalette";

export default {
  title: "floro-app/common-components/SourceGraph",
  component: SourceGraph,
  argTypes: {},
};

const Template = (args) => {
  const [currentSha, setCurrentSha] = useState("E");
  const [highlightedBranchId, setHighlightedBranchId] =
    useState<string | null>(null);
  return (
    <div>
      <div>
        <SourceGraph
          {...args}
          rootNodes={SOURCE_HISTORY}
          branches={BRANCHES}
          currentSha={currentSha}
          onSelectBranch={(branch) => {
            if (branch.lastCommit) {
              setCurrentSha(branch.lastCommit);
            }
          }}
          onMouseOverBranch={(branch) => {
            setHighlightedBranchId(branch.id);
          }}
          onMouseOffBranch={() => {
            setHighlightedBranchId(null);
          }}
          highlightedBranchId={highlightedBranchId}
          renderPopup={({ sourceCommit }: any) => {
            return (
              <div>
                <p
                  style={{
                    padding: 0,
                    margin: 0,
                    color: ColorPalette.lightPurple,
                  }}
                >
                  {"SHA: " + sourceCommit.sha}
                </p>
                <button
                  onClick={() => {
                    setCurrentSha(sourceCommit.sha);
                  }}
                >
                  {"update"}
                </button>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export const Primary: any = Template.bind({});
Primary.args = {
  height: 500,
  width: 1000,
  isDebug: true,
  filterBranchlessNodes: true,
};
