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
import { SchemaTypes, makeQueryRef, useFloroContext, useFloroState } from "../floro-schema-api";

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
  terms: SchemaTypes["$(text).terms"];
  setTerms: (pgs: SchemaTypes['$(text).terms'], doSave?: boolean) => void|(() => void);
}

const AddTermModal = (props: Props) => {
  const theme = useTheme();

  const { applicationState } = useFloroContext();
  const [newTermName, setNewTermName] = useState("");

  useEffect(() => {
    if (props.show) {
      setNewTermName("");
    }
  }, [props.show]);

  const existingIds = useMemo(() => {
    return new Set(props?.terms.map(p => p.id));
  }, [props.terms])

  const newId = useMemo((): string | null => {
    if (!newTermName || (newTermName?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      newTermName?.trim?.()?.replaceAll?.(/ +/g, "_")?.toLowerCase?.() ?? null
    );
  }, [newTermName]);

  const canAddNewName = useMemo(() => {
    if (!newId) {
      return false;
    }
    for (const { id } of props.terms ?? []) {
      if (id == newId) {
        return false;
      }
    }
    return true;
  }, [newId, props.terms]);


  const onPrependNewTerm = useCallback(() => {
    if (!newId || !newTermName || !canAddNewName || !props.terms || !applicationState?.text.localeSettings.defaultLocaleRef) {
      return;
    }
    const localizedTerm: SchemaTypes['$(text).terms.id<?>.localizedTerms.id<?>'] = {
      id: applicationState?.text.localeSettings.defaultLocaleRef,
      termValue: newTermName
    }
    props.setTerms([
      { id: newId, name: newTermName, localizedTerms: [localizedTerm] },
      ...props.terms,
    ]);
    setNewTermName("");
    props.onDismiss();
  }, [props.onDismiss, newTermName, newId, canAddNewName, props.terms, props.setTerms, applicationState?.text.localeSettings.defaultLocaleRef]);

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
          <HeaderTitle>{"add term"}</HeaderTitle>
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
              {`Add new term`}
            </PageTitle>
          </Row>
          <Row
            style={{
              marginTop: 32,
              justifyContent: "center",
            }}
          >
            <Input
              value={newTermName}
              onTextChanged={setNewTermName}
              widthSize={"wide"}
              label={
                !newId || !existingIds.has(newId)
                  ? "term"
                  : "term (taken)"
              }
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
            label={"add new term"}
            bg={"orange"}
            size={"extra-big"}
            isDisabled={!canAddNewName}
            onClick={onPrependNewTerm}
          />
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(AddTermModal);
