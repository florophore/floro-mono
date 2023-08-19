import React, { useMemo, useCallback, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  ApiKey,
  Organization,
  useDeleteOrganizationApiKeyMutation,
  useRegenerateOrganizationApiKeyMutation,
  useUpdateOrganizationApiKeyEnabledMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import SecretDisplay from "../SecretDisplay";


import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg"
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg"

import RefreshLight from "@floro/common-assets/assets/images/icons/refresh.light.svg";
import RefreshDark from "@floro/common-assets/assets/images/icons/refresh.dark.svg";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import ConfirmDeleteKey from "../modals/ConfirmDeleteKey";
import ConfirmRegenerateKey from "../modals/ConfirmRegenerateKey";

import RedXCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import VerifiedLight from "@floro/common-assets/assets/images/icons/verified.light.svg";
import VerifiedDark from "@floro/common-assets/assets/images/icons/verified.dark.svg";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

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
  margin-top: 12px;
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
const CheckRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  margin-top: 12px;
`;

const PermissionText = styled.div`
  margin-left: 16px;
  margin-top: 2px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
`;

const VerificationIcon = styled.img`
  height: 24px;
  width: 24px;
`;

export interface Props {
  apiKey: ApiKey;
  organization: Organization;
}

const RemoteOrganizationApiKeyCard = (props: Props): React.ReactElement => {
  const theme = useTheme();

  const [regenerateKey, regenerateKeyMutation] = useRegenerateOrganizationApiKeyMutation();
  const [deleteKey, deleteKeyMutation] = useDeleteOrganizationApiKeyMutation();
  const [changeEnablement, changeEnablementMutation] = useUpdateOrganizationApiKeyEnabledMutation();
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
    if (!props.apiKey?.id || !props?.organization?.id) {
      return;
    }
    regenerateKey({
      variables: {
        apiKeyId: props.apiKey.id,
        organizationId: props.organization.id
      }
    })
  }, [props.apiKey, props.organization?.id]);

  const onToggleEnablement =  useCallback(() => {
    if (changeEnablementMutation.loading || !props?.apiKey?.id || !props.organization?.id) {
      return;
    }
    changeEnablement({
      variables: {
        apiKeyId: props?.apiKey?.id,
        isEnabled: !props.apiKey.isEnabled,
        organizationId: props.organization.id
      }
    })

  }, [props.apiKey.isEnabled, changeEnablementMutation.loading, props.organization?.id])

  const onDeleteKey = useCallback(() => {
    if (!props.apiKey?.id || !props.organization?.id) {
      return;
    }
    deleteKey({
      variables: {
        apiKeyId: props.apiKey.id,
        organizationId: props.organization?.id
      }
    })
  }, [props.apiKey, props.organization?.id]);

  useEffect(() => {
    if (regenerateKeyMutation.data?.regenerateOrganizationApiKey?.__typename == "OrganizationApiKeySuccess") {
      regenerateKeyMutation.reset();
      setShowConfirmRegenerate(false);
    }
  }, [regenerateKeyMutation.data?.regenerateOrganizationApiKey?.__typename])

  useEffect(() => {
    if (deleteKeyMutation.data?.deleteOrganizationApiKey?.__typename == "OrganizationApiKeySuccess") {
      deleteKeyMutation.reset();
      setShowConfirmDelete(false);
    }
  }, [deleteKeyMutation.data?.deleteOrganizationApiKey?.__typename])

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

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleLight;
    }
    return RedXCircleDark;
  }, [theme.name]);
  const verifiedIcon = useMemo(() => {
    if (theme.name == "light") {
      return VerifiedLight;
    }
    return VerifiedDark;
  }, [theme.name]);


  const isLoading = useMemo(() => {
    return regenerateKeyMutation.loading || deleteKeyMutation.loading;
  }, [regenerateKeyMutation.loading, deleteKeyMutation.loading])

  return (
    <>
      <ConfirmDeleteKey
        show={showConfirmDelete}
        onDismiss={onHideConfirmDelete}
        onConfirm={onDeleteKey}
        keyName={props.apiKey.keyName as string}
        isLoading={deleteKeyMutation.loading}
      />
      <ConfirmRegenerateKey
        show={showConfirmRegenerate}
        onDismiss={onHideConfirmRegenerate}
        onConfirm={onRegenKey}
        keyName={props.apiKey.keyName as string}
        isLoading={regenerateKeyMutation.loading}
      />
      <Container
        style={{
          border: `2px solid ${theme.colors.inputBorderColor}`,
        }}
      >
        <TopRow>
          <KeyTitle>{props.apiKey.keyName}</KeyTitle>
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
        <div style={{marginTop: 12, height: 28}}>
          {!showEditMode && (
            <CheckRow>
                <VerificationIcon src={props.apiKey.isEnabled ? verifiedIcon : xIcon}/>
                <span style={{marginTop: -2}}>
                <PermissionText>{props.apiKey.isEnabled ? 'key enabled' : 'key disabled'}</PermissionText>
                </span>
            </CheckRow>
          )}
          {showEditMode && (
            <CheckRow>
              <Checkbox isChecked={props.apiKey.isEnabled ?? false} onChange={onToggleEnablement} />
                {!changeEnablementMutation.loading && (
                  <span style={{marginTop: -2, marginLeft: -4}}>
                    <PermissionText>{props.apiKey.isEnabled ? 'key enabled' : 'key disabled'}</PermissionText>
                  </span>
                )}
                {changeEnablementMutation.loading && (
                  <span style={{marginTop: 8, marginLeft: 8}}>
                    <DotsLoader size="small" color={theme.name == "light" ? "gray" : "white"}/>
                  </span>
                )}
            </CheckRow>
          )}
        </div>
        <ButtonRow>
          <DefaultTitle style={{ padding: 0 }}>{"secret: "}</DefaultTitle>
          <SecretDisplay secret={props.apiKey.secret ?? ""} />
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

export default React.memo(RemoteOrganizationApiKeyCard);
