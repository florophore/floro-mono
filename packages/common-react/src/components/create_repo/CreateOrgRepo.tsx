import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import CreateRepoInputs from "@floro/storybook/stories/common-components/CreateRepoInputs";
import Button from "@floro/storybook/stories/design-system/Button";
import ProfanityFilter from "bad-words";
import { REPO_REGEX } from "@floro/common-web/src/utils/validators";
import {
  Repository,
  Organization,
  useCreateOrgRepositoryMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useOfflinePhoto } from "../../offline/OfflinePhotoContext";
import { useIsOnline } from "../../hooks/offline";

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
`;

interface Props {
  repositories: Repository[];
  organization: Organization;
}

const CreateOrgRepo = (props: Props) => {
  const navigate = useNavigate();
  const profanityFilter = useMemo(() => new ProfanityFilter(), []);
  const isOnline = useIsOnline();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const offlinePhoto = useOfflinePhoto(
    props.organization?.profilePhoto ?? null
  );
  const nameIsTaken = useMemo(() => {
    return !!props.repositories?.find((repo) => {
      return repo.name?.toLowerCase() == name.toLowerCase();
    });
  }, [props.repositories, name]);

  const isValid = useMemo(() => {
    if (!REPO_REGEX.test(name)) {
      return false;
    }
    if (profanityFilter.isProfane(name)) {
      return false;
    }
    return !nameIsTaken;
  }, [nameIsTaken, name, isPrivate, profanityFilter]);

  const [createRepo, { data, loading }] =
    useCreateOrgRepositoryMutation();

  const onSubmit = useCallback(() => {
    if (isValid && props?.organization?.id) {
      createRepo({
        variables: {
          organizationId: props.organization.id,
          name,
          isPrivate,
        },
      });
    }
  }, [
    createRepo,
    props?.organization?.id,
    isValid,
    name,
    isPrivate,
  ]);

  useEffect(() => {
    if (
      data?.createOrgRepository?.__typename ==
      "CreateOrganizationRepositorySuccess"
    ) {
      const repositoryName = data?.createOrgRepository?.repository?.name;
      if (repositoryName && props.organization?.handle) {
        navigate(`/repo/@/${props.organization?.handle}/${repositoryName}`);
      }
    }
  }, [navigate, data, props.organization?.handle]);

  return (
    <Background>
      <div>
        <Title>{"New Organization Repository"}</Title>
        <CreateRepoInputs
          name={name}
          repoType={"org_repo"}
          onUpdateName={setName}
          nameIsTaken={nameIsTaken}
          organization={props.organization}
          offlinePhoto={offlinePhoto}
          isPrivate={isPrivate}
          onChangeIsPrivate={setIsPrivate}
        />
      </div>
      <div>
        <ButtonContainer>
          <Button
            bg={"orange"}
            size={"big"}
            label={"Create Repo"}
            isDisabled={!isValid && isOnline}
            isLoading={loading}
            onClick={onSubmit}
          />
        </ButtonContainer>
      </div>
    </Background>
  );
};

export default React.memo(CreateOrgRepo);
