import React, { useMemo, useCallback, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import {
  Organization,
  OrganizationMember,
  useExchangeSessionMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ColorPalette from "@floro/styles/ColorPalette";
import TimeAgo from "javascript-time-ago";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiKey } from "floro/dist/src/apikeys";
import SecretDisplay from "../SecretDisplay";


import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg"
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg"

import RefreshLight from "@floro/common-assets/assets/images/icons/refresh.light.svg";
import RefreshDark from "@floro/common-assets/assets/images/icons/refresh.dark.svg";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useDeleteApiKey, useRegenerateApiKey } from "../local-api-hooks";
import ConfirmDeleteKey from "../modals/ConfirmDeleteKey";
import ConfirmRegenerateKey from "../modals/ConfirmRegenerateKey";

const Container = styled.div`
  margin-top: 14px;
  position: relative;
  width: 760px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  user-select: none;
  border: 2px solid ${(props) => props.theme.colors.inputBorderColor};
  padding: 16px 12px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 72px;
`;

const KeyTitle = styled.h4`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.titleText};
  font-weight: 600;
  font-size: 1.7rem;
  user-select: text;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  align-items: center;
`;

const Icon = styled.img`
    height: 28px;
    width: 28px;
    cursor: pointer;
`;

const DefaultTitle = styled.p`
  margin: 0;
  padding: 8px 0 0 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 600;
  font-size: 1.2rem;
  display: block;
  user-select: text;
`;


export interface Props {
  localApiKey: ApiKey;
}

const LocalApiKeyCard = (props: Props): React.ReactElement => {
  const theme = useTheme();

  const regenerateKeyMutation = useRegenerateApiKey();
  const deleteKeyMutation = useDeleteApiKey();
  const [showEditMode, setShowEditMode] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

  const onToggleEditMode = useCallback(() => {
    setShowEditMode(!showEditMode);
  }, [showEditMode])

  const onShowConfirmDelete = useCallback(() => {
    setShowConfirmDelete(true);
  }, []);

  const onHideConfirmDelete = useCallback(() => {
    setShowConfirmDelete(false);
  }, []);

  const onShowConfirmRegenerate = useCallback(() => {
    setShowConfirmRegenerate(true);
  }, []);

  const onHideConfirmRegenerate = useCallback(() => {
    setShowConfirmRegenerate(false);
  }, []);

  const onRegenKey = useCallback(() => {
    regenerateKeyMutation.mutate({
        id: props.localApiKey.id
    })
  }, [props.localApiKey]);

  const onDeleteKey = useCallback(() => {
    deleteKeyMutation.mutate({
        id: props.localApiKey.id
    })
  }, [props.localApiKey]);

  useEffect(() => {
    if (regenerateKeyMutation.isSuccess) {
      regenerateKeyMutation.reset();
      setShowConfirmRegenerate(false);
    }
  }, [regenerateKeyMutation.isSuccess])

  useEffect(() => {
    if (deleteKeyMutation.isSuccess) {
      deleteKeyMutation.reset();
      setShowConfirmDelete(false);
    }
  }, [deleteKeyMutation.isSuccess])

  const trashIcon = useMemo(() => {
    if (theme.name == "light") {
        return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const refreshIcon = useMemo(() => {
    if (theme.name == "light") {
        return RefreshLight;
    }
    return RefreshDark;
  }, [theme.name]);


  const isLoading = useMemo(() => {
    return regenerateKeyMutation.isLoading || deleteKeyMutation.isLoading;
  }, [regenerateKeyMutation.isLoading, deleteKeyMutation.isLoading])

  return (
    <>
      <ConfirmDeleteKey
        show={showConfirmDelete}
        onDismiss={onHideConfirmDelete}
        onConfirm={onDeleteKey}
        keyName={props.localApiKey.name}
        isLoading={deleteKeyMutation.isLoading}
      />
      <ConfirmRegenerateKey
        show={showConfirmRegenerate}
        onDismiss={onHideConfirmRegenerate}
        onConfirm={onRegenKey}
        keyName={props.localApiKey.name}
        isLoading={regenerateKeyMutation.isLoading}
      />
      <Container
        style={{
          border: `2px solid ${theme.colors.inputBorderColor}`,
        }}
      >
        <TopRow>
          <KeyTitle>{props.localApiKey.name}</KeyTitle>
          {showEditMode && (
            <IconRow>
              {!isLoading && (
                <>
                  <Icon onClick={onShowConfirmRegenerate} src={refreshIcon} />
                  <Icon onClick={onShowConfirmDelete} src={trashIcon} />
                </>
              )}
              {isLoading && (
                <>
                  <DotsLoader
                    size="small"
                    color={theme.name == "light" ? "gray" : "white"}
                  />
                </>
              )}
            </IconRow>
          )}
        </TopRow>
        <ButtonRow>
          <DefaultTitle style={{ padding: 0 }}>{"secret: "}</DefaultTitle>
          <SecretDisplay secret={props.localApiKey.secret} />
          <Button
            onClick={onToggleEditMode}
            label={!showEditMode ? "edit" : "done"}
            bg={!showEditMode ? "orange" : "gray"}
            size={"small"}
          />
        </ButtonRow>
      </Container>
    </>
  );
};

export default React.memo(LocalApiKeyCard);
