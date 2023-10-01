import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState, useQueryRef, useReferencedObject } from "../../floro-schema-api";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import ColorPalette from "@floro/styles/ColorPalette";
import { AnimatePresence, Reorder } from "framer-motion";
import TestCaseReOrderRow from "./TestCaseReOrderRow";
import TestCase from "./TestCase";


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

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  fallbackLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  globalFallbackLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
}

const TestCaseList = (props: Props) => {
  const theme = useTheme();

  const { commandMode} = useFloroContext();
  const localeRef = useQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedLocale.localeCode
  );
  const [localeTests, setLocaleTests] = useFloroState(
    `${props.phraseRef}.testCases.id<${localeRef}>.localeTests`
  );
  const [description, setDescription] = useState<string>("");

  const isDescriptionTaken = useMemo(() => {
    const caseSet = new Set(localeTests?.map(lc => lc.description));
    return caseSet.has(description?.toLowerCase());
  }, [description, localeTests])

  const showDescriptionInputInvalid = useMemo(() => {
    if (description == "") {
        return true;
    }
    if (isDescriptionTaken) {
        return false;
    }
    return description.trim() != "";
  }, [description, isDescriptionTaken]);

  const isEnabled = useMemo(() => {
    if (isDescriptionTaken) {
        return false;
    }
    return description.trim() != "";
  }, [description, isDescriptionTaken]);

  const [isDragging, setIsDragging] = useState(false);

  const onReOrderLocaleCases = useCallback(
    (values: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests']) => {
        if (values) {
            setLocaleTests(values);
        }
    },
    [setLocaleTests, localeTests]
  );

  const onAppendLocaleCase = useCallback(() => {
    if (!isEnabled) {
        return;
    }
    setLocaleTests([...(localeTests ? localeTests : []), {
        description: description.trim(),
        mockValues: []
      }]
    );
    setDescription("");
  }, [localeTests, setDescription, description, isEnabled]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    //save();
  }, []);

  const [isReOrderMode, setIsReOrderMode] = useState(false);

  const onToggleReOrder = useCallback(() => {
    setIsReOrderMode(!isReOrderMode);
  }, [isReOrderMode])

  const onRemove = useCallback(
    (localeTest: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>']) => {
        setLocaleTests(localeTests?.filter(v => v?.description != localeTest?.description) ?? []);
    },
    [setLocaleTests, localeTests]
  )


  if (commandMode != "edit" && (localeTests?.length ?? 0) == 0) {
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
            {`Test Cases (${props.selectedLocale?.localeCode})`}
          </span>
          <span>
          </span>
        </RowTitle>
        {(localeTests?.length ?? 0) > 0 && commandMode == "edit" && (
          <ToggleEditTitle onClick={onToggleReOrder}>{isReOrderMode ? 'done organizing' : 'organize test cases'}</ToggleEditTitle>
        )}
      </TitleRow>
      {isReOrderMode && commandMode == "edit" && (
        <Reorder.Group
          axis="y"
          values={localeTests ?? []}
          onReorder={onReOrderLocaleCases}
          className={css(`
            padding: 0px 0px 0px 0px;
        `)}
        >
          <AnimatePresence>
            {localeTests?.map((localeCase, index) => {
              return (
                <TestCaseReOrderRow
                  key={localeCase.description}
                  localeCase={localeCase}
                  index={index}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                />
              );
            })}
          </AnimatePresence>
        </Reorder.Group>
        )}
      {(!isReOrderMode || commandMode != "edit") && (
        <div>
          {localeTests?.map((localeTest, index) => {
            return (
              <TestCase
                key={localeTest.description}
                phrase={props.phrase}
                phraseRef={props.phraseRef}
                localeTestRef={`${props.phraseRef}.testCases.id<${localeRef}>.localeTests.description<${localeTest.description}>`}
                localeTest={localeTest}
                selectedLocale={props.selectedLocale}
                fallbackLocale={props.fallbackLocale}
                globalFallbackLocale={props.globalFallbackLocale}
                onRemove={onRemove}
              />
            );
          })}
        </div>
        )}
      {commandMode == "edit" && (
        <AddVariableContainer
          style={{ justifyContent: "space-between", alignItems: "center", marginTop: 12 }}
        >
          <AddVariableContainer>
            <div>
              <Input
                value={description}
                label={
                  showDescriptionInputInvalid
                    ? "test description"
                    : isDescriptionTaken
                    ? `test description (name taken)`
                    : `test description (invalid name)`
                }
                placeholder={`test description (e.g. "when noun is singular")`}
                onTextChanged={setDescription}
                widthSize="wide"
                isValid={showDescriptionInputInvalid}
              />
            </div>
          </AddVariableContainer>
          <div style={{ marginTop: 12 }}>
            <Button
              size="medium"
              label={"add test case"}
              bg={"purple"}
              isDisabled={!isEnabled}
              onClick={onAppendLocaleCase}
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

export default React.memo(TestCaseList);
