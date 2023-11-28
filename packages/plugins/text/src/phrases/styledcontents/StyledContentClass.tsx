import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import {
  PointerTypes,
  SchemaTypes,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "../../floro-schema-api";
import styled from "@emotion/styled";

import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import ColorPalette from "@floro/styles/ColorPalette";
import { useDiffColor } from "../../diff";

const Container = styled.div``;

const SubContainer = styled.div`
  padding: 0;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 16px;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background: ${(props) => props.theme.background};
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
  color: ${(props) => props.theme.colors.contrastTextLight};
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  styleClass?: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>"];
  styledContent: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>"];
  localeRule: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>"];
  localeRuleRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
}

const StyledContentClass = (props: Props) => {
  const theme = useTheme();

  const { commandMode } = useFloroContext();
  const styleClasses = useReferencedObject(`${props.phraseRef}.styleClasses`)
  const [styledContent, setStyledContent] = useFloroState(`${props.phraseRef}.styledContents.name<${props.styledContent.name}>`);
  const options = useMemo(() => {
    return styleClasses?.map(iv => {
        const ref = `${props.phraseRef}.styleClasses.id<${iv.id}>`;
        return {
            label: iv.name,
            value: ref,
        }
    }) ?? [];
  }, [styleClasses, props.phraseRef]);
  const diffColor = useDiffColor(
    `${props.phraseRef}.styledContents.name<${props.styledContent.name}>`
  );

  return (
    <SubContainer style={{ borderColor: diffColor, paddingBottom: 24 }}>
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
              {`Style Class of `}
            </span>
            <span
              style={{
                fontSize: "1.4rem",
                background: ColorPalette.variableRed,
                boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableRedInset}`,
                borderRadius: 8,
                padding: 4,
                fontWeight: 500,
                color: ColorPalette.white,
              }}
            >
              {props.styledContent.name}
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
                width: "100%",
                height: 72,
                display: "flex",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "1.4rem",
                    background: ColorPalette.variableRed,
                    boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableRedInset}`,
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
                  {props.styledContent?.name}
                </span>
                <span
                  style={{
                    fontSize: "1.4rem",
                    fontFamily: "MavenPro",
                    fontWeight: 600,
                    marginRight: 12,
                    marginTop: 12,
                    display: "inline-block",
                    color: theme.colors.titleText,
                  }}
                >
                  {"is of style class "}
                </span>
              </div>
              {commandMode == "edit" && (
                <div style={{ marginRight: 24 }}>
                  <InputSelector
                    options={options}
                    label={"style class"}
                    placeholder={"select a style class"}
                    size="short"
                    value={props.styledContent.styleClassRef}
                    onChange={(option) => {
                      if (option?.value && styledContent) {
                        setStyledContent({
                            ...styledContent,
                            styleClassRef: option.value as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>"]
                        })
                      }
                    }}
                  />
                </div>
              )}
              {commandMode != "edit" && (
                <div style={{ marginRight: 24 }}>
                  <span
                    style={{
                      marginTop: 8,
                      fontWeight: 500,
                      color: theme.colors.titleText,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      fontSize: "2rem",
                      fontFamily: "MavenPro",
                    }}
                  >
                    {props.styleClass?.name}
                  </span>
                </div>
              )}
            </AddVariableContainer>
          </AddVariableContainer>
        </div>
      </Container>
    </SubContainer>
  );
};

export default React.memo(StyledContentClass);
