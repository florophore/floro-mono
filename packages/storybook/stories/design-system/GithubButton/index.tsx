import React, { useMemo, useCallback } from 'react';
import colorPalette, { Opacity } from '@floro/styles/ColorPalette';
import { css } from '@emotion/css';
import DotsLoader from '../DotsLoader';
import GithubWhiteBG from '@floro/common-assets/assets/images/icons/github_white_bg.svg';
import styled from '@emotion/styled';

export interface ButtonProps {
    label: string;
    isLoading?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    tabIndex?: number;
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

const GithubButton = ({
    label,
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

    return (
      <button
        className={css`
          padding: 0;
          margin: 0;
          transition: box-shadow 300ms;
          position: relative;
          background-color: ${colorPalette.darkGray};
          border: 1px solid black;
          color: ${colorPalette.white};
          font-family: "MavenPro";
          font-weight: 600;
          font-size: 2rem;
          max-width: 360px;
          height: 72px;
          width: 100%;
          border-radius: 8px;
          border: none;
          outline: 0;
          cursor: ${cursor};
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          border: 1px solid ${colorPalette.black};
          box-shadow: 0px 2px 4px 2px ${colorPalette.gray.substring(0, 7) + Opacity[50]};
          &:hover {
            box-shadow: 0px 1px 2px 1px ${colorPalette.gray.substring(0, 7) + Opacity[50]};
          }
        `}
        onClick={onClickCB}
        {...rest}
      >
        <GithubIcon src={GithubWhiteBG} />
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
            <DotsLoader color="white" size={"large"} />
          </div>
        )}
      </button>
    );
}

export default React.memo(GithubButton);