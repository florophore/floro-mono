import React, {
  useMemo,
} from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import {
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";

import { useRepoLinkBase } from "../hooks/remote-hooks";
import DefaultBranchSetting from "./settings_boxes/DefaultBranchSetting";
import CanChangeSettingsSetting from "./settings_boxes/CanChangeSettingsSetting";
import CanReadSetting from "./settings_boxes/CanReadSetting";
import CanPushBranchesSetting from "./settings_boxes/CanPushBranchesSetting";
import { useSession } from "../../../../session/session-context";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  user-select: text;
  ::-webkit-scrollbar {
    width: 4px;
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${(props) => props.theme.background};
  }
`;

const InnerContainer = styled.div`
  padding: 16px 40px 80px 24px;
  overflow-y: scroll;
  height: 100%;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const ApiConfigText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
`;

const InsufficientPermssionsContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const InsufficientPermssionsTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const InsufficientPermssionsText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
`;

interface Props {
  repository: Repository;
  plugin: string;
}

const SettingsDisplay = (props: Props) => {

  const linkBase = useRepoLinkBase(props.repository);
  const { currentUser } = useSession();
  const apiLink = useMemo(() => {
    return linkBase + "/settings/api?from=remote&plugin=" + (props?.plugin ?? "home");
  }, [linkBase, props.plugin]);

  const showChangeSettings = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
        return false;
    }
    if (props?.repository?.repoType == "org_repo") {
        return true;
    }
    return false;
  }, [props?.repository])

  const showReadSetting = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
        return false;
    }
    if (props?.repository?.repoType == "org_repo") {
        return props.repository.isPrivate;
    }
    return false;
  }, [props?.repository]);

  const showPushSetting = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
        return !props?.repository.isPrivate;
    }
    return true;
  }, [props?.repository]);

  const canChangeApiSettings = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
      return currentUser?.id == props?.repository?.user?.id;
    }
    return props?.repository?.organization?.membership?.permissions
      ?.canModifyOrganizationDeveloperSettings ?? false;
  }, [
    currentUser?.id,
    props?.repository?.user?.id,
    props?.repository?.repoType,
    props?.repository?.organization?.membership?.permissions
      ?.canModifyOrganizationDeveloperSettings,
  ]);

  if (!props?.repository?.repoPermissions?.canChangeSettings) {
    return (
      <InsufficientPermssionsContainer>
        <InsufficientPermssionsTextWrapper>
          <InsufficientPermssionsText>
            {"insufficient repo access to display setting controls"}
          </InsufficientPermssionsText>
        </InsufficientPermssionsTextWrapper>
      </InsufficientPermssionsContainer>
    );
  }

  return (
    <Container>
      <InnerContainer>
        <TitleContainer>
          <Title>{"Repo Settings"}</Title>
          {canChangeApiSettings && (
            <Link to={apiLink}>
                <ApiConfigText>{'Configure API Settings'}</ApiConfigText>
            </Link>
          )}
        </TitleContainer>
        <DefaultBranchSetting repository={props.repository}/>
        {showChangeSettings && (
          <CanChangeSettingsSetting repository={props.repository}/>
        )}
        {showReadSetting && (
          <CanReadSetting repository={props.repository}/>
        )}
        {showPushSetting && (
          <CanPushBranchesSetting repository={props.repository}/>
        )}
      </InnerContainer>
    </Container>
  );
};

export default React.memo(SettingsDisplay);
