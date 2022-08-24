import React, { useMemo, useCallback } from 'react';
import colorPalette, { Opacity } from '@floro/styles/ColorPalette';
import { css } from '@emotion/css';
import DotsLoader from '../DotsLoader';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

export interface ButtonProps {
    label: string;
    isLoading?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    tabIndex?: number;
    googleAsset: string;
}

const GithubIcon = styled.img`
  height: 36px;
  width: 36px;
  margin-left: 12px;
`;

const LabelTag = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  margin-right: 12px;
`;

const GoogleButton = ({
    label,
    googleAsset,
    onClick,
    isLoading,
    ...rest
}: ButtonProps): React.ReactElement => {

    const onClickCB = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!isLoading) {
            onClick?.(event);
        }
    }, [isLoading]);

    const cursor = useMemo(() => {
        if (isLoading) {
            return 'progress';
        }
        return 'pointer';

    }, [isLoading]);

    const theme = useTheme();

    return (
      <button
        className={css`
          padding: 0;
          margin: 0;
          position: relative;
          transition: box-shadow 300ms;
          background-color: ${theme.colors.googleButtonBackground};
          border: 1px solid black;
          color: ${theme.colors.googleButtonText};
          font-family: "MavenPro";
          font-weight: 600;
          font-size: 2rem;
          max-width: 360px;
          height: 72px;
          width: 100%;
          border-radius: 8px;
          outline: 0;
          cursor: ${cursor};
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          border: 1px solid ${theme.colors.googleButtonBorder};
          box-shadow: 0px 2px 4px 2px ${colorPalette.gray.substring(0, 7) + Opacity[50]};
          &:hover {
            box-shadow: 0px 1px 2px 1px ${colorPalette.gray.substring(0, 7) + Opacity[50]};
          }
        `}
        onClick={onClickCB}
        {...rest}
      >
        <GithubIcon src={googleAsset} />
        {!isLoading && (
            <LabelTag>{label}</LabelTag>
        )}
        {isLoading && (
          <div
            className={css`
              flex-grow: 1;
              display: flex;
              margin-right: 24px;
              justify-content: center;
              align-items: center;
            `}
          >
            <DotsLoader color={theme.loaders.googleButtonLoader} size={"large"} />
          </div>
        )}
      </button>
    );
}

export default React.memo(GoogleButton);