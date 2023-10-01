import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import RootModal from "@floro/common-react/src/components/RootModal";
import {
  SchemaTypes,
  makeQueryRef,
  useFloroState,
  useReferencedObject,
} from "../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

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

interface Props {
  show: boolean;
  onDismiss: () => void;
  term: SchemaTypes["$(text).terms.id<?>"];
}

const UpdateTermModal = (props: Props) => {
  const theme = useTheme();

  const [terms, setTerms] = useFloroState(`$(text).terms`);
  const [name, setName] = useState(props.term.name);

  useEffect(() => {
    if (props.show) {
      setName(props.term.name);
    }
  }, [props.show, props.term.name])

  const existingIds = useMemo(() => {
    return new Set(terms?.filter(p => p.id != props.term.id).map((p) => p.id));
  }, [terms, props.term?.id]);

  const newId = useMemo((): string | null => {
    if (!name || (name?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      name?.trim?.()?.replaceAll?.(/ +/g, "_")?.toLowerCase?.() ?? null
    );
  }, [name]);

  const canAddKey = useMemo(() => {
    if (!newId) {
      return false;
    }
    if (existingIds.has(newId)) {
      return false;
    }
    return true;
  }, [newId, existingIds]);

  const onUpdate = useCallback(() => {
    if (!newId || !name) {
      return;
    }

    const nextTerms = terms?.map(term => {
      if (term.id == props.term.id) {
        return {
          ...term,
          name,
          newId
        }
      }
      return term;
    });
    if (nextTerms) {
      setTerms(nextTerms);
    }
    props.onDismiss();
  }, [
    newId,
    name,
    props.term,
    props.term?.id,
    setTerms,
    setTerms,
    props.onDismiss
  ]);

  return (
    <RootModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"update term name"}</HeaderTitle>
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
            <Input
              value={name}
              onTextChanged={setName}
              widthSize={"wide"}
              label={(!newId || !existingIds.has(newId)) ? "term name" : "term name (taken)"}
              placeholder={'Term Name'}
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
            label={"update term name"}
            bg={"orange"}
            size={"extra-big"}
            isDisabled={!canAddKey}
            onClick={onUpdate}
          />
        </div>
      </OuterContainer>
    </RootModal>
  );
};

export default React.memo(UpdateTermModal);
