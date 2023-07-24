import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  Repository,
  useUpdateAutomaticallyDeleteMergedFeatureBranchesMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ColorPalette } from "@floro/styles/ColorPalette";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";

const Container = styled.div`
  margin-top: 24px;
  width: 100%;
  max-width: 960px;
  padding: 16px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  border-radius: 8px;
`;

const Title = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const TitleSpan = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const LeftContainer = styled.div`
  margin-right: 12px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const SubTitle = styled.p`
  margin-top: 8px;
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.standardTextLight};
`;

const BottomContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
`;

interface Props {
  repository: Repository;
}

const AutormaticallyDeleteMergedFeatureBranchesSetting = (props: Props) => {
  const [automaticallyDeleteMergedFeatureBranches, setAutomaticallyDeleteMergedFeatureBranches] =
    useState<boolean>(false);
  const theme = useTheme();
  const [
    automaticallyDeleteMergedFeatureBranchesMutation,
    automaticallyDeleteMergedFeatureBranchesRequest,
  ] = useUpdateAutomaticallyDeleteMergedFeatureBranchesMutation();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setAutomaticallyDeleteMergedFeatureBranches(
      props.repository?.protectedBranchRule?.automaticallyDeleteMergedFeatureBranches ?? false
    );
  }, [props.repository?.protectedBranchRule?.disableDirectPushing]);

  const onChange = useCallback(() => {
    if (props.repository?.id && props?.repository?.protectedBranchRule?.id) {
      setAutomaticallyDeleteMergedFeatureBranches(!automaticallyDeleteMergedFeatureBranches);
      automaticallyDeleteMergedFeatureBranchesMutation({
        variables: {
          repositoryId: props.repository?.id,
          protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
          automaticallyDeleteMergedFeatureBranches: !automaticallyDeleteMergedFeatureBranches,
        },
      });
    }
  }, [automaticallyDeleteMergedFeatureBranches, props.repository]);

  return (
    <Container>
      <MainContainer>
        <LeftContainer>
          <Checkbox
            isChecked={automaticallyDeleteMergedFeatureBranches}
            onChange={onChange}
          />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Automatically Delete Merged Feature Branches"}</Title>
            {automaticallyDeleteMergedFeatureBranchesRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {
              "Delete feature branches (if possible) after remotely merging."
            }
          </SubTitle>
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(AutormaticallyDeleteMergedFeatureBranchesSetting);