import React, { useMemo, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  getArrayStringDiff,
  makeQueryRef,
  useExtractQueryArgs,
  useFloroContext,
  useQueryRef,
  useReferencedObject,
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import DiffTextDocument from "@floro/storybook/stories/design-system/ContentEditor/DiffTextDocument";

import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import Button from "@floro/storybook/stories/design-system/Button";
import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import ColorPalette from "@floro/styles/ColorPalette";
import { splitTextForDiff } from "../phrasetranslation/diffing";
import TextNode from "@floro/storybook/stories/design-system/ContentEditor/editor/nodes/TextNode";
import TermList from "../termdisplay/TermList";

const NothingToDiff = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${ColorPalette.gray};
  font-style: italic;
  padding: 0;
  margin: 0;
`;

const Container = styled.div`
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

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  interpolationVariant: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  interpolationVariantRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  targetInterpolationVariantLocaleRule: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>"];
}

const SourceDefaultValueInterpolationVariant = (props: Props) => {
  const theme = useTheme();
  const [phraseGroupId, phraseId, name] = useExtractQueryArgs(
    props.interpolationVariantRef
  );
  const { applicationState } = useFloroContext();

  const localeRef = props?.systemSourceLocale?.localeCode ? makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.systemSourceLocale.localeCode
  ) : null as unknown as PointerTypes['$(text).localeSettings.locales.localeCode<?>'];;

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
  const defaultValue = useReferencedObject(
    `${localRuleTranslationRef}.defaultValue`
  );

  const terms = useReferencedObject("$(text).terms");
  const localeTerms = useMemo(() => {
    return terms.flatMap(term => {
      const value = term.localizedTerms.find(localizedTerm => {
        return localizedTerm.id == sourceLocaleRef;
      })?.termValue ?? term?.name;
      return {
        id: term.id,
        value: value == '' ? term.name : value,
        name: term.name
      }
    });
  }, [terms, props?.systemSourceLocale?.localeCode, applicationState]);

  const mentionedTerms = useMemo(() => {
    const json = JSON.parse(defaultValue?.json ?? '{}');
    const children: Array<TextNode> = (json?.children ?? [])?.flatMap?.((child: TextNode) => {
      if (child?.type == "ol-tag" || child?.type == "ul-tag") {
        return child?.children?.flatMap(li => {
          return li?.children ?? []
        }) ?? [];
      }
      return [child];
    }) ?? [];
    const foundTerms: Array<{
      value: string,
      id: string,
      name: string,
    }> = [];

    const flattenedChildren: Array<TextNode> = [];
    for (let i = 0; i < children.length; ++i) {
      if (children[i]?.type == "text" || children[i]?.type == "mentioned-tag") {
        const combined = children[i];
        combined.type = 'text';
        for (let j = i; j < children.length; ++j) {
          if (children[j]?.type != "text" && children[j]?.type != "mentioned-tag") {
            flattenedChildren.push(combined);
            break;
          }
          combined.content += children[j].content;
          i = j;
          flattenedChildren.push(combined)
        }
      } else {
        flattenedChildren.push(children[i]);
      }
    }

    for (const localeTerm of localeTerms) {
      for (const child of flattenedChildren) {
        if (child?.type == 'text') {
          if ((child.content?? '')?.toLowerCase()?.indexOf(localeTerm.value?.toLowerCase()) != -1) {
            foundTerms.push(localeTerm);
            break;
          }
        }
        if (child?.type == 'mentioned-tag') {
          if (child.content == localeTerm.value) {
            foundTerms.push(localeTerm);
            break;
          }
        }
      }
    }
    return foundTerms;
  }, [defaultValue?.json, localeTerms])

  const enabledMentionedTerms = useMemo(() => {
    return mentionedTerms
      ?.filter((mentionedTerm) => {
        return defaultValue?.enabledTerms?.includes(mentionedTerm?.id);
      })
      ;
  }, [mentionedTerms, defaultValue?.enabledTerms])

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    const contentVariables = props.phrase.contentVariables.map((v) => v.name);
    return new Observer(
      variables,
      [],
      [],
      enabledMentionedTerms?.map((mentionedTerm) => mentionedTerm.value) ?? [],
      contentVariables
    );
  }, [
    props.phrase.variables,
    props.phrase.contentVariables,
    enabledMentionedTerms,
  ]);

  const localeRuleEditorDoc = useMemo(() => {
    if (defaultValue) {
      const doc = new EditorDocument(
        editorObserver,
        props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(defaultValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      editorObserver,
      props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.systemSourceLocale.localeCode, editorObserver]);

  const requireRevision = useMemo(() => {
    if (!sourceDefaultValue) {
      return false;
    }
    return (
      (sourceDefaultValue?.json ?? "{}") !=
      (props.targetInterpolationVariantLocaleRule?.defaultValue
        ?.sourceAtRevision?.json ?? "{}")
    );
  }, [
    props.targetInterpolationVariantLocaleRule?.defaultValue?.sourceAtRevision
      ?.json,
    sourceDefaultValue?.json,
  ]);

  const beforeText = useMemo(() => {
    return splitTextForDiff(
      props.targetInterpolationVariantLocaleRule?.defaultValue?.sourceAtRevision
        ?.plainText ?? ""
    );
  }, [
    props.targetInterpolationVariantLocaleRule.defaultValue?.sourceAtRevision
      ?.plainText,
  ]);

  const afterText = useMemo(() => {
    return splitTextForDiff(sourceDefaultValue?.plainText ?? "");
  }, [sourceDefaultValue?.plainText]);

  const diff = useMemo(() => {
    const diff = getArrayStringDiff(beforeText, afterText);
    return diff;
  }, [beforeText, afterText])

  const diffIsEmpty = useMemo(() => {
    return Object.keys(diff.add).length == 0 && Object.keys(diff.remove).length == 0;
  }, [Object.keys(diff.add).length == 0 && Object.keys(diff.remove).length == 0]);

  const [showDiff, setShowDiff] = useState(!diffIsEmpty);
  useEffect(() => {
    if (diffIsEmpty) {
      setShowDiff(false);
    }
  }, [diffIsEmpty])

  const richText = useMemo(() => {
    return sourceDefaultValue?.richTextHtml ?? "";
  }, [sourceDefaultValue?.richTextHtml])

  return (
    <Container>
      <TitleRow style={{ marginTop: 12, marginBottom: 12, height: 40 }}>
        <RowTitle
          style={{
            fontWeight: 600,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            maxWidth: requireRevision ? "65%" : "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span style={{ color: theme.colors.contrastText }}>
              {`Source Default Conditional Value of `}
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
              {`(${props.systemSourceLocale.localeCode}):`}
            </span>
          </div>
        </RowTitle>
        <div style={{maxWidth: '50%'}}>
          {requireRevision && (
            <div
              style={{
                fontWeight: 600,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {diffIsEmpty && (
                <NothingToDiff>{"Nothing to diff"}</NothingToDiff>
              )}
              {!diffIsEmpty && !showDiff && (
                <Button
                  style={{ width: 120 }}
                  label={"show diff"}
                  bg={"purple"}
                  size={"small"}
                  textSize="small"
                  onClick={() => {
                    setShowDiff(true);
                  }}
                />
              )}
              {showDiff && !diffIsEmpty && (
                <Button
                  style={{ width: 120 }}
                  label={"hide diff"}
                  bg={"purple"}
                  size={"small"}
                  textSize="small"
                  onClick={() => {
                    setShowDiff(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </TitleRow>
      {(!showDiff || diffIsEmpty) && (
        <PlainTextDocument
          lang={props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"}
          editorDoc={localeRuleEditorDoc}
          content={richText}
          isSource
        />
      )}
      {showDiff && !diffIsEmpty && (
        <DiffTextDocument
          lang={props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"}
          beforeStrings={beforeText}
          afterStrings={afterText}
          diff={diff}
        />
      )}

        {enabledMentionedTerms?.length > 0 && (
          <TermList
            terms={mentionedTerms ?? []}
            selectedLocale={props.selectedLocale}
            systemSourceLocale={props.systemSourceLocale}
            isReadOnly
            enabledTerms={[]}
            isEmpty={(sourceDefaultValue?.plainText?.trim?.() ?? "") == ""}
            title={(
              <>
                <span style={{ color: theme.colors.contrastText }}>
                  {`Mentioned Terms in Source Default Conditional Value of `}
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
                  {`(${props.systemSourceLocale.localeCode}):`}
                </span>
              </>
            )}
          />
        )}
    </Container>
  );
};

export default React.memo(SourceDefaultValueInterpolationVariant);
