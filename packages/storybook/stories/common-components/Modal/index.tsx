import React, { useCallback, useMemo } from "react";
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
`;

const ModalHeaderContainer = styled.div`
  background: ${(props) => props.theme.colors.modalHeaderBackground};
  height: 168px;
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
    height: 168px;
    width: 100%;
    padding: 16px;
`;

const ContentWrapper = styled.div`
    height: 400px;
    width: 100%;
`;

export interface Props {
  show?: boolean;
  onDismiss?: () => void;
  children?: React.ReactElement | React.ReactElement[];
  disableBackgroundDismiss?: boolean;
  showExitIcon?: boolean;
  headerChildren?: React.ReactElement|React.ReactElement[];
}

const Modal = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const exitIconSrc = useMemo(() => {
    if (theme.name == "light") {
      return ExitIconLight;
    }
    return ExitIconDark;
  }, [theme.name]);

  return (
    <ModalBackdrop
      show={props.show}
      onDismiss={props?.onDismiss}
      disableBackgroundDismiss={props?.disableBackgroundDismiss}
    >
      <ModalContainer>
        <ModalHeaderContainer>
          <HeaderContentWrapper>
            {props?.headerChildren}
          </HeaderContentWrapper>
          {(props.showExitIcon ?? true) && <ExitIconImage onClick={props?.onDismiss} src={exitIconSrc} />}
        </ModalHeaderContainer>
        <ContentWrapper>
            {props?.children}
        </ContentWrapper>
      </ModalContainer>
    </ModalBackdrop>
  );
};

export default React.memo(Modal);
