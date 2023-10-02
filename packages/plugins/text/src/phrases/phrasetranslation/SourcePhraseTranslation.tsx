import React, { useMemo, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useExtractQueryArgs,
  useFloroContext,
  useReferencedObject,
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";
import DiffTextDocument from "@floro/storybook/stories/design-system/ContentEditor/DiffTextDocument";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import Button from "@floro/storybook/stories/design-system/Button";
import { getArrayStringDiff, splitTextForDiff } from "./diffing";
import ColorPalette from "@floro/styles/ColorPalette";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import TextNode from "@floro/storybook/stories/design-system/ContentEditor/editor/nodes/TextNode";
import TermList from "../termdisplay/TermList";

const Container = styled.div`
  margin-top: 24px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const NothingToDiff = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${ColorPalette.gray};
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
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  targetPhraseTranslation: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>"];
}

const SourcePhraseTranslation = (props: Props) => {
  const theme = useTheme();
  const { applicationState } = useFloroContext();
  const [phraseGroupId, phraseId] = useExtractQueryArgs(props.phraseRef);
  const sourceLocaleRef = props?.systemSourceLocale?.localeCode
    ? makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props.systemSourceLocale.localeCode
      )
    : (null as unknown as PointerTypes["$(text).localeSettings.locales.localeCode<?>"]);

  const sourceRef = sourceLocaleRef
    ? makeQueryRef(
        "$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>",
        phraseGroupId,
        phraseId,
        sourceLocaleRef
      )
    : (null as unknown as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>"]);

  const sourcePhraseTranslation = useReferencedObject(sourceRef);

  const richText = useMemo(() => {
    return sourcePhraseTranslation?.richTextHtml ?? "";
  }, [sourcePhraseTranslation?.richTextHtml]);

  const terms = useReferencedObject("$(text).terms");
  const localeTerms = useMemo(() => {
    return terms.flatMap((term) => {
      const value =
        term.localizedTerms.find((localizedTerm) => {
          return localizedTerm.id == sourceLocaleRef;
        })?.termValue ?? term?.name;
      return {
        id: term.id,
        value: value == "" ? term.name : value,
        name: term.name,
      };
    });
  }, [terms, props?.systemSourceLocale?.localeCode, applicationState]);

  const mentionedTerms = useMemo(() => {
    const json = JSON.parse(sourcePhraseTranslation?.json ?? "{}");
    const children: Array<TextNode> = json?.children ?? [];
    const foundTerms: Array<{
      value: string;
      id: string;
      name: string;
    }> = [];

    const flattenedChildren: Array<TextNode> = [];
    for (let i = 0; i < children.length; ++i) {
      if (children[i]?.type == "text" || children[i]?.type == "mentioned-tag") {
        const combined = children[i];
        combined.type = "text";
        for (let j = i; j < children.length; ++j) {
          if (
            children[j]?.type != "text" &&
            children[j]?.type != "mentioned-tag"
          ) {
            flattenedChildren.push(combined);
            break;
          }
          combined.content += children[j].content;
          i = j;
          flattenedChildren.push(combined);
        }
      } else {
        flattenedChildren.push(children[i]);
      }
    }

    for (const localeTerm of localeTerms) {
      for (const child of flattenedChildren) {
        if (child?.type == "text") {
          if (
            (child.content ?? "")
              ?.toLowerCase()
              ?.indexOf(localeTerm.value?.toLowerCase()) != -1
          ) {
            foundTerms.push(localeTerm);
            break;
          }
        }
        if (child?.type == "mentioned-tag") {
          if (child.content == localeTerm.value) {
            foundTerms.push(localeTerm);
            break;
          }
        }
      }
    }
    return foundTerms;
  }, [sourcePhraseTranslation?.json, localeTerms]);

  const enabledMentionedTerms = useMemo(() => {
    return mentionedTerms?.filter((mentionedTerm) => {
      return sourcePhraseTranslation?.enabledTerms?.includes(mentionedTerm?.id);
    });
  }, [mentionedTerms, sourcePhraseTranslation?.enabledTerms]);

  const editorObserver = useMemo(() => {
    const variables = props.phrase?.variables?.map((v) => v.name) ?? [];
    const linkVariables =
      props.phrase?.linkVariables?.map((v) => v.linkName) ?? [];
    const interpolationVariants =
      props.phrase?.interpolationVariants?.map((v) => v.name) ?? [];
    return new Observer(
      variables,
      linkVariables,
      interpolationVariants,
      enabledMentionedTerms?.map((mentionedTerm) => mentionedTerm.value) ?? []
    );
  }, [
    props.phrase.variables,
    props.phrase.linkVariables,
    props.phrase.interpolationVariants,
    enabledMentionedTerms,
  ]);

  const editorDoc = useMemo(() => {
    if (sourcePhraseTranslation) {
      const doc = new EditorDocument(
        editorObserver,
        props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(sourcePhraseTranslation?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      editorObserver,
      props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [
    sourcePhraseTranslation,
    props.systemSourceLocale.localeCode,
    editorObserver,
  ]);

  const requireRevision = useMemo(() => {
    if (!sourcePhraseTranslation) {
      return false;
    }
    return (
      (sourcePhraseTranslation?.revisionCount ?? 0) >
      (props.targetPhraseTranslation?.revisionCount ?? 0)
    );
  }, [
    props.targetPhraseTranslation?.revisionCount,
    sourcePhraseTranslation?.revisionCount,
  ]);

  const beforeText = useMemo(() => {
    return splitTextForDiff(
      props.targetPhraseTranslation?.sourceAtRevision?.plainText ?? ""
    );
  }, [props.targetPhraseTranslation?.sourceAtRevision?.plainText]);

  const afterText = useMemo(() => {
    return splitTextForDiff(sourcePhraseTranslation?.plainText ?? "");
  }, [sourcePhraseTranslation?.plainText]);

  const diff = useMemo(() => {
    const diff = getArrayStringDiff(beforeText, afterText);
    return diff;
  }, [beforeText, afterText]);

  const diffIsEmpty = useMemo(() => {
    return (
      Object.keys(diff.add).length == 0 && Object.keys(diff.remove).length == 0
    );
  }, [
    Object.keys(diff.add).length == 0 && Object.keys(diff.remove).length == 0,
  ]);

  const [showDiff, setShowDiff] = useState(!diffIsEmpty);
  useEffect(() => {
    if (diffIsEmpty) {
      setShowDiff(false);
    }
  }, [diffIsEmpty]);

  return (
    <>
      <Container>
        <TitleRow style={{ marginTop: 12, marginBottom: 12, height: 40 }}>
          <RowTitle style={{ fontWeight: 600 }}>
            <span style={{ color: theme.colors.contrastText }}>
              {`Source Phrase Value (${props.systemSourceLocale.localeCode}):`}
            </span>
          </RowTitle>
          <div>
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
            editorDoc={editorDoc}
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
            title={
              <>
                {`Mentioned Terms in Source Phrase Value (${props.systemSourceLocale.localeCode}):`}
              </>
            }
          />
        )}
      </Container>
    </>
  );
};

export default React.memo(SourcePhraseTranslation);
