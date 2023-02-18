import React, { useMemo, useState, useCallback, useEffect } from "react";
import RootModal from "../RootModal";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import {
  Organization,
  usePluginNameCheckLazyQuery,
  useCreateOrgPluginMutation,
  useCreateUserPluginMutation,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useSession } from "../../session/session-context";
import OwnerDescriptor from "@floro/storybook/stories/common-components/OwnerDescriptor";
import { useOfflinePhoto } from "../../offline/OfflinePhotoContext";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import { PLUGIN_REGEX } from "@floro/common-web/src/utils/validators";
import ProfanityFilter from "bad-words";
import debouncer from "lodash.debounce";
import InfoLightIcon from "@floro/common-assets/assets/images/icons/info.light.svg";
import InfoDarkIcon from "@floro/common-assets/assets/images/icons/info.dark.svg";
import RedXCircleLightIcon from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDarkIcon from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import CheckMarkCircleLightIcon from "@floro/common-assets/assets/images/icons/check_mark_circle.light.svg";
import CheckMarkCircleDarkIcon from "@floro/common-assets/assets/images/icons/check_mark_circle.dark.svg";
import ToolTip from "@floro/storybook/stories/design-system/ToolTip";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";

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

const TopContentContainer = styled.div``;

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
interface Props {
  show?: boolean;
  onDismiss?: () => void;
  pluginVersion?: PluginVersion|null;
}

const RegisterPluginModal = (props: Props) => {

  const [registerOrgPlugin, registerOrgPluginRequest] =
    useCreateOrgPluginMutation();
  const [registerUserPlugin, registerUserPluginRequest] =
    useCreateUserPluginMutation();

  const registerIsLoading = useMemo(() => {
    return (
      registerOrgPluginRequest.loading || registerUserPluginRequest.loading
    );
  }, [registerOrgPluginRequest.loading, registerUserPluginRequest.loading]);

  useEffect(() => {
    if (registerUserPluginRequest?.data?.createUserPlugin?.__typename == "CreateUserPluginSuccess") {
      //if (registerUserPluginRequest?.data?.createUserPlugin?.user) {
      //  setCurrentUser(registerUserPluginRequest?.data?.createUserPlugin?.user);
      //}
      props.onDismiss?.();
    }
  }, [registerUserPluginRequest?.data?.createUserPlugin?.__typename])

  useEffect(() => {
    if (registerOrgPluginRequest?.data?.createOrgPlugin?.__typename == "CreateOrganizationPluginSuccess") {
      props.onDismiss?.();
    }
  }, [registerOrgPluginRequest?.data?.createOrgPlugin?.__typename])

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
        </TopContentContainer>
        <BottomContentContainer>
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(RegisterPluginModal);
