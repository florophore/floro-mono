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
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import ContentEditor from "@floro/storybook/stories/design-system/ContentEditor";
import LinkEditor from "@floro/storybook/stories/design-system/ContentEditor/LinkEditor";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import Button from "@floro/storybook/stories/design-system/Button";
import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";
import LinkPlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/LinkPlainTextDocument";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import ColorPalette from "@floro/styles/ColorPalette";
import ConditionalList from "./conditionals/ConditionalList";

const Container = styled.div`
`;

const SubContainer = styled.div`
  padding: 0;
  margin-bottom: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 16px;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 24px;
  background: ${props => props.theme.name == 'light' ? ColorPalette.extraLightGray : ColorPalette.darkerGray};
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const RequiresRevision = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.warningTextColor};
  font-style: italic;
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

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  interpolationVariant: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  interpolationVariantRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
  pinnedPhrases: Array<string>|null;
}

const InterpolationVariant = (props: Props) => {
  const theme = useTheme();
  const [phraseGroupId, phraseId, name] = useExtractQueryArgs(
    props.interpolationVariantRef
  );
  const { commandMode } = useFloroContext();

  const localeRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedLocale.localeCode
  );


  const sourceLocaleRef = props?.systemSourceLocale?.localeCode
    ? makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props.systemSourceLocale.localeCode
      )
    : (null as unknown as PointerTypes["$(text).localeSettings.locales.localeCode<?>"]);

  const sourceRef = sourceLocaleRef
    ? makeQueryRef(
        "$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>",
        phraseGroupId,
        phraseId,
        name,
        sourceLocaleRef
      )
    : (null as unknown as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>"]);

  const sourceDefaultValue = useReferencedObject(`${sourceRef}.defaultValue`);

  const localRuleTranslationRef = useQueryRef(
    "$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>",
    phraseGroupId,
    phraseId,
    name,
    localeRef
  );

  const localeRule = useReferencedObject(
    localRuleTranslationRef
  );

  const variable = useReferencedObject(props.interpolationVariant.variableRef);

  const [defaultValue, setDefaultValue] = useFloroState(
    `${localRuleTranslationRef}.defaultValue`
  );

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    return new Observer(variables);
  }, [props.phrase.variables]);

  const localeRuleEditorDoc = useMemo(() => {
    if (defaultValue) {
      const doc = new EditorDocument(
        editorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(defaultValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      editorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, editorObserver]);

  const defaultValueIsEmpty = useMemo(() => {
    return (defaultValue?.plainText ?? "") == "";
  }, [defaultValue?.plainText])

  const onSetDefaultValueContent = useCallback(
    (richTextHtml: string) => {
      localeRuleEditorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = localeRuleEditorDoc.tree.rootNode.toUnescapedString();
      const json = localeRuleEditorDoc.tree.rootNode.toJSON();
      if (!defaultValue) {
        return;
      }
      if (defaultValueIsEmpty && props.globalFilterUntranslated && !props.isPinned) {
        props.setPinnedPhrases([...(props?.pinnedPhrases ?? []), props.phraseRef]);
      }
      if (sourceDefaultValue) {
        setDefaultValue({
          ...defaultValue,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        });
      } else {
        setDefaultValue({
          ...defaultValue,
          revisionCount: defaultValue.revisionCount + 1,
          revisionTimestamp: new Date().toISOString(),
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        });
      }
    },
    [
      localeRuleEditorDoc?.tree,
      defaultValue,
      setDefaultValue,
      sourceDefaultValue,
      sourceRef,
      defaultValueIsEmpty,
      props.isPinned,
      props.setPinnedPhrases,
      props.pinnedPhrases,
      props.phraseRef,
      props.globalFilterUntranslated
    ]
  );


  const onMarkDisplayResolved = useCallback(() => {
    if (!defaultValue) {
      return;
    }
    if (sourceDefaultValue) {
      setDefaultValue({
        ...defaultValue,
        revisionCount: sourceDefaultValue?.revisionCount,
        revisionTimestamp: new Date().toISOString(),
        sourceAtRevision: {
          sourceLocaleRef: sourceLocaleRef,
          richTextHtml: sourceDefaultValue.richTextHtml,
          json: sourceDefaultValue.json,
          plainText: sourceDefaultValue.plainText,
        },
      });
    }
  }, [
    localeRuleEditorDoc?.tree,
    sourceDefaultValue,
    setDefaultValue,
    sourceDefaultValue?.richTextHtml,
    sourceDefaultValue?.json,
    sourceDefaultValue?.plainText,
    sourceRef,
  ]);

  const displayRequireRevision = useMemo(() => {
    if (!sourceDefaultValue) {
      return false;
    }
    return (
      (sourceDefaultValue?.revisionCount ?? 0) >
      (defaultValue?.revisionCount ?? 0)
    );
  }, [
    defaultValue?.revisionCount,
    sourceDefaultValue?.revisionCount,
  ]);

  return (
    <div style={{ marginBottom: 24 }}>
      <TitleRow>
        <RowTitle
          style={{
            marginTop: 15,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
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
            {name}
          </span>
          <span
            style={{
              marginLeft: 8,
              color: theme.colors.contrastText,
              fontWeight: 600,
            }}
          >
            {` (${props.selectedLocale.localeCode}):`}
          </span>
        </RowTitle>
      </TitleRow>
      <SubContainer>
        {localeRule && (
          <ConditionalList
            phrase={props.phrase}
            phraseRef={props.phraseRef}
            selectedLocale={props.selectedLocale}
            systemSourceLocale={props.systemSourceLocale}
            globalFilterUntranslated={props.globalFilterUntranslated}
            pinnedPhrases={props.pinnedPhrases}
            setPinnedPhrases={props.setPinnedPhrases}
            isPinned={props.isPinned}
            localeRule={localeRule}
            localeRuleRef={localRuleTranslationRef}
            variable={variable}
            interpolationVariant={props.interpolationVariant}
          />
        )}
        <Container>
          <TitleRow style={{ marginBottom: 24 }}>
            <RowTitle
              style={{
                fontWeight: 600,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span style={{ color: theme.colors.contrastText }}>
                {`Default Conditional Value of `}
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
                  marginLeft: 8,
                  marginRight: 8,
                }}
              >
                {name}
              </span>
              <span style={{ color: theme.colors.contrastText }}>
                {`(${props.selectedLocale.localeCode}):`}
              </span>
              {props.systemSourceLocale && commandMode == "edit" && (
                <div style={{ width: 120, marginLeft: 12 }}>
                  <Button
                    label={"ML translate"}
                    bg={"teal"}
                    size={"small"}
                    textSize="small"
                  />
                </div>
              )}
            </RowTitle>
            <div>
              {displayRequireRevision && (
                <div
                  style={{
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <RequiresRevision style={{ marginRight: 12 }}>
                    {"requires revision"}
                  </RequiresRevision>
                  {commandMode == "edit" && (
                    <Button
                      onClick={onMarkDisplayResolved}
                      style={{ width: 120 }}
                      label={"mark resolved"}
                      bg={"orange"}
                      size={"small"}
                      textSize="small"
                    />
                  )}
                </div>
              )}
            </div>
          </TitleRow>
          {commandMode == "edit" && (
            <ContentEditor
              lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
              editorDoc={localeRuleEditorDoc}
              content={defaultValue?.richTextHtml ?? ""}
              onSetContent={onSetDefaultValueContent}
              placeholder={`write the (${props.selectedLocale.localeCode}) value for ${name}...`}
            />
          )}
          {commandMode != "edit" && (
            <PlainTextDocument
              lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
              editorDoc={localeRuleEditorDoc}
              content={defaultValue?.richTextHtml ?? ""}
            />
          )}
        </Container>
      </SubContainer>
    </div>
  );
};

export default React.memo(InterpolationVariant);
