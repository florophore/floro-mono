import React, { useCallback, useMemo, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import { CompleteSignupAction } from "@floro/graphql-schemas/build/generated/main-graphql";
import {
  NAME_REGEX,
  USERNAME_REGEX,
} from "@floro/common-web/src/utils/validators";
import InfoLightIcon from "@floro/common-assets/assets/images/icons/info.light.svg";
import InfoDarkIcon from "@floro/common-assets/assets/images/icons/info.dark.svg";
import RedXCircleLightIcon from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDarkIcon from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import CheckMarkCircleLightIcon from "@floro/common-assets/assets/images/icons/check_mark_circle.light.svg";
import CheckMarkCircleDarkIcon from "@floro/common-assets/assets/images/icons/check_mark_circle.dark.svg";
import ProfanityFilter from "bad-words";

import Input from "@floro/storybook/stories/design-system/Input";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import ToolTip from "../../design-system/ToolTip";
import WarningLabel from "../../design-system/WarningLabel";
import Checkbox from "../../design-system/Checkbox";
import ColorPalette from "@floro/styles/ColorPalette";

const InfoImage = styled.img`
  height: 32px;
  width: 32px;
  margin-bottom: -6px;
`;

const UsernameInfoContainer = styled.div`
  height: 192px;
  width: 184px;
  box-sizing: border-box;
`;

const UsernameTitle = styled.p`
  font-size: 1rem;
  font-weight: 600;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 12px 0;
  color: ${(props) => props.theme.colors.signupTooltipUsernameTitle};
`;

const UsernameInstruction = styled.p`
  font-size: 0.85rem;
  font-weight: 400;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 6px 0;
  color: ${(props) => props.theme.colors.signupTooltipUsernameInstruction};
`;

const UsernameEmphasis = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  font-family: "MavenPro";
  padding: 0;
  margin: 0;
  color: ${(props) =>
    props.theme.colors.signupTooltipUsernameEmphasizedSymbols};
`;

const UsernameTooltipValidityImage = styled.img`
  height: 32px;
  width: 32px;
  margin-bottom: -6px;
`;

const UsernameTooltipErrorText = styled.p`
  font-size: 0.85rem;
  font-weight: 500;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 0 8px;
  color: ${(props) => props.theme.colors.signupTooltipUsernameErrorText};
`;

const UsernameTooltipValidText = styled.p`
  font-size: 0.85rem;
  font-weight: 500;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 0 8px;
  color: ${(props) => props.theme.colors.signupTooltipUsernameValidText};
`;

const TOSParagraph = styled.p`
  font-size: 1rem;
  font-weight: 500;
  font-family: "MavenPro";
  padding: 0;
  margin: 0 0 0 12px;
  transition: color 300ms;
`;

const TOSLink = styled.span`
  font-size: 1rem;
  font-weight: 700;
  font-family: "MavenPro";
  padding: 0;
  margin: 0;
  text-decoration: underline;
  color: ${props => props.theme.colors.tosLinkTextColor};
  cursor: pointer;
`;

export interface Props {
  firstName: string;
  lastName: string;
  username: string;
  agreedToTOS: boolean;
  onUpdateFirstName: (firstName: string) => void;
  onUpdateLastName: (lastName: string) => void;
  onUpdateUsername: (username: string) => void;
  onUpdateAgreedToTOS: (agreed: boolean) => void;
  usernameIsTaken: boolean;
  usernameCheckLoading: boolean;
  onOpenTOS: () => void;
}

const SignupInputs = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const profanityFilter = useMemo(() => new ProfanityFilter(), []);
  const [usernameIsFocused, setUsernameIsFocused] = useState(false);
  const [isHoveringTooltip, setIsHoveringToolTip] = useState(false);
  const [isFocusedOnTooltip, setIsFocusedOnTooltip] = useState(false);

  const firstNameIsValid = useMemo(() => {
    if (NAME_REGEX.test(props.firstName)) {
      return !profanityFilter.isProfane(props.firstName);
    }
    return false;
  }, [props.firstName]);
  const lastNameIsValid = useMemo(() => {
    if (NAME_REGEX.test(props.lastName)) {
      return !profanityFilter.isProfane(props.lastName);
    }
    return false;
  }, [props.lastName]);
  const usernameIsValid = useMemo(() => {
    if (USERNAME_REGEX.test(props.username)) {
      return !profanityFilter.isProfane(props.username);
    }
    return false;
  }, [props.username, profanityFilter]);

  const onFocusUsername = useCallback(() => {
    setUsernameIsFocused(true);
  }, []);

  const onBlurUsername = useCallback(() => {
    setUsernameIsFocused(false);
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
      usernameIsValid &&
      !props?.usernameIsTaken &&
      !props?.usernameCheckLoading &&
      !usernameIsFocused &&
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
    theme.name,
    props?.usernameIsTaken,
    props?.usernameCheckLoading,
    usernameIsValid,
    usernameIsFocused,
    isHoveringTooltip,
    isFocusedOnTooltip,
    CheckMarkCircleIcon
  ]);

  const redXCircle = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleLightIcon;
    }
    return RedXCircleDarkIcon;
  }, [theme.name]);

  const tosTextColor = useMemo(() => {
    if (props.agreedToTOS) {
      return theme.colors.contrastText;
    }

    return ColorPalette.gray;
  }, [theme.name, props.agreedToTOS]);

  return (
    <div style={{ paddingLeft: 40 }}>
      <div style={{ height: 32 }}>
        {(!firstNameIsValid || !lastNameIsValid) && (
          <WarningLabel
            size="small"
            label="names must be between 2-50 characters"
          />
        )}
      </div>
      <div
        className={css`
          margin-bottom: 36px;
        `}
      >
        <Input
          label={"first name"}
          placeholder={"first name"}
          value={props.firstName}
          onTextChanged={props.onUpdateFirstName}
          isValid={firstNameIsValid}
        />
      </div>
      <div
        className={css`
          margin-bottom: 22px;
        `}
      >
        <Input
          label={"last name"}
          placeholder={"last name"}
          value={props.lastName}
          onTextChanged={props.onUpdateLastName}
          isValid={lastNameIsValid}
        />
      </div>
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
          label={"username"}
          placeholder={"@username"}
          value={props.username}
          onTextChanged={props.onUpdateUsername}
          isValid={usernameIsValid && !props?.usernameIsTaken}
          onFocus={onFocusUsername}
          onBlur={onBlurUsername}
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
              usernameIsFocused ||
              !usernameIsValid ||
              props?.usernameIsTaken ||
              isHoveringTooltip
            }
            onFocusChanged={onToolTipFocusChanged}
            inner={
              <UsernameInfoContainer>
                <UsernameTitle>username</UsernameTitle>
                <UsernameInstruction>
                  {"Your username needs to be between 3-20 characters"}
                </UsernameInstruction>
                <UsernameInstruction>
                  {
                    "Your username can include letters, numbers, as well as the following characters"
                  }
                </UsernameInstruction>
                <UsernameEmphasis>{". - _ $ !"}</UsernameEmphasis>
                {props.usernameCheckLoading && (
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
                {!props.usernameCheckLoading && (
                  <div
                    className={css`
                      margin-top: 12px;
                      display: flex;
                      flex-direction: row;
                    `}
                  >
                    {(props?.usernameIsTaken || !usernameIsValid) && (
                      <UsernameTooltipValidityImage src={redXCircle} />
                    )}
                    {!props?.usernameIsTaken && usernameIsValid && (
                      <>
                        <UsernameTooltipValidityImage
                          src={CheckMarkCircleIcon}
                        />
                        <UsernameTooltipValidText>
                          {"this username hasn't been taken"}
                        </UsernameTooltipValidText>
                      </>
                    )}
                    {props.usernameIsTaken && usernameIsValid && (
                      <UsernameTooltipErrorText>
                        {"this username has been taken"}
                      </UsernameTooltipErrorText>
                    )}
                    {!usernameIsValid && (
                      <UsernameTooltipErrorText>
                        {"invalid username format"}
                      </UsernameTooltipErrorText>
                    )}
                  </div>
                )}
              </UsernameInfoContainer>
            }
          >
            <InfoImage src={infoIcon} />
          </ToolTip>
        </div>
      </div>
      <div
        className={css`
          display: flex;
          flex-direction: row;
          align-items: center;
        `}
      >
        <Checkbox
          isChecked={props.agreedToTOS}
          onChange={props.onUpdateAgreedToTOS}
        />
        <TOSParagraph style={{ color: tosTextColor }}>
          {"I agree to the "}
          <TOSLink onClick={props.onOpenTOS}>
            {"floro terms of service"}
          </TOSLink>
        </TOSParagraph>
      </div>
    </div>
  );
};

export default React.memo(SignupInputs);
