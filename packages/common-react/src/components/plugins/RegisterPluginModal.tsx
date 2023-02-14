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

const InfoImage = styled.img`
  height: 32px;
  width: 32px;
  margin-bottom: -6px;
`;

const PluginNameInfoContainer = styled.div`
  height: 208px;
  width: 184px;
  box-sizing: border-box;
`;

const PluginNameTitle = styled.p`
  font-size: 1rem;
  font-weight: 600;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 12px 0;
  color: ${(props) => props.theme.colors.signupTooltipUsernameTitle};
`;

const PluginNameInstruction = styled.p`
  font-size: 0.85rem;
  font-weight: 400;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 6px 0;
  color: ${(props) => props.theme.colors.signupTooltipUsernameInstruction};
`;

const PluginNameEmphasis = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  font-family: "MavenPro";
  padding: 0;
  margin: 0;
  color: ${(props) =>
    props.theme.colors.signupTooltipUsernameEmphasizedSymbols};
`;

const PluginNameTooltipValidityImage = styled.img`
  height: 32px;
  width: 32px;
  margin-bottom: -6px;
`;

const PluginNameTooltipErrorText = styled.p`
  font-size: 0.85rem;
  font-weight: 500;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 0 8px;
  color: ${(props) => props.theme.colors.signupTooltipUsernameErrorText};
`;

const PluginNameTooltipValidText = styled.p`
  font-size: 0.85rem;
  font-weight: 500;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 0 8px;
  color: ${(props) => props.theme.colors.signupTooltipUsernameValidText};
`;

interface Props {
  show?: boolean;
  onDismiss?: () => void;
  accountType: "user" | "org";
  organization?: Organization;
}

const RegisterPluginModal = (props: Props) => {
  const [pluginName, setPluginName] = useState("");
  const [pluginNameIsFocused, setPluginNameIsFocused] = useState(false);
  const [isHoveringTooltip, setIsHoveringToolTip] = useState(false);
  const [isFocusedOnTooltip, setIsFocusedOnTooltip] = useState(false);
  const profanityFilter = useMemo(() => new ProfanityFilter(), []);
  const theme = useTheme();

  const [registerOrgPlugin, registerOrgPluginRequest] =
    useCreateOrgPluginMutation();
  const [registerUserPlugin, registerUserPluginRequest] =
    useCreateUserPluginMutation();

  const registerIsLoading = useMemo(() => {
    return (
      registerOrgPluginRequest.loading || registerUserPluginRequest.loading
    );
  }, [registerOrgPluginRequest.loading, registerUserPluginRequest.loading]);

  const pluginInputIsValid = useMemo(() => {
    if (pluginName == "") {
      return true;
    }
    if (PLUGIN_REGEX.test(pluginName)) {
      return !profanityFilter.isProfane(pluginName);
    }
    return false;
  }, [pluginName]);

  const canRegister = useMemo(() => {
    return pluginInputIsValid && pluginName != "";
  }, [pluginInputIsValid, pluginName]);

  const onPressRegister = useCallback(() => {
    if (!canRegister) {
      return;
    }
    alert(props.accountType)
    if (props.accountType == "user") {
      registerUserPlugin({
        variables: {
          name: pluginName,
          isPrivate: false,
        },
      });
    }
    if (props.accountType == "org") {
      registerOrgPlugin({
        variables: {
          name: pluginName,
          isPrivate: false,
          organizationId: props?.organization?.id as string,
        },
      });
    }
  }, [
    props.accountType,
    pluginName,
    canRegister,
    registerOrgPlugin,
    registerUserPlugin,
    props.organization,
  ]);

  const [checkPluginName, { data, loading }] = usePluginNameCheckLazyQuery({
    nextFetchPolicy: "network-only",
  });
  const { currentUser } = useSession();
  const offlinePhoto = useOfflinePhoto(currentUser?.profilePhoto ?? null);

  const checkPluginNameDebounced = useCallback(
    debouncer(checkPluginName, 300),
    [checkPluginName]
  );

  const onFocusPluginName = useCallback(() => {
    setPluginNameIsFocused(true);
  }, []);

  const onBlurPluginName = useCallback(() => {
    setPluginNameIsFocused(false);
  }, []);

  const onStartHoverTooltipCB = useCallback(() => {
    setIsHoveringToolTip(true);
  }, []);

  const onStopHoverTooltipCB = useCallback(() => {
    setIsHoveringToolTip(false);
  }, []);

  const onToolTipFocusChanged = useCallback((isFocused: boolean) => {
    setIsFocusedOnTooltip(isFocused);
  }, []);

  const CheckMarkCircleIcon = useMemo(() => {
    if (theme.name == "light") {
      return CheckMarkCircleLightIcon;
    }
    return CheckMarkCircleDarkIcon;
  }, [theme.name]);

  const infoIcon = useMemo(() => {
    if (
      pluginInputIsValid &&
      pluginName != "" &&
      !data?.checkPluginNameIsTaken?.exists &&
      !loading &&
      !pluginNameIsFocused &&
      !isHoveringTooltip &&
      !isFocusedOnTooltip
    ) {
      return CheckMarkCircleIcon;
    }
    if (theme.name == "light") {
      return InfoLightIcon;
    }
    return InfoDarkIcon;
  }, [
    pluginName,
    theme.name,
    data?.checkPluginNameIsTaken?.exists,
    loading,
    pluginInputIsValid,
    pluginNameIsFocused,
    isHoveringTooltip,
    isFocusedOnTooltip,
    CheckMarkCircleIcon,
  ]);

  const redXCircle = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleLightIcon;
    }
    return RedXCircleDarkIcon;
  }, [theme.name]);

  useEffect(() => {
    checkPluginNameDebounced({
      variables: {
        pluginName,
      },
    });
  }, [pluginName]);

  useEffect(() => {
    if (props.show) {
        setPluginName("");
    }
  }, [props.show]);

  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"register plugin name"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  if (!currentUser) {
    return null;
  }
  return (
    <RootModal
      headerSize="small"
      headerChildren={title}
      show={props.show}
      onDismiss={props.onDismiss}
    >
      <ContentContainer>
        <TopContentContainer>
          <div style={{ display: "inline-flex" }}>
            <OwnerDescriptor
              label="owner"
              user={currentUser}
              offlinePhoto={offlinePhoto}
            />
          </div>
          <div style={{ marginTop: 32 }}>
            <div
              className={css`
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                margin-bottom: 22px;
              `}
            >
              <Input
                label={"plugin name"}
                placeholder={"plugin name"}
                value={pluginName}
                onTextChanged={setPluginName}
                isValid={
                  pluginInputIsValid && !data?.checkPluginNameIsTaken?.exists
                }
                onFocus={onFocusPluginName}
                onBlur={onBlurPluginName}
              />
              <div
                onMouseEnter={onStartHoverTooltipCB}
                onMouseLeave={onStopHoverTooltipCB}
                className={css`
                  padding-top: 14px;
                  padding-left: 8px;
                  height: 64px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                `}
              >
                <ToolTip
                  show={
                    pluginNameIsFocused ||
                    !pluginInputIsValid ||
                    data?.checkPluginNameIsTaken?.exists ||
                    isHoveringTooltip
                  }
                  onFocusChanged={onToolTipFocusChanged}
                  inner={
                    <PluginNameInfoContainer>
                      <PluginNameTitle>plugin name</PluginNameTitle>
                      <PluginNameInstruction>
                        {"Plugin names need to be between 3-20 characters"}
                      </PluginNameInstruction>
                      <PluginNameInstruction>
                        {
                          "A plugin name can include lowercase letters, numbers, as well as the following characters"
                        }
                      </PluginNameInstruction>
                      <PluginNameEmphasis>{"- _"}</PluginNameEmphasis>
                      {loading && (
                        <div
                          className={css`
                            margin-top: 24px;
                            display: flex;
                            flex-direction: row;
                            justify-content: center;
                            align-items: center;
                          `}
                        >
                          <DotsLoader size={"medium"} color={"purple"} />
                        </div>
                      )}
                      {!loading && pluginName != "" && (
                        <div
                          className={css`
                            margin-top: 12px;
                            display: flex;
                            flex-direction: row;
                          `}
                        >
                          {(data?.checkPluginNameIsTaken?.exists ||
                            !pluginInputIsValid) && (
                            <PluginNameTooltipValidityImage src={redXCircle} />
                          )}
                          {!data?.checkPluginNameIsTaken?.exists &&
                            pluginInputIsValid && (
                              <>
                                <PluginNameTooltipValidityImage
                                  src={CheckMarkCircleIcon}
                                />
                                <PluginNameTooltipValidText>
                                  {"this plugin name hasn't been taken"}
                                </PluginNameTooltipValidText>
                              </>
                            )}
                          {data?.checkPluginNameIsTaken?.exists &&
                            pluginInputIsValid && (
                              <PluginNameTooltipErrorText>
                                {"this plugin name has been taken"}
                              </PluginNameTooltipErrorText>
                            )}
                          {!pluginInputIsValid && (
                            <PluginNameTooltipErrorText>
                              {"invalid plugin name format"}
                            </PluginNameTooltipErrorText>
                          )}
                        </div>
                      )}
                    </PluginNameInfoContainer>
                  }
                >
                  <InfoImage src={infoIcon} />
                </ToolTip>
              </div>
            </div>
          </div>
        </TopContentContainer>
        <BottomContentContainer>
          <Button
            onClick={onPressRegister}
            isLoading={registerIsLoading}
            label={"register plugin"}
            bg={"purple"}
            size={"big"}
            isDisabled={!canRegister}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(RegisterPluginModal);
