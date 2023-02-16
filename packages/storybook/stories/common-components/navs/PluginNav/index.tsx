import React from "react";
import styled from "@emotion/styled";
import Button from "../../../design-system/Button";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-graphql";
import PluginNavRow from "./PluginNavRow";

const RelativeWrapper = styled.div`
  height: 100%;
  position: relative;
  flex: 1;
  background: ${props => props.theme.background};
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 80px;
  width: 100%;
  height: 80px;
  background: ${props => `linear-gradient(${props.theme.gradients.backgroundNoOpacity}, ${props.theme.gradients.backgroundFullOpacity});`}
  pointer-events: none;
`

const Container = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TopWrapper = styled.div`
  flex: 1;
  background: ${props => props.theme.background};
  max-height: calc(100% - 80px);
  overflow: scroll;
  padding-bottom: 80px;
  padding-top: 12px;
`;

const BottomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  padding-bottom: 16px;
  height: 80px;
  box-sizing: border-box;
  background: ${props => props.theme.background};
`;

export interface Props {
    currentPlugin?: Plugin|null;
    plugins: Plugin[];
    onPressRegisterNewPlugin: () => void;
    icons: {[key: string]: string};
    linkPrefix: string;
}

const PluginNav = (props: Props) => {
  return (
    <RelativeWrapper>
      <Container>
        <TopWrapper>
          {props.plugins.map((plugin, index) => {
            return (
              <PluginNavRow
                linkPrefix={props.linkPrefix}
                key={index}
                plugin={plugin}
                icons={props.icons}
                isSelected={props?.currentPlugin?.id == plugin?.id}
              />
            );
          })}
        </TopWrapper>
        <BottomWrapper>
          <Button
            onClick={props.onPressRegisterNewPlugin}
            label={"register new plugin"}
            bg={"purple"}
            size={"medium"}
            textSize={"small"}
          />
        </BottomWrapper>
      </Container>
      <GradientOverlay />
    </RelativeWrapper>
  );
};

export default React.memo(PluginNav);