import React, { useMemo, useCallback } from 'react';
import colorPalette, { Opacity } from '@floro/styles/ColorPalette';
import { css } from '@emotion/css';
import DotsLoader from '../../design-system/DotsLoader';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import ColorPalette from '@floro/styles/ColorPalette';

import CircleCheckMark from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.light.svg";
import RedXCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";

export interface ButtonProps {
  isApproved: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  tabIndex?: number;
  size?: "medium" | "large";
  titleTextSize?: "medium"|"small";
}

const IconWrapper = styled.div`
  height: 32px;
  width: 32px;
  margin-right: 8px;
`;
const Icon = styled.img`
  height: 32px;
  width: 32px;
`;

const LabelTag = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  padding: 0;
  margin: 0;
`;
const SubTitleTag = styled.p`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0;
  margin: 0;
`;


const RepoUndoReviewButton = ({
    isApproved = false,
    onClick,
    isLoading,
    isDisabled=false,
    size = "large",
    titleTextSize = "medium",
    ...rest
}: ButtonProps): React.ReactElement => {
    const theme = useTheme();


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
          font-size: ${size == "medium" ? titleTextSize == "medium" ? "1.44rem" : "1.2rem" : "1.7rem"};
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
        {!isLoading && (
          <div
            className={css`
              flex-grow: 1;
              display: flex;
              justify-content: center;
              align-items: center;
              color: ${theme.colors.contrastTextLight};
              margin-left: 24px;
              flex-direction: column;
            `}
          >
            <LabelTag
            style={{
              color: isDisabled ? (theme.name == "light" ? ColorPalette.gray : ColorPalette.mediumGray) : theme.colors.contrastTextLight,
              marginLeft: titleTextSize == "medium" ? 0 : 8
            }}

            >{"Undo Review:"}</LabelTag>
            {isApproved && (
              <SubTitleTag style={{
                color: ColorPalette.teal
              }}>
                {"approved"}
              </SubTitleTag>
            )}
            {!isApproved && (
              <SubTitleTag style={{
                color: theme.colors.warningTextColor
              }}>
                {"blocked"}
              </SubTitleTag>
            )}
          </div>
        )}
        <IconWrapper>
          <Icon src={isApproved ? CircleCheckMark : theme.name == "light" ? RedXCircleLight : RedXCircleDark }/>
        </IconWrapper>
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

export default React.memo(RepoUndoReviewButton);