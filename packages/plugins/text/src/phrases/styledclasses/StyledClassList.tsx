import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState, useReferencedObject } from "../../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import ContentVariableReOrderRow from "./StyledClassReOrderRow";
import ContentVariableRow from "./StyledClassRow";
import ColorPalette from "@floro/styles/ColorPalette";
import { useDiffColor } from "../../diff";
import StyledClassReOrderRow from "./StyledClassReOrderRow";
import StyledClassRow from "./StyledClassRow";

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

const StyleClassList = (props: Props) => {
  const theme = useTheme();
  const { commandMode} = useFloroContext();

  const [name, setName] = useState<string>("");
  const [_isDragging, setIsDragging] = useState(false);

  const [styleClasses, setStyleClasses] = useFloroState(`${props.phraseRef}.styleClasses`);
  const variables = useReferencedObject(`${props.phraseRef}.variables`);
  const contentVariables = useReferencedObject(`${props.phraseRef}.contentVariables`);

  const diffColor = useDiffColor(`${props.phraseRef}.contentVariables`, true, 'darker');

  const varSet = useMemo(() => {
    return new Set([
      ...variables?.map((v) => v.name?.toLowerCase?.() as string) ?? [],
      ...styleClasses?.map((sc) => sc.name?.toLowerCase() as string) ?? [],
      ...contentVariables?.map((cv) => cv.name?.toLowerCase() as string) ?? [],
    ]);
  }, [variables, styleClasses, contentVariables]);

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
    setStyleClasses([...(styleClasses ? styleClasses : []), {
        id: `${name}`,
        name,
      }]
    );
    setName("");
  }, [setStyleClasses, styleClasses, name, isEnabled]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    //save();
  }, []);


  const onReOrderVariables = useCallback(
    (values: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses']) => {
        if (values) {
            setStyleClasses(values);
        }
    },
    [setStyleClasses, styleClasses]
  );

  const onRemoveVar = useCallback(
    (variable: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']) => {
        setStyleClasses(styleClasses?.filter(v => v?.name != variable?.name) ?? []);
    },
    [setStyleClasses, styleClasses]

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
            {`Style Classes`}
          </span>
        </RowTitle>
        {(contentVariables?.length ?? 0) > 0 && commandMode == "edit" && (
          <ToggleEditTitle onClick={onToggleReOrder}>{isReOrderMode ? 'done organizing' : 'organize style classes'}</ToggleEditTitle>
        )}
      </TitleRow>
      {(!isReOrderMode || commandMode != "edit") && (
      <div>
            {styleClasses?.map((styleClass, index) => {
              return (
                <StyledClassRow
                  key={styleClass.name}
                  styleClass={styleClass}
                  styleClassRef={`${props.phraseRef}.styleClasses.id<${styleClass.id}>`}
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
            {styleClasses?.map((styleClass, index) => {
              return (
                <StyledClassReOrderRow
                  key={styleClass.name}
                  styleClass={styleClass}
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
                    ? "style class name"
                    : isNameTaken
                    ? `style class name (name taken)`
                    : `style class name (invalid name)`
                }
                placeholder={"style class name"}
                onTextChanged={onChangeName}
                widthSize="shorter"
                isValid={showNameInputInvalid}
              />
            </div>
          </AddVariableContainer>
          <div style={{marginTop: 12 }}>
            <Button
              size="medium"
              label={"add style class"}
              bg={"purple"}
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

export default React.memo(StyleClassList);
