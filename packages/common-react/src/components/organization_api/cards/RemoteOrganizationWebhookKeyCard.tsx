import React, { useMemo, useCallback, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "@floro/storybook/stories/design-system/Button";
import SecretDisplay from "../SecretDisplay";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg"
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg"

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg"
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg"

import RefreshLight from "@floro/common-assets/assets/images/icons/refresh.light.svg";
import RefreshDark from "@floro/common-assets/assets/images/icons/refresh.dark.svg";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import ConfirmDeleteKey from "../modals/ConfirmDeleteKey";
import ConfirmRegenerateKey from "../modals/ConfirmRegenerateKey";
import {
  Organization,
  WebhookKey,
  useDeleteOrganizationWebhookKeyMutation,
  useRegenerateOrganizationWebhookKeyMutation,
  useUpdateOrganizationApiKeyEnabledMutation,
  useUpdateOrganizationWebhookKeyEnabledMutation,
  useUpdateUserWebhookKeyEnabledMutation,
  useVerifyOrganizationWebhookKeyMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import UpdateRemoteUserWebhookDomainModal from "../modals/UpdateRemoteOrganizationWebhookDomainModal";

import RedXCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";

import VerifiedLight from "@floro/common-assets/assets/images/icons/verified.light.svg";
import VerifiedDark from "@floro/common-assets/assets/images/icons/verified.dark.svg";
import DomainVerifiySucceededModal from "../modals/DomainVerifiySucceededModal";
import DomainVerifyFailedModal from "../modals/DomainVerifyFailedModal";
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

const CheckRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  margin-top: 12px;
`;

const PermissionText = styled.div`
  margin-left: 16px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  margin-top: -2px;
`;

const VerificationIcon = styled.img`
  height: 24px;
  width: 24px;
`;



export interface Props {
  webhookKey: WebhookKey;
  organization: Organization;
}

const RemoteOrganizationWebhookKeyCard = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const [showUpdate, setShowUpdate] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);
  const [showVerificationSucceded, setShowVerifcationSucceded] = useState(false);
  const [showVerificationFailed, setShowVerifcationFailed] = useState(false);

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

  const onHideVerificationSucceded = useCallback(() => {
    setShowVerifcationSucceded(false);
  }, []);

  const onHideVerificationFailed = useCallback(() => {
    setShowVerifcationFailed(false);
  }, []);

  const [regenerateKey, regenerateKeyMutation] = useRegenerateOrganizationWebhookKeyMutation();
  const [deleteKey, deleteKeyMutation] = useDeleteOrganizationWebhookKeyMutation();
  const [verifyKey, verifyMutation] = useVerifyOrganizationWebhookKeyMutation();
  const [changeEnablement, changeEnablementMutation] = useUpdateOrganizationWebhookKeyEnabledMutation();

  const onToggleEnablement = useCallback(() => {
    if (changeEnablementMutation.loading || !props?.webhookKey?.id || !props?.organization?.id) {
      return;
    }
    changeEnablement({
      variables: {
        organizationId: props?.organization?.id,
        webhookKeyId: props?.webhookKey?.id,
        isEnabled: !props.webhookKey.isEnabled
      }
    });
  }, [props.webhookKey.isEnabled, changeEnablementMutation.loading, props?.organization?.id])

  const onRegenKey = useCallback(() => {
    if (!props.webhookKey.id || !props.organization?.id) {
      return;
    }
    regenerateKey({
      variables: {
        webhookKeyId: props.webhookKey.id,
        organizationId: props.organization.id
      }
    })
  }, [props.webhookKey, props.organization?.id]);

  const onDeleteKey = useCallback(() => {
    if (!props.webhookKey.id || !props.organization?.id) {
      return;
    }
    deleteKey({
      variables: {
        webhookKeyId: props.webhookKey.id,
        organizationId: props.organization?.id
      }
    })
  }, [props.webhookKey, props.organization?.id]);

  const onVerifyKey = useCallback(() => {
    if (!props.webhookKey.id || !props.organization?.id) {
      return;
    }
    verifyKey({
      variables: {
        webhookKeyId: props.webhookKey.id,
        organizationId: props.organization?.id
      }
    })
  }, [props.webhookKey, props.organization?.id]);

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

  const defaultWebhook = useMemo(() => {
    let str = `${props.webhookKey?.defaultProtocol}://`;
    if (props.webhookKey.defaultSubdomain) {
      str += props.webhookKey.defaultSubdomain + ".";
    }
    str += props?.webhookKey?.domain;
    if (props.webhookKey?.defaultPort) {
      str += ":" + props?.webhookKey?.defaultPort;
    }
    return str;
  }, [
    props.webhookKey.defaultProtocol,
    props?.webhookKey?.defaultSubdomain,
    props?.webhookKey?.domain,
    props?.webhookKey?.defaultPort,
  ]);

  useEffect(() => {
    if (regenerateKeyMutation.data?.regenerateOrganizationWebhookKey?.__typename == "OrganizationWebhookKeySuccess") {
      regenerateKeyMutation.reset();
      setShowConfirmRegenerate(false);
    }
  }, [regenerateKeyMutation.data?.regenerateOrganizationWebhookKey?.__typename])

  useEffect(() => {
    if (deleteKeyMutation.data?.deleteOrganizationWebhookKey?.__typename == "OrganizationWebhookKeySuccess") {
      deleteKeyMutation.reset();
      setShowConfirmDelete(false);
    }
  }, [deleteKeyMutation.data?.deleteOrganizationWebhookKey?.__typename])

  useEffect(() => {
    if (verifyMutation.data?.verifyOrganizationWebhookKey?.__typename == "OrganizationWebhookKeySuccess") {
      verifyMutation.reset();
      setShowVerifcationSucceded(true);
    }
  }, [verifyMutation.data?.verifyOrganizationWebhookKey?.__typename])

  useEffect(() => {
    if (verifyMutation.data?.verifyOrganizationWebhookKey?.__typename == "OrganizationWebhookKeyError") {
      verifyMutation.reset();
      setShowVerifcationFailed(true);
    }
  }, [verifyMutation.data?.verifyOrganizationWebhookKey?.__typename])

  return (
    <>
      <ConfirmDeleteKey
        show={showConfirmDelete}
        onDismiss={onHideConfirmDelete}
        onConfirm={onDeleteKey}
        keyName={props.webhookKey.domain as string}
        isLoading={deleteKeyMutation.loading}
      />
      <ConfirmRegenerateKey
        show={showConfirmRegenerate}
        onDismiss={onHideConfirmRegenerate}
        onConfirm={onRegenKey}
        keyName={props.webhookKey.domain as string}
        isLoading={regenerateKeyMutation.loading}
      />
      <UpdateRemoteUserWebhookDomainModal
        onDismissModal={onHideUpdate}
        show={showUpdate}
        webhookKey={props.webhookKey}
        organization={props.organization}
      />
      <DomainVerifiySucceededModal
        onDismiss={onHideVerificationSucceded}
        show={showVerificationSucceded}
      />
      <DomainVerifyFailedModal
        onDismiss={onHideVerificationFailed}
        show={showVerificationFailed}
        webhookKey={props.webhookKey}
      />
      <Container
        style={{
          border: `2px solid ${theme.colors.inputBorderColor}`,
        }}
      >
        <TopRow>
          <KeyTitle>{props.webhookKey.domain}</KeyTitle>
          {!props.webhookKey?.isVerified && (
            <IconRow style={{ width: 72 }}>
              {!isLoading && (
                <>
                  <Icon onClick={onShowUpdate} src={editIcon} />
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
        <div style={{ marginTop: 12, marginBottom: 6 }}>
          <CheckRow>
            <VerificationIcon
              src={props.webhookKey.isVerified ? verifiedIcon : xIcon}
            />
            <PermissionText>
              {props.webhookKey.isVerified
                ? "verified"
                : "awaiting verification"}
            </PermissionText>
          </CheckRow>
        </div>
        {!props?.webhookKey?.isVerified && (
          <div>
            <DefaultTitle
              style={{
                fontWeight: 400,
                color: theme.colors.contrastText,
                fontStyle: "italic",
              }}
            >
              {
                'Copy the TXT record listed below. From your DNS provider\'s website, create a new TXT record. If a "Host" value is required, enter "@". For the value of the record, copy the value listed below exactly as is and save the record. After saving the TXT record, return back to this page and press the "verify" button below. It may take a few minutes (or up to 48 hours) for DNS changes to propagate. If your domain cannot be immediately verified, try again later or set the TTL of the TXT record to a shorter value. Further instructions can be found in our documentation.'
              }
            </DefaultTitle>
          </div>
        )}
        {props?.webhookKey?.isVerified && (
        <div style={{marginTop: 12, height: 28}}>
          {!showEditMode && (
            <CheckRow>
                <VerificationIcon src={props.webhookKey.isEnabled ? verifiedIcon : xIcon}/>
                <PermissionText>{props.webhookKey.isEnabled ? 'domain enabled' : 'domain disabled'}</PermissionText>
            </CheckRow>
          )}
          {showEditMode && (
            <CheckRow>
              <Checkbox isChecked={props.webhookKey.isEnabled ?? false} onChange={onToggleEnablement} />
                {!changeEnablementMutation.loading && (
                  <span style={{marginTop: 0, marginLeft: -4}}>
                    <PermissionText>{props.webhookKey.isEnabled ? 'domain enabled' : 'domain disabled'}</PermissionText>
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
        )}
        {!props.webhookKey.isVerified && (
          <ButtonRow>
            <DefaultTitle style={{ padding: 0 }}>{"TXT record: "}</DefaultTitle>
            <SecretDisplay secret={props.webhookKey.txtRecord ?? ""} />
            <Button onClick={onVerifyKey} isLoading={verifyMutation.loading} label={"verify"} bg={"teal"} size={"small"} />
          </ButtonRow>
        )}
        {props.webhookKey.isVerified && (
          <ButtonRow>
            <DefaultTitle style={{ padding: 0 }}>{"secret: "}</DefaultTitle>
            <SecretDisplay secret={props.webhookKey.secret ?? ""} />
            <Button
              onClick={onToggleEditMode}
              label={!showEditMode ? "edit" : "done"}
              bg={!showEditMode ? "orange" : "gray"}
              size={"small"}
            />
          </ButtonRow>
        )}
      </Container>
    </>
  );
};

export default React.memo(RemoteOrganizationWebhookKeyCard);
