import React, {
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ToolTipArrowLight from "@floro/common-assets/assets/images/icons/tooltip_arrow.light.svg";
import ToolTipArrowDark from "@floro/common-assets/assets/images/icons/tooltip_arrow.dark.svg";

export interface Props {
  children: React.ReactElement;
  inner: React.ReactElement;
  show: boolean;
  onFocusChanged?: (isFocused: boolean) => void;
}

const ToolTip = ({ children, inner, show, ...props }: Props): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  const theme = useTheme();

  const onMouseOverCB = useCallback(() => {
    setIsHovering(true);
  }, []);

  const onMouseLeaveCB = useCallback(() => {
    setIsHovering(false);
  }, []);

  const onClickCB = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      setIsFocused(true);
      props?.onFocusChanged?.(true);
    },
    [props?.onFocusChanged]
  );

  useEffect(() => {
    setContainerHeight(containerRef?.current?.clientHeight ?? 0);
    const onUnfocus = (event: Event) => {
      setIsFocused(false);
      props?.onFocusChanged?.(false);
    };
    window.addEventListener("click", onUnfocus);
    return () => {
      window.removeEventListener("click", onUnfocus);
    };
  }, [props?.onFocusChanged]);

  const quarterHeight = useMemo(() => containerHeight / 4, [containerHeight]);

  const showToolTip = useMemo(() => {
    return isHovering || isFocused || show;
  }, [isHovering, isFocused, show]);

  const tooltipArrow = useMemo(() => {
    if (theme.name == "light") {
      return ToolTipArrowLight;
    }
    return ToolTipArrowDark;
  }, [theme.name]);

  return (
    <div
      ref={containerRef}
      onClick={onClickCB}
      onMouseOver={onMouseOverCB}
      onMouseLeave={onMouseLeaveCB}
      className={css`
        position: relative;
        display: inline-block;
        cursor: pointer;
      `}
    >
      {children}
      <div
        className={css`
          display: ${showToolTip ? "block" : "none"};
          position: absolute;
          left: 100%;
          bottom: -${quarterHeight}px;
        `}
      >
        <img
          className={css`
            position: absolute;
            bottom: ${quarterHeight}px;
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
              padding: 16px;
              box-shadow: inset 0 0 3px ${theme.colors.tooltipInnerShadowColor};
              border-radius: 8px;
            `}
          >
            {inner}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ToolTip);