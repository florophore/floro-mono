
import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, useFloroContext, useFloroState } from "../../floro-schema-api";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import Tag from "./Tag";

const Container = styled.div`
    margin-top: 24px;
`;

const AddVariableContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;
const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

interface Props {
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
}

const TagList = (props: Props) => {
  const theme = useTheme();
  const { commandMode, applicationState} = useFloroContext();

  const [tag, setTag] = useState<string>("");

  const [phrase, setPhrase] = useFloroState(props.phraseRef);

  const tagSet = useMemo(() => {
    return new Set<string>(
        (phrase?.tags ?? []).map(s => s.toLowerCase())
    );
  }, [applicationState]);

  const isNameTaken = useMemo(() => {
    return tagSet.has(tag?.toLowerCase());
  }, [tag, tagSet])

  const showNameInputValid = useMemo(() => {
    if (tag?.trim() == "") {
        return false;
    }
    if (isNameTaken) {
        return false;
    }
    return true;
  }, [tag, isNameTaken]);

  const onChangeName = useCallback((text: string) => {
    setTag(text);
  },[]);

  const isEnabled = useMemo(() => {
    if (tag.trim() == "") {
        return false;
    }
    if (isNameTaken) {
        return false;
    }
    return true;
  }, [tag, isNameTaken]);

  const onAppendTag = useCallback(() => {
    if (!isEnabled || !phrase?.tags) {
        return;
    }
    setPhrase({
        ...phrase,
        tags: [...phrase.tags, tag]
    });
    setTag("");
  }, [tag, isEnabled]);

  const onRemove = useCallback((index) => {
    if (!phrase) {
        return;
    }
    const nextTags = phrase.tags.filter((_, i) => i != index);
    if (nextTags && phrase) {
        setPhrase({
            ...phrase,
            tags: nextTags
        });
    }
  }, [phrase, applicationState]);

  if (commandMode != "edit" && (phrase?.tags?.length ?? 0) == 0) {
    return null;
  }

  return (
    <Container>
      <TitleRow style={{ marginTop: 12, marginBottom: 12, height: 40 }}>
        <RowTitle
          style={{
            fontWeight: 600,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <span style={{ color: theme.colors.contrastText }}>
            {`Phrase Tags`}
          </span>
        </RowTitle>
      </TitleRow>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {phrase?.tags.map((tag, index) => {
          return <Tag key={index} tag={tag} index={index} onRemove={onRemove} />;
        })}
      </div>
      {commandMode == "edit" && (
        <AddVariableContainer
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <AddVariableContainer>
            <div>
              <Input
                value={tag}
                label={
                  showNameInputValid || tag == ""
                    ? "tag name"
                    : isNameTaken
                    ? `tag name (name taken)`
                    : `tag name (invalid name)`
                }
                placeholder={"tag name"}
                onTextChanged={onChangeName}
                widthSize="shorter"
                isValid={showNameInputValid || tag == ""}
              />
            </div>
          </AddVariableContainer>
          <div style={{ marginTop: 12 }}>
            <Button
              size="medium"
              label={"add tag"}
              bg={"orange"}
              isDisabled={!isEnabled}
              onClick={onAppendTag}
              style={{
                width: 200,
              }}
            />
          </div>
        </AddVariableContainer>
      )}
    </Container>
  );
};

export default React.memo(TagList);
