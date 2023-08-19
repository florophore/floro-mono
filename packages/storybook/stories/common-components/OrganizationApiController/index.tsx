import React from "react";
import SideNavWrapper from "../navs/SideNavWrapper";
import styled from "@emotion/styled";
import Button from "../../design-system/Button";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";

const RelativeWrapper = styled.div`
  height: 100%;
  position: relative;
  flex: 1;
  background: ${(props) => props.theme.background};
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 80px;
  width: 100%;
  height: 80px;
  background: ${(props) =>
    `linear-gradient(${props.theme.gradients.backgroundNoOpacity}, ${props.theme.gradients.backgroundFullOpacity});`}
  pointer-events: none;
`;

const Container = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TopWrapper = styled.div`
  flex: 1;
  background: ${(props) => props.theme.background};
  max-height: calc(100% - 80px);
  overflow: scroll;
  padding-bottom: 80px;
  padding-top: 12px;
`;

const BottomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  padding-bottom: 16px;
  height: 80px;
  box-sizing: border-box;
  background: ${(props) => props.theme.background};
`;

const RowContainer = styled.div`
  height: 64px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  cursor: pointer;
  background: ${(props) => props.theme.background};
`;
const DisplayName = styled.h6`
  display: inline-block;
  margin-left: 8px;
  margin-right: 8px;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  width: 100%;
`;

export interface Props {
  page: "remote-api" | "remote-webhook";
  children: React.ReactElement;
  orgLink: string;
  onClickCreateApiKey?: () => void;
  onClickCreateWebhookDomain?: () => void;
}

const OrganizationApiController = (props: Props) => {
  const theme = useTheme();

  return (
    <SideNavWrapper
      nav={
        <RelativeWrapper>
          <Container>
            <TopWrapper>
              <Link to={`${props.orgLink}/remote/api`}>
                <RowContainer>
                  <DisplayName
                    style={{
                      color:
                        props.page == "remote-api"
                          ? theme.colors.selectedPluginRow
                          : theme.colors.unselectedPluginRow,
                    }}
                  >{`Remote API Keys`}</DisplayName>
                </RowContainer>
              </Link>
              <Link to={`${props.orgLink}/remote/webhooks`}>
                <RowContainer>
                  <DisplayName
                    style={{
                      color:
                        props.page == "remote-webhook"
                          ? theme.colors.selectedPluginRow
                          : theme.colors.unselectedPluginRow,
                    }}
                  >{`Remote Webhooks`}</DisplayName>
                </RowContainer>
              </Link>
            </TopWrapper>
            <BottomWrapper>
              {props.page == "remote-api" && (
                <Button
                  label={"create api key"}
                  bg={"teal"}
                  size={"medium"}
                  textSize={"small"}
                  onClick={props.onClickCreateApiKey}
                />
              )}
              {props.page == "remote-webhook" && (
                <Button
                  label={"register webhook domain"}
                  bg={"orange"}
                  size={"medium"}
                  textSize={"small"}
                  onClick={props.onClickCreateWebhookDomain}
                />
              )}
            </BottomWrapper>
          </Container>
          <GradientOverlay />
        </RelativeWrapper>
      }
    >
      {props.children}
    </SideNavWrapper>
  );
};

export default React.memo(OrganizationApiController);
