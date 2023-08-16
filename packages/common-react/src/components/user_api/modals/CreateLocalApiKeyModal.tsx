import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { useTheme } from "@emotion/react";
import { ApiKey } from "floro/dist/src/apikeys";
import { useAddApiKey } from "../local-api-hooks";

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

const PermissionsWrapper = styled.div`
  margin-top: 18px;
`;

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 16px 16px 8px 16px;
  border-radius: 8px;
  position: relative;
  margin: 0;
  width: 470px;
`;

const LabelContainer = styled.div`
  position: absolute;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
`;

const PermissionBox = styled.div`
  width: 100%;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const PermissionRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  padding-top: 8px;
  padding-bottom: 8px;
`;

const PermissionText = styled.div`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const DefaultRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  align-items: center;
  padding-top: 24px;
  padding-bottom: 8px;
  width: 470px;
`;

const DefaultText = styled.div`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastText};
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
  localApiKeys: Array<ApiKey>;
}

const CreateLocalApiKeyModal = (props: Props) => {
  const theme = useTheme();
  const [name, setName] = useState("");
  const createKeyMutation = useAddApiKey();

  useEffect(() => {
    if (!props.show) {
      setName("");
    }
  }, [props.show]);

  const isValid = useMemo(() => {
    if (name == "") {
      return undefined;
    }
    if (name.trim() == "") {
      return false;
    }
    const exitingKeyWithName = props.localApiKeys.find(k => k.name == name);
    if (exitingKeyWithName) {
      return false;
    }
    return true;

  }, [name, props.localApiKeys]);

  const onAddKey = useCallback(() => {
    if (!isValid) {
      return;
    }
    createKeyMutation.mutate({
      name
    });
  }, [isValid, name]);

  useEffect(() => {
    if (createKeyMutation.isSuccess) {
      props.onDismissModal();

    }
  }, [createKeyMutation.isSuccess])


  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"create local api key"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <TopWrapper>
          <Input
            label={"key name"}
            placeholder={"key name (e.g. development key)"}
            widthSize="wide"
            value={name}
            onTextChanged={setName}
            isValid={isValid}
          />
        </TopWrapper>
        <BottomWrapper>
          <ButtonRow>
            <Button
              label={"create local api key"}
              bg={"purple"}
              size={"extra-big"}
              isDisabled={!isValid}
              onClick={onAddKey}
              isLoading={createKeyMutation.isLoading}
            />
          </ButtonRow>
        </BottomWrapper>
      </ContentWrapper>
    </RootLongModal>
  );
};

export default React.memo(CreateLocalApiKeyModal);
