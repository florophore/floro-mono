import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState, useReferencedObject } from "../../floro-schema-api";
import { AnimatePresence, Reorder } from "framer-motion";
import styled from "@emotion/styled";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import InputSelector, { Option } from "@floro/storybook/stories/design-system/InputSelector";
import ColorPalette from "@floro/styles/ColorPalette";
import { useDiffColor } from "../../diff";
import StyledContent from "./StyledContent";
import StyledContentReOrderRow from "./StyledContentReOrderRow";

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

const MissingTranslationsPill = styled.div`
  height: 24px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.colors.warningTextColor};
  padding-left: 12px;
  padding-right: 12px;
  margin-left: 12px;
`;

const MissingTranslationsTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.white};
`;

const BusinessLogicDisclaimer = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${props => props.theme.colors.contrastText};
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
}

const StyledContentsList = (props: Props) => {
  const theme = useTheme();

  const [name, setName] = useState<string>("");
  const [styleClassRef, setStyleClassRef] = useState<PointerTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>']|null>(null);
  const { commandMode, applicationState} = useFloroContext();

  const [_isDragging, setIsDragging] = useState(false);
  const diffColor = useDiffColor(`${props.phraseRef}.styledContents`);

  const [styledContents, setStyledContents] = useFloroState(`${props.phraseRef}.styledContents`);
  const variables = useReferencedObject(`${props.phraseRef}.variables`)
  const contentVariables = useReferencedObject(`${props.phraseRef}.contentVariables`)
  const linkVariables = useReferencedObject(`${props.phraseRef}.linkVariables`)
  const interpolationVariants = useReferencedObject(`${props.phraseRef}.interpolationVariants`)
  const styleClasses = useReferencedObject(`${props.phraseRef}.styleClasses`)

  const varSet = useMemo(() => {
    return new Set([
      ...variables?.map?.((v) => v.name?.toLowerCase?.() as string) ?? [],
      ...interpolationVariants?.map?.((iv) => iv.name?.toLowerCase() as string) ?? [],
      ...linkVariables?.map?.((l) => l.linkName?.toLowerCase() as string) ?? [],
      ...contentVariables?.map?.((cv) => cv.name?.toLowerCase?.() as string) ?? [],
      ...styledContents?.map?.((sc) => sc.name?.toLowerCase?.() as string) ?? [],
    ]);
  }, [variables, linkVariables, interpolationVariants, styledContents, contentVariables]);


  const options = useMemo(() => {
    return styleClasses?.map(iv => {
        const ref = `${props.phraseRef}.styleClasses.id<${iv.id}>`;
        return {
            label: iv.name,
            value: ref,
        }
    }) ?? [];
  }, [styleClasses, props.phraseRef]);

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
    return name.trim() != "";
  }, [name, isNameTaken]);

  const onChangeName = useCallback((name) => {
    setName(name);
  },[]);

  const isEnabled = useMemo(() => {
    if (isNameTaken) {
        return false;
    }
    if (!styleClassRef) {
        return false;
    }
    return name.trim() != "";
  }, [name, isNameTaken, styleClassRef]);

  const onAppendStyledContent = useCallback(() => {
    if (!isEnabled || !styleClassRef) {
        return;
    }
    setStyledContents([...(props.phrase.styledContents ? props.phrase.styledContents : []), {
        name: name.trim(),
        styleClassRef,
        localeRules: []
      }]
    );
    setName("");
    setStyleClassRef(null);
  }, [props.phrase.styledContents, setStyledContents, name, styleClassRef, isEnabled]);

  const onDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    //save();
  }, []);


  const onReOrderStyledContents = useCallback(
    (values: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents']) => {
        if (values) {
            setStyledContents(values);
        }
    },
    [setStyledContents, styledContents]
  );

  const onRemoveStyledContent = useCallback(
    (styledContent: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>']) => {
        setStyledContents(styledContents?.filter(v => v?.name != styledContent?.name) ?? []);
    },
    [setStyledContents, styledContents]
  )

  const [isReOrderMode, setIsReOrderMode] = useState(false);

  const onToggleReOrder = useCallback(() => {
    setIsReOrderMode(!isReOrderMode);
  }, [isReOrderMode]);

  const isMissingValues = useMemo(() => {
    const localeRef = `$(text).localeSettings.locales.localeCode<${props.selectedLocale.localeCode}>`;
    for (const iv of styledContents ?? []) {
      for (const localeRule of iv?.localeRules ?? []) {
        if (localeRule.id != localeRef) {
          continue;
        }
        if ((localeRule.displayValue?.plainText ?? "") == "") {
          return true;
        }
      }
    }
    return false;
  }, [styledContents, applicationState, props.selectedLocale.localeCode])

  if (commandMode != "edit" && (styledContents?.length ?? 0) == 0) {
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
          <span style={{ color: diffColor }}>{`Styled Content`}</span>
          <span>
            {isMissingValues && (
              <MissingTranslationsPill>
                <MissingTranslationsTitle>{`missing ${props.selectedLocale.localeCode} content`}</MissingTranslationsTitle>
              </MissingTranslationsPill>
            )}
          </span>
        </RowTitle>
        {(styledContents?.length ?? 0) > 0 && commandMode == "edit" && (
          <ToggleEditTitle onClick={onToggleReOrder}>
            {isReOrderMode
              ? "done organizing"
              : "organize styled content"}
          </ToggleEditTitle>
        )}
      </TitleRow>
      {isReOrderMode && commandMode == "edit" && (
        <Reorder.Group
          axis="y"
          values={styledContents ?? []}
          onReorder={onReOrderStyledContents}
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          <AnimatePresence>
            {styledContents?.map((styledContent, index) => {
              return (
                <StyledContentReOrderRow
                  key={styledContent.name}
                  styledContent={styledContent}
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
          {commandMode == "edit" && (
            <div>
              <BusinessLogicDisclaimer>
                <b>{`Why aren't there styles?`}</b>
                <span>
                  {
                    " We do not render styles in styled content. You style the content in your runtime environment. The associated style class should be used for styling your content."
                  }
                </span>
              </BusinessLogicDisclaimer>
            </div>
          )}
          {styledContents?.map((styledContent) => {
            return (
              <StyledContent
                key={`${props.phraseRef}.styledContents.name<${styledContent.name}>`}
                styledContent={styledContent}
                phrase={props.phrase}
                styledContentRef={`${props.phraseRef}.styledContents.name<${styledContent.name}>`}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                globalFilterUntranslated={props.globalFilterUntranslated}
                pinnedPhrases={props.pinnedPhrases}
                setPinnedPhrases={props.setPinnedPhrases}
                isPinned={props.isPinned}
                phraseRef={props.phraseRef}
                onRemove={onRemoveStyledContent}
              />
            );
          })}
        </div>
      )}
      {commandMode == "edit" && (
        <AddVariableContainer
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <AddVariableContainer
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <div>
              <Input
                value={name}
                label={
                  showNameInputInvalid
                    ? "content name"
                    : isNameTaken
                    ? `content name (name taken)`
                    : `content name (invalid name)`
                }
                placeholder={"content name"}
                onTextChanged={onChangeName}
                widthSize="shorter"
                isValid={showNameInputInvalid}
              />
            </div>
            <div style={{ marginLeft: 24 }}>
              <InputSelector
                options={options}
                label={"style class"}
                placeholder={"select a style class"}
                size="short"
                value={styleClassRef}
                onChange={(option) => {
                  if (option?.value) {
                    setStyleClassRef(
                      option?.value as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>"]
                    );
                  }
                }}
              />
            </div>
          </AddVariableContainer>
          <div style={{ marginTop: 24 }}>
            <Button
              size="medium"
              label={"add content"}
              bg={"red"}
              isDisabled={!isEnabled}
              onClick={onAppendStyledContent}
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

export default React.memo(StyledContentsList);