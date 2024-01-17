import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  extractQueryArgs,
  makeQueryRef,
  useExtractQueryArgs,
  useFloroContext,
  useFloroState,
  useHasConflict,
  useQueryRef,
  useReferencedObject,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import ColorPalette, { Opacity } from "@floro/styles/ColorPalette";

import CopyLight from "@floro/common-assets/assets/images/icons/copy.light.svg";
import CopyDark from "@floro/common-assets/assets/images/icons/copy.dark.svg";
import { rethemeSvg } from "../colorhooks";
import { useFocusContext } from "../focus/FocusContext";
import ReactDOM from "react-dom";

const Wrapper = styled.div`
  position: relative;
  margin-top: 29px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  margin-bottom: 8px;
  margin-right: 16px;
`;

const Card = styled.div`
  position: relative;
  height: 136px;
  width: 216px;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.colorPaletteCard};
  border: 2px solid;
`;

const CardInterior = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FocusWrapperIconWrapper = styled.div`
  width: 100%;
  height: 100%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: red;
  align-self: center;
  border-radius: 24px;
  border: 1px solid;
`;

const FocusedIcon = styled.img`
  width: 70%;
  display: flex;
  max-height: 80%;
`;

const Title = styled.h4`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
`;

const IconWrapper = styled.div`
  height: 104px;
  width: 104px;
  cursor: pointer;
`;

const Icon = styled.img`
  max-height: 104px;
  max-width: 104px;
  width: 100%;
  height: 100%;
`;

const ClipboardCopyContainer = styled.div`
  position: absolute;
  right: 4px;
  top: 4px;
  height: 24px;
  width: 32px;
  border: 2px solid black;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 200ms, background-color 200ms;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CopyIcon = styled.img`
  height: 16px;
  width: 16px;
  cursor: pointer;
`;

const CopyOverlay = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 500ms;
`;

const CopyText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.white};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
`;


const getColorDistance = (staticHex: string, comparedHex: string) => {
  try {
    if (staticHex[0] != "#" || comparedHex[0] != "#") {
      return 0;
    }
    const r1 = parseInt((staticHex?.[1] ?? "F") + (staticHex?.[2] ?? "F"), 16);
    const r2 = parseInt(
      (comparedHex?.[1] ?? "F") + (comparedHex?.[2] ?? "F"),
      16
    );
    const g1 = parseInt((staticHex?.[3] ?? "F") + (staticHex?.[4] ?? "F"), 16);
    const g2 = parseInt(
      (comparedHex?.[3] ?? "F") + (comparedHex?.[4] ?? "F"),
      16
    );
    const b1 = parseInt((staticHex?.[5] ?? "F") + (staticHex?.[6] ?? "F"), 16);
    const b2 = parseInt(
      (comparedHex?.[5] ?? "F") + (comparedHex?.[6] ?? "F"),
      16
    );
    return Math.sqrt(
      Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    );
  } catch (e) {
    return 0;
  }
};

interface Props {
  remappedSVG?: string;
  defaultIconTheme: string;
  selectedVariants?: { [key: string]: boolean };
  appliedThemes?: { [key: string]: PointerTypes["$(theme).themeColors.id<?>"] };
  themeRef: PointerTypes['$(theme).themes.id<?>'];
  stateVariantRef: PointerTypes['$(theme).stateVariants.id<?>'];
}

const IconThemeDefVariantCell = (props: Props) => {
  const theme = useTheme();
  const { commandMode, applicationState } = useFloroContext();

  const themeObject = useReferencedObject(props.themeRef);
  const stateVariant = useReferencedObject(props.stateVariantRef);
  const [isHoveringClipboard, setIsHoveringClipboard] = useState(false);
  const [clickedCopy, setClickedCopy] = useState(false);

  const { focusPortal, showFocus, setShowFocus} = useFocusContext();
  const [showFocusImg, setShowFocusImg] = useState(false);

  const copyIcon = useMemo(() => {
    const lightDistance = getColorDistance(
      ColorPalette.white,
      themeObject.backgroundColor.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      themeObject.backgroundColor.hexcode
    );
    if (lightDistance <= darkDistance) {
      return CopyLight;
    }
    return CopyDark;
  }, [themeObject.backgroundColor.hexcode]);

  useEffect(() => {
    if (clickedCopy) {
      const timeout = setTimeout(() => {
        setClickedCopy(false);
      }, 700);
      return () => {
        clearTimeout(timeout);
      }
    }
  }, [clickedCopy])

  const onClipBoardMouseEnter = useCallback(() => {
    setIsHoveringClipboard(true);
  }, []);

  const onClipBoardMouseLeave = useCallback(() => {
    setIsHoveringClipboard(false);
  }, []);

  const variantSvg = useMemo(() => {
    if (!applicationState || !props.remappedSVG) {
      return props.remappedSVG ?? "";
    }
    return rethemeSvg(
      applicationState,
      props.remappedSVG,
      props.appliedThemes ?? {},
      props.themeRef,
      null,
      null,
      props.stateVariantRef
    ) ?? "";
  }, [
    applicationState,
    props.remappedSVG,
    props.appliedThemes,
    props.themeRef,
    props.stateVariantRef
  ]);

  const contrastColor = useMemo(() => {
    const lightDistance = getColorDistance(
      ColorPalette.white,
      themeObject.backgroundColor.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      themeObject.backgroundColor.hexcode
    );
    if (lightDistance <= darkDistance) {
      return ColorPalette.mediumGray;
    }
    return ColorPalette.white;
  }, [themeObject?.backgroundColor?.hexcode]);

  const remappedSVGUrl = useMemo(() => {
    return `data:image/svg+xml,${encodeURIComponent(variantSvg ?? "")}`;
  }, [variantSvg]);

  const onDragStart = useCallback((event: React.DragEvent<HTMLImageElement>) => {
    event.dataTransfer.setData("text/plain", variantSvg)
    return true;
  }, [variantSvg]);

  const onCopyToClipboard = useCallback(async () => {
    const blob = new Blob([variantSvg], { type: "text/plain" });
    navigator.clipboard.write([
      new ClipboardItem({
        ["text/plain"]: blob,
      }),
    ]);
    setClickedCopy(true);
  }, [remappedSVGUrl, variantSvg]);

  const onShowFocus = useCallback(() => {
    setShowFocus(true);
    setShowFocusImg(true)
  }, [setShowFocus])

  useEffect(() => {
    if (showFocusImg && !showFocus) {
      setShowFocusImg(false);
    }

  }, [showFocusImg, showFocus])

  if (!variantSvg && variantSvg == '') {
    return null;
  }

  const focusImg = showFocusImg && focusPortal?.current? ReactDOM.createPortal(
    (<FocusWrapperIconWrapper
          style={{
            borderColor: contrastColor,
            background: themeObject.backgroundColor.hexcode,
          }}
    >
      <FocusedIcon src={remappedSVGUrl}/>
    </FocusWrapperIconWrapper>),
    focusPortal?.current
  ) : null;

  return (
    <Wrapper>
      {focusImg}
      <Container>
        <Card
          style={{
            borderColor: contrastColor,
            background: themeObject.backgroundColor.hexcode,
          }}
        >
          <CardInterior>
            <IconWrapper onClick={onShowFocus}>
              <Icon draggable="true" onDragStart={onDragStart} src={remappedSVGUrl} />
            </IconWrapper>
          </CardInterior>
          <CopyOverlay style={{
            opacity: clickedCopy ? 1 : 0,
            background: ColorPalette.mediumGray.substring(0, 7) + Opacity[50]
          }}>
            <CopyText>{'copied!'}</CopyText>
          </CopyOverlay>
          <ClipboardCopyContainer
            onClick={onCopyToClipboard}
            onMouseEnter={onClipBoardMouseEnter}
            onMouseLeave={onClipBoardMouseLeave}
            style={{ borderColor: isHoveringClipboard ? contrastColor : 'transparent' }}
          >
            <CopyIcon src={copyIcon}/>
          </ClipboardCopyContainer>
        </Card>
        <Title style={{ color: theme.colors.pluginTitle }}>
          {stateVariant?.name}
        </Title>
      </Container>
    </Wrapper>
  );
};

export default React.memo(IconThemeDefVariantCell);
