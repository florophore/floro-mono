import React, { useMemo, useCallback, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "@floro/storybook/stories/design-system/Button";
import { WebhookKey } from "floro/dist/src/apikeys";
import SecretDisplay from "../SecretDisplay";


import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg"
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg"

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg"
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg"

import RefreshLight from "@floro/common-assets/assets/images/icons/refresh.light.svg";
import RefreshDark from "@floro/common-assets/assets/images/icons/refresh.dark.svg";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import {  useDeleteWebhookKey, useRegenerateWebhookKey } from "../local-api-hooks";
import UpdateLocalWebhookDomainModal from "../modals/UpdateLocalWebhookDomainModal";
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
  width: 108px;
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
  margin-top: 18px;
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

const DefaultDisplay = styled.span`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.2rem;
  user-select: text;
`;



export interface Props {
  localWebhookKey: WebhookKey;
}

const LocalWebhookKeyCard = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const [showUpdate, setShowUpdate] = useState(false);
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

  const onShowUpdate = useCallback(() => {
    setShowUpdate(true);
  }, []);

  const onHideUpdate = useCallback(() => {
    setShowUpdate(false);
  }, []);


  const regenerateKeyMutation = useRegenerateWebhookKey();
  const deleteKeyMutation = useDeleteWebhookKey();

  const onRegenKey = useCallback(() => {
    regenerateKeyMutation.mutate({
        id: props.localWebhookKey.id
    })
  }, [props.localWebhookKey]);

  const onDeleteKey = useCallback(() => {
    deleteKeyMutation.mutate({
        id: props.localWebhookKey.id
    })
  }, [props.localWebhookKey]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
        return EditLight;
    }
    return EditDark;
  }, [theme.name]);

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

  const defaultWebhook = useMemo(() => {
    let str = `${props.localWebhookKey?.defaultProtocol}://`;
    if (props.localWebhookKey.defaultSubdomain) {
      str += props.localWebhookKey.defaultSubdomain + ".";
    }
    str += props?.localWebhookKey?.domain;
    if (props.localWebhookKey?.defaultPort) {
      str += ":" + props?.localWebhookKey?.defaultPort;
    }
    return str;
  }, [
    props.localWebhookKey.defaultProtocol,
    props?.localWebhookKey?.defaultSubdomain,
    props?.localWebhookKey?.domain,
    props?.localWebhookKey?.defaultPort,
  ]);

  useEffect(() => {
    if (deleteKeyMutation.isSuccess) {
      deleteKeyMutation.reset();
      setShowConfirmDelete(false);
    }
  }, [deleteKeyMutation.isSuccess])

  useEffect(() => {
    if (regenerateKeyMutation.isSuccess) {
      regenerateKeyMutation.reset();
      setShowConfirmRegenerate(false);
    }
  }, [regenerateKeyMutation.isSuccess])

  return (
    <>
      <ConfirmDeleteKey
        show={showConfirmDelete}
        onDismiss={onHideConfirmDelete}
        onConfirm={onDeleteKey}
        keyName={props.localWebhookKey.domain}
        isLoading={deleteKeyMutation.isLoading}
      />
      <ConfirmRegenerateKey
        show={showConfirmRegenerate}
        onDismiss={onHideConfirmRegenerate}
        onConfirm={onRegenKey}
        keyName={props.localWebhookKey.domain}
        isLoading={regenerateKeyMutation.isLoading}
      />
      <UpdateLocalWebhookDomainModal
        onDismissModal={onHideUpdate}
        show={showUpdate}
        webhookKey={props.localWebhookKey}
      />
      <Container
        style={{
          border: `2px solid ${theme.colors.inputBorderColor}`,
        }}
      >
        <TopRow>
          <KeyTitle>{props.localWebhookKey.domain}</KeyTitle>
          {showEditMode && (
            <IconRow>
              {!isLoading && (
                <>
                  <Icon onClick={onShowUpdate} src={editIcon} />
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
        <div>
          <DefaultTitle>
            {"default: "}
            <DefaultDisplay>{defaultWebhook}</DefaultDisplay>
          </DefaultTitle>
        </div>
        <ButtonRow>
          <DefaultTitle style={{ padding: 0 }}>{"secret: "}</DefaultTitle>
          <SecretDisplay secret={props.localWebhookKey.secret} />
          <Button onClick={onToggleEditMode} label={!showEditMode ? "edit" : "done"} bg={!showEditMode ? "orange" : "gray"} size={"small"} />
        </ButtonRow>
      </Container>
    </>
  );
};

export default React.memo(LocalWebhookKeyCard);
