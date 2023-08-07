import React, { useMemo, useCallback, useState } from "react";
import {
  Plugin,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import { ComparisonState, RemoteCommitState, useBeforeCommitState, useRemoteCompareFrom, useViewMode } from "../hooks/remote-state";
import RemotePluginEditor from "./RemotePluginEditor";
import ColorPalette from "@floro/styles/ColorPalette";
import { RepoPage } from "../../types";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow: scroll;
  padding: 24px 40px 48px 40px;
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

const Icon = styled.img`
  width: 80px;
  height: 80px;
  margin-right: 24px;
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
  min-height: 184px;
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
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  page: RepoPage;
}

const RemoteHomeRead = (props: Props) => {

  const theme = useTheme();
  const { compareFrom } = useRemoteCompareFrom();
  const beforeCommitState = useBeforeCommitState(props.repository, props.page);
  const viewMode = useViewMode(props.page);
  const plugins = useMemo(() => {
    if (viewMode == "compare" && compareFrom == "before") {
      return props.comparisonState?.beforeRemoteCommitState?.renderedState?.plugins ?? [];
    }
    return props.remoteCommitState?.renderedState?.plugins ?? [];
  }, [
    props.remoteCommitState?.renderedState,
    props.comparisonState?.beforeRemoteCommitState?.renderedState,
    viewMode,
    compareFrom
  ]);

  const descriptionChanges = useMemo((): Set<number> => {
    if (viewMode != "compare") {
      return new Set<number>([]);
    }
    if (compareFrom == "before") {
      return new Set<number>(props?.comparisonState?.apiDiff?.description?.removed ?? []);
    }
    return new Set<number>(props?.comparisonState?.apiDiff?.description?.added ?? []);
  }, [
    viewMode,
    compareFrom,
    props?.comparisonState?.apiDiff?.description?.added,
    props?.comparisonState?.apiDiff?.description?.removed,
  ]);

  const description = useMemo((): string|React.ReactElement => {

    if (viewMode == "compare") {
      if (compareFrom == "before") {
        if ((props?.comparisonState?.beforeRemoteCommitState?.renderedState?.description?.length ?? 0) == 0) {
          return "No description";
        }
        return (
          <>
            {props?.comparisonState?.beforeRemoteCommitState?.renderedState?.description?.map(
              (sentence, index) => {
                return (
                  <React.Fragment key={index}>
                    <span
                      style={{
                        background: descriptionChanges.has(index)
                          ? ColorPalette.lightRed
                          : "none",
                        color: descriptionChanges.has(index)
                          ? ColorPalette.black
                          : theme.colors.contrastText,
                        fontWeight: descriptionChanges.has(index) ? 500 : 400,
                        paddingLeft: descriptionChanges.has(index)  ? 4 : 0,
                        paddingRight: descriptionChanges.has(index) ? 4 : 0,
                      }}
                    >
                      {sentence}
                    </span>{" "}
                  </React.Fragment>
                );
              }
            )}
          </>
        );
      }
      if ((props?.remoteCommitState?.renderedState?.description?.length ?? 0) == 0) {
        return "No description";
      }
      return (
        <>
          {props.remoteCommitState.renderedState.description.map(
            (sentence, index) => {
              return (
                <React.Fragment key={index}>
                  <span
                    style={{
                      background: descriptionChanges.has(index)
                        ? ColorPalette.lightTeal
                        : "none",
                      color: descriptionChanges.has(index)
                        ? ColorPalette.black
                        : theme.colors.contrastText,
                      fontWeight: descriptionChanges.has(index)
                        ? 500
                        : 400,
                      paddingLeft: descriptionChanges.has(index)
                        ? 4
                        : 0,
                      paddingRight: descriptionChanges.has(index)
                        ? 4
                        : 0,
                    }}
                  >
                    {sentence}
                  </span>{" "}
                </React.Fragment>
              );
            }
          )}
        </>
      );
    }
    return props?.remoteCommitState?.renderedState.description.join(" ");
  }, [
    props?.remoteCommitState?.renderedState.description,
    props?.comparisonState?.beforeRemoteCommitState?.renderedState?.description,
    viewMode,
    compareFrom,
    descriptionChanges,
    theme
  ]);

  const hasNoLicense = useMemo(() => {
    if (viewMode == "compare" && compareFrom == "before") {
      return (props?.comparisonState?.beforeRemoteCommitState?.renderedState?.licenses?.length ?? 0) == 0;
    }
    return (props?.remoteCommitState?.renderedState.licenses?.length ?? 0) == 0;
  }, [
    props?.remoteCommitState?.renderedState.licenses,
    props?.comparisonState?.beforeRemoteCommitState?.renderedState?.licenses,
    compareFrom,
    viewMode,
  ]);

  const licensesChanges = useMemo((): Set<number> => {
    if (viewMode != "compare") {
      return new Set<number>([]);
    }
    if (compareFrom == "before") {
      return new Set<number>(props?.comparisonState?.apiDiff?.licenses?.removed ?? []);
    }
    return new Set<number>(props?.comparisonState?.apiDiff?.licenses?.added ?? []);
  }, [
    viewMode,
    compareFrom,
    props?.comparisonState?.apiDiff?.licenses?.added,
    props?.comparisonState?.apiDiff?.licenses?.removed,
  ]);


  const licenses = useMemo(() => {

    if (
      viewMode == "compare") {
      if (compareFrom == "before") {
        return (
          <BlurbBox style={{ paddingTop: 0, paddingBottom: 0 }}>
            {hasNoLicense && (
              <NoLicenseContainer>
                <NoLicensesText>{"No licenses selected"}</NoLicensesText>
              </NoLicenseContainer>
            )}
            {props?.comparisonState?.beforeRemoteCommitState?.renderedState?.licenses.map((license, index) => {
              return (
                <LicenseRow key={index}>
                  <LicenseTitle
                  style={{
                    color: licensesChanges.has(index)
                      ? theme.colors.removedText
                      : theme.colors.contrastText,
                  }}
                  >{license.value}</LicenseTitle>
                </LicenseRow>
              );
            })}
          </BlurbBox>
        );
      }
      return (
        <BlurbBox style={{ paddingTop: 0, paddingBottom: 0 }}>
          {hasNoLicense && (
            <NoLicenseContainer>
              <NoLicensesText>{"No licenses selected"}</NoLicensesText>
            </NoLicenseContainer>
          )}
          {props.remoteCommitState.renderedState.licenses.map((license, index) => {
            return (
              <LicenseRow key={index}>
                <LicenseTitle
                  style={{
                    color: licensesChanges.has(index)
                      ? theme.colors.addedText
                      : theme.colors.contrastText,
                  }}
                >
                  {license.value}
                </LicenseTitle>
              </LicenseRow>
            );
          })}
        </BlurbBox>
      );
    }

    return (
      <BlurbBox style={{ paddingTop: 0, paddingBottom: 0 }}>
        {hasNoLicense && (
          <NoLicenseContainer>
            <NoLicensesText>{"No licenses selected"}</NoLicensesText>
          </NoLicenseContainer>
        )}
        {props?.remoteCommitState?.renderedState.licenses.map((license, index) => {
          return (
            <LicenseRow key={index}>
              <LicenseTitle>{license.value}</LicenseTitle>
            </LicenseRow>
          );
        })}
      </BlurbBox>
    );
  }, [
    props?.remoteCommitState?.renderedState?.licenses,
    props?.comparisonState?.beforeRemoteCommitState?.renderedState?.licenses,
    hasNoLicense,
    licensesChanges,
    viewMode,
    compareFrom,
    theme
  ])

  const hasNoPlugins = useMemo(() => {
    return (plugins?.length ?? 0) == 0;
  }, [plugins]);

  return (
    <Container>
      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Description"}</SectionTitle>
          </SectionTitleWrapper>
        </SectionRow>
        <BlurbBox>
          <BlurbText>{description}</BlurbText>
        </BlurbBox>
      </BigSectionContainer>
      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Licenses"}</SectionTitle>
          </SectionTitleWrapper>
        </SectionRow>
        {licenses}
      </BigSectionContainer>
      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Installed Plugins"}</SectionTitle>
          </SectionTitleWrapper>
        </SectionRow>
        <BlurbBox style={{ padding: 0 }}>
          {hasNoPlugins && (
            <NoLicenseContainer>
              <NoLicensesText>{"No plugins installed"}</NoLicensesText>
            </NoLicenseContainer>
          )}
          {plugins.length > 0 && (
            <RemotePluginEditor
              repository={props.repository}
              remoteCommitState={props.remoteCommitState}
              comparisonState={props.comparisonState}
              page={props.page}
            />
          )}
        </BlurbBox>
      </BigSectionContainer>
    </Container>
  );
};

export default React.memo(RemoteHomeRead);