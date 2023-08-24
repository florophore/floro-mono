import React, { useCallback, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import { Repository, RepositoryEnabledWebhookKey, WebhookKey } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import { IP_REGEX } from "@floro/common-web/src/utils/validators";
import ConfirmDeleteRemoteWebhookModal from "./modals/ConfirmDeleteRemoteWebhookModal";
import UpdateRemoteWebhookModal from "./modals/UpdateRemoteWebhookModal";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 40px;
  align-items: center;
  margin-top: 12px;
`;

const UrlText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.titleText};
`;

const Icon = styled.img`
  height: 28px;
  width: 28px;
  cursor: pointer;
  margin-right: 16px;
`;

export interface Props {
  enabledWebhook: RepositoryEnabledWebhookKey;
  repository: Repository;
  webhookKeys: WebhookKey[];
  isFirst: boolean;
}

const RetmoteWebhookRow = (props: Props) => {
  const theme = useTheme();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showTest, setShowTest] = useState(false);

  const onShowConfirmDelete = useCallback(() => {
    setShowConfirmDelete(true);
  }, []);

  const onHideConfirmDelete = useCallback(() => {
    setShowConfirmDelete(false);
  }, []);

  const onShowUpdate = useCallback(() => {
    setShowUpdate(true);
  }, []);

  const onHideUpdate = useCallback(() => {
    setShowUpdate(false);
  }, []);

  const onShowTest = useCallback(() => {
    setShowTest(true);
  }, []);

  const onHideTest = useCallback(() => {
    setShowTest(false);
  }, []);

  const key = useMemo(() => {
    return props.webhookKeys?.find(
      (k) => k.id == props.enabledWebhook?.webhookKey?.id
    ) as WebhookKey;
  }, [props.webhookKeys, props.enabledWebhook]);

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

  const defaultWebhook = useMemo(() => {
    let str = `${props.enabledWebhook?.protocol ?? "http"}://`;
    if (props.enabledWebhook.subdomain && !IP_REGEX.test(key?.domain as string)) {
      str += props.enabledWebhook.subdomain + ".";
    }
    str += key?.domain;
    if (props.enabledWebhook?.port) {
      str += ":" + props.enabledWebhook?.port;
    }
    return str + (props?.enabledWebhook?.uri ?? "");
  }, [
    key?.domain,
    props.enabledWebhook.protocol,
    props?.enabledWebhook?.subdomain,
    props?.enabledWebhook?.uri,
    props?.enabledWebhook?.port,
  ]);
  return (
    <>
      <ConfirmDeleteRemoteWebhookModal
        repository={props.repository}
        enabledWebhookKey={props.enabledWebhook}
        show={showConfirmDelete}
        onDismissModal={onHideConfirmDelete}
        webhookKey={props.enabledWebhook?.webhookKey as WebhookKey}
      />
      <UpdateRemoteWebhookModal
        repository={props.repository}
        enabledWebhookKey={props.enabledWebhook}
        show={showUpdate}
        onDismissModal={onHideUpdate}
        webhookKeys={props.webhookKeys}
      />
      <Container style={{ marginTop: props.isFirst ? 0 : 12 }}>
        <Icon onClick={onShowConfirmDelete} src={trashIcon} />
        <Icon onClick={onShowUpdate} src={editIcon} />
        <UrlText>{defaultWebhook}</UrlText>
      </Container>
    </>
  );
};

export default React.memo(RetmoteWebhookRow);
