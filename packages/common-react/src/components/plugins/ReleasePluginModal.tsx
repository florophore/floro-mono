import React, { useMemo, useState, useCallback, useEffect } from "react";
import RootModal from "../RootModal";
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
import { useIsOnline } from "../../hooks/offline";

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

const IncompatibleVersion = styled.p`
  padding: 0;
  margin: 8px 0 0 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.warningTextColor};
`;

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;
interface Props {
  show?: boolean;
  onDismiss?: () => void;
  pluginVersion?: PluginVersion | null;
  plugin: Plugin;
}

const RegisterPluginModal = (props: Props) => {
  const theme = useTheme();

  const isOnline = useIsOnline();

  const isValid = useMemo(() => {
    return (
      !!props.plugin.versions?.[0]?.id &&
      props.plugin.versions?.[0]?.id == props?.pluginVersion?.id &&
      isOnline
    );
  }, [props.plugin?.versions?.[0]?.id, props?.pluginVersion?.id, isOnline]);

  const [releaseOrgPlugin, releaseOrgPluginRequest] =
    useReleaseOrgPluginMutation();
  const [releaseUserPlugin, releaseUserPluginRequest] =
    useReleaseUserPluginMutation();

  const onReleaseConfirm = useCallback(() => {
    if (isValid) {
      if (
        props?.pluginVersion?.ownerType == "user_plugin" &&
        props?.pluginVersion.id
      ) {
        releaseUserPlugin({
          variables: {
            pluginVersionId: props.pluginVersion.id,
          },
        });
        return;
      }
      if (
        props?.pluginVersion?.ownerType == "org_plugin" &&
        props?.pluginVersion.id &&
        props?.plugin?.organization?.id
      ) {
        releaseOrgPlugin({
          variables: {
            organizationId: props?.plugin?.organization?.id,
            pluginVersionId: props.pluginVersion.id,
          },
        });
        return;
      }
    }
  }, [releaseOrgPlugin, releaseUserPlugin, props.pluginVersion, isValid]);

  const icon = useMemo(() => {
    if (props.pluginVersion?.isBackwardsCompatible === false) {
      return theme.name == "light"
        ? RedHexagonWarningLight
        : RedHexagonWarningDark;
    }
    return TealHexagonWarningLight;
  }, [theme.name, props.pluginVersion]);

  const releaseIsLoading = useMemo(() => {
    return releaseOrgPluginRequest.loading || releaseUserPluginRequest.loading;
  }, [releaseOrgPluginRequest.loading, releaseUserPluginRequest.loading]);

  useEffect(() => {
    if (
      releaseUserPluginRequest?.data?.releaseUserPlugin?.__typename ==
      "ReleaseUserPluginSuccess"
    ) {
      props.onDismiss?.();
    }
  }, [releaseUserPluginRequest?.data?.releaseUserPlugin?.__typename]);

  useEffect(() => {
    if (
      releaseOrgPluginRequest?.data?.releaseOrgPlugin?.__typename ==
      "ReleaseOrgPluginSuccess"
    ) {
      props.onDismiss?.();
    }
  }, [releaseOrgPluginRequest?.data?.releaseOrgPlugin?.__typename]);

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"release plugin"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

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
          <VersionText>{`Version ${props.pluginVersion?.version}`}</VersionText>
          {props.pluginVersion?.isBackwardsCompatible === false && (
            <>
              <PromptText>
                {"This version is incompatible with version"}
              </PromptText>
              <IncompatibleVersion>{props.pluginVersion.previousReleaseVersion}</IncompatibleVersion>
              <PromptText>
                {"Are you sure you want to release this version?"}
              </PromptText>
            </>
          )}
          {props.pluginVersion?.isBackwardsCompatible && (
            <>
              <PromptText>
                {"Please confirm you want to release this version"}
              </PromptText>
            </>
          )}
        </TopContentContainer>
        <BottomContentContainer>
          <Button
            onClick={props.onDismiss}
            label={"cancel"}
            bg={"gray"}
            size={"medium"}
          />
          <Button
            isLoading={releaseIsLoading}
            isDisabled={!isValid}
            onClick={onReleaseConfirm}
            label={
              <span>
                <span style={{ marginLeft: 12 }}>confirm</span>
                <span style={{ marginLeft: 12 }}>🚀</span>
              </span>
            }
            bg={"purple"}
            size={"medium"}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(RegisterPluginModal);
