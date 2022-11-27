import React, { useMemo, useState, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Cropper from "react-easy-crop";
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

export interface CropArea {
    height: number;
    width: number;
    x: number;
    y: number;
}

export interface Props {
  title: string;
  src: string;
  show: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onSave: (croppedArea: CropArea) => void;
}

const PhotoCropper = ({ title, src, show, onCancel, onSave, isLoading }: Props): React.ReactElement => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCropAreaPixels] = useState<CropArea>({height: 500, width: 500, x: 0, y: 0});
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCropAreaPixels(croppedAreaPixels);
  }, []);

  const onSaveCrop = useCallback(() => {
    onSave(croppedAreaPixels);
  }, [croppedAreaPixels]);
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
                    <Button size="small" label="save" bg="teal" onClick={onSaveCrop} isLoading={isLoading}/>
                    <Button size="small" label="cancel" bg="gray" onClick={onCancel} isDisabled={isLoading}/>
                </ButtonWrapper>
            </ModalSubContainer>
          </ModalHeaderContainer>
          <BottomContainer>
            <Cropper
              style={{
                containerStyle: {
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                },
              }}
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </BottomContainer>
        </Container>
      </ModalBackdrop>
    </div>
  );
};

export default React.memo(PhotoCropper);
