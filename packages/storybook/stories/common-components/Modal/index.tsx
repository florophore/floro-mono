import React, {  useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ModalBackdrop from "../ModalBackdrop";
import ExitIconLight from "@floro/common-assets/assets/images/icons/exit_icon.light.svg";
import ExitIconDark from "@floro/common-assets/assets/images/icons/exit_icon.dark.svg";

const ModalContainer = styled.div`
  width: 528px;
  height: 568px;
  box-shadow: ${(props) =>
    `0px 8px 40px ${props.theme.shadows.modalContainer}`};
  position: relative;
  border-radius: 10px;
  background: ${(props) => props.theme.background};
  zoom: 80%;
`;

const ModalHeaderContainer = styled.div`
  background: ${(props) => props.theme.colors.modalHeaderBackground};
  width: 100%;
  box-sizing: border-box;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

const ExitIconImage = styled.img`
  height: 32px;
  width: 32px;
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  z-index: 0;
`;

const HeaderContentWrapper = styled.div`
    box-sizing: border-box;
    width: 100%;
    padding: 16px;
`;

const ContentWrapper = styled.div`
  width: 100%;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;

export interface Props {
  show?: boolean;
  onDismiss?: () => void;
  children?: React.ReactElement | React.ReactElement[];
  disableBackgroundDismiss?: boolean;
  showExitIcon?: boolean;
  headerChildren?: React.ReactElement|React.ReactElement[];
  headerSize?: "small"|"normal";
  topOffest?: number;
}

const Modal = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const headerSize = useMemo(() => {
    if (props?.headerSize == "small") {
      return 80;
    }
    return 168;
  }, [props?.headerSize]);
  const exitIconSrc = useMemo(() => {
    if (theme.name == "light") {
      return ExitIconLight;
    }
    // ignore dark for now
    return ExitIconLight;
  }, [theme.name]);

  const contentHeight = useMemo(() => {
    return 400 + (168 - headerSize);
  }, [headerSize]);

  return (
    <ModalBackdrop
      show={props.show}
      onDismiss={props?.onDismiss}
      disableBackgroundDismiss={props?.disableBackgroundDismiss}
    >
      <ModalContainer style={{marginTop: -(props.topOffest ?? 0)}}>
        <ModalHeaderContainer style={{height: headerSize}}>
          <HeaderContentWrapper style={{height: headerSize}}>
            {props?.headerChildren}
          </HeaderContentWrapper>
          {(props.showExitIcon ?? true) && <ExitIconImage onClick={props?.onDismiss} src={exitIconSrc} />}
        </ModalHeaderContainer>
        <ContentWrapper style={{height: contentHeight}}>
            {props?.children}
        </ContentWrapper>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default React.memo(Modal);
