import React, {
  useCallback,
  useState,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  Repository,
  RepositoryEnabledWebhookKey,
  WebhookKey,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import RemoteWebhookRow from "./RemoteWebhookRow";
import CreateRemoteWebhookModal from "./modals/CreateRemoteWebhookModal";

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
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const SubContainer = styled.div`
  width: 100%;
  padding: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  border-radius: 8px;
  position: relative;
`;

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justift-content: space-between;
  position: relative;
`;

const LeftContainer = styled.div`
  margin-right: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
const PlaceholderText = styled.span`
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  margin-top: 8px;
  margin-left: 6px;
  color: ${(props) => props.theme.colors.standardTextLight};
`;

const LabelContainer = styled.div`
  position: absolute;
  top: -16px;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
  color: ${(props) => props.theme.colors.inputLabelTextColor};
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
  color: ${(props) => props.theme.colors.inputLabelTextColor};
`;
const VerificationIcon = styled.img`
  height: 24px;
  width: 24px;
`;
const CheckRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  align-items: center;
`;

const PermissionText = styled.div`
  margin-left: 16px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  margin-top: -2px;
`;

interface Props {
  repository: Repository;
  webhookKeys: WebhookKey[];
}

const RemoteEnabledWebhookKeys = (props: Props) => {
  const theme = useTheme();

  const [showCreate, setShowCreate] = useState(false);

  const onShowCreate = useCallback(() => {
    setShowCreate(true);
  }, []);

  const onHideCreate = useCallback(() => {
    setShowCreate(false);
  }, []);

  return (
    <>
      <CreateRemoteWebhookModal
        repository={props.repository}
        webhookKeys={props?.webhookKeys}
        show={showCreate}
        onDismissModal={onHideCreate}
      />
      <Container>
        <Title>{"Enabled Webhooks"}</Title>
        <SubTitle>
          {`Register the remote webhooks you would like to enable for remote acces to this repository. If you do not have any remote webhook domains setup, you may go to ${
            props.repository.repoType == "user_repo"
              ? `your`
              : `${props.repository.organization?.name}'s`
          } developer settings where you can register remote webhook domains.`}
        </SubTitle>
        <BottomContainer style={{ marginTop: 18 }}>
          <SubContainer>
            <LabelContainer>
              <LabelBorderEnd style={{ left: -1 }} />
              <LabelText>{"webhooks"}</LabelText>
              <LabelBorderEnd style={{ right: -1 }} />
            </LabelContainer>
            <MainContainer>
              <LeftContainer>
                {props.repository?.enabledWebhookKeys?.length == 0 && (
                  <PlaceholderText>{"No Enabled Webhooks"}</PlaceholderText>
                )}
                <div>
                  {props.repository?.enabledWebhookKeys?.map(
                    (enabledWebhookKey, index) => {
                      return (
                        <RemoteWebhookRow
                          key={index}
                          enabledWebhook={
                            enabledWebhookKey as RepositoryEnabledWebhookKey
                          }
                          repository={props.repository}
                          webhookKeys={props.webhookKeys}
                          isFirst={index == 0}
                        />
                      );
                    }
                  )}
                </div>
              </LeftContainer>
              <RightContainer>
                <div style={{ width: 120 }}>
                  <Button
                    onClick={onShowCreate}
                    label={"add"}
                    bg={"orange"}
                    size={"small"}
                  />
                </div>
              </RightContainer>
            </MainContainer>
          </SubContainer>
        </BottomContainer>
      </Container>
    </>
  );
};

export default React.memo(RemoteEnabledWebhookKeys);
