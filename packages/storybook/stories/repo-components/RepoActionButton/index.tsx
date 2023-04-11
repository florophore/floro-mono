import React, { useMemo, useCallback } from 'react';
import colorPalette, { Opacity } from '@floro/styles/ColorPalette';
import { css } from '@emotion/css';
import DotsLoader from '../../design-system/DotsLoader';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import ColorPalette from '@floro/styles/ColorPalette';
import SourceGraphWhite from '@floro/common-assets/assets/images/repo_icons/source_graph.white.svg';
import SourceGraphGray from '@floro/common-assets/assets/images/repo_icons/source_graph.gray.svg';
import SourceGraphMediumGray from '@floro/common-assets/assets/images/repo_icons/source_graph.medium_gray.svg';

import CompareWhite from '@floro/common-assets/assets/images/repo_icons/compare.white.svg';
import CompareGray from '@floro/common-assets/assets/images/repo_icons/compare.gray.svg';
import CompareMediumGray from '@floro/common-assets/assets/images/repo_icons/compare.medium_gray.svg';

export interface ButtonProps {
    label: string;
    isLoading?: boolean;
    isDisabled?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    tabIndex?: number;
    size?: "medium"|"large";
    icon: "source-graph"|"compare";
}

const IconWrapper = styled.div`
  height: 32px;
  width: 32px;
  margin-left: 8px;
`;
const Icon = styled.img`
  height: 32px;
  width: 32px;
`;

const LabelTag = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
`;

const RepoActionButton = ({
    label,
    onClick,
    isLoading,
    isDisabled=false,
    size = "medium",
    icon,
    ...rest
}: ButtonProps): React.ReactElement => {
    const theme = useTheme();

    const iconSvg = useMemo(() => {
      if (icon == "source-graph") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? SourceGraphGray : SourceGraphMediumGray;
        }
        return theme.name == "light" ? SourceGraphGray : SourceGraphWhite;
      }

      if (icon == "compare") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? CompareGray : CompareMediumGray;
        }
        return theme.name == "light" ? CompareGray : CompareWhite;
      }

    }, [[size, isDisabled, isLoading, theme.name, icon]]);

    const onClickCB = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (isDisabled) {
        return;
      }
        if (!isLoading) {
            onClick?.(event);
        }
    }, [isLoading, isDisabled]);

    const cursor = useMemo(() => {
      if (isDisabled) {
        return 'not-allowed';
      }
        if (isLoading) {
            return 'progress';
        }
        return 'pointer';

    }, [isLoading, isDisabled]);

    const maxWidth = useMemo(() => {
      if (size == "medium") {
        return 220;
      }
      return 486;
    }, [size])

    return (
      <button
        className={css`
          padding: 0;
          margin: 0;
          transition: box-shadow 300ms;
          position: relative;
          background-color: ${isDisabled ? (theme.name == "light" ? ColorPalette.lightGray : ColorPalette.darkGray) : theme.background};
          border: 1px solid black;
          color: ${colorPalette.white};
          font-family: "MavenPro";
          font-weight: 600;
          font-size: ${size == "medium" ? "1.44rem" : "1.7rem"};
          max-width: ${maxWidth}px;
          height: 64px;
          width: 100%;
          border-radius: 8px;
          border: none;
          outline: 0;
          cursor: ${cursor};
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          border: 2px solid ${isDisabled ? (theme.name == "light" ? ColorPalette.gray : ColorPalette.mediumGray) : theme.colors.contrastTextLight};
          box-shadow: 0px 2px 4px 2px ${theme.name == "light" ? colorPalette.gray.substring(0, 7) + Opacity[50] : colorPalette.black.substring(0, 7) + Opacity[50]};
          ${isDisabled || isLoading ? `` : `
            &:hover {
              box-shadow: 0px 1px 2px 1px ${theme.name == "light" ? colorPalette.gray.substring(0, 7) + Opacity[50] : colorPalette.black.substring(0, 7) + Opacity[50]};
            }
          `}
        `}
        onClick={onClickCB}
        {...rest}
      >
        <IconWrapper>
          <Icon src={iconSvg}/>

        </IconWrapper>
        {!isLoading && (
          <div
            className={css`
              flex-grow: 1;
              display: flex;
              justify-content: center;
              align-items: center;
              color: ${theme.colors.contrastTextLight};
              margin-right: 8px;
            `}
          >
            <LabelTag
            style={{
              color: isDisabled ? (theme.name == "light" ? ColorPalette.gray : ColorPalette.mediumGray) : theme.colors.contrastTextLight
            }}

            >{label}</LabelTag>
          </div>
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
            <DotsLoader color={theme.name == "light" ? "gray" : "white"} size={"medium"} />
          </div>
        )}
      </button>
    );
}

export default React.memo(RepoActionButton);