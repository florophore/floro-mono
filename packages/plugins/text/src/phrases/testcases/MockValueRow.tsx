import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import ColorPalette from "@floro/styles/ColorPalette";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import Input from "@floro/storybook/stories/design-system/Input";

const Container = styled.div`
  padding: 0;
  margin-bottom: 0px;
  margin-left: 0px;
  margin-top: 12px;
  margin-bottom: 12px;
`;

const ContentRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ColorControlsContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 72px;
`;

const EditRow = styled.div`
  font-family: "MavenPro";
  font-weight: 400;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const DragShadeContainer = styled.div`
  height: 50px;
  cursor: grab;
  margin-right: 24px;
  margin-top: 14px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const DragIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
`;

const DeleteVarContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteVar = styled.img`
  height: 32px;
  width: 32px;
  pointer-events: none;
  user-select: none;
`;

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

const colorPaletteItemVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom,
    },
  }),
};

const paletteCellVariants = {
  active: {
    height: 20,
    width: 104,
    y: -30,
    scale: 0.35,
    marginTop: 12,
  },
  inactive: {
    scale: 1,
    marginTop: 0,
    height: "auto",
    transition: { duration: 0.3 },
  },
};

interface Props {
  variable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  varRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  index: number;
  localeTest: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>"];
  localeTestRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>"];
}

const MockValueRow = (props: Props) => {
  const theme = useTheme();
  const { commandMode } = useFloroContext();
  const mockValue = useReferencedObject(
    `${props.localeTestRef}.mockValues.variableRef<${props.varRef}>`
  );

  const [mockValues, setMockValues] = useFloroState(`${props.localeTestRef}.mockValues`);

  const setMockValue = useCallback(
    (
      mockValue: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>.mockValues.variableRef<?>"]
    ) => {
      const nextValues = mockValues?.map(m => {
        if (m.variableRef == mockValue.variableRef) {
          return mockValue;
        }
        return m;
      });
      if (nextValues) {
        setMockValues(nextValues);
      }
    },
    [mockValues, setMockValues]
  );

  const [integerValue, setIntegerValue] = useState<string>(
    mockValue?.intMockValue?.toString?.() ?? ""
  );
  const [floatValue, setFloatValue] = useState<string>(
    mockValue?.floatMockValue?.toString?.() ?? ""
  );
  const [stringValue, setStringValue] = useState<string>(
    mockValue?.stringMockValue?.toString?.() ?? ""
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

  const isValueValid = useMemo(() => {
    if (props.variable.varType == "integer") {
      return /^\d+$/.test(integerValue);
    }
    if (props.variable.varType == "float") {
      return /^(\d+|\d+\.\d+)$/.test(floatValue);
    }
    if (props.variable.varType == "string") {
      return (mockValue?.stringMockValue?.trim?.() ?? "") != "";
    }
    return true;
  }, [
    props.variable.varType,
    integerValue,
    mockValue?.stringMockValue,
    floatValue,
  ]);

  const varValue = useMemo(() => {
    if (props.variable.varType == "integer") {
      return mockValue?.intMockValue;
    }
    if (props.variable.varType == "float") {
      return mockValue?.floatMockValue;
    }
    if (props.variable.varType == "string") {
      return mockValue?.stringMockValue;
    }
    if (props.variable.varType == "boolean") {
      return mockValue?.booleanMockValue ? "TRUE" : "FALSE";
    }
    return null;
  }, [props.variable.varType, mockValue]);

  useEffect(() => {
    if (commandMode == "edit") {
      if (props.variable?.varType != "integer") {
        return;
      }
      const timeout = setTimeout(() => {
        if (/^\d+$/.test(integerValue) && mockValue) {
          setMockValue({
            ...mockValue,
            intMockValue: parseInt(integerValue),
          });
        }
      }, 500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [integerValue, commandMode]);

  useEffect(() => {
    if (commandMode == "edit") {
      if (props.variable?.varType != "float") {
        return;
      }
      const timeout = setTimeout(() => {
        if (/^(\d+|\d+\.\d+)$/.test(floatValue) && mockValue) {
          setMockValue({
            ...mockValue,
            floatMockValue: parseFloat(floatValue),
          });
        }
      }, 500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [floatValue, commandMode]);

  useEffect(() => {
    if (commandMode == "edit") {
      const timeout = setTimeout(() => {
        if (props.variable.varType != "string") {
          return;
        }
        if (mockValue) {
          setMockValue({
            ...mockValue,
            stringMockValue: stringValue,
          });
        }
      }, 500);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [stringValue, commandMode]);

  return (
    <div>
      <Container>
        <TitleRow>
          <ColorControlsContainer>
            <RowTitle
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: theme.colors.contrastText,
                  fontWeight: 600,
                  fontSize: "1.4rem",
                  fontFamily: "MavenPro",
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
              >
                {"when "}
              </span>
              <span
                style={{
                  fontWeight: 500,
                  color: ColorPalette.white,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  fontSize: "1.4rem",
                  background: ColorPalette.variableGreen,
                  boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableGreenInset}`,
                  borderRadius: 8,
                  padding: 4,
                }}
              >
                {props.variable.name}
              </span>
              <span
                style={{
                  color: theme.colors.contrastText,
                  fontWeight: 600,
                  fontSize: "1.4rem",
                  fontFamily: "MavenPro",
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
              >
                {" is equal to "}
              </span>
              {commandMode != "edit" && (
                <span>{varValue}</span>
              )}
            </RowTitle>

          {commandMode == "edit" && (
            <EditRow
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                minHeight: 96,
              }}
            >
              <ContentRow>

              <div style={{ marginRight: 24, marginLeft: 12, marginTop: -12 }}>
                <span>
                  {props.variable.varType == "boolean" && (
                    <InputSelector
                      label={"value"}
                      placeholder={"value"}
                      value={mockValue?.booleanMockValue ? "true" : "false"}
                      options={booleanOptions}
                      size="shortest"
                      onChange={(option) => {
                        if (option?.value && mockValue) {
                          setMockValue({
                            ...mockValue,
                            booleanMockValue: option.value != "false",
                          });
                        }
                      }}
                    />
                  )}
                  {props.variable.varType == "string" && (
                    <Input
                      label={"value"}
                      placeholder={"value"}
                      value={stringValue ?? ""}
                      widthSize="semi-short"
                      isValid={isValueValid}
                      onTextChanged={setStringValue}
                    />
                  )}
                  {props.variable.varType == "integer" && (
                    <Input
                      label={"value"}
                      placeholder={"value"}
                      isValid={isValueValid}
                      value={integerValue}
                      widthSize="shortest"
                      onTextChanged={(text) => {
                        onUpdateIntegerValue(text);
                      }}
                    />
                  )}
                  {props.variable.varType == "float" && (
                    <Input
                      label={"value"}
                      placeholder={"value"}
                      isValid={isValueValid}
                      value={floatValue}
                      widthSize="shortest"
                      onTextChanged={(text) => {
                        onUpdateFloatValue(text);
                      }}
                    />
                  )}
                </span>
              </div>
              </ContentRow>
              </EditRow>
            )}
          </ColorControlsContainer>
        </TitleRow>
      </Container>
    </div>
  );
};

export default React.memo(MockValueRow);
