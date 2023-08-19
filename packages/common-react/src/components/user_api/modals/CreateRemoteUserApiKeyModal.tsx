import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { useTheme } from "@emotion/react";
import { ApiKey, useCreateUserApiKeyMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FloroHeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const ContentWrapper = styled.div`
  padding: 16px;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
`;

const TopWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
`;

const BottomWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 470px;
`;

export interface Props {
  show: boolean;
  onDismissModal: () => void;
  apiKeys: Array<ApiKey>;
}

const CreateRemoteUserApiKeyModal = (props: Props) => {
  const theme = useTheme();
  const [keyName, setKeyName] = useState("");
  const [createApiKey, createApiKeyMutation] = useCreateUserApiKeyMutation();

  useEffect(() => {
    if (!props.show) {
      setKeyName("");
    }
  }, [props.show]);

  const isValid = useMemo(() => {
    if (keyName == "") {
      return undefined;
    }
    if (keyName.trim() == "") {
      return false;
    }
    const exitingKeyWithName = props.apiKeys.find(k => k.keyName == keyName);
    if (exitingKeyWithName) {
      return false;
    }
    return true;

  }, [keyName, props.apiKeys]);

  const onAddKey = useCallback(() => {
    if (!isValid) {
      return;
    }
    createApiKey({
        variables: {
          keyName
        }
      }
    );
  }, [isValid, keyName]);

  useEffect(() => {
    if (createApiKeyMutation.data?.createUserApiKey?.__typename == "UserApiKeySuccess") {
      props.onDismissModal();

    }
  }, [createApiKeyMutation.data?.createUserApiKey?.__typename])


  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"create remote api key"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <TopWrapper>
          <Input
            label={"key name"}
            placeholder={"key name (e.g. development key)"}
            widthSize="wide"
            value={keyName}
            onTextChanged={setKeyName}
            isValid={isValid}
          />
        </TopWrapper>
        <BottomWrapper>
          <ButtonRow>
            <Button
              label={"create remote api key"}
              bg={"purple"}
              size={"extra-big"}
              isDisabled={!isValid}
              onClick={onAddKey}
              isLoading={createApiKeyMutation.loading}
            />
          </ButtonRow>
        </BottomWrapper>
      </ContentWrapper>
    </RootLongModal>
  );
};

export default React.memo(CreateRemoteUserApiKeyModal);
