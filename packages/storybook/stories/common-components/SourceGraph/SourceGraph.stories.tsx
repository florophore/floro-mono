import { useState } from 'react';
import { useTheme } from "@emotion/react";
import SourceGraph from "./index";
import { SIMPLE_BRANCHES, SIMPLE_MAIN_HISTORY } from "./mocks";
import ColorPalette from "@floro/styles/ColorPalette";

export default {
  title: "floro-app/common-components/SourceGraph",
  component: SourceGraph,
  argTypes: {},
};

const Template = (args) => {
  const theme = useTheme();
  const [currentSha, setCurrentSha] = useState("E");
  const [highlightedBranchId, setHighlightedBranchId] = useState<string|null>(null);
  const [selectedBranchId, setSelectedBranch] = useState<string|null>(null);
  return (
    <div>
      <div>
        <SourceGraph
          {...args}
          rootNodes={SIMPLE_MAIN_HISTORY}
          branches={SIMPLE_BRANCHES}
          currentSha={currentSha}
          onSelectBranch={(branch) => {
            //setSelectedBranch(branch.id);
          }}
          onMouseOverBranch={(branch) => {
            setHighlightedBranchId(branch.id);
          }}
          onMouseOffBranch={() => {
            setHighlightedBranchId(null);
          }}
          selectedBranchId={selectedBranchId}
          highlightedBranchId={highlightedBranchId ?? selectedBranchId}
          renderPopup={({ sourceCommit}: any) => {
            return (
              <div>
                <p style={{
                  padding: 0,
                  margin: 0,
                  color: ColorPalette.lightPurple
                }}>
                  {'SHA: ' + sourceCommit.sha}
                </p>
                <button onClick={() => {
                  setCurrentSha(sourceCommit.sha);
                }}>{'update'}</button>
              </div>
            );
          }}
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