import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';
import { useTheme } from '@emotion/react';
import BranchIconLight from '@floro/common-assets/assets/images/icons/branch_icon.light.svg';
import BranchIconDark from '@floro/common-assets/assets/images/icons/branch_icon.dark.svg';

import CommitIconLight from '@floro/common-assets/assets/images/icons/commit_icon.light.svg';
import CommitIconDark from '@floro/common-assets/assets/images/icons/commit_icon.dark.svg';
import Button from '../../design-system/Button';
import { Branch, CommitData } from '@floro/floro-lib/src/repo';
import { Repository } from '@floro/graphql-schemas/build/generated/main-graphql';
import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    border: 2px solid ${props => props.theme.colors.contrastTextLight};
    padding: 8px;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
`;

const TitleSpan = styled.span`
    font-size: 1.7rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.titleText};
    white-space: nowrap;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LeftRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 188px;
`;

const RightRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 252px;
`;

const Icon = styled.img`
    width: 32px;
    height: 32px;
    margin-right: 12px;
`;

const NoIcon = styled.div`
    width: 32px;
    height: 32px;
    margin-right: 12px;
`;

const LabelSpan = styled.span`
    font-size: 1.1rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.contrastTextLight};
    white-space: nowrap;
`;

const ValueSpan = styled.span`
    font-size: 1rem;
    font-family: "MavenPro";
    font-weight: 500;
    color: ${props => props.theme.colors.contrastText};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const ValueItalicSpan = styled.span`
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 700;
    font-style: italic;
    color: ${props => props.theme.colors.contrastText};
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const GoBackIcon = styled.img`
    width: 32px;
    height: 32px;
    cursor: pointer;
`;

export interface Props {
  respository: Repository;
  showWIP?: boolean;
  isWIP?: boolean;
  branch?: Branch;
  baseBranch?: Branch;
  lastCommit?: CommitData;
  showBranchButtons?: boolean;
  onShowBranches?: () => void;
  onShowEditBranch?: () => void;
  showBackButton?: boolean;
  onGoBack?: () => void;
}

const CurrentInfo = (props: Props): React.ReactElement => {
  const showWIP = props.showWIP ?? false;
  const theme = useTheme();
  const branchIcon = useMemo(() => {
    if (theme.name == "light") {
      return BranchIconLight;
    }
    return BranchIconDark;
  }, [theme.name]);

  const commitIcon = useMemo(() => {
    if (theme.name == "light") {
      return CommitIconLight;
    }
    return CommitIconDark;
  }, [theme.name]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const commitShaShort = useMemo(() => {
    if (props.lastCommit) {
      return props.lastCommit?.sha?.substring?.(0, 4) ?? null;
    }
    return null;
  }, [props.lastCommit]);

  return (
    <Container>
      <Row style={{marginBottom: 16, height: 40}}>
        <span>
          <TitleSpan style={{color: theme.colors.contrastTextLight}}>{'Repository: '}</TitleSpan>
          <TitleSpan style={{fontWeight: 500}}>{props.respository.name}</TitleSpan>
        </span>
        {props.showBackButton &&
          <GoBackIcon src={backArrowIcon} onClick={props.onGoBack}/>
        }
      </Row>
      <Row>
        <LeftRow>
          <Icon src={branchIcon} />
          <LabelSpan>Current branch:</LabelSpan>
        </LeftRow>
        <RightRow>
          {props.branch &&
            <ValueSpan>{props.branch.name}</ValueSpan>
          }
          {!props.branch &&
            <ValueSpan>{"None"}</ValueSpan>
          }
        </RightRow>
      </Row>
      {props.branch &&
        <Row style={{ marginTop: 6 }}>
          <LeftRow>
            <NoIcon />
            <LabelSpan>Base branch:</LabelSpan>
          </LeftRow>
          <RightRow>
            {props.baseBranch &&
              <ValueSpan>{props.baseBranch?.name}</ValueSpan>
            }
            {!props.baseBranch &&
              <ValueSpan>{"None"}</ValueSpan>
            }
          </RightRow>
        </Row>
      }
      <Row style={{ marginTop: 12 }}>
        <LeftRow>
          <Icon src={commitIcon} />
          <LabelSpan>Last commit:</LabelSpan>
        </LeftRow>
        <RightRow>
          {props.lastCommit && (
            <ValueSpan>
              {commitShaShort && (
                <ValueItalicSpan style={{ marginRight: 8 }}>
                  {`(${commitShaShort})`}
                </ValueItalicSpan>
              )}
              {
                props.lastCommit?.message
              }
            </ValueSpan>
          )}
          {!props.lastCommit && (
            <ValueSpan>
              {
                "None"
              }
            </ValueSpan>
          )}
        </RightRow>
      </Row>
      {showWIP && (
        <Row style={{ marginTop: 6 }}>
          <LeftRow>
            <NoIcon />
            <LabelSpan>WIP status:</LabelSpan>
          </LeftRow>
          <RightRow>
            <ValueItalicSpan>
              {props.isWIP ? "In progress" : "No changes"}
            </ValueItalicSpan>
          </RightRow>
        </Row>
      )}
      {props.showBranchButtons &&
        <ButtonRow style={{ marginTop: 16 }}>
          <Button
            label={"branches"}
            bg={"purple"}
            size={"medium"}
            onClick={props.onShowBranches}
          />
          <Button
            label={"edit branch"}
            bg={"orange"}
            size={"medium"}
            onClick={props.onShowEditBranch}
          />
        </ButtonRow>
      }
    </Container>
  );
};

export default React.memo(CurrentInfo);
