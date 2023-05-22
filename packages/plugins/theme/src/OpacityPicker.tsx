import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useState,
} from "react";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ToolTipArrowLight from "@floro/common-assets/assets/images/icons/tooltip_arrow.light.svg";
import ToolTipArrowDark from "@floro/common-assets/assets/images/icons/tooltip_arrow.dark.svg";
import styled from "@emotion/styled";

const DRAG_CONTAINER_HEIGHT = 130;

const Title = styled.h4`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  text-align: center;
  padding-top: 8px;
  user-select: none;
`;

const DragWrapper = styled.h4`
  width: 100%;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const OpacityPercentWrapper = styled.h4`
  margin-top: 8px;
  height: 32px;
  width: 48px;
  border: 2px solid ${props => props.theme.colors.contrastTextLight};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
`;

const AlphaTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.contrastTextLight};
  user-select: none;
`;

const DraggerContainer = styled.div`
  height: ${DRAG_CONTAINER_HEIGHT}px;
  width: 8px;
  border-radius: 8px;
  background: ${props => props.theme.colors.draggerBackground};
  position: relative;
`;

const DraggerBackground = styled.div`
  bottom: 0;
  width: 8px;
  border-radius: 8px;
`;

const DragCircle = styled.div`
  position: absolute;
  top: -8px;
  left: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.theme.background};
  border: 2px solid ${props => props.theme.colors.contrastTextLight};
`;

interface Props {
  show: boolean;
  onDismiss: () => void;
  isVariant?: boolean;
  alpha: number;
  hexcode: string;
  themeHex: string;
  onChange: (value: number) => void;
}

const OpacityPicker = (props: Props) => {
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(props.alpha ?? 0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const topOffset = useRef<number>();
  const dragContainer = useRef<HTMLDivElement>(null);


  const onStartDrag = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const percentage = (value ?? 100)/255;
    topOffset.current = event.clientY - DRAG_CONTAINER_HEIGHT * (1 - percentage);
    setIsMouseDown(true);
  }, [value]);

  const onStopDrag = useCallback(() => {
    setIsMouseDown(false);
    props?.onChange?.(Math.round(value) );
  }, [value]);

  const onMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isMouseDown) {
      return;
    }
    if (topOffset.current != undefined && event.clientY != undefined) {
      const mousePos = Math.min(Math.max(0,  event.clientY - topOffset.current), DRAG_CONTAINER_HEIGHT);
      const mousePct = 1 - (mousePos/DRAG_CONTAINER_HEIGHT);
      setValue(mousePct * 255);
    }
  }, [isMouseDown]);

  const tooltipArrow = useMemo(() => {
    if (theme.name == "light") {
      return ToolTipArrowLight;
    }
    return ToolTipArrowDark;
  }, [theme.name]);

  useEffect(() => {
    if (!props.show) {
        return;
    }
    setValue(props.alpha);

    const onWindowClick = (e: Event) => {
        props.onDismiss?.()
    }
    const timeout = setTimeout(() => {
        window.addEventListener("click", onWindowClick);
    }, 0);
    return () => {
        clearTimeout(timeout);
        window.removeEventListener("click", onWindowClick);
    }
  }, [props.show]);

  const onStopPropagation = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
  }, []);

  const alphaPct = useMemo(() => {
    if (value !== null && value !== undefined) {
      return ((value/255) * 100).toFixed(0) + '%';
    }
    return null;
  }, [value])

  const hex = useMemo(() => {
    return props.hexcode + (Math.round(value ?? 100).toString(16).padStart(2, "0"));
  }, [props.hexcode, value])


  const cursor = useMemo(() => {
    if (!isMouseDown) {
      return "grab";
    }
    return "grabbing";
  }, [isMouseDown])

  const pct = useMemo(() => {
    return ((value ?? 0)/255)* 100 + '%';
  }, [value]);

  if (!props.show) {
    return null;
  }

  return (
    <div
      onClick={onStopPropagation}
      ref={container}
      className={css`
        position: absolute;
        left: calc(100% - 50px);
        top: -${props.isVariant ? 90 : 72}px;
        border-radius: 8px;
        z-index: 1;
      `}
      onMouseMove={onMouseMove}
      onMouseUp={onStopDrag}
    >
      <img
        className={css`
          position: absolute;
          top: 205px;
          left: 1px;
        `}
        src={tooltipArrow}
      />
      <div
        className={css`
          height: 100%;
          margin-left: 8px;
          width: calc(100% - 8px);
          border-radius: 8px;
          box-sizing: border-box;
          box-shadow: 0 0 20px 1px ${theme.colors.tooltipOuterShadowColor};
        `}
      >
        <div
          className={css`
            background: ${theme.background};
            box-shadow: inset 0 0 3px ${theme.colors.tooltipInnerShadowColor};
            border-radius: 8px;
          `}
        >
          <div
            className={css`
              height: 240px;
              width: 100px;
              display: flex;
              flex-direction: column;
              align-items: center;
            `}
          >
            <Title>{"opacity"}</Title>
            <DragWrapper>
              <DraggerContainer ref={dragContainer}>
                <div
                  style={{
                    background: props.themeHex,
                    height: pct,
                    position: "absolute",
                    bottom: 0,
                    borderRadius: 8,
                  }}
                >
                  <DraggerBackground
                    style={{ background: hex, height: "100%", borderRadius: 8 }}
                  >
                    <div
                      style={{
                        height: "100%",
                        position: "relative",
                        borderRadius: 8,
                      }}
                    >
                      <DragCircle
                        style={{ cursor }}
                        onMouseDown={onStartDrag}
                      />
                    </div>
                  </DraggerBackground>
                </div>
              </DraggerContainer>
            </DragWrapper>
            <OpacityPercentWrapper>
              <AlphaTitle>{alphaPct}</AlphaTitle>
            </OpacityPercentWrapper>
          </div>
          <div />
        </div>
      </div>
    </div>
  );
};

export default React.memo(OpacityPicker);