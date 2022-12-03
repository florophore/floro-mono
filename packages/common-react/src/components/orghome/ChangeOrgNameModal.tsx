import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import RootModal from "@floro/common-react/src/components/RootModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { NAME_REGEX } from "@floro/common-web/src/utils/validators";
import { useUpdateOrganizationNameMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Organization } from "@floro/graphql-schemas/build/generated/main-graphql";

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const HeaderSubtitle = styled.h4`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderSubtitleColor};
  font-weight: 500;
  font-size: 2.4rem;
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
`;

export interface Props {
  show: boolean;
  organization: Organization;
  onDismissModal: () => void;
}

const ChangeOrgNameModal = (props: Props) => {
  const [name, setName] = useState(props.organization?.name ?? "");
  const [legalName, setLegalName] = useState(props.organization?.legalName ?? "");

  const [updateName, { data, error, loading}] = useUpdateOrganizationNameMutation();

  const firstNameIsValid = useMemo(() => {
    return NAME_REGEX.test(name);
  }, [name]);

  const lastNameIsValid = useMemo(() => {
    return NAME_REGEX.test(legalName);
  }, [legalName]);

  const isValid = useMemo(() => {
    return firstNameIsValid && lastNameIsValid;
  }, [firstNameIsValid, lastNameIsValid]);

  const onClickUpdateName = useCallback(() => {
    if (isValid && props.organization?.id) {
      updateName({
        variables: {
          organizationId: props.organization.id,
          name,
          legalName,
        },
      });
    }
  }, [updateName, isValid, name, legalName, props.organization?.id]); 

  useEffect(() => {
    if (
      data?.updateOrganizationName?.__typename ==
      "UpdateOrganizationNameSuccess"
    ) {
      setName(data?.updateOrganizationName?.organization?.name ?? name);
      setLegalName(
        data?.updateOrganizationName?.organization?.legalName ?? legalName
      );
      props.onDismissModal();
    }
  }, [data, error, props.organization, props.onDismissModal]);

  return (
    <RootModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerChildren={
        <HeaderWrapper>
          <HeaderSubtitle>{"update name"}</HeaderSubtitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <div>
          <div style={{ marginBottom: 36 }}>
            <Input
              label={"organization name"}
              value={name}
              placeholder={"organization name"}
              onTextChanged={setName}
              isValid={firstNameIsValid}
            />
          </div>
          <div style={{ marginBottom: 36 }}>
            <Input
              label={"legal name"}
              value={legalName}
              placeholder={"legal name"}
              onTextChanged={setLegalName}
              isValid={lastNameIsValid}
            />
          </div>
        </div>
        <Button
          size={"big"}
          bg={"purple"}
          label={"change name"}
          isLoading={loading}
          isDisabled={!isValid}
          onClick={onClickUpdateName}
        />
      </ContentWrapper>
    </RootModal>
  );
};

export default React.memo(ChangeOrgNameModal);