import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  PointerTypes,
  useFloroState,
  useReferencedObject,
} from "../../../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Button from "@floro/storybook/stories/design-system/Button";
import ColorPalette from "@floro/styles/ColorPalette";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import Input from "@floro/storybook/stories/design-system/Input";

const SubContainer = styled.div`
  border-top: 2px solid ${(props) => props.theme.colors.contrastText};
  border-bottom: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 24px 0 24px 0;
  margin-bottom: 8px;
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

interface Props {
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  variableRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  condtionalRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]"];
  onHideAddSubcondition: () => void;
}

const NewSubContainer = (props: Props) => {
  const theme = useTheme();

  const variables = useReferencedObject(`${props.phraseRef}.variables`);
  const [subconditions, setSubconditions] = useFloroState(
    `${props.condtionalRef}.subconditions`
  );

  const variableOptions = useMemo(() => {
    return (
      variables?.map((iv) => {
        const ref = `${props.phraseRef}.variables.id<${iv.id}>`;
        return {
          label: iv.name,
          value: ref,
        };
      }) ?? []
    );
  }, [variables, props.phraseRef]);

  const [variableRef, setVariableRef] = useState(props.variableRef);

  const variable = useReferencedObject(variableRef);

  const [operator, setOperator] = useState<string>("eq");
  const [stringValue, setStringValue] = useState<string>("");
  const [booleanValue, setBooleanValue] = useState<boolean>(true);
  const [integerValue, setIntegerValue] = useState<string>("");
  const [floatValue, setFloatValue] = useState<string>("");

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
      if (/^\d+\.\d*$/.test(value)) {
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
    setOperator("eq");
    setStringValue("");
    setBooleanValue(true);
    setIntegerValue("");
    setFloatValue("");
  }, [variable]);

  useEffect(() => {
    if (!variable) {
      setVariableRef(props.variableRef);
    }
  }, [variable, props.variableRef]);

  const isValueValid = useMemo(() => {
    if (variable?.varType == "integer") {
      return /^\d+$/.test(integerValue);
    }
    if (variable?.varType == "float") {
      if (operator == "is_fractional") {
        return true;
      }
      return /^(\d+|\d+\.\d+)$/.test(floatValue);
    }
    if (variable?.varType == "string") {
      return stringValue.trim() != "";
    }
    return true;
  }, [variable?.varType, integerValue, stringValue, floatValue, operator]);

  const onAppendSubcondition = useCallback(() => {
    if (!isValueValid || !variable?.varType) {
      return;
    }
    const nextSubconditions = [...(subconditions ? subconditions : [])];
    if (variable?.varType == "string") {
      setSubconditions([
        ...nextSubconditions,
        {
          conjunction: "AND",
          variableRef,
          operator,
          stringComparatorValue: stringValue,
          intComparatorValue: undefined,
          floatComparatorValue: undefined,
          booleanComparatorValue: undefined,
        },
      ]);
    }
    if (variable?.varType == "integer") {
      setSubconditions([
        ...nextSubconditions,
        {
          conjunction: "AND",
          variableRef,
          operator,
          stringComparatorValue: undefined,
          intComparatorValue: parseInt(integerValue) as number,
          floatComparatorValue: undefined,
          booleanComparatorValue: undefined,
        },
      ]);
    }
    if (variable?.varType == "float") {
      setSubconditions([
        ...nextSubconditions,
        {
          conjunction: "AND",
          variableRef,
          operator,
          stringComparatorValue: undefined,
          intComparatorValue: undefined,
          floatComparatorValue:
            operator == "is_fractional"
              ? /^(\d+|\d+\.\d+)$/.test(floatValue)
                ? parseFloat(floatValue)
                : 0
              : (parseFloat(floatValue) as number),
          booleanComparatorValue: undefined,
        },
      ]);
    }
    if (variable?.varType == "boolean") {
      setSubconditions([
        ...nextSubconditions,
        {
          conjunction: "AND",
          variableRef,
          operator,
          stringComparatorValue: undefined,
          intComparatorValue: undefined,
          floatComparatorValue: undefined,
          booleanComparatorValue: booleanValue,
        },
      ]);
    }
    setOperator("eq");
    setBooleanValue(true);
    setStringValue("");
    setFloatValue("");
    setIntegerValue("");
    props?.onHideAddSubcondition?.();
  }, [
    subconditions,
    setSubconditions,
    variableRef,
    isValueValid,
    operator,
    booleanValue,
    floatValue,
    integerValue,
    stringValue,
    props?.onHideAddSubcondition
  ]);

  if (!variable) {
    return null;
  }
  return (
    <SubContainer>
      <TitleRow style={{ height: 72 }}>
        <RowTitle
          style={{
            fontWeight: 600,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span style={{ color: theme.colors.contrastText }}>
              {`Add New Subcondition for`}
            </span>
            <div style={{ marginLeft: 12, marginTop: -20 }}>
              <InputSelector
                options={variableOptions}
                label={"variable"}
                placeholder={"select a variable"}
                size="short"
                value={variableRef}
                onChange={(option) => {
                  if (option?.value) {
                    setVariableRef(
                      option.value as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"]
                    );
                  }
                }}
              />
            </div>
          </div>
        </RowTitle>
      </TitleRow>
      <EditRow
        style={{
          marginTop: 12,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          minHeight: 96,
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
              {variable?.name}
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
              value={operator}
              size={
                variable.varType == "integer" || variable.varType == "float"
                  ? "semi-short"
                  : "short"
              }
              onChange={(option) => {
                if (option?.value) {
                  setOperator(option.value as string);
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
                  value={booleanValue ? "true" : "false"}
                  options={booleanOptions}
                  size="shortest"
                  onChange={(option) => {
                    if (option?.value) {
                      setBooleanValue(option.value != "false");
                    }
                  }}
                />
              )}
              {variable.varType == "string" && (
                <Input
                  label={"value"}
                  placeholder={"value"}
                  value={stringValue}
                  widthSize="semi-short"
                  onTextChanged={setStringValue}
                />
              )}
              {variable.varType == "integer" && (
                <Input
                  label={"value"}
                  placeholder={"value"}
                  value={integerValue}
                  widthSize="shortest"
                  onTextChanged={onUpdateIntegerValue}
                />
              )}
              {variable.varType == "float" && operator != "is_fractional" && (
                <Input
                  label={"value"}
                  placeholder={"value"}
                  value={floatValue}
                  widthSize="shortest"
                  onTextChanged={onUpdateFloatValue}
                />
              )}
            </span>
          </div>
        </ContentRow>
      </EditRow>
      <AddRow>
        <div style={{ marginTop: 24 }}>
          <Button
            size="medium"
            label={"cancel"}
            bg={"gray"}
            style={{
              width: 200,
            }}
            onClick={props.onHideAddSubcondition}
          />
        </div>
        <div style={{ marginTop: 24 }}>
          <Button
            size="medium"
            label={"add condition"}
            bg={"purple"}
            isDisabled={!isValueValid}
            onClick={onAppendSubcondition}
            style={{
              width: 200,
            }}
          />
        </div>
      </AddRow>
    </SubContainer>
  );
};

export default React.memo(NewSubContainer);
