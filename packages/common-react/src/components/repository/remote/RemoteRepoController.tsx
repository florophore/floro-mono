import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import HomeRead from "../home/HomeRead";
import HomeWrite from "../home/HomeWrite";
import LocalPluginController from "../plugin/LocalPluginController";
import { useSourceGraphIsShown } from "../ui-state-hook";
import SourceGraphMount from "../sourcegraph/SourceGraphMount";

const LoadingContainer = styled.div`
  display: flex;
  flex-stretch: 1;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 100%;
  height: 100%;
`;
const NoPluginContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const NoPluginTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const NoPluginText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${props => props.theme.colors.contrastText};
`;

interface Props {
  repository: Repository;
  plugin?: string;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
}

const RemoteRepoController = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(
    () => (theme.name == "light" ? "purple" : "lightPurple"),
    [theme.name]
  );
  console.log(props.repository?.branchState);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      //if (event.metaKey && event.shiftKey  && event.key == "e") {
      //  onToggleCommandMode();
      //}

      //if (event.metaKey && event.shiftKey  && event.key == "c") {
      //  onToggleCompare();
      //}

      //if (event.metaKey && event.shiftKey  && event.key == "[") {
      //  onGoToBefore();
      //}

      //if (event.metaKey && event.shiftKey  && event.key == "]") {
      //  onGoToAfter();
      //}
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, []);

  //const localRepoHeader = useMemo(() => {
  //  if (showSourceGraph) {
  //    return null;
  //  }
  //  return  <LocalRepoSubHeader repository={props.repository}  plugin={props.plugin}/>
  //}, [props.repository, props.plugin, showSourceGraph]);


  return (
    <>
        <LoadingContainer>
          <DotsLoader color={loaderColor} size={"large"} />
        </LoadingContainer>
    </>
  );
};

export default React.memo(RemoteRepoController);