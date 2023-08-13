import React, { useMemo, useCallback, useEffect } from "react";

import styled from "@emotion/styled";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import {
  Organization,
  OrganizationInvitation,
  PluginVersion,
  Repository,
  useExchangeSessionMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import RootLongModal from "../../../RootLongModal";
import { useCopyPasteContext } from "../CopyPasteContext";
import LocalRepoInfoList from "@floro/storybook/stories/common-components/LocalRepoInfoList";
import CopyPluginsContainer from "./CopyPluginsContainer";
import { RenderedApplicationState } from "floro/dist/src/repo";

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const HeaderTitle = styled.div`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${ColorPalette.white};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 24px;
`;

const TopContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;
export interface Props {
    client: "remote"|"local";
    pluginVersions: PluginVersion[];
    fromRepository: Repository;
    stateMap: RenderedApplicationState["store"];
}

const CopyPasteModal = (props: Props) => {
  const title = useMemo(() => {
    if (props?.client == "local") {
        return (
        <HeaderContainer>
            <HeaderTitle>{"copy from local repository"}</HeaderTitle>
        </HeaderContainer>
        );
    }
    return (
      <HeaderContainer>
        <HeaderTitle>{"copy from remote repository"}</HeaderTitle>
      </HeaderContainer>
    );
  }, [props?.client]);

  const {
    showCopyPaste,
    setShowCopyPaste,
    repoInfos,
    selectedRepoInfo,
    setSelectedRepoInfo,
    setCopyInstructions
  } = useCopyPasteContext(props.client);

  const onDismiss = useCallback(() => {
    setShowCopyPaste(false);
    setCopyInstructions({});
    setSelectedRepoInfo(null);
  }, []);

  useEffect(() => {
    if (!selectedRepoInfo) {
      setCopyInstructions({});
    }
  }, [selectedRepoInfo]);
  return (
    <RootLongModal
      show={showCopyPaste}
      headerSize="small"
      headerChildren={title}
      onDismiss={onDismiss}
      width={720}
      disableBackgroundDismiss
    >
      <ContentContainer>
        {!selectedRepoInfo && (
          <LocalRepoInfoList
            repoInfos={repoInfos}
            onSelectRepoInfo={setSelectedRepoInfo}
            fromRepository={props.fromRepository}
          />
        )}
        {selectedRepoInfo && (
          <CopyPluginsContainer
            pluginVersions={props.pluginVersions}
            repoInfo={selectedRepoInfo}
            fromRepository={props.fromRepository}
            client={props.client}
            stateMap={props.stateMap}
          />
        )}
      </ContentContainer>
    </RootLongModal>
  );
};

export default React.memo(CopyPasteModal);
