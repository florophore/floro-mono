import React, { useCallback, useState, useMemo, useEffect } from "react";
import styled from "@emotion/styled";
import EditOrgInputs from "@floro/storybook/stories/common-components/EditOrgInputs";
import {
  Organization,
  useUpdateOrganizationContactEmailMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import EmailValidator from "email-validator";
import Button from "@floro/storybook/stories/design-system/Button";

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

const ButtonContainer = styled.div`
  width: 470px;
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;

const UpdateTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.44rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

interface Props {
  organization: Organization;
}

const OrgAccountSettings = (props: Props) => {
  const [didUpdate, setDidUpdate] = useState(false);
  const [contactEmail, setContactEmail] = useState(
    props?.organization?.contactEmail ?? ""
  );

  const contactEmailIsValid = useMemo(
    () => EmailValidator.validate(contactEmail),
    [contactEmail]
  );
  const contactEmailInputIsValid = useMemo(
    () => contactEmailIsValid,
    [contactEmail, contactEmailIsValid]
  );
  const [updateContactEmail, updateContactEmailRequest] =
    useUpdateOrganizationContactEmailMutation();

  const onUpdate = useCallback(() => {
    if (
      !props?.organization?.id ||
      !contactEmail ||
      !contactEmailInputIsValid
    ) {
      return;
    }
    updateContactEmail({
      variables: {
        organizationId: props.organization.id,
        contactEmail,
      },
    });
  }, [props?.organization, contactEmail, contactEmailInputIsValid]);

  useEffect(() => {
    if (props?.organization?.contactEmail) {
      setContactEmail(props?.organization?.contactEmail);
    }
  }, [props?.organization?.contactEmail]);

  useEffect(() => {
    if (
      updateContactEmailRequest?.data?.updateOrganizationContactEmail
        ?.__typename == "UpdateOrganizationContactEmailSuccess"
    ) {
      setDidUpdate(true);
      updateContactEmailRequest?.reset();
    }
  }, [
    updateContactEmailRequest?.data?.updateOrganizationContactEmail?.__typename,
  ]);

  useEffect(() => {
    if (didUpdate) {
      const timeout = setTimeout(() => {
        setDidUpdate(false);
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [didUpdate]);

  return (
    <Container>
      <InnerContainer>
        <TitleContainer style={{ marginBottom: 48 }}>
          <Title>{"Account Settings"}</Title>
        </TitleContainer>
        <EditOrgInputs
          contactEmail={contactEmail}
          onUpdateContactEmail={setContactEmail}
        />
        <div
          style={{
            opacity: didUpdate ? 1 : 0,
            height: 48,
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            width: 470,
            justifyContent: "center",
            transition: "opacity 300ms",
          }}
        >
          <UpdateTitle>{"Updated Contact Email!"}</UpdateTitle>
        </div>
        <ButtonContainer>
          <Button
            onClick={onUpdate}
            isLoading={updateContactEmailRequest?.loading}
            isDisabled={!contactEmailInputIsValid}
            bg={"teal"}
            size={"big"}
            label={"Update Contact Email"}
          />
        </ButtonContainer>
      </InnerContainer>
    </Container>
  );
};

export default React.memo(OrgAccountSettings);
