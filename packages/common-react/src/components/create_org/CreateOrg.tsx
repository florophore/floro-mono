import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import styled from "@emotion/styled";
import CreateOrgInputs from "@floro/storybook/stories/common-components/CreateOrgInputs";
import Button from "@floro/storybook/stories/design-system/Button";
import { useSession } from "../../session/session-context";
import debouncer from 'lodash.debounce';
import EmailValidator from 'email-validator';
import ProfanityFilter from "bad-words";
import { NAME_REGEX, USERNAME_REGEX } from "@floro/common-web/src/utils/validators";
import { useUsernameCheckLazyQuery, useCreateOrganizationMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";

const Background = styled.div`
  background-color: ${(props) => props.theme.background};
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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

const CreateOrg = () => {
  const { currentUser, session } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [contactEmail, setContactEmail] = useState(session?.authenticationCredentials?.[0]?.email ?? "");
  const [handle, setHandle] = useState("");
  const [
    agreedToCustomerServiceAgreement,
    setAgreedToCustomerServiceAgreement,
  ] = useState(false);
  const profanityFilter = useMemo(() => new ProfanityFilter(), []);


  const nameIsValid = useMemo(() => {
    if (NAME_REGEX.test(name)) {
      return !profanityFilter.isProfane(name);
    }
    return false;
  }, [name]);

  const legalNameIsValid = useMemo(() => {
    if (NAME_REGEX.test(legalName)) {
      return !profanityFilter.isProfane(legalName);
    }
    return false;
  }, [legalName]);

  const contactEmailIsValid = useMemo(() => EmailValidator.validate(contactEmail), [contactEmail]);

  const handleIsValid = useMemo(() => {
    if (USERNAME_REGEX.test(handle)) {
      return !profanityFilter.isProfane(handle);
    }
    return false;
  }, [handle, profanityFilter]);

  const [checkUserName, { data, loading }] = useUsernameCheckLazyQuery({
    fetchPolicy: "network-only"
  });

  const checkUsernameDebounced = useCallback(debouncer(checkUserName, 300), [
    checkUserName,
  ]);

  const [createOrg, createOrgRequest] = useCreateOrganizationMutation({
    fetchPolicy: "network-only"
  });

  const onSubmit = useCallback(() => {
    createOrg({
      variables: {
        name,
        legalName,
        contactEmail,
        handle,
        agreedToCustomerServiceAgreement
      },
    });
  }, [
    name,
    legalName,
    contactEmail,
    handle,
    agreedToCustomerServiceAgreement,
  ]);

  const canSubmit = useMemo(() => {
    return (
      nameIsValid &&
      legalNameIsValid &&
      contactEmailIsValid &&
      handleIsValid &&
      agreedToCustomerServiceAgreement &&
      data?.usernameCheck?.username == handle &&
      !data?.usernameCheck?.exists
    );
  }, [
  nameIsValid,
  legalNameIsValid,
  contactEmailIsValid,
  agreedToCustomerServiceAgreement,
  handle,
  handleIsValid,
  data?.usernameCheck?.username,
  ]);

  useEffect(() => {
    checkUsernameDebounced({
      variables: {
        username: handle,
      },
    });
  }, [handle]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (createOrgRequest?.data?.createOrganization?.__typename == "CreateOrganizationSuccess") {
      console.log(createOrgRequest?.data?.createOrganization?.organization);
      alert("change pages")
    } 
  }, [createOrgRequest?.data?.createOrganization, navigate])

  return (
    <Background>
      <Title>{"New Organization"}</Title>
      <CreateOrgInputs
        name={name}
        legalName={legalName}
        contactEmail={contactEmail}
        handle={handle}
        onUpdateName={setName}
        onUpdateLegalName={setLegalName}
        onUpdateContactEmail={setContactEmail}
        onUpdateHandle={setHandle}
        agreedToCustomerServiceAgreement={agreedToCustomerServiceAgreement}
        onUpdateAgreedToCustomerServiceAgreement={
          setAgreedToCustomerServiceAgreement
        }
        onOpenTOS={() => alert("show TOS")}
        handleIsTaken={data?.usernameCheck?.exists ?? false}
        handleCheckLoading={loading}
      />
      <ButtonContainer>
        <Button
          isLoading={createOrgRequest?.loading ?? false}
          isDisabled={!canSubmit}
          bg={"teal"}
          size={"big"}
          label={
            "Create Org"
          }
          onClick={onSubmit}
        />
      </ButtonContainer>
    </Background>
  );
};

export default React.memo(CreateOrg);