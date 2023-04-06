import React, { useMemo } from "react";
import { useTheme } from "@emotion/react";
import { css } from "@emotion/css";

import ToolTipArrowLight from "@floro/common-assets/assets/images/icons/tooltip_arrow.light.svg";
import ToolTipArrowDark from "@floro/common-assets/assets/images/icons/tooltip_arrow.dark.svg";

export interface Props {
  children?: React.ReactElement;
}

const CommitContent = (props: Props) => {
  const theme = useTheme();

  const tooltipArrow = useMemo(() => {
    if (theme.name == "light") {
      return ToolTipArrowLight;
    }
    return ToolTipArrowDark;
  }, [theme.name]);
  return (
    <div
      className={css`
        padding-left: 8px;
        padding-right: 8px;
        padding-bottom: 8px;
        height: 100%;
        box-sizing: border-box;
        position: relative;
      `}
    >
      <div
        className={css`
          width: 100%;
          margin-top: 8px;
          border-radius: 8px;
          box-shadow: 0px 2px 2px 2px ${theme.colors.tooltipOuterShadowColor};
          height: calc(100% - 8px);
        `}
      >
        <div
          className={css`
            background: ${theme.background};
            padding: 8px;
            box-shadow: inset 0 0 3px ${theme.colors.tooltipInnerShadowColor};
            border-radius: 8px;
            height: 100%;
            box-sizing: border-box;
          `}
        >
          {props.children}
        </div>
      </div>
      <img
        className={css`
          position: absolute;
          transform: rotate(90deg);
          top: -16px;
          left: calc(50% - 8px);
        `}
        src={tooltipArrow}
      />
    </div>
  );
};

export default React.memo(CommitContent);
