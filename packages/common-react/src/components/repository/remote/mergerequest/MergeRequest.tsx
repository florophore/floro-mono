
import React, { useMemo, useCallback, useState, useRef } from "react";
import {
  Plugin,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import { ComparisonState, RemoteCommitState, useBeforeCommitState, useRemoteCompareFrom, useViewMode } from "../hooks/remote-state";
import ColorPalette from "@floro/styles/ColorPalette";
import { RepoPage } from "../../types";
import EditIconLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditIconDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import { useMergeRequestNavContext } from "./MergeRequestContext";
import Timeline from "./Timeline";
import CreateComment from "./comments/CreateComment";
import MainPageComments from "./comments/MainPageComments";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow: scroll;
  padding: 24px 40px 80px 24px;
  user-select: text;

  ::-webkit-scrollbar {
    width: 4px;
    background: ${props => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${props => props.theme.background};
  }
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 528px;
  margin-bottom: 48px;
`;

const EditIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-left: 24px;
  cursor: pointer;
`;

const LineWrapRow = styled.span`
  display: inline-flex;
  align-items: center;

`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-stretch: 1;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const ConversationTitle = styled.h2`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const SubTitleWrapper = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SubTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.pluginDisplaySubTitle};
`;

const SectionContainer = styled.div`
  max-width: 528px;
  margin-bottom: 48px;
`;

const BigSectionContainer = styled.div`
  max-width: 624px;
  margin-bottom: 48px;
`;

const SectionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-right: 6px;
  height: 40px;
`;

const SectionTitleWrapper = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const BlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 216px;
`;

const BlurbText = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  display: block;
`;

const NoLicenseContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-height: 184px;
`;

const NoLicensesText = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.blurbBorder};
`;

const LicenseRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 24px;
  height: 32px;
`;

const LicenseTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.blurbBorder};
`;

interface Props {
  repository: Repository;
  page: RepoPage;
}

const MergeRequest = (props: Props) => {
  const theme = useTheme();
  const { isEditting, setIsEditting } = useMergeRequestNavContext();
  const container = useRef<HTMLDivElement>(null);

  const onEdit = useCallback(() => {
    if (
      !props?.repository?.mergeRequest?.mergeRequestPermissions?.canEditInfo
    ) {
      return;
    }
    setIsEditting(true);
  }, [props?.repository?.mergeRequest?.mergeRequestPermissions?.canEditInfo]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditIconLight;
    }

    return EditIconDark;
  }, [theme.name]);

  return (
    <Container ref={container}>
      <BigSectionContainer style={{ marginBottom: 24 }}>
        <LineWrapRow>
          <Title>{props.repository?.mergeRequest?.title ?? ""}</Title>
          {!isEditting &&
            props?.repository?.mergeRequest?.mergeRequestPermissions
              ?.canEditInfo && <EditIcon src={editIcon} onClick={onEdit} />}
        </LineWrapRow>
      </BigSectionContainer>
      <BigSectionContainer style={{ marginBottom: 24 }}>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Description"}</SectionTitle>
          </SectionTitleWrapper>
        </SectionRow>
        <BlurbBox>
          <BlurbText>
            {props?.repository?.mergeRequest?.description ?? ""}
          </BlurbText>
        </BlurbBox>
      </BigSectionContainer>
      {props?.repository?.mergeRequest && (
        <Timeline
          repository={props.repository}
          mergeRequest={props.repository.mergeRequest}
        />
      )}
      {props?.repository?.mergeRequest && (
        <MainPageComments container={container} repository={props.repository}/>
      )}
    </Container>
  );
};

export default React.memo(MergeRequest);