import React, {
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { PointerTypes } from "../floro-schema-api";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ToolTipArrowLight from "@floro/common-assets/assets/images/icons/tooltip_arrow.light.svg";
import ToolTipArrowDark from "@floro/common-assets/assets/images/icons/tooltip_arrow.dark.svg";
import ColorPaletteMatrix from "./ColorPaletteMatrix";


interface Props {
  show: boolean;
  onDismiss: () => void;
  onSelect: (
    colorPaletteColorShadeRef: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"]
  ) => void;
  filterNullHexes?: boolean;
}

const PalettePicker = (props: Props) => {
  const theme = useTheme();
  const container = useRef<HTMLDivElement>(null);
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

    const onWindowClick = (e: Event) => {
      if (container.current && !container.current.contains(e.target as Node)) {
          props.onDismiss?.()
      }
    }

    const timeout = setTimeout(() => {
      document.addEventListener("click", onWindowClick, {
        passive: true,
        capture: true
      });
    }, 0);
    return () => {
        clearTimeout(timeout);
        document.removeEventListener("click", onWindowClick);
    }
  }, [props.show, props.onDismiss]);

  const onStopPropagation = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
  }, []);

  const onSelect = useCallback(
    (
      colorPaletteColorShade: PointerTypes["$(palette).colorPalettes.id<?>.colorShades.id<?>"]
    ) => {
      props.onDismiss();
      props.onSelect(colorPaletteColorShade);
    },
    [props.onSelect, props.onDismiss]
  );

  if (!props.show) {
    return null;
  }

  return (
    <div
      onClick={onStopPropagation}
      ref={container}
      className={css`
        position: absolute;
        left: -279px;
        top: 48px;
        border-radius: 8px;
        z-index: 1;
      `}
    >
      <img
        className={css`
          position: absolute;
          top: -14px;
          left: 336px;
          transform: rotate(90deg);
        `}
        src={tooltipArrow}
      />
      <div
        className={css`
          height: 100%;
          margin-left: 3px;
          width: 646px;
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
            `}
          >
            <ColorPaletteMatrix onSelect={onSelect} filterNullHexes={props.filterNullHexes}/>
          </div>
          <div />
        </div>
      </div>
    </div>
  );
};

export default React.memo(PalettePicker);
