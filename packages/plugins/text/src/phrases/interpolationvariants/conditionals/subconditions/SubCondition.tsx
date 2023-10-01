import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useExtractQueryArgs,
  useFloroContext,
  useFloroState,
  useQueryRef,
  useReferencedObject,
} from "../../../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import ContentEditor from "@floro/storybook/stories/design-system/ContentEditor";
import LinkEditor from "@floro/storybook/stories/design-system/ContentEditor/LinkEditor";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import Button from "@floro/storybook/stories/design-system/Button";
import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";
import LinkPlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/LinkPlainTextDocument";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import ColorPalette from "@floro/styles/ColorPalette";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import Input from "@floro/storybook/stories/design-system/Input";

const SubContainer = styled.div`
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 12px;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const DeleteVarContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteVar = styled.img`
  height: 32px;
  width: 32px;
  user-select: none;
`;

const EditRow = styled.div`
  font-family: "MavenPro";
  font-weight: 400;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const ContentRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

const AddRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const options = [
  {
    value: "eq",
    label: "equal to",
  },
  {
    value: "neq",
    label: "NOT equal to",
  },
  {
    value: "gt",
    label: "greater than",
  },
  {
    value: "gte",
    label: "greater than or equal to",
  },
  {
    value: "lt",
    label: "less than",
  },
  {
    value: "lte",
    label: "less than or equal to",
  },
];

const floatOptions = [
  {
    value: "eq",
    label: "equal to",
  },
  {
    value: "neq",
    label: "NOT equal to",
  },
  {
    value: "gt",
    label: "greater than",
  },
  {
    value: "gte",
    label: "greater than or equal to",
  },
  {
    value: "lt",
    label: "less than",
  },
  {
    value: "lte",
    label: "less than or equal to",
  },
  {
    value: "is_fractional",
    label: "a fractional quantity",
  },
];

const partialOperators = [
  {
    value: "eq",
    label: "equal to",
  },
  {
    value: "neq",
    label: "NOT equal to",
  },
];

const booleanOptions = [
  {
    value: "true",
    label: "TRUE",
  },
  {
    value: "false",
    label: "FALSE",
  },
];

const conjuctions = [
  {
    value: "AND",
    label: "and if",
  },
  {
    value: "AND NOT",
    label: "but not if",
  },
];
interface Props {
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  variableRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  conditionalRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]"];
  subconditionRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions.[?]"];
  subcondition: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?].subconditions.[?]"];
  onHideAddSubcondition: () => void;
  index: number;
}

const SubCondition = (props: Props) => {
  const theme = useTheme();

  const variables = useReferencedObject(`${props.phraseRef}.variables`);
  const [subcondition, setSubcondition] = useFloroState(
    props.subconditionRef
  );
  const [subconditions, setSubconditions] = useFloroState(
    `${props.conditionalRef}.subconditions`
  );

  const onRemove = useCallback(() => {
    const nextSubconditions = subconditions?.filter((_, i) => i != props.index);
    if (nextSubconditions) {
      setSubconditions(nextSubconditions);
    }
  }, [subconditions, setSubconditions, props.index]);

  const { commandMode } = useFloroContext();

  const [variableRef, setVariableRef] = useState(props.variableRef);

  const variable = useReferencedObject(variableRef);

  const [integerValue, setIntegerValue] = useState<string>(
    subcondition?.intComparatorValue?.toString?.() ?? ""
  );
  const [floatValue, setFloatValue] = useState<string>(
   subcondition?.floatComparatorValue?.toString?.() ?? ""
  );

  useEffect(() => {
    setIntegerValue(
      subcondition?.intComparatorValue?.toString?.() ?? ""
    )
  }, [subcondition?.intComparatorValue])

  useEffect(() => {
    setFloatValue(
      subcondition?.floatComparatorValue?.toString?.() ?? ""
    )
  }, [subcondition?.floatComparatorValue])

  const onUpdateIntegerValue = useCallback((value: string) => {
    try {
      if (value == "") {
        setIntegerValue("");
        return;
      }
      const int = parseInt(value);
      if (!Number.isNaN(int)) {
        setIntegerValue(int.toString());
      }
      return;
    } catch (e) {}
  }, []);

  const onUpdateFloatValue = useCallback((value: string) => {
    try {
      if (value == "") {
        setFloatValue("");
        return;
      }
      if (/^\d+\.$/.test(value)) {
        setFloatValue(value);
        return;
      }
      const float = parseFloat(value);
      if (!Number.isNaN(float)) {
        setFloatValue(float.toString());
      }
      return;
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!variable) {
      setVariableRef(props.variableRef);
    }
  }, [variable, props.variableRef]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const isValueValid = useMemo(() => {
    if (variable?.varType == "integer") {
      return /^\d+$/.test(integerValue);
    }
    if (variable?.varType == "float") {
      return /^(\d+|\d+\.\d+)$/.test(floatValue);
    }
    if (variable?.varType == "string") {
      return subcondition?.stringComparatorValue?.trim() != "";
    }
    return true;
  }, [variable?.varType, integerValue, subcondition?.stringComparatorValue, floatValue]);

  const varValue = useMemo(() => {
    if (variable?.varType == "integer") {
      return subcondition?.intComparatorValue;
    }
    if (variable?.varType == "float") {
      return subcondition?.floatComparatorValue;
    }
    if (variable?.varType == "string") {
      return subcondition?.stringComparatorValue;
    }
    if (variable?.varType == "boolean") {
      return subcondition?.booleanComparatorValue ? "TRUE" : "FALSE";
    }
    return null;
  }, [variable?.varType, subcondition]);

  const operandText = useMemo(() => {
    if (subcondition?.operator == "eq") {
      return `is equal to`;
    }
    if (subcondition?.operator == "neq") {
      return `is NOT equal to`;
    }

    if (subcondition?.operator == "gt") {
      return `is greater than`;
    }
    if (subcondition?.operator == "gte") {
      return `is greater than or equal to`;
    }

    if (subcondition?.operator == "lt") {
      return `is less than`;
    }
    if (subcondition?.operator == "lte") {
      return `is less than or equal to`;
    }
    if (subcondition?.operator == "is_fractional") {
      return `is a fractional quantity`;
    }
    return null;
  }, [subcondition?.operator]);

  if (!variable) {
    return null;
  }
  return (
    <SubContainer>
      {commandMode != "edit" && (
        <RowTitle
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            height: 96,
            marginTop: -36,
          }}
        >
          <span
            style={{
              fontSize: "1.4rem",
              color: theme.colors.contrastText,
              fontWeight: 600,
              marginRight: 12,
            }}
          >
            {"And if "}
          </span>
          <span
            style={{
              fontSize: "1.4rem",
              background: ColorPalette.variableGreen,
              boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableGreenInset}`,
              borderRadius: 8,
              padding: 4,
              fontWeight: 500,
              color: ColorPalette.white,
            }}
          >
            {variable.name}
          </span>
          <span
            style={{
              fontWeight: 600,
              marginLeft: 12,
              marginRight: 12,
              fontSize: "1.4rem",
            }}
          >
            {operandText}
          </span>
          {subcondition?.operator != "is_fractional" && <span>{varValue}</span>}
        </RowTitle>
      )}
      {commandMode == "edit" && (
        <EditRow
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            minHeight: 96,
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <ContentRow>
            <div>
              <span
                style={{
                  fontSize: "1.4rem",
                  color: theme.colors.contrastText,
                  fontWeight: 600,
                  marginRight: 12,
                }}
              >
                {"And if"}
              </span>
            </div>
            <div>
              <span
                style={{
                  fontSize: "1.4rem",
                  background: ColorPalette.variableGreen,
                  boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableGreenInset}`,
                  borderRadius: 8,
                  padding: 4,
                  fontWeight: 400,
                  color: ColorPalette.white,
                }}
              >
                {variable.name}
              </span>
            </div>
            <div>
              <span
                style={{
                  fontSize: "1.4rem",
                  color: theme.colors.contrastText,
                  fontWeight: 600,
                  marginLeft: 12,
                }}
              >
                {"is"}
              </span>
            </div>
            <div style={{ marginRight: 24, marginLeft: 12, marginTop: -12 }}>
              <InputSelector
                options={
                  variable.varType == "integer"
                    ? options
                    : variable.varType == "float"
                    ? floatOptions
                    : partialOperators
                }
                label={"operand"}
                placeholder={"select a variable"}
                value={subcondition?.operator}
                size={
                  variable.varType == "integer" || variable.varType == "float"
                    ? "semi-short"
                    : "short"
                }
                onChange={(option) => {
                  if (option?.value && subcondition) {
                    if (variable.varType == "float" && subcondition.floatComparatorValue == undefined) {
                      setSubcondition({
                        ...subcondition,
                        operator: option.value as string,
                        floatComparatorValue: 0,
                      });
                      setFloatValue("0");
                    } else {
                      setSubcondition({
                        ...subcondition,
                        operator: option.value as string,
                      });
                    }
                  }
                }}
              />
            </div>
            <div style={{ marginTop: -12 }}>
              <span>
                {variable.varType == "boolean" && (
                  <InputSelector
                    label={"value"}
                    placeholder={"value"}
                    value={
                      props.subcondition?.booleanComparatorValue
                        ? "true"
                        : "false"
                    }
                    isValid={isValueValid}
                    options={booleanOptions}
                    size="shortest"
                    onChange={(option) => {
                      if (option?.value && subcondition) {
                        setSubcondition({
                          ...subcondition,
                          booleanComparatorValue: option.value != "false",
                        });
                      }
                    }}
                  />
                )}
                {variable.varType == "string" && (
                  <Input
                    label={"value"}
                    placeholder={"value"}
                    value={subcondition?.stringComparatorValue ?? ""}
                    isValid={isValueValid}
                    widthSize="semi-short"
                    onTextChanged={(stringComparatorValue) => {
                      if (subcondition) {
                        setSubcondition({
                          ...subcondition,
                          stringComparatorValue,
                        });
                      }
                    }}
                  />
                )}
                {variable.varType == "integer" && (
                  <Input
                    label={"value"}
                    placeholder={"value"}
                    value={integerValue}
                    widthSize="shortest"
                    isValid={isValueValid}
                    onTextChanged={(text) => {
                      if (/^\d+$/.test(text) && subcondition) {
                        setSubcondition({
                          ...subcondition,
                          intComparatorValue: parseInt(text),
                        });
                      }
                      onUpdateIntegerValue(text);
                    }}
                  />
                )}
                {variable.varType == "float" &&
                  subcondition?.operator != "is_fractional" && (
                    <Input
                      label={"value"}
                      placeholder={"value"}
                      isValid={isValueValid}
                      value={floatValue}
                      widthSize="shortest"
                      onTextChanged={(text) => {
                        if (/^\d+\.$/.test(text) && subcondition) {
                          setSubcondition({
                            ...subcondition,
                            floatComparatorValue: parseFloat(text),
                          });
                        }
                        onUpdateFloatValue(text);
                      }}
                    />
                  )}
              </span>
            </div>
          </ContentRow>
          <div>
            {commandMode == "edit" && (
              <DeleteVarContainer>
                <DeleteVar onClick={onRemove} src={xIcon} />
              </DeleteVarContainer>
            )}
          </div>
        </EditRow>
      )}
    </SubContainer>
  );
};

export default React.memo(SubCondition);
