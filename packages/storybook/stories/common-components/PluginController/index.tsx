import React, { useMemo } from "react";
import PluginNav from "../navs/PluginNav";
import SideNavWrapper from "../navs/SideNavWrapper";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";

const NoPluginsTextContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    flex: 1;
    flex-grow: 1;
`
const NoPluginsText = styled.h2`
    font-size: 1.7rem;
    font-family: "MavenPro";
    font-weight: 600;
    text-align: center;
    color: ${props => props.theme.colors.pageBannerInfo};
    max-width: 650px;
    padding-bottom: 72px;
`

export interface Props {
    currentPlugin?: Plugin|null;
    plugins: Plugin[];
    children: React.ReactElement;
    onPressRegisterNewPlugin: () => void;
    icons: {[key: string]: string};
    linkPrefix: string;
}

const NoPlugins = () => {
    return (
      <NoPluginsTextContainer>
        <NoPluginsText>
          {
            "There are no plugins associated with this account. Register a new plugin to get started."
          }
        </NoPluginsText>
      </NoPluginsTextContainer>
    );
}

const PluginController = (props: Props) => {
  const content = useMemo(() => {
      if (props.plugins?.length == 0) {
          return <NoPlugins/>
      }
      return props.children;

  }, [props.plugins, props.children, props.currentPlugin]);
    
  return (
    <SideNavWrapper nav={<PluginNav linkPrefix={props.linkPrefix} currentPlugin={props.currentPlugin} icons={props.icons} onPressRegisterNewPlugin={props.onPressRegisterNewPlugin} plugins={props.plugins} />}>
        {content}
    </SideNavWrapper>
  );
};

export default React.memo(PluginController);