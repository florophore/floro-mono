
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import styled from "@emotion/styled";
import ModalBackdrop from "./ModalBackdrop";
import ColorPalette from "@floro/styles/ColorPalette";
import ExitIconLight from "@floro/common-assets/assets/images/icons/exit_icon.light.svg";
import ExitIconDark from "@floro/common-assets/assets/images/icons/exit_icon.dark.svg";
import { useTheme } from "@emotion/react";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-client-graphql";

const Container = styled.div`
  width: 650px;
  height: 700px;
  overflow: hidden;
  box-shadow: ${(props) =>
    `0px 8px 40px ${props.theme.shadows.modalContainer}`};
  position: relative;
  border-radius: 10px;
  background: ${(props) => props.theme.background};
  padding: 0;
`;

const ModalHeaderContainer = styled.div`
  background: ${ColorPalette.purple};
  height: 80px;
  width: 100%;
  box-sizing: border-box;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  display: flex;
  flex-direction: row;
  padding: 16px 24px;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitleWrapper = styled.div`
    display: flex;
    flex-grow: 1;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding-left: 40px;
`;

const ModalTitle = styled.h3`
    text-align: center;
    align-self: center;
    font-family: "MavenPro";
    font-size: 2rem;
    font-weight: 500;
    margin: 0;
    padding: 0;
    color: ${ColorPalette.white};
`

const ButtonWrapper = styled.div`
    height: 100%;
    width: 160px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-end;
    align-self: flex-end;
    padding: 8px 16px;
    box-sizing: border-box;
`;

const BottomContainer = styled.div`
  background: ${props => props.theme.background};
  height: 620px;
  width: 100%;
  box-sizing: border-box;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  position: relative;
`;

const ExitIconImage = styled.img`
  height: 40px;
  width: 40px;
  cursor: pointer;
`;

const SearchDropdownContainer = styled.div`
    position: absolute;
    left: 26px;
    top: 64px;
    z-index: 1;
`;

export interface CropArea {
    height: number;
    width: number;
    x: number;
    y: number;
}

export interface Props {
  show: boolean;
  onDismiss?: () => void;
  children?: React.ReactElement | React.ReactElement[];
  left?: React.ReactElement | React.ReactElement[] | null;
  title?: string;
}

const IconModal = ({
  show,
  onDismiss,
  title,
  children,
  left = null
}: Props): React.ReactElement => {
  const theme = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const bottomContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      if (searchRef.current) {
        searchRef.current.focus();
      }
    }
  }, [show]);

  const exitIconSrc = useMemo(() => {
    if (theme.name == "light") {
      return ExitIconLight;
    }
    return ExitIconDark;
  }, [theme.name]);

  return (
    <div>
      <ModalBackdrop show={show} disableBackgroundDismiss={true}>
        <Container>
          <ModalHeaderContainer>
            {left}
            <ModalTitleWrapper>
                <ModalTitle>{title}</ModalTitle>
            </ModalTitleWrapper>
            <ExitIconImage src={exitIconSrc} onClick={onDismiss} />
          </ModalHeaderContainer>
          <BottomContainer ref={bottomContainer}>{children}</BottomContainer>
        </Container>
      </ModalBackdrop>
    </div>
  );
};

export default React.memo(IconModal);
