import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState, useReferencedObject } from "../../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import InputSelector, { Option } from "@floro/storybook/stories/design-system/InputSelector";
import VariableReOrderRow from "./VariableReOrderRow";
import VariableRow from "./VariableRow";
import ColorPalette from "@floro/styles/ColorPalette";


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

const VariableList = (props: Props) => {
  const theme = useTheme();
  const { commandMode} = useFloroContext();

  const [name, setName] = useState<string>("");
  const [type, setType] = useState<string>("float");
  const [isDragging, setIsDragging] = useState(false);

  const [variables, setVariables] = useFloroState(`${props.phraseRef}.variables`);
  const interpolationVariants = useReferencedObject(`${props.phraseRef}.interpolationVariants`)
  const linkVariables = useReferencedObject(`${props.phraseRef}.linkVariables`)

  const varSet = useMemo(() => {
    return new Set([
      ...variables?.map((v) => v.name?.toLowerCase?.() as string) ?? [],
      ...interpolationVariants?.map((iv) => iv.name?.toLowerCase() as string) ?? [],
      ...linkVariables?.map((l) => l.linkName?.toLowerCase() as string) ?? [],
    ]);
  }, [variables, linkVariables, interpolationVariants]);

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
    if (!type || !optionSet.has(type)) {
        return false;
    }
    if (isNameTaken) {
        return false;
    }
    return isVarName(name);
  }, [type, name, isNameTaken]);

  const onAppendVariable = useCallback(() => {
    if (!isEnabled) {
        return;
    }
    setVariables([...(variables ? variables : []), {
        id: `${name}:${type}`,
        name,
        varType: type
      }]
    );
    setName("");
    setType("float");
  }, [variables, setVariables, name, type, isEnabled]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    //save();
  }, []);


  const onReOrderVariables = useCallback(
    (values: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables']) => {
        if (values) {
            setVariables(values);
        }
    },
    [setVariables, variables]
  );

  const onRemoveVar = useCallback(
    (variable: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>']) => {
        setVariables(variables?.filter(v => v?.name != variable?.name) ?? []);
    },
    [setVariables, variables]

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
          <span style={{ color: theme.colors.contrastText }}>
            {`Phrase Variables`}
          </span>
        </RowTitle>
          {(variables?.length ?? 0) > 0 && commandMode == "edit" && (
            <ToggleEditTitle onClick={onToggleReOrder}>{isReOrderMode ? 'done organizing' : 'organize variables'}</ToggleEditTitle>
          )}
      </TitleRow>
      {(!isReOrderMode || commandMode != "edit") && (
      <div>
            {variables?.map((variable, index) => {
              return (
                <VariableRow
                  key={variable.name}
                  variable={variable}
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
          className={css(`
            padding: 0px 0px 0px 0px;
        `)}
        >
          <AnimatePresence>
            {variables?.map((variable, index) => {
              return (
                <VariableReOrderRow
                  key={variable.name}
                  variable={variable}
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
                    ? "variable name"
                    : isNameTaken
                    ? `variable name (name taken)`
                    : `variable name (invalid name)`
                }
                placeholder={"variable name"}
                onTextChanged={onChangeName}
                widthSize="shorter"
                isValid={showNameInputInvalid}
              />
            </div>
            <div
              style={{
                width: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: theme.colors.pluginTitle,
                  fontWeight: 900,
                  fontSize: 48,
                  paddingTop: 6,
                  fontFamily: "MavenPro",
                }}
              >
                {":"}
              </span>
            </div>
            <div>
              <InputSelector
                options={options}
                label={"type"}
                placeholder={"type"}
                size="shortest"
                value={type}
                onChange={(option) => {
                  if (option?.value) {
                    setType(option.value as string);
                  }
                }}
              />
            </div>
          </AddVariableContainer>
          <div style={{marginTop: 12 }}>
            <Button
              size="medium"
              label={"add variable"}
              bg={"purple"}
              isDisabled={!isEnabled}
              onClick={onAppendVariable}
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

export default React.memo(VariableList);
