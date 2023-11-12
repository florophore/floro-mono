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

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 2px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 184px;
  position: relative;
  display: grid;
  width: 470px;
  margin: 0;

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
    font-weight: 400;
    font-size: 1rem;
    display: block;
    margin-top: -38px;
  }
`;

const BlurbTextArea = styled.textarea`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  white-space: pre-wrap;
  resize: none;
  background: none;
  width: 100%;
  padding: 0;
  height: 184px;
  outline: none;
  border: none;
  margin: 0;
  resize: none;
  background: none;
  appearance: none;
`;

const BlurbPlaceholder = styled.span`
  color: ${(props) => props.theme.colors.contrastTextLight};
  position: absolute;
  top: 0;
  left: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  left: 16px;
  top: 16px;
  pointer-events: none;
`;

const LabelContainer = styled.div`
  position: absolute;
  height: 32;
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
  top: 14.5px;
  transition: 500ms background-color;
`;

interface Props {
  show: boolean;
  onDismiss: () => void;
  onAdd: () => void;
  phraseGroup: SchemaTypes["$(text).phraseGroups.id<?>"];
}

const AddPhraseModal = (props: Props) => {
  const theme = useTheme();

  const phraseGroupRef = makeQueryRef(
    "$(text).phraseGroups.id<?>",
    props.phraseGroup.id
  );
  const [phraseGroup, setPhraseGroup] = useFloroState(phraseGroupRef);
  const [phraseKey, setPhraseKey] = useState("");
  const [description, setDescription] = useState("");

  const textareaContainer = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const onChangePhraseKey = useCallback((phraseKey: string) => {
    setPhraseKey(phraseKey.toLowerCase());
  }, []);

  const existingIds = useMemo(() => {
    return new Set(phraseGroup?.phrases?.map((p) => p.id));
  }, [phraseGroup?.phrases]);

  useEffect(() => {
    if (!props.show) {
      setPhraseKey("");
      setDescription("");
    }
  }, [props.show]);

  const newId = useMemo((): string | null => {
    if (!phraseKey || (phraseKey?.trim?.() ?? "") == "") {
      return null;
    }
    return (
      phraseKey?.trim?.()?.replaceAll?.(/ +/g, "_")?.toLowerCase?.() ?? null
    );
  }, [phraseKey]);

  const canAddKey = useMemo(() => {
    if (!newId) {
      return false;
    }
    if (existingIds.has(newId)) {
      return false;
    }
    return true;
  }, [newId, existingIds]);

  const onTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setDescription(event.target.value?.toLowerCase());
    },
    []
  );
  const onPrependNewPhrase = useCallback(() => {
    if (!canAddKey) {
      return;
    }
    if (!phraseGroup?.id || !phraseGroup?.name) {
      return;
    }
    if (!newId || !phraseKey) {
      return;
    }
    setPhraseGroup({
      id: phraseGroup.id,
      name: phraseGroup.name,
      phrases: [
        {
          id: newId,
          phraseKey,
          description: {
            value: description ?? ""
          },
          tags: [],
          phraseTranslations: [],
          variables: [],
          linkVariables: [],
          interpolationVariants: [],
          testCases: [],
        },
        ...(phraseGroup.phrases ?? []),
      ],
    });
    props.onAdd?.();
  }, [
    props.onAdd,
    newId,
    phraseKey,
    description,
    phraseGroup,
    canAddKey,
    phraseGroup?.phrases,
  ]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"add phrase key"}</HeaderTitle>
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
              {`Adding new phrase to `}
              <i>{props.phraseGroup.name}</i>
            </PageTitle>
          </Row>
          <Row
            style={{
              marginTop: 32,
              justifyContent: "center",
            }}
          >
            <Input
              value={phraseKey}
              onTextChanged={onChangePhraseKey}
              widthSize={"wide"}
              label={
                !newId || !existingIds.has(newId)
                  ? "phrase key"
                  : "phrase key (taken)"
              }
              placeholder={'Phrase Key (e.g. "home page greeting")'}
              isValid={!newId || !existingIds.has(newId)}
            />
          </Row>
          <Row
            style={{
              marginTop: 32,
              justifyContent: "center",
            }}
          >
            <TextAreaBlurbBox
              style={{
                border: `2px solid ${theme.colors.contrastTextLight}`,
                position: "relative",
              }}
              ref={textareaContainer}
            >
              <LabelContainer>
                <LabelBorderEnd
                  style={{
                    left: -1,
                    background: theme.colors.contrastTextLight,
                  }}
                />
                <LabelText style={{ color: theme.colors.contrastTextLight }}>
                  {"description"}
                </LabelText>
                <LabelBorderEnd
                  style={{
                    right: -1,
                    background: theme.colors.contrastTextLight,
                  }}
                />
              </LabelContainer>
              {description == "" && (
                <BlurbPlaceholder>
                  {"Write a description to help add context to the phrase"}
                </BlurbPlaceholder>
              )}
              <BlurbTextArea
                ref={textarea}
                value={description}
                onChange={onTextBoxChanged}
              />
            </TextAreaBlurbBox>
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
            label={"add new phrase key"}
            bg={"orange"}
            size={"extra-big"}
            isDisabled={!canAddKey}
            onClick={onPrependNewPhrase}
          />
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(AddPhraseModal);
