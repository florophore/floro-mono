import React, { useMemo } from "react";
import styled from "@emotion/styled";
import SearchDropdown from "@floro/storybook/stories/design-system/SearchDropdown";
import { User } from "@floro/graphql-schemas/build/generated/main-graphql";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useTheme } from "@emotion/react";
import UserResultRow from "./UserResultRow";

const NoResultsContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const NoResultsText = styled.p`
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 500;
  margin-top: 12px;
  margin-bottom: 12px;
  color: ${(props) => props.theme.colors.standardText};
`;

const LoadingContainer = styled.div`
  flex: 1;
  max-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 46.5px;
`;

export interface Props {
  users: User[];
  isLoading: boolean;
  onHoverUser?: (user: User) => void;
  onClickUser?: (user: User) => void;
  selectedUser?: User;
}

const FindPluginSearchDropdown = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(() => {
    if (theme.name == "light") {
      return "purple";
    }
    return "lightPurple";
  }, [theme.name]);
  return (
    <SearchDropdown width={468}>
      <>
        {!props.isLoading && (props?.users?.length ?? 0) == 0 && (
          <NoResultsContainer>
            <NoResultsText>{"no user found..."}</NoResultsText>
          </NoResultsContainer>
        )}
        {props.users.map((user: User, index: number) => {
            return (
              <UserResultRow
                key={index}
                user={user}
                isSelected={props?.selectedUser?.id == user?.id}
                onHoverUser={props.onHoverUser}
                onClickUser={props.onClickUser}
              />
            );
        })}
        {props.isLoading && (
          <LoadingContainer>
            <DotsLoader color={loaderColor} size={"small"} />
          </LoadingContainer>
        )}
      </>
    </SearchDropdown>
  );
};

export default React.memo(FindPluginSearchDropdown);