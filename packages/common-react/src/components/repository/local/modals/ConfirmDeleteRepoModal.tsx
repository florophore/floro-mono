import React, { useMemo, useState, useCallback, useEffect } from "react";
import RootModal from "../../../RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import {
  PluginVersion,
  Plugin,
  useReleaseOrgPluginMutation,
  useReleaseUserPluginMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import TealHexagonWarningLight from "@floro/common-assets/assets/images/icons/teal_hexagon_warning.light.svg";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { useChangeMergeDirection, useDiscardChanges } from "../hooks/local-hooks";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { useDeleteRepo } from "../../../../hooks/repos";
import { useSearchParams } from "react-router-dom";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { useLocalVCSNavContext } from "../vcsnav/LocalVCSContext";

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
  align-items: center;
`;

const WarningIcon = styled.img`
  height: 96px;
  width: 96px;
`;

const VersionText = styled.h6`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.releaseTextColor};
`;

const PromptText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
  text-align: center;
  color: ${(props) => props.theme.colors.promptText};
`;

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

export interface Props {
  onDismiss: () => void;
  show?: boolean;
  repository: Repository;
}

const ConfirmDeleteRepoModal = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { setShowLocalSettings } = useLocalVCSNavContext();

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"delete local repo!"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  const deleteRepoMutation = useDeleteRepo(props.repository?.id as string);

  const onDelete = useCallback(() => {
    deleteRepoMutation.mutate();
  }, []);

  useEffect(() => {
    if (deleteRepoMutation.isSuccess) {
        props.onDismiss();
        setShowLocalSettings(false);
        const params = {};
        for(let [key, value] of searchParams.entries()) {
          params[key] = value;
        }
        params["from"] = "remote";
        setSearchParams(params);
    }
  }, [deleteRepoMutation.isSuccess, props.onDismiss]);

  return (
    <RootModal
      headerSize="small"
      headerChildren={title}
      show={props.show}
      onDismiss={props.onDismiss}
    >
      <ContentContainer>
        <TopContentContainer>
          <WarningIcon src={icon} />
          <PromptText>
            {`Are you positive you want to delete the "${props.repository.name}" repository locally?`}
          </PromptText>
          <div style={{marginTop: 12}}>
            <WarningLabel label="permanent loss danger!" size={"large"}/>
          </div>
          <PromptText>
            {"All work in progress, as well as branches and commits that have not been pushed to the remote repository, will be permanently deleted."}
          </PromptText>
        </TopContentContainer>
        <BottomContentContainer>
          <Button
            onClick={props.onDismiss}
            label={"cancel"}
            bg={"gray"}
            size={"medium"}
          />
          <Button
            label={"confirm delete"}
            bg={"red"}
            size={"medium"}
            onClick={onDelete}
            isLoading={deleteRepoMutation.isLoading}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(ConfirmDeleteRepoModal);
