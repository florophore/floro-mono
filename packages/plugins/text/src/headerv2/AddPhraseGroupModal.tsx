import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import { SchemaTypes, makeQueryRef, useFloroState } from "../floro-schema-api";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const PageTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  text-align: center;
  padding: 0;
  margin: 0;
`;

interface Props {
  show: boolean;
  onDismiss: () => void;
  phraseGroups: SchemaTypes["$(text).phraseGroups"];
  setPhraseGroups: (pgs: SchemaTypes['$(text).phraseGroups'], doSave?: boolean) => void|(() => void);
}

const AddPhraseGroupModal = (props: Props) => {
  const theme = useTheme();

  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    if (props.show) {
      setNewGroupName("");
    }
  }, [props.show]);

  const existingIds = useMemo(() => {
    return new Set(props?.phraseGroups.map(p => p.id));
  }, [props.phraseGroups])

  const newId = useMemo((): string | null => {
    if (!newGroupName || (newGroupName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newGroupName?.trim?.()?.replaceAll?.(/ +/g, "_")?.toLowerCase?.() ?? null
    );
  }, [newGroupName]);

  const canAddNewName = useMemo(() => {
    if (!newId) {
      return false;
    }
    for (const { id } of props.phraseGroups ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, props.phraseGroups]);

  const onPrependNewGroup = useCallback(() => {
    if (!newId || !newGroupName || !canAddNewName || !props.phraseGroups) {
      return;
    }
    const updateFn = props.setPhraseGroups([
      { id: newId, name: newGroupName, phrases: [] },
      ...props.phraseGroups,
    ], false);
    setNewGroupName("");
    if (updateFn) {
      setTimeout(updateFn, 0);
    }
    props.onDismiss();
  }, [newGroupName, newId, canAddNewName, props.phraseGroups, props.setPhraseGroups, props.onDismiss]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      zIndex={5}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"add phrase group"}</HeaderTitle>
        </HeaderWrapper>
      }
    >
      <OuterContainer>
        <div>
          <Row
            style={{
              justifyContent: "center",
            }}
          >
            <PageTitle style={{ marginTop: 8, textAlign: "left" }}>
              {`Add new phrase group`}
            </PageTitle>
          </Row>
          <Row
            style={{
              marginTop: 32,
              justifyContent: "center",
            }}
          >
            <Input
              value={newGroupName}
              onTextChanged={setNewGroupName}
              widthSize={"wide"}
              label={
                !newId || !existingIds.has(newId)
                  ? "phrase group"
                  : "phrase group (taken)"
              }
              placeholder={'Group Name'}
              isValid={!newId || !existingIds.has(newId)}
            />
          </Row>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button
            label={"add new phrase group"}
            bg={"orange"}
            size={"extra-big"}
            isDisabled={!canAddNewName}
            onClick={onPrependNewGroup}
          />
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(AddPhraseGroupModal);
