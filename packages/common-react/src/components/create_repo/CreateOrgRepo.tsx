
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
import { useUsernameCheckLazyQuery, useCreateOrganizationMutation, Repository, Organization } from "@floro/graphql-schemas/src/generated/main-client-graphql";
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
  organization: Organization;
}

const CreateOrgRepo = (props: Props) => {
  const navigate = useNavigate();
  const profanityFilter = useMemo(() => new ProfanityFilter(), []);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [license, setLicense] = useState<string|null>(null);
  const offlinePhoto = useOfflinePhoto(props.organization?.profilePhoto ?? null);
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
      return !!license;
    }
    return !nameIsTaken;
  }, [nameIsTaken, name, isPrivate, license, profanityFilter]);

  return (
    <Background>
      <div>
        <Title>{"New Repository"}</Title>
        <CreateRepoInputs
          name={name}
          repoType={"org_repo"}
          onUpdateName={setName}
          nameIsTaken={nameIsTaken}
          organization={props.organization}
          offlinePhoto={offlinePhoto}
          isPrivate={isPrivate}
          onChangeIsPrivate={setIsPrivate}
          license={license}
          onChangeLicense={setLicense}
        />
      </div>
      <div>
        <ButtonContainer>
          <Button
            bg={"orange"}
            size={"big"}
            label={"Create Repo"}
            isDisabled={!isValid}
          />
        </ButtonContainer>
      </div>
    </Background>
  );
};

export default React.memo(CreateOrgRepo);