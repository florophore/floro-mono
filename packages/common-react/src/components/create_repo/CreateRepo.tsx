
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import styled from "@emotion/styled";
import CreateOrgInputs from "@floro/storybook/stories/common-components/CreateOrgInputs";
import CreateRepoInputs from "@floro/storybook/stories/common-components/CreateRepoInputs";
import Button from "@floro/storybook/stories/design-system/Button";
import { useSession } from "../../session/session-context";
import debouncer from 'lodash.debounce';
import EmailValidator from 'email-validator';
import ProfanityFilter from "bad-words";
import { NAME_REGEX, USERNAME_REGEX } from "@floro/common-web/src/utils/validators";
import { useUsernameCheckLazyQuery, useCreateOrganizationMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useOfflinePhoto } from "../../offline/OfflinePhotoContext";

const Background = styled.div`
  background-color: ${(props) => props.theme.background};
  flex: 1;
  height: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
`;

const Title = styled.h1`
    font-family: "MavenPro";
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 24px;
    color: ${(props) => props.theme.colors.titleTextColor};
`;

const ButtonContainer = styled.div`
  width: 432px;
  display: flex;
  justify-content: center;
  margin-top: 12px;
`

const CreateRepo = () => {
  const { currentUser, session } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState("");
  const [license, setLicense] = useState(null);
  const offlinePhoto = useOfflinePhoto(currentUser?.profilePhoto ?? null);

  return (
    <Background>
      <div>
        <Title>{"New Repository"}</Title>
        <CreateRepoInputs
          name={name}
          repoType={"user_repo"}
          onUpdateName={setName}
          nameIsTaken={false}
          user={currentUser}
          offlinePhoto={offlinePhoto}
        />
      </div>
      <div>
        <ButtonContainer>
          <Button bg={"orange"} size={"big"} label={"Create Repo"} isDisabled/>
        </ButtonContainer>
      </div>
    </Background>
  );
};

export default React.memo(CreateRepo);