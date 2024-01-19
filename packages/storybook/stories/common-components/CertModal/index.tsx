import React, { useCallback } from "react";
import styled from "@emotion/styled";
import ModalBackdrop from "../ModalBackdrop";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from '../../design-system/Button';

const Container = styled.div`
  width: 960px;
  height: 700px;
  box-shadow: ${(props) =>
    `0px 8px 40px ${props.theme.shadows.modalContainer}`};
  position: relative;
  border-radius: 10px;
  background: ${(props) => props.theme.background};
  zoom: 80%;
`;

const ModalHeaderContainer = styled.div`
  background: ${ColorPalette.purple};
  height: 120px;
  width: 100%;
  box-sizing: border-box;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  display: flex;
  flex-direction: row;
`;

const ModalSubContainer = styled.div`
    height: height: 100%;
    flex: 1;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
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
  background: ${ColorPalette.white};
  height: 580px;
  width: 100%;
  box-sizing: border-box;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  position: relative;
`;

export interface Props {
  title: string;
  show: boolean;
  isApiKeysDisabled: boolean;
  page: 'cert'|'api-keys';
  onChangePage: (page: 'cert'|'api-keys') => void;
  onClose: () => void;
  children: React.ReactElement
}

const CertModal = ({ title, page, show, isApiKeysDisabled, onChangePage, onClose, children }: Props): React.ReactElement => {
  const onGoToCert = useCallback(() => {
    onChangePage('cert');
  }, [onChangePage])
  const onGoToApiKeys = useCallback(() => {
    onChangePage('api-keys');
  }, [onChangePage])

  return (
    <div>
      <ModalBackdrop show={show} disableBackgroundDismiss={true}>
        <Container>
          <ModalHeaderContainer>
            <ModalSubContainer/>
            <ModalSubContainer>
                <ModalTitle>
                    {title}
                </ModalTitle>
            </ModalSubContainer>
            <ModalSubContainer>
                <ButtonWrapper>
                    {page === 'cert' && (
                      <Button size="small" label="connect" bg="teal" onClick={onGoToApiKeys} isDisabled={isApiKeysDisabled}/>
                    )}
                    {page === 'api-keys' && (
                      <Button size="small" label="tls cert" bg="teal" onClick={onGoToCert} isDisabled={isApiKeysDisabled}/>
                    )}
                    <Button size="small" label="cancel" bg="gray" onClick={onClose}/>
                </ButtonWrapper>
            </ModalSubContainer>
          </ModalHeaderContainer>
          <BottomContainer>
            {children}
          </BottomContainer>
        </Container>
      </ModalBackdrop>
    </div>
  );
};

export default React.memo(CertModal);
