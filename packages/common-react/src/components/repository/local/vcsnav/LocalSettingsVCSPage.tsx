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
import { useParams, useSearchParams } from "react-router-dom";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { useNavigate } from "react-router";
import { RepoPage } from "../../types";
import BranchRuleSelector from "@floro/storybook/stories/repo-components/BranchRuleSelector";
import { Branch } from "floro/dist/src/repo";

import BranchRuleIcon from "@floro/common-assets/assets/images/icons/branch_rule.dark.svg";
import { useLocalVCSNavContext } from "./LocalVCSContext";

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

interface Props {
  repository: Repository;
}

const LocalSettingsVCSPage = (props: Props) => {
  const theme = useTheme();
  const { setShowLocalSettings } = useLocalVCSNavContext();


  const onGoBack = useCallback(() => {
    setShowLocalSettings(false);
  }, []);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);
  return (
    <>
      <InnerContent>
        <TopContainer>
          <TitleRow>
            <TitleSpan
              style={{
                paddingTop: 6,
              }}
            >
              {"Local Repository Settings"}
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
                  <span>{"delete local repository"}</span>
                </div>
              }
              bg={"red"}
              size={"extra-big"}
            />
          </div>
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(LocalSettingsVCSPage);
