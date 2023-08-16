import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import {
  Organization,
  OrganizationMember,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ColorPalette from "@floro/styles/ColorPalette";
import TimeAgo from "javascript-time-ago";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiKey } from "floro/dist/src/apikeys";
import SecretDisplay from "../SecretDisplay";


import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg"
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg"

import RefreshLight from "@floro/common-assets/assets/images/icons/refresh.light.svg";
import RefreshDark from "@floro/common-assets/assets/images/icons/refresh.dark.svg";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useDeleteApiKey, useRegenerateApiKey } from "../local-api-hooks";

const Container = styled.div`
  margin-top: 14px;
  position: relative;
  width: 760px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  user-select: none;
  border: 2px solid ${(props) => props.theme.colors.inputBorderColor};
  padding: 16px 12px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 72px;
`;

const KeyTitle = styled.h4`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.titleText};
  font-weight: 600;
  font-size: 1.7rem;
  user-select: text;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 24px;
  align-items: center;
`;

const Icon = styled.img`
    height: 28px;
    width: 28px;
    cursor: pointer;
`;

const DefaultTitle = styled.p`
  margin: 0;
  padding: 8px 0 0 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 600;
  font-size: 1.2rem;
  display: block;
  user-select: text;
`;


export interface Props {
  localApiKey: ApiKey;
}

const LocalApiKeyCard = (props: Props): React.ReactElement => {
  const theme = useTheme();

  const regenerateKeyMutation = useRegenerateApiKey();
  const deleteKeyMutation = useDeleteApiKey();

  const onRegenKey = useCallback(() => {
    regenerateKeyMutation.mutate({
        id: props.localApiKey.id
    })
  }, [props.localApiKey]);

  const onDeleteKey = useCallback(() => {
    deleteKeyMutation.mutate({
        id: props.localApiKey.id
    })
  }, [props.localApiKey]);

  const trashIcon = useMemo(() => {
    if (theme.name == "light") {
        return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const refreshIcon = useMemo(() => {
    if (theme.name == "light") {
        return RefreshLight;
    }
    return RefreshDark;
  }, [theme.name]);


  const isLoading = useMemo(() => {
    return regenerateKeyMutation.isLoading || deleteKeyMutation.isLoading;
  }, [regenerateKeyMutation.isLoading, deleteKeyMutation.isLoading])

  return (
    <Container
      style={{
        border: `2px solid ${theme.colors.inputBorderColor}`,
      }}
    >
      <TopRow>
        <KeyTitle>{props.localApiKey.name}</KeyTitle>
        <IconRow>
            {!isLoading && (
                <>
            <Icon onClick={onRegenKey} src={refreshIcon}/>
            <Icon onClick={onDeleteKey} src={trashIcon}/>
                </>
            )}
            {isLoading && (
                <>
                <DotsLoader size="small" color={theme.name == "light" ? "gray" : "white"}/>
                </>
            )}
        </IconRow>
      </TopRow>
      <ButtonRow>
        <DefaultTitle style={{padding: 0, marginRight: 24}}>
          {'secret: '}
        </DefaultTitle>
        <SecretDisplay secret={props.localApiKey.secret} />
        {false && <Button label={"edit"} bg={"orange"} size={"small"} />}
      </ButtonRow>
    </Container>
  );
};

export default React.memo(LocalApiKeyCard);
