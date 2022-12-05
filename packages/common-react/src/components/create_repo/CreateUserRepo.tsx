
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
import { NAME_REGEX, REPO_REGEX, USERNAME_REGEX } from "@floro/common-web/src/utils/validators";
import { useCreateUserRepositoryMutation, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useOfflinePhoto } from "../../offline/OfflinePhotoContext";

const Background = styled.div`
  background-color: ${(props) => props.theme.background};
  flex: 1;
  height: 770px;
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

interface Props {
  repositories: Repository[];
}

const CreateUserRepo = (props: Props) => {
  const { currentUser, session } = useSession();
  const navigate = useNavigate();
  const profanityFilter = useMemo(() => new ProfanityFilter(), []);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [licenseCode, setLicenseCode] = useState<string|null>(null);
  const offlinePhoto = useOfflinePhoto(currentUser?.profilePhoto ?? null);
  const nameIsTaken = useMemo(() => {
    return !!props.repositories?.find(repo => {
      return repo.name?.toLowerCase() == name.toLowerCase();
    });
  }, [props.repositories, name])

  const isValid = useMemo(() => {
    if (!REPO_REGEX.test(name)) {
      return false;
    }
    if (profanityFilter.isProfane(name)) {
      return false;
    }
    if (!isPrivate) {
      return !!licenseCode;
    }
    return !nameIsTaken;
  }, [nameIsTaken, name, isPrivate, licenseCode, profanityFilter]);

  const [createRepo, { loading, data }] = useCreateUserRepositoryMutation();

  const onSubmit = useCallback(() => {
    if (isValid) {
      createRepo({
        variables: {
          name,
          isPrivate,
          licenseCode,
        },
      });
    }
  }, [
    createRepo,
    isValid,
    name,
    isPrivate,
    licenseCode,
  ]);

  useEffect(() => {
    if (
      data?.createUserRepository?.__typename ==
      "CreateUserRepositorySuccess"
    ) {
      const repositoryName = data?.createUserRepository?.repository?.name;
      if (repositoryName && currentUser?.username) {
        navigate(`/repo/@/${currentUser?.username}/${repositoryName}`);
      }
    }
  }, [navigate, data, currentUser?.username]);

  return (
    <Background>
      <div>
        <Title>{"New Repository"}</Title>
        <CreateRepoInputs
          name={name}
          repoType={"user_repo"}
          onUpdateName={setName}
          nameIsTaken={nameIsTaken}
          user={currentUser}
          offlinePhoto={offlinePhoto}
          isPrivate={isPrivate}
          onChangeIsPrivate={setIsPrivate}
          license={licenseCode}
          onChangeLicense={setLicenseCode}
        />
      </div>
      <div>
        <ButtonContainer>
          <Button
            bg={"orange"}
            size={"big"}
            label={"Create Repo"}
            isDisabled={!isValid}
            onClick={onSubmit}
            isLoading={loading}
          />
        </ButtonContainer>
      </div>
    </Background>
  );
};

export default React.memo(CreateUserRepo);