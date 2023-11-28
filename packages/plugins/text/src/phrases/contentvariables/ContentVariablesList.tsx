import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState, useReferencedObject } from "../../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import ContentVariableReOrderRow from "./ContentVariableReOrderRow";
import ContentVariableRow from "./ContentVariableRow";
import ColorPalette from "@floro/styles/ColorPalette";
import { useDiffColor } from "../../diff";

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

const ToggleEditTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.linkBlue};
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
`;



const options = [
    {
        label: 'Integer',
        value: 'integer',
    },
    {
        label: 'Float',
        value: 'float',
    },
    {
        label: 'String',
        value: 'string',
    },
    {
        label: 'Bool',
        value: 'boolean',
    },
];

const optionSet = new Set(['integer', 'float', 'string', 'boolean']);

function isVarName(str) {
  if (typeof str !== "string") {
    return false;
  }

  if (str.trim() !== str) {
    return false;
  }

  try {
    new Function(str, "var " + str);
  } catch (_) {
    return false;
  }

  return true;
}

interface Props {
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
}

const ContentVariableList = (props: Props) => {
  const theme = useTheme();
  const { commandMode} = useFloroContext();

  const [name, setName] = useState<string>("");
  const [_isDragging, setIsDragging] = useState(false);

  const [contentVariables, setContentVariables] = useFloroState(`${props.phraseRef}.contentVariables`);
  const interpolationVariants = useReferencedObject(`${props.phraseRef}.interpolationVariants`)
  const linkVariables = useReferencedObject(`${props.phraseRef}.linkVariables`);
  const variables = useReferencedObject(`${props.phraseRef}.variables`);
  const styleClasses = useReferencedObject(`${props.phraseRef}.styleClasses`)
  const styledContents = useReferencedObject(`${props.phraseRef}.styledContents`)

  const diffColor = useDiffColor(`${props.phraseRef}.contentVariables`, true, 'darker');

  const varSet = useMemo(() => {
    return new Set([
      ...(variables?.map((v) => v.name?.toLowerCase?.() as string) ?? []),
      ...(interpolationVariants?.map(
        (iv) => iv.name?.toLowerCase() as string
      ) ?? []),
      ...(linkVariables?.map((l) => l.linkName?.toLowerCase() as string) ?? []),
      ...(contentVariables?.map((cv) => cv.name?.toLowerCase() as string) ??
        []),
      ...(styledContents?.map((sc) => sc.name?.toLowerCase() as string) ?? []),
      ...(styleClasses?.map((sc) => sc.name?.toLowerCase() as string) ?? []),
    ]);
  }, [
    variables,
    linkVariables,
    interpolationVariants,
    contentVariables,
    styleClasses,
    styledContents,
  ]);

  const isNameTaken = useMemo(() => {
    return varSet.has(name?.toLowerCase());
  }, [name, varSet])

  const showNameInputInvalid = useMemo(() => {
    if (name == "") {
        return true;
    }
    if (isNameTaken) {
        return false;
    }
    return isVarName(name);
  }, [name, isNameTaken]);

  const onChangeName = useCallback((name) => {
    setName(name.trim());
  },[]);

  const isEnabled = useMemo(() => {
    if (isNameTaken) {
        return false;
    }
    return isVarName(name);
  }, [name, isNameTaken]);

  const onAppendContentVariable = useCallback(() => {
    if (!isEnabled) {
        return;
    }
    setContentVariables([...(contentVariables ? contentVariables : []), {
        id: `${name}`,
        name,
      }]
    );
    setName("");
  }, [contentVariables, setContentVariables, name, isEnabled]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    //save();
  }, []);


  const onReOrderVariables = useCallback(
    (values: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables']) => {
        if (values) {
            setContentVariables(values);
        }
    },
    [setContentVariables, variables]
  );

  const onRemoveVar = useCallback(
    (variable: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.contentVariables.id<?>']) => {
        setContentVariables(contentVariables?.filter(v => v?.name != variable?.name) ?? []);
    },
    [setContentVariables, contentVariables]

  )

  const [isReOrderMode, setIsReOrderMode] = useState(false);

  const onToggleReOrder = useCallback(() => {
    setIsReOrderMode(!isReOrderMode);
  }, [isReOrderMode])

  if (commandMode != "edit" && (variables?.length ?? 0) == 0) {
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
          <span style={{ color: diffColor }}>
            {`Content Variables`}
          </span>
        </RowTitle>
        {(contentVariables?.length ?? 0) > 0 && commandMode == "edit" && (
          <ToggleEditTitle onClick={onToggleReOrder}>{isReOrderMode ? 'done organizing' : 'organize content variables'}</ToggleEditTitle>
        )}
      </TitleRow>
      {(!isReOrderMode || commandMode != "edit") && (
      <div>
            {contentVariables?.map((contentVariable, index) => {
              return (
                <ContentVariableRow
                  key={contentVariable.name}
                  contentVariable={contentVariable}
                  contentVariableRef={`${props.phraseRef}.contentVariables.id<${contentVariable.id}>`}
                  index={index}
                  onRemove={onRemoveVar}
                />
              );
            })}

      </div>

      )}
      {isReOrderMode && commandMode == "edit" && (
        <Reorder.Group
          axis="y"
          values={variables ?? []}
          onReorder={onReOrderVariables}
          style={{listStyle: "none", margin: 0, padding: 0 }}
        >
          <AnimatePresence>
            {contentVariables?.map((contentVariable, index) => {
              return (
                <ContentVariableReOrderRow
                  key={contentVariable.name}
                  contentVariable={contentVariable}
                  index={index}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
      )}
      {commandMode == "edit" && (
        <AddVariableContainer
          style={{ justifyContent: "space-between", alignItems: "center", marginTop: 12 }}
        >
          <AddVariableContainer>
            <div>
              <Input
                value={name}
                label={
                  showNameInputInvalid
                    ? "content variable name"
                    : isNameTaken
                    ? `content variable name (name taken)`
                    : `content variable name (invalid name)`
                }
                placeholder={"content variable name"}
                onTextChanged={onChangeName}
                widthSize="shorter"
                isValid={showNameInputInvalid}
              />
            </div>
          </AddVariableContainer>
          <div style={{marginTop: 12 }}>
            <Button
              size="medium"
              textSize="small"
              label={"add content variable"}
              bg={"gray"}
              isDisabled={!isEnabled}
              onClick={onAppendContentVariable}
              style={{
                  width: 200
              }}
            />
          </div>
        </AddVariableContainer>
      )}
    </Container>
  );
};

export default React.memo(ContentVariableList);
