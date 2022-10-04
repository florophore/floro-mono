import React, { useMemo, useCallback } from 'react';
import colorPalette, { Opacity } from '@floro/styles/ColorPalette';
import { css } from '@emotion/css';
import { useTheme } from '@emotion/react';
import DotsLoader from '../DotsLoader';
import X from '@floro/common-assets/assets/react.svg';

export interface ButtonProps {
    label: string;
    bg: "purple"|"orange"|"teal"|"gray";
    isDisabled?: boolean;
    isLoading?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    tabIndex?: number;
    style?: React.CSSProperties;
}

const Button = ({
    label,
    bg,
    onClick,
    isDisabled,
    isLoading,
    ...rest
}: ButtonProps): React.ReactElement => {

    const backgroundColor = useMemo(() => {
        if (bg == "orange") {
            return colorPalette.orange;
        }
        if (bg == "gray") {
            return colorPalette.gray;
        }
        if (bg == "teal") {
            return colorPalette.teal;
        }
        return colorPalette.purple;
    }, [bg]);

    const hoverRadialGradientMiddleBackgroundColor = useMemo(() => {
        if (bg == "orange") {
            return colorPalette.lightOrange;
        }
        if (bg == "gray") {
            return colorPalette.lightGray;
        }
        if (bg == "teal") {
            return colorPalette.lightTeal;
        }
        return colorPalette.lightPurple;
    }, [bg]);
    
    const hoverRadialGradient = useMemo(() => {
        const edgeColor = backgroundColor.substring(0, 7) + Opacity[50]; 
        const centerColor = hoverRadialGradientMiddleBackgroundColor.substring(0, 7) + Opacity[80]; 
        return `radial-gradient(circle farthest-side, ${edgeColor}, ${centerColor})`;
    }, [backgroundColor, hoverRadialGradientMiddleBackgroundColor]);

    const hoverRadialGradient0Opacity = useMemo(() => {
        const edgeColor = backgroundColor.substring(0, 7) + Opacity[0]; 
        const centerColor = hoverRadialGradientMiddleBackgroundColor.substring(0, 7) + Opacity[0]; 
        return `radial-gradient(circle farthest-side, ${edgeColor}, ${centerColor})`;
    }, [backgroundColor, hoverRadialGradientMiddleBackgroundColor]);

    const hoverBackgroundColor = useMemo(() => {
        return (isDisabled || isLoading) ? hoverRadialGradient0Opacity : hoverRadialGradient;
    }, [isDisabled, isLoading, hoverRadialGradient, hoverRadialGradient0Opacity]);

    const overlayOpacityLayer1 = useMemo(() => {
        return isDisabled ? 0.8 : 0;
    }, [isDisabled]);

    const overlayOpacityLayer2 = useMemo(() => {
        return isDisabled ? 0.3 : 0;
    }, [isDisabled]);

    const cursor = useMemo(() => {
        if (isLoading) {
            return 'progress';
        }
        if (isDisabled) {
            return 'not-allowed';
        }
        return 'pointer';

    }, [isLoading, isDisabled])

    const theme =  useTheme();

    const onClickCB = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!isLoading && !isDisabled) {
            onClick?.(event);
        }
    }, [isDisabled, isLoading, onClick])

    return (
      <button
        className={css`
          padding: 0;
          margin: 0;
          position: relative;
          background-color: ${backgroundColor};
          transition: background-color 300ms;
          border: 1px solid black;
          color: ${colorPalette.white};
          font-family: "MavenPro";
          font-weight: 600;
          font-size: 2.25rem;
          max-width: 360px;
          height: 72px;
          width: 100%;
          border-radius: 8px;
          border: none;
          outline: 0;
          cursor: ${cursor};
        `}
        disabled={isDisabled}
        onClick={onClickCB}
        {...rest}
      >
        {!isLoading && (
          <>
            <div
              className={css`
                position: absolute;
                transition: opacity 300ms;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-image: ${hoverBackgroundColor};
                opacity: 0;
                &:hover {
                  opacity: 1;
                }
              `}
            >
              {label}
            </div>
            {label}
            <div
              className={css`
                pointer-events: none;
                position: absolute;
                transition: opacity 300ms;
                top: 0;
                left: 0;
                background-color: ${backgroundColor};
                height: 100%;
                width: 100%;
                border-radius: 8px;
                opacity: ${overlayOpacityLayer1};
              `}
            ></div>
            <div
              className={css`
                pointer-events: none;
                position: absolute;
                transition: opacity 300ms;
                top: 0;
                left: 0;
                background-color: ${theme.colors.disableOverlay};
                height: 100%;
                width: 100%;
                border-radius: 8px;
                opacity: ${overlayOpacityLayer2};
              `}
            ></div>
          </>
        )}
        {isLoading && (
          <div
            className={css`
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              width: 100%;
              border-radius: 8px;
              display: flex;
              justify-content: center;
              align-items: center;
            `}
          >
            <DotsLoader color="white" size={"large"} />
          </div>
        )}
        <img src={X}/>
      </button>
    );
}

export default React.memo(Button);