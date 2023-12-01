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

import HomeWhite from '@floro/common-assets/assets/images/repo_icons/home.white.svg';
import HomeGray from '@floro/common-assets/assets/images/repo_icons/home.gray.svg';
import HomeMediumGray from '@floro/common-assets/assets/images/repo_icons/home.medium_gray.svg';

import CompareWhite from '@floro/common-assets/assets/images/repo_icons/compare.white.svg';
import CompareGray from '@floro/common-assets/assets/images/repo_icons/compare.gray.svg';
import CompareMediumGray from '@floro/common-assets/assets/images/repo_icons/compare.medium_gray.svg';

import SettingsWhite from '@floro/common-assets/assets/images/repo_icons/settings.white.svg';
import SettingsGray from '@floro/common-assets/assets/images/repo_icons/settings.gray.svg';
import SettingsMediumGray from '@floro/common-assets/assets/images/repo_icons/settings.medium_gray.svg';

import StashWhite from '@floro/common-assets/assets/images/repo_icons/stash.white.svg';
import StashGray from '@floro/common-assets/assets/images/repo_icons/stash.gray.svg';
import StashMediumGray from '@floro/common-assets/assets/images/repo_icons/stash.medium_gray.svg';

import StashPopWhite from '@floro/common-assets/assets/images/repo_icons/stash_pop.white.svg';
import StashPopGray from '@floro/common-assets/assets/images/repo_icons/stash_pop.gray.svg';
import StashPopMediumGray from '@floro/common-assets/assets/images/repo_icons/stash_pop.medium_gray.svg';

import DiscardWhite from '@floro/common-assets/assets/images/repo_icons/discard.white.svg';
import DiscardGray from '@floro/common-assets/assets/images/repo_icons/discard.gray.svg';
import DiscardMediumGray from '@floro/common-assets/assets/images/repo_icons/discard.medium_gray.svg';

import CommitWhite from '@floro/common-assets/assets/images/repo_icons/commit.white.svg';
import CommitGray from '@floro/common-assets/assets/images/repo_icons/commit.gray.svg';
import CommitMediumGray from '@floro/common-assets/assets/images/repo_icons/commit.medium_gray.svg';

import MergeWhite from '@floro/common-assets/assets/images/repo_icons/merge.white.svg';
import MergeGray from '@floro/common-assets/assets/images/repo_icons/merge.gray.svg';
import MergeMediumGray from '@floro/common-assets/assets/images/repo_icons/merge.medium_gray.svg';

import ResolveWhite from '@floro/common-assets/assets/images/repo_icons/resolve.white.svg';
import ResolveGray from '@floro/common-assets/assets/images/repo_icons/resolve.gray.svg';
import ResolveMediumGray from '@floro/common-assets/assets/images/repo_icons/resolve.medium_gray.svg';

import AbortWhite from '@floro/common-assets/assets/images/repo_icons/abort.white.svg';
import AbortGray from '@floro/common-assets/assets/images/repo_icons/abort.gray.svg';
import AbortMediumGray from '@floro/common-assets/assets/images/repo_icons/abort.medium_gray.svg';

import SurgeryWhite from '@floro/common-assets/assets/images/repo_icons/surgery.white.svg';
import SurgeryGray from '@floro/common-assets/assets/images/repo_icons/surgery.gray.svg';
import SurgeryMediumGray from '@floro/common-assets/assets/images/repo_icons/surgery.medium_gray.svg';

import AmendWhite from '@floro/common-assets/assets/images/repo_icons/amend.white.svg';
import AmendGray from '@floro/common-assets/assets/images/repo_icons/amend.gray.svg';
import AmendMediumGray from '@floro/common-assets/assets/images/repo_icons/amend.medium_gray.svg';

import AutoFixWhite from '@floro/common-assets/assets/images/repo_icons/auto_fix.white.svg';
import AutoFixGray from '@floro/common-assets/assets/images/repo_icons/auto_fix.gray.svg';
import AutoFixMediumGray from '@floro/common-assets/assets/images/repo_icons/auto_fix.medium_gray.svg';

import RevertWhite from '@floro/common-assets/assets/images/repo_icons/revert.white.svg';
import RevertGray from '@floro/common-assets/assets/images/repo_icons/revert.gray.svg';
import RevertMediumGray from '@floro/common-assets/assets/images/repo_icons/revert.medium_gray.svg';

import CherryPickWhite from '@floro/common-assets/assets/images/repo_icons/cherry_pick.white.svg';
import CherryPickGray from '@floro/common-assets/assets/images/repo_icons/cherry_pick.gray.svg';
import CherryPickMediumGray from '@floro/common-assets/assets/images/repo_icons/cherry_pick.medium_gray.svg';

import PullWhite from '@floro/common-assets/assets/images/repo_icons/pull.white.svg';
import PullGray from '@floro/common-assets/assets/images/repo_icons/pull.gray.svg';
import PullMediumGray from '@floro/common-assets/assets/images/repo_icons/pull.medium_gray.svg';

import PushWhite from '@floro/common-assets/assets/images/repo_icons/push.white.svg';
import PushGray from '@floro/common-assets/assets/images/repo_icons/push.gray.svg';
import PushMediumGray from '@floro/common-assets/assets/images/repo_icons/push.medium_gray.svg';

import MergeRequestWhite from '@floro/common-assets/assets/images/repo_icons/merge_request.white.svg';
import MergeRequestGray from '@floro/common-assets/assets/images/repo_icons/merge_request.gray.svg';
import MergeRequestMediumGray from '@floro/common-assets/assets/images/repo_icons/merge_request.medium_gray.svg';

import CopyWhite from '@floro/common-assets/assets/images/repo_icons/copy.white.svg';
import CopyGray from '@floro/common-assets/assets/images/repo_icons/copy.gray.svg';
import CopyMediumGray from '@floro/common-assets/assets/images/repo_icons/copy.medium_gray.svg';

import CopyCheckWhite from '@floro/common-assets/assets/images/repo_icons/copy_check.white.svg';
import CopyCheckGray from '@floro/common-assets/assets/images/repo_icons/copy_check.gray.svg';
import CopyCheckMediumGray from '@floro/common-assets/assets/images/repo_icons/copy_check.medium_gray.svg';

import CopyCancelWhite from '@floro/common-assets/assets/images/repo_icons/copy_cancel.white.svg';
import CopyCancelGray from '@floro/common-assets/assets/images/repo_icons/copy_cancel.gray.svg';
import CopyCancelMediumGray from '@floro/common-assets/assets/images/repo_icons/copy_cancel.medium_gray.svg';

import { isPropertySignature } from 'typescript';

export interface ButtonProps {
  label: string;
  subTitle?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  tabIndex?: number;
  size?: "medium" | "large";
  titleTextSize?: "medium"|"small";
  icon:
    | "home"
    | "source-graph"
    | "compare"
    | "settings"
    | "copy"
    | "copy-check"
    | "copy-cancel"
    | "stash"
    | "stash-pop"
    | "discard"
    | "commit"
    | "merge"
    | "merge-request"
    | "surgery"
    | "resolve"
    | "abort"
    | "amend"
    | "auto-fix"
    | "revert"
    | "cherry-pick"
    | "push"
    | "pull";
  showNotification?: boolean;
  notificationCount?: number;
  showSecondaryNotification?: boolean;
  secondaryNotificationCount?: number;
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
const SubTitleTag = styled.p`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 0.85rem;
`;

const NotificationWrapper = styled.div`
  background: red;
  height: 24px;
  width: 24px;
  position: absolute;
  right: 8px;
  top: 4px;
  background: ${ColorPalette.teal};
  border: 2px solid ${props => props.theme.colors.contrastTextLight};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const SecondaryNotificationWrapper = styled.div`
  background: red;
  height: 24px;
  width: 24px;
  position: absolute;
  right: 8px;
  top: 32px;
  background: ${ColorPalette.orange};
  border: 2px solid ${props => props.theme.colors.contrastTextLight};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const NotificationText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 0.85rem;
  color: ${ColorPalette.white};
`;

const RepoActionButton = ({
    label,
    onClick,
    isLoading,
    isDisabled=false,
    showNotification = false,
    showSecondaryNotification = false,
    size = "medium",
    titleTextSize = "medium",
    icon,
    subTitle,
    notificationCount = 0,
    secondaryNotificationCount = 0,
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

      if (icon == "settings") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? SettingsGray : SettingsMediumGray;
        }
        return theme.name == "light" ? SettingsGray : SettingsWhite;
      }
      if (icon == "copy") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? CopyGray : CopyMediumGray;
        }
        return theme.name == "light" ? CopyGray : CopyWhite;
      }

      if (icon == "stash") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? StashGray : StashMediumGray;
        }
        return theme.name == "light" ? StashGray : StashWhite;
      }

      if (icon == "stash-pop") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? StashPopGray : StashPopMediumGray;
        }
        return theme.name == "light" ? StashPopGray : StashPopWhite;
      }

      if (icon == "discard") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? DiscardGray : DiscardMediumGray;
        }
        return theme.name == "light" ? DiscardGray : DiscardWhite;
      }

      if (icon == "merge") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? MergeGray : MergeMediumGray;
        }
        return theme.name == "light" ? MergeGray : MergeWhite;
      }

      if (icon == "merge-request") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? MergeRequestGray : MergeRequestMediumGray;
        }
        return theme.name == "light" ? MergeRequestGray : MergeRequestWhite;
      }

      if (icon == "commit") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? CommitGray : CommitMediumGray;
        }
        return theme.name == "light" ? CommitGray : CommitWhite;
      }

      if (icon == "surgery") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? SurgeryGray : SurgeryMediumGray;
        }
        return theme.name == "light" ? SurgeryGray : SurgeryWhite;
      }

      if (icon == "resolve") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? ResolveGray : ResolveMediumGray;
        }
        return theme.name == "light" ? ResolveGray : ResolveWhite;
      }

      if (icon == "abort") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? AbortGray : AbortMediumGray;
        }
        return theme.name == "light" ? AbortGray : AbortWhite;
      }

      if (icon == "amend") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? AmendGray : AmendMediumGray;
        }
        return theme.name == "light" ? AmendGray : AmendWhite;
      }

      if (icon == "auto-fix") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? AutoFixGray : AutoFixMediumGray;
        }
        return theme.name == "light" ? AutoFixGray : AutoFixWhite;
      }

      if (icon == "revert") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? RevertGray : RevertMediumGray;
        }
        return theme.name == "light" ? RevertGray : RevertWhite;
      }

      if (icon == "cherry-pick") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? CherryPickGray : CherryPickMediumGray;
        }
        return theme.name == "light" ? CherryPickGray : CherryPickWhite;
      }

      if (icon == "pull") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? PullGray : PullMediumGray;
        }
        return theme.name == "light" ? PullGray : PullWhite;
      }

      if (icon == "push") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? PushGray : PushMediumGray;
        }
        return theme.name == "light" ? PushGray : PushWhite;
      }

      if (icon == "copy-check") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? CopyCheckGray : CopyCheckMediumGray;
        }
        return theme.name == "light" ? CopyCheckGray : CopyCheckWhite;
      }

      if (icon == "copy-cancel") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? CopyCancelGray : CopyCancelMediumGray;
        }
        return theme.name == "light" ? CopyCancelGray : CopyCancelWhite;
      }
      if (icon == "home") {
        if (isDisabled && !isLoading) {
          return theme.name == "light" ? HomeGray : HomeMediumGray;
        }
        return theme.name == "light" ? HomeGray : HomeWhite;
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
              margin-right: 24px;
              flex-direction: column;
            `}
          >
            <LabelTag
            style={{
              color: isDisabled ? (theme.name == "light" ? ColorPalette.gray : ColorPalette.mediumGray) : theme.colors.contrastTextLight,
              marginLeft: titleTextSize == "medium" ? 0 : 8
            }}

            >{label}</LabelTag>
            {subTitle && (
              <SubTitleTag style={{
                color: isDisabled ? (theme.name == "light" ? ColorPalette.gray : ColorPalette.mediumGray) : theme.colors.contrastTextLight
              }}>
                {subTitle}
              </SubTitleTag>
            )}
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
        {showNotification && (
          <NotificationWrapper>
            <NotificationText>{notificationCount}</NotificationText>

          </NotificationWrapper>
        )}
        {showSecondaryNotification && (
          <SecondaryNotificationWrapper>
            <NotificationText>{secondaryNotificationCount}</NotificationText>
          </SecondaryNotificationWrapper>
        )}
      </button>
    );
}

export default React.memo(RepoActionButton);