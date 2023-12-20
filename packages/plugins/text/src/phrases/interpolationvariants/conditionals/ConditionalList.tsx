import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState } from "../../../floro-schema-api";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import ColorPalette from "@floro/styles/ColorPalette";
import ConditionalRow from "./ConditionalRow";
import { useDiffColor } from "../../../diff";


const Container = styled.div`
`;

const SubContainer = styled.div`
  padding: 0;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 16px;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${props => props.theme.background};
  margin-bottom: 24px;
`;

const AddVariableContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
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

const AddRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
`;

const NoConditionalsBox = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
`;

const NoConditionals = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  font-style: italic;
  color: ${props => props.theme.colors.contrastTextLight};
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
]

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  variable?: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  interpolationVariant: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  localeRule: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>"];
  localeRuleRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
  searchText: string;
  isSearching: boolean;
  onFocusSearch: () => void;
}

const ConditionalList = (props: Props) => {
  const theme = useTheme();

  const { commandMode} = useFloroContext();
  const [operator, setOperator] = useState<string>("eq");
  const [stringValue, setStringValue] = useState<string>("");
  const [booleanValue, setBooleanValue] = useState<boolean>(true);
  const [integerValue, setIntegerValue] = useState<string>("");
  const [floatValue, setFloatValue] = useState<string>("");

  const [conditionals, setConditionals] = useFloroState(
    `${props.phraseRef}.interpolationVariants.name<${props.interpolationVariant.name}>.localeRules.id<${props.localeRule.id}>.conditionals`
  );

  const diffColor = useDiffColor(
    `${props.phraseRef}.interpolationVariants.name<${props.interpolationVariant.name}>.localeRules.id<${props.localeRule.id}>.conditionals`
  );

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
    } catch(e) {
    }
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
    } catch(e) {
    }
  }, []);

  const isValueValid = useMemo(() => {
    if (props.variable?.varType == "integer") {
      return /^\d+$/.test(integerValue);
    }
    if (props?.variable?.varType == "float") {
      if (operator == "is_fractional") {
        return true;
      }
      return /^(\d+|\d+\.\d+)$/.test(floatValue);
    }
    if (props.variable?.varType == "string") {
      return stringValue.trim() != "";
    }
    return true;
  }, [props.variable?.varType, integerValue, stringValue, floatValue, operator]);

  const onAppend = useCallback(() => {
    if (!conditionals || !isValueValid) {
      return;
    }
    if (props.variable?.varType == 'string') {
      setConditionals([...conditionals, {
        operator,
        subconditions: [],
        stringComparatorValue: stringValue,
        intComparatorValue: undefined,
        floatComparatorValue: undefined,
        booleanComparatorValue: undefined,
        resultant: {
          json: "{}",
          richTextHtml: "",
          plainText: ""
        }
      }])
    }
    if (props.variable?.varType == 'integer') {
      setConditionals([...conditionals, {
        operator,
        subconditions: [],
        intComparatorValue: parseInt(integerValue) as number,
        stringComparatorValue: undefined,
        floatComparatorValue: undefined,
        booleanComparatorValue: undefined,
        resultant: {
          json: "{}",
          richTextHtml: "",
          plainText: ""
        }
      }])
    }
    if (props.variable?.varType == 'float') {
      setConditionals([
        ...conditionals,
        {
          operator,
          subconditions: [],
          floatComparatorValue:
            operator == "is_fractional"
              ? /^(\d+|\d+\.\d+)$/.test(floatValue)
                ? parseFloat(floatValue)
                : 0
              : (parseFloat(floatValue) as number),
          stringComparatorValue: undefined,
          intComparatorValue: undefined,
          booleanComparatorValue: undefined,
          resultant: {
            json: "{}",
            richTextHtml: "",
            plainText: "",
          },
        },
      ]);
    }
    if (props.variable?.varType == 'boolean') {
      setConditionals([...conditionals, {
        operator,
        subconditions: [],
        booleanComparatorValue: booleanValue,
        stringComparatorValue: undefined,
        intComparatorValue: undefined,
        floatComparatorValue: undefined,
        resultant: {
          json: "{}",
          richTextHtml: "",
          plainText: ""
        }
      }])
    }
    setOperator("eq");
    setBooleanValue(true);
    setStringValue("");
    setFloatValue("");
    setIntegerValue("");
  }, [
    props.variable?.varType,
    conditionals,
    setConditionals,
    isValueValid,
    integerValue,
    stringValue,
    floatValue,
    booleanValue,
    operator,
  ]);

  const onRemove = useCallback(
    (
      index: number
    ) => {
      const nextConditionals = conditionals?.filter((_, i) => i != index);
      if (nextConditionals) {
        setConditionals(nextConditionals);
      }
    },
    [conditionals, setConditionals]
  );

  return (
    <SubContainer style={{borderColor: diffColor}}>
      <Container>
        <TitleRow style={{ marginBottom: 12, height: 40 }}>
          <RowTitle
            style={{
              fontWeight: 600,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span style={{ color: diffColor, marginRight: 8 }}>
              {`Conditionals of `}
            </span>
            <span
              style={{
                fontSize: "1.4rem",
                background: ColorPalette.variableYellow,
                boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableYellowInset}`,
                borderRadius: 8,
                padding: 4,
                fontWeight: 500,
                color: ColorPalette.darkGray,
              }}
            >
              {props.interpolationVariant.name}
            </span>
            <span
              style={{
                marginLeft: 8,
                color: diffColor,
                fontWeight: 600,
              }}
            >
              {` (${props.selectedLocale.localeCode}):`}
            </span>
          </RowTitle>
        </TitleRow>
        {(conditionals?.length ?? 0) == 0 && (
          <NoConditionalsBox>
            <NoConditionals>
              <span>{`No conditionals added for `}</span>
              <span
                style={{
                  fontSize: "1.4rem",
                  background: ColorPalette.variableYellow,
                  boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableYellowInset}`,
                  borderRadius: 8,
                  padding: 4,
                  fontWeight: 500,
                  fontStyle: 'normal',
                  color: ColorPalette.darkGray,
                }}
              >
              {props.interpolationVariant.name}
            </span>
            <span>{` (${props.selectedLocale.localeCode})`}</span>
            </NoConditionals>
          </NoConditionalsBox>
        )}
        <div>
          {props.variable && conditionals?.map((conditional, index) => {
            if (!props.variable) {
              return (
                <React.Fragment
                  key={`${props.phraseRef}.interpolationVariants.name<${props.interpolationVariant.name}>.localeRules.id<${props.localeRule.id}>.conditionals.[${index}]`}
                 />
              )
            }
            return (
              <ConditionalRow
                key={`${props.phraseRef}.interpolationVariants.name<${props.interpolationVariant.name}>.localeRules.id<${props.localeRule.id}>.conditionals.[${index}]`}
                variable={props.variable}
                conditional={conditional}
                conditionalRef={`${props.phraseRef}.interpolationVariants.name<${props.interpolationVariant.name}>.localeRules.id<${props.localeRule.id}>.conditionals.[${index}]`}
                interpolationVariant={props.interpolationVariant}
                phrase={props.phrase}
                lang={props.selectedLocale.localeCode}
                onRemove={onRemove}
                phraseRef={props.phraseRef}
                globalFilterUntranslated={props.globalFilterUntranslated}
                pinnedPhrases={props.pinnedPhrases}
                setPinnedPhrases={props.setPinnedPhrases}
                isPinned={props.isPinned}
                index={index}
                isSearching={props.isSearching}
                searchText={props.searchText}
                onFocusSearch={props.onFocusSearch}
              />
            );
          })}
        </div>

        {commandMode == "edit" && !props.isSearching && (
          <TitleRow style={{
            marginTop: 12,
            marginBottom: 12
          }}>
            <RowTitle
              style={{
                fontWeight: 600,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                fontSize: '1.4rem',
                marginTop: 0
              }}
            >
              <span style={{ color: theme.colors.contrastText }}>
                {conditionals?.length == 0 ? `Add condition:` : `Add or else condition:`}
              </span>
              </RowTitle>
          </TitleRow>
        )}
        {commandMode == "edit" && !props.isSearching && (
          <div>
            <AddVariableContainer
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 0,
              }}
            >
              <AddVariableContainer
                style={{
                  alignItems: "center",
                  marginTop: 12,
                  width: '100%'
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      fontFamily: "MavenPro",
                      fontWeight: 600,
                      marginRight: 12,
                      marginTop: 12,
                      display: "inline-block",
                      color: theme.colors.contrastText,
                    }}
                  >
                    {"If"}
                  </span>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      background: ColorPalette.variableGreen,
                      boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableGreenInset}`,
                      borderRadius: 8,
                      padding: 4,
                      color: ColorPalette.white,
                      fontFamily: "MavenPro",
                      fontWeight: 400,
                      marginRight: 12,
                      marginTop: 12,
                      display: "inline-block",
                    }}
                  >
                    {props.variable?.name}
                  </span>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      fontFamily: "MavenPro",
                      fontWeight: 600,
                      marginRight: 12,
                      marginTop: 12,
                      display: "inline-block",
                      color: theme.colors.contrastText,
                    }}
                  >
                    {"is"}
                  </span>
                </div>
                <div style={{ marginRight: 24 }}>
                  <InputSelector
                    options={
                      props.variable?.varType == "integer" ? options :
                      props.variable?.varType == "float"
                        ? floatOptions
                        : partialOperators
                    }
                    label={"operand"}
                    placeholder={"select a variable"}
                    value={operator}
                    size={
                      props.variable?.varType == "integer" ||
                      props.variable?.varType == "float"
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
                <div>
                  {props.variable?.varType == "boolean" && (
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
                  {props.variable?.varType == "string" && (
                    <Input
                      label={"value"}
                      placeholder={"value"}
                      value={stringValue}
                      widthSize="semi-short"
                      onTextChanged={setStringValue}
                    />
                  )}
                  {props.variable?.varType == "integer" && (
                    <Input
                      label={"value"}
                      placeholder={"value"}
                      value={integerValue}
                      widthSize="shortest"
                      onTextChanged={onUpdateIntegerValue}
                    />
                  )}
                  {props.variable?.varType == "float" && operator != "is_fractional" && (
                    <Input
                      label={"value"}
                      placeholder={"value"}
                      value={floatValue}
                      widthSize="shortest"
                      onTextChanged={onUpdateFloatValue}
                    />
                  )}
                </div>

              </AddVariableContainer>
            </AddVariableContainer>
            <AddRow>
              <div style={{ marginTop: 24 }}>
                <Button
                  size="medium"
                  label={"add conditional"}
                  bg={"purple"}
                  isDisabled={!isValueValid}
                  onClick={onAppend}
                  style={{
                    width: 200,
                  }}
                />
              </div>

            </AddRow>

          </div>
        )}
      </Container>
    </SubContainer>
  );
};

export default React.memo(ConditionalList);