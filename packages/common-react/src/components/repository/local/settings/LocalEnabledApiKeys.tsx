import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  ProtectedBranchRule,
  RepoBranch,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import TimeAgo from "javascript-time-ago";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

import en from "javascript-time-ago/locale/en";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import { useNavigate } from "react-router";
import ColorPalette from "@floro/styles/ColorPalette";
import { Branch } from "floro/dist/src/repo";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import Button from "@floro/storybook/stories/design-system/Button";
import { useAddEnabledApiKey, useDeleteEnabledApiKey, useEnabledApiKeys } from "./enabled-key-hooks";
import { useApiKeys } from "../../../user_api/local-api-hooks";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import RedXCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";

import VerifiedLight from "@floro/common-assets/assets/images/icons/verified.light.svg";
import VerifiedDark from "@floro/common-assets/assets/images/icons/verified.dark.svg";

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
}

const LocalEnabledApiKeys = (props: Props) => {
  const theme = useTheme();
  const [isEditting, setIsEditting] = useState(false);

  const onEdit = useCallback(() => {
    setIsEditting(true);
  }, []);

  const onDoneEditting = useCallback(() => {
    setIsEditting(false);
  }, []);

  const { data: apiKeys } = useApiKeys();
  const { data: enabledApiKeys } = useEnabledApiKeys(
    props?.repository?.id as string
  );

  const addMutation = useAddEnabledApiKey(props.repository.id as string);
  const removeMutation = useDeleteEnabledApiKey(props.repository.id as string);

  const enabledApiKeyIds = useMemo(
    () => new Set(enabledApiKeys?.map((v) => v.apiKeyId as string)),
    [enabledApiKeys]
  );
  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleLight;
    }
    return RedXCircleDark;
  }, [theme.name]);
  const verifiedIcon = useMemo(() => {
    if (theme.name == "light") {
      return VerifiedLight;
    }
    return VerifiedDark;
  }, [theme.name]);

  const onTurnOnApiKey = useCallback((apiKeyId: string) => {
    addMutation.mutate({
      apiKeyId
    })
  }, []);

  const onTurnOffApiKey = useCallback((apiKeyId: string) => {
    removeMutation.mutate({
      apiKeyId
    });
  }, []);

  const onToggleEnablement = useCallback((id) => {
    if (enabledApiKeyIds.has(id)) {
      onTurnOffApiKey(id);
    } else {
      onTurnOnApiKey(id);
    }
  }, [enabledApiKeyIds]);

  return (
    <>
      <Container>
        <Title>{"Enabled Api Keys"}</Title>
        <SubTitle>
          {
            "Select the local API keys you would like to enable for local API requests against this repository. If you do not have API keys, you may go to your personal developer settings where you can generate local API keys."
          }
        </SubTitle>
        <BottomContainer style={{ marginTop: 18 }}>
          <SubContainer>
            <LabelContainer>
              <LabelBorderEnd style={{ left: -1 }} />
              <LabelText>{"api keys"}</LabelText>
              <LabelBorderEnd style={{ right: -1 }} />
            </LabelContainer>
            <MainContainer>
              <LeftContainer>
                {apiKeys?.length == 0 && (
                  <PlaceholderText>{"No Api Keys To Enable"}</PlaceholderText>
                )}
                <div>
                  {apiKeys?.map((apiKey, index) => {
                    return (
                      <div key={index} style={{height: 40, display: 'flex', flexDirection: 'row', alignItems: "center"}}>
                        {!isEditting && (
                          <CheckRow>
                            <VerificationIcon
                              src={
                                enabledApiKeyIds.has(apiKey.id)
                                  ? verifiedIcon
                                  : xIcon
                              }
                            />

                            <span style={{ marginTop: 1, marginLeft: 0 }}>
                              <PermissionText>
                                  {apiKey.name}
                              </PermissionText>
                            </span>
                          </CheckRow>
                        )}
                        {isEditting && (
                          <CheckRow>
                            <Checkbox
                              isChecked={
                                enabledApiKeyIds.has(apiKey.id) ?? false
                              }
                              onChange={() => onToggleEnablement(apiKey.id)}
                            />
                            <span style={{ marginTop: 3, marginLeft: -4 }}>
                              <PermissionText>
                                {apiKey.name}
                              </PermissionText>
                            </span>
                          </CheckRow>
                        )}
                      </div>
                    );
                  })}
                </div>
              </LeftContainer>
              <RightContainer>
                <div style={{ width: 120 }}>
                  {isEditting && (
                    <Button
                      onClick={onDoneEditting}
                      label={"done"}
                      bg={"gray"}
                      size={"small"}
                    />
                  )}
                  {!isEditting && (
                    <Button
                      onClick={onEdit}
                      label={"edit"}
                      bg={"orange"}
                      size={"small"}
                      isDisabled={apiKeys?.length == 0}
                    />
                  )}
                </div>
              </RightContainer>
            </MainContainer>
          </SubContainer>
        </BottomContainer>
      </Container>
    </>
  );
};

export default React.memo(LocalEnabledApiKeys);
