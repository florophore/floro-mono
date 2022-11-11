import React, { useCallback, useMemo, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import {
  NAME_REGEX,
  USERNAME_REGEX,
} from "@floro/common-web/src/utils/validators";
import InfoLightIcon from "@floro/common-assets/assets/images/icons/info.light.svg";
import InfoDarkIcon from "@floro/common-assets/assets/images/icons/info.dark.svg";
import RedXCircleLightIcon from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDarkIcon from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import CheckMarkCircleIcon from "@floro/common-assets/assets/images/icons/check_mark_circle.svg";
import ProfanityFilter from "bad-words";

import Input from "@floro/storybook/stories/design-system/Input";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import ToolTip from "../../design-system/ToolTip";
import WarningLabel from "../../design-system/WarningLabel";
import Checkbox from "../../design-system/Checkbox";
import ColorPalette from "@floro/styles/ColorPalette";
import EmailValidator from "email-validator";

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
  color: ${ColorPalette.purple};
  cursor: pointer;
`;

export interface Props {
  name: string;
  legalName: string;
  contactEmail: string;
  handle: string;
  agreedToToCustomerServiceAgreement: boolean;
  onUpdateName: (name: string) => void;
  onUpdateLegalName: (lastName: string) => void;
  onUpdateContactEmail: (contactEmail: string) => void;
  onUpdateHandle: (handle: string) => void;
  onUpdateAgreedToCustomerServiceAgreement: (agreed: boolean) => void;
  handleIsTaken: boolean;
  handleCheckLoading: boolean;
  onOpenTOS: () => void;
}

const CreateOrgInputs = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const profanityFilter = useMemo(() => new ProfanityFilter(), []);
  const [handleIsFocused, setHandleIsFocused] = useState(false);
  const [isHoveringTooltip, setIsHoveringToolTip] = useState(false);
  const [isFocusedOnTooltip, setIsFocusedOnTooltip] = useState(false);

  const nameInputIsValid = useMemo(() => {
    if (NAME_REGEX.test(props.name) || props.name == "") {
      return !profanityFilter.isProfane(props.name);
    }
    return false;
  }, [props.name]);

  const legalNameInputIsValid = useMemo(() => {
    if (NAME_REGEX.test(props.legalName) || props.legalName == "") {
      return !profanityFilter.isProfane(props.legalName);
    }
    return false;
  }, [props.legalName]);

  const contactEmailIsValid = useMemo(
    () => EmailValidator.validate(props.contactEmail),
    [props.contactEmail]
  );
  const contactEmailInputIsValid = useMemo(
    () => contactEmailIsValid || props.contactEmail == "",
    [props.contactEmail, contactEmailIsValid]
  );

  const handleIsValid = useMemo(() => {
    if (USERNAME_REGEX.test(props.handle)) {
      return !profanityFilter.isProfane(props.handle);
    }
    return false;
  }, [props.handle, profanityFilter]);

  const handleInputIsValid = useMemo(() => {
    if (props.handle == "") {
      return true;
    }
    if (USERNAME_REGEX.test(props.handle)) {
      return !profanityFilter.isProfane(props.handle);
    }
    return false;
  }, [props.handle, profanityFilter]);

  const onFocusHandle = useCallback(() => {
    setHandleIsFocused(true);
  }, []);

  const onBlurHandle = useCallback(() => {
    setHandleIsFocused(false);
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

  const infoIcon = useMemo(() => {
    if (
      handleIsValid &&
      !props?.handleIsTaken &&
      !props?.handleCheckLoading &&
      !handleIsFocused &&
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
    props?.handleIsTaken,
    props?.handleCheckLoading,
    handleIsValid,
    handleIsFocused,
    isHoveringTooltip,
    isFocusedOnTooltip,
  ]);

  const redXCircle = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleLightIcon;
    }
    return RedXCircleDarkIcon;
  }, [theme.name]);

  const tosTextColor = useMemo(() => {
    if (props.agreedToToCustomerServiceAgreement) {
      return theme.colors.contrastText;
    }

    return ColorPalette.gray;
  }, [theme.name, props.agreedToToCustomerServiceAgreement]);

  return (
    <div>
      <div
        className={css`
          margin-bottom: 36px;
        `}
      >
        <Input
          label={"organization name"}
          placeholder={"organization name"}
          value={props.name}
          onTextChanged={props.onUpdateName}
          isValid={nameInputIsValid}
        />
      </div>
      <div
        className={css`
          margin-bottom: 36px;
        `}
      >
        <Input
          label={"organization legal name"}
          placeholder={"organization legal name"}
          value={props.legalName}
          onTextChanged={props.onUpdateLegalName}
          isValid={legalNameInputIsValid}
        />
      </div>
      <div
        className={css`
          margin-bottom: 22px;
        `}
      >
        <Input
          label={"contact email"}
          placeholder={"contact email"}
          value={props.contactEmail}
          onTextChanged={props.onUpdateContactEmail}
          isValid={contactEmailInputIsValid}
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
          label={"organization account handle"}
          placeholder={"organization account @handle"}
          value={props.handle}
          onTextChanged={props.onUpdateHandle}
          isValid={handleInputIsValid && !props?.handleIsTaken}
          onFocus={onFocusHandle}
          onBlur={onBlurHandle}
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
              handleIsFocused ||
              !handleInputIsValid ||
              props?.handleIsTaken ||
              isHoveringTooltip
            }
            onFocusChanged={onToolTipFocusChanged}
            inner={
              <UsernameInfoContainer>
                <UsernameTitle>organization handle</UsernameTitle>
                <UsernameInstruction>
                  {"Org handles needs to be between 3-20 characters"}
                </UsernameInstruction>
                <UsernameInstruction>
                  {
                    "Org handles can include letters, numbers, as well as the following characters"
                  }
                </UsernameInstruction>
                <UsernameEmphasis>{". - _ $ !"}</UsernameEmphasis>
                {props.handleCheckLoading && (
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
                {!props.handleCheckLoading && (
                  <div
                    className={css`
                      margin-top: 12px;
                      display: flex;
                      flex-direction: row;
                    `}
                  >
                    {(props?.handleIsTaken || !handleInputIsValid) && (
                      <UsernameTooltipValidityImage src={redXCircle} />
                    )}
                    {!props?.handleIsTaken && handleIsValid && (
                      <>
                        <UsernameTooltipValidityImage
                          src={CheckMarkCircleIcon}
                        />
                        <UsernameTooltipValidText>
                          {"this handle hasn't been taken"}
                        </UsernameTooltipValidText>
                      </>
                    )}
                    {props.handleIsTaken && handleInputIsValid && (
                      <UsernameTooltipErrorText>
                        {"this handle has been taken"}
                      </UsernameTooltipErrorText>
                    )}
                    {!handleInputIsValid && (
                      <UsernameTooltipErrorText>
                        {"invalid handle format"}
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
          align-items: flex-start;
          max-width: 432px;
        `}
      >
        <div>
          <Checkbox
            isChecked={props.agreedToToCustomerServiceAgreement}
            onChange={props.onUpdateAgreedToCustomerServiceAgreement}
          />
        </div>
        <TOSParagraph style={{ color: tosTextColor }}>
          {"I agree to the "}
          <TOSLink onClick={props.onOpenTOS}>
            {"floro customer agreement"}
          </TOSLink>
          {
            " on behalf of my organization and confirm that I have the authority to do so."
          }
        </TOSParagraph>
      </div>
      <div style={{ height: 32, marginTop: 12 }}>
        {(!nameInputIsValid) && (
          <WarningLabel
            size="small"
            label="name must be between 2-50 characters"
          />
        )}
        {(nameInputIsValid && !legalNameInputIsValid) && (
          <WarningLabel
            size="small"
            label="legal name must be between 2-50 characters"
          />
        )}
        {nameInputIsValid &&
          legalNameInputIsValid &&
          !contactEmailInputIsValid && (
            <WarningLabel size="small" label="invalid format for contact email" />
          )}
      </div>
    </div>
  );
};

export default React.memo(CreateOrgInputs);
