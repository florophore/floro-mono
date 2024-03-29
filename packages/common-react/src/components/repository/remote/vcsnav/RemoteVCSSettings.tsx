import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  ProtectedBranchRule,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import { RemoteCommitState } from "../hooks/remote-state";
import { useParams, useSearchParams } from "react-router-dom";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router";
import { RepoPage } from "../../types";
import BranchRuleSelector from "@floro/storybook/stories/repo-components/BranchRuleSelector";
import { Branch } from "floro/dist/src/repo";

import BranchRuleIcon from "@floro/common-assets/assets/images/icons/branch_rule.dark.svg";
import CreateBranchRuleModal from "../settings/warning_modals/CreateBranchRuleModal";

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 16px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 24px 16px;
`;

const TitleSpan = styled.span`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.titleText};
  white-space: nowrap;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const GoBackIcon = styled.img`
  width: 32px;
  height: 32px;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-top: 24px;
`;

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 184px;
  position: relative;
  display: grid;
  width: 100%;
  margin: 0;

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
    font-weight: 400;
    font-size: 1rem;
    display: block;
    margin-top: -38px;
  }
`;

const BlurbTextArea = styled.textarea`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  resize: none;
  background: none;
  width: 100%;
  padding: 0;
  height: 184px;
  outline: none;
  border: none;
  margin: 0;
  resize: none;
  background: none;
  appearance: none;
`;

const BlurbPlaceholder = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  position: absolute;
  top: 0;
  left: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  left: 16px;
  top: 16px;
  pointer-events: none;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

export const getBranchIdFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[[\]'"]/g, "");
};

interface Props {
  repository: Repository;
  plugin: string;
}

const RemoteVCSSettings = (props: Props) => {
  const theme = useTheme();

  const navigate = useNavigate();
  const [showCreateBranchRule, setShowCreateBranchRule] = useState(false);

  const onShowDeleteBranchRule = useCallback(() => {
    setShowCreateBranchRule(true);
  }, []);

  const onHideDeleteBranchRule = useCallback(() => {
    setShowCreateBranchRule(false);
  }, []);

  const linkBase = useRepoLinkBase(props.repository);
  const onBranchRuleCreate = useCallback((branchRule: ProtectedBranchRule) => {
    setShowCreateBranchRule(false);
    navigate(`${linkBase}/settings/branchrules/${branchRule?.id}?from=remote&plugin=${props.plugin ?? "home"}`);
  }, [linkBase]);
  const homeLink = useMemo(() => {
    return `${linkBase}?from=remote&plugin=${props.plugin ?? "home"}`;
  }, [linkBase, props.plugin]);

  const onGoBack = useCallback(() => {
    navigate(homeLink);
  }, [homeLink]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);


  const branchRuleBranchIds = useMemo(() => {
    return new Set(props?.repository?.protectedBranchRules?.map(br => br?.branchId));
  }, [props?.repository?.protectedBranchRules]);

  const branchesWithoutBranchRules = useMemo((): Array<Branch> => {
    return props?.repository?.repoBranches?.filter(b => {
      return !branchRuleBranchIds.has(b?.id as string);
    }) as Array<Branch> ?? ([] as Array<Branch>);
  }, [props?.repository?.repoBranches, branchRuleBranchIds]);

  const createBranchRuleEnabled = useMemo(() => {
    return branchesWithoutBranchRules.length > 0;
  }, [branchesWithoutBranchRules]);

  const onSelectBranchRule = useCallback(
    (branchRule: ProtectedBranchRule | null) => {
      if (branchRule) {
        navigate(`${linkBase}/settings/branchrules/${branchRule?.id}?from=remote&plugin=${props.plugin ?? "home"}`);
      }
    },
    [linkBase, props.plugin]
  );

  return (
    <>
      <CreateBranchRuleModal
        repository={props.repository}
        onDismiss={onHideDeleteBranchRule}
        onSuccess={onBranchRuleCreate}
        show={showCreateBranchRule}
      />
      <InnerContent>
        <TopContainer>
          <TitleRow>
            <TitleSpan
              style={{
                paddingTop: 6,
              }}
            >
              {"Repository Settings"}
            </TitleSpan>
            <div
              style={{
                paddingRight: 10,
                paddingTop: 14,
              }}
            >
              <GoBackIcon src={backArrowIcon} onClick={onGoBack} />
            </div>
          </TitleRow>
          <Row>
            <BranchRuleSelector
              size="wide"
              branchRules={props?.repository?.protectedBranchRules ?? []}
              branchRule={null}
              onChangeBranchRule={onSelectBranchRule}
            />
          </Row>
        </TopContainer>
        <BottomContainer>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={onShowDeleteBranchRule}
              isDisabled={!createBranchRuleEnabled}
              label={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingLeft: 24,
                    paddingRight: 36,
                  }}
                >
                  <img
                    style={{
                      height: 32,
                      width: 32,
                      marginRight: 16,
                    }}
                    src={BranchRuleIcon}
                  />
                  <span>{"create branch rule"}</span>
                </div>
              }
              bg={"purple"}
              size={"extra-big"}
            />
          </div>
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(RemoteVCSSettings);
