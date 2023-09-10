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
import SourceLinkDisplayTranslation from "./SourceLinkDisplayTranslation";
import SourceLinkHrefTranslation from "./SourceLinkHrefTranslation";

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
  linkVariable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  linkRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>"];
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
  pinnedPhrases: Array<string>|null;
}

const LinkVariable = (props: Props) => {
  const theme = useTheme();
  const [phraseGroupId, phraseId, linkName] = useExtractQueryArgs(
    props.linkRef
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
        "$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>",
        phraseGroupId,
        phraseId,
        linkName,
        sourceLocaleRef
      )
    : (null as unknown as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>"]);

  const sourceLinkTranslation = useReferencedObject(sourceRef);

  const linkTranslationRef = useQueryRef(
    "$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>",
    phraseGroupId,
    phraseId,
    linkName,
    localeRef
  );

  const [linkDisplayValue, setLinkDisplayValue] = useFloroState(
    `${linkTranslationRef}.linkDisplayValue`
  );
  const [linkHrefValue, setLinkHrefValue] = useFloroState(
    `${linkTranslationRef}.linkHrefValue`
  );

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    const interpolationVariants = props.phrase.interpolationVariants.map((v) => v.name);
    return new Observer(variables, [], interpolationVariants);
  }, [props.phrase.variables]);

  const linkDisplayEditorDoc = useMemo(() => {
    if (linkDisplayValue) {
      const doc = new EditorDocument(
        editorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(linkDisplayValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      editorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, editorObserver]);


  const linkHrefEditorDoc = useMemo(() => {
    if (linkHrefValue) {
      const doc = new EditorDocument(
        editorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(linkHrefValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      editorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, editorObserver]);

  const displayContentIsEmpty = useMemo(() => {
    return (linkDisplayValue?.plainText ?? "") == "";
  }, [linkDisplayValue?.plainText])

  const hrefContentIsEmpty = useMemo(() => {
    return (linkHrefValue?.plainText ?? "") == "";
  }, [linkHrefValue?.plainText])

  const onSetDisplayValueContent = useCallback(
    (richTextHtml: string) => {
      linkDisplayEditorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = linkDisplayEditorDoc.tree.rootNode.toUnescapedString();
      const json = linkDisplayEditorDoc.tree.rootNode.toJSON();
      if (!linkDisplayValue) {
        return;
      }
      if (displayContentIsEmpty && props.globalFilterUntranslated && !props.isPinned) {
        props.setPinnedPhrases([...(props?.pinnedPhrases ?? []), props.phraseRef]);
      }
      if (sourceLinkTranslation) {
        setLinkDisplayValue({
          ...linkDisplayValue,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        });
      } else {
        setLinkDisplayValue({
          ...linkDisplayValue,
          revisionCount: linkDisplayValue.revisionCount + 1,
          revisionTimestamp: new Date().toISOString(),
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        });
      }
    },
    [
      linkDisplayEditorDoc?.tree,
      linkDisplayValue,
      setLinkDisplayValue,
      sourceLinkTranslation,
      sourceRef,
      displayContentIsEmpty,
      props.isPinned,
      props.setPinnedPhrases,
      props.pinnedPhrases,
      props.phraseRef,
      props.globalFilterUntranslated
    ]
  );

  const onSetHrefValueContent = useCallback(
    (richTextHtml: string) => {
      linkHrefEditorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = linkHrefEditorDoc.tree.rootNode.toUnescapedString();
      const json = linkHrefEditorDoc.tree.rootNode.toJSON();
      if (!linkHrefValue) {
        return;
      }
      if (hrefContentIsEmpty && props.globalFilterUntranslated && !props.isPinned) {
        props.setPinnedPhrases([...(props?.pinnedPhrases ?? []), props.phraseRef]);
      }
      if (sourceLinkTranslation) {
        setLinkHrefValue({
          ...linkHrefValue,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        });
      } else {
        setLinkHrefValue({
          ...linkHrefValue,
          revisionCount: linkHrefValue.revisionCount + 1,
          revisionTimestamp: new Date().toISOString(),
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        });
      }
    },
    [
      linkHrefEditorDoc?.tree,
      linkHrefValue,
      setLinkHrefValue,
      sourceLinkTranslation,
      sourceRef,
      hrefContentIsEmpty,
      props.isPinned,
      props.setPinnedPhrases,
      props.pinnedPhrases,
      props.phraseRef,
      props.globalFilterUntranslated
    ]
  );

  const onMarkDisplayResolved = useCallback(() => {
    if (!linkDisplayValue) {
      return;
    }
    if (sourceLinkTranslation?.linkDisplayValue) {
      setLinkDisplayValue({
        ...linkDisplayValue,
        revisionCount: sourceLinkTranslation?.linkDisplayValue.revisionCount,
        revisionTimestamp: new Date().toISOString(),
        sourceAtRevision: {
          sourceLocaleRef: sourceLocaleRef,
          richTextHtml: sourceLinkTranslation?.linkDisplayValue.richTextHtml,
          json: sourceLinkTranslation?.linkDisplayValue.json,
          plainText: sourceLinkTranslation?.linkDisplayValue.plainText,
        },
      });
    }
  }, [
    linkDisplayEditorDoc?.tree,
    sourceLinkTranslation?.linkDisplayValue,
    setLinkDisplayValue,
    sourceLinkTranslation?.linkDisplayValue?.richTextHtml,
    sourceLinkTranslation?.linkDisplayValue?.json,
    sourceLinkTranslation?.linkDisplayValue?.plainText,
    sourceRef,
  ]);


  const onMarkHrefResolved = useCallback(() => {
    if (!linkHrefValue) {
      return;
    }
    if (sourceLinkTranslation?.linkHrefValue) {
      setLinkHrefValue({
        ...linkHrefValue,
        revisionCount: sourceLinkTranslation?.linkHrefValue.revisionCount,
        revisionTimestamp: new Date().toISOString(),
        sourceAtRevision: {
          sourceLocaleRef: sourceLocaleRef,
          json: sourceLinkTranslation?.linkHrefValue.json,
          plainText: sourceLinkTranslation?.linkHrefValue.plainText,
          richTextHtml: sourceLinkTranslation?.linkHrefValue.richTextHtml,
        },
      });
    }
  }, [
    linkHrefEditorDoc?.tree,
    sourceLinkTranslation?.linkHrefValue,
    sourceLinkTranslation?.linkHrefValue?.plainText,
    sourceLinkTranslation?.linkHrefValue?.richTextHtml,
    sourceRef,
  ]);

  const displayRequireRevision = useMemo(() => {
    if (!sourceLinkTranslation?.linkDisplayValue) {
      return false;
    }
    return (
      (sourceLinkTranslation?.linkDisplayValue?.revisionCount ?? 0) >
      (linkDisplayValue?.revisionCount ?? 0)
    );
  }, [
    linkDisplayValue?.revisionCount,
    sourceLinkTranslation?.linkDisplayValue?.revisionCount,
  ]);

  const hrefRequireRevision = useMemo(() => {
    if (!sourceLinkTranslation?.linkHrefValue) {
      return false;
    }
    return (
      (sourceLinkTranslation?.linkHrefValue?.revisionCount ?? 0) >
      (linkHrefValue?.revisionCount ?? 0)
    );
  }, [
    linkHrefValue?.revisionCount,
    sourceLinkTranslation?.linkHrefValue?.revisionCount,
  ]);

  return (
    <div style={{marginBottom: 24}}>
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
              background: ColorPalette.variableBlue,
              boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableBlueInset}`,
              borderRadius: 8,
              padding: 4,
              fontWeight: 500,
              color: ColorPalette.white,
            }}
          >
            {props.linkVariable.linkName}
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
                {`Link Display Value`}
              </span>
              <span
                  style={{
                  fontSize: "1.4rem",
                  background: ColorPalette.variableBlue,
                  boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableBlueInset}`,
                  borderRadius: 8,
                  padding: 4,
                  fontWeight: 500,
                  color: ColorPalette.white,
                  marginLeft: 8,
                  marginRight: 8,
                  }}
              >
              {props.linkVariable.linkName}
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
              editorDoc={linkDisplayEditorDoc}
              content={linkDisplayValue?.richTextHtml ?? ""}
              onSetContent={onSetDisplayValueContent}
              placeholder={`write the (${props.selectedLocale.localeCode}) value for ${linkName}...`}
            />
          )}
          {commandMode != "edit" && (
            <PlainTextDocument
              lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
              editorDoc={linkDisplayEditorDoc}
              content={linkDisplayValue?.richTextHtml ?? ""}
            />
          )}
        </Container>
        {props.systemSourceLocale && linkDisplayValue &&(
          <SourceLinkDisplayTranslation
            phrase={props.phrase}
            systemSourceLocale={props.systemSourceLocale}
            linkVariableRef={props.linkRef}
            targetLinkDisplayTranslation={linkDisplayValue}
            linkVariable={props.linkVariable}
          />
        )}
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
                {`Link HREF Value`}
              </span>
              <span
                  style={{
                  fontSize: "1.4rem",
                  background: ColorPalette.variableBlue,
                  boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableBlueInset}`,
                  borderRadius: 8,
                  padding: 4,
                  fontWeight: 500,
                  color: ColorPalette.white,
                  marginLeft: 8,
                  marginRight: 8,
                  }}
              >
              {props.linkVariable.linkName}
            </span>
              <span style={{ color: theme.colors.contrastText }}>
                {`(${props.selectedLocale.localeCode}):`}
              </span>
            </RowTitle>
            <div>
              {hrefRequireRevision && (
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
                      onClick={onMarkHrefResolved}
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
            <LinkEditor
              lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
              editorDoc={linkHrefEditorDoc}
              content={linkHrefValue?.richTextHtml ?? ""}
              onSetContent={onSetHrefValueContent}
              placeholder={`write the (${props.selectedLocale.localeCode}) href for ${linkName} (eg. "/users/{user_id}?locale=${props.selectedLocale.localeCode}")`}
            />
          )}
          {commandMode != "edit" && (
            <LinkPlainTextDocument
              lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
              editorDoc={linkHrefEditorDoc}
              content={linkHrefValue?.richTextHtml ?? ""}
            />
          )}
        </Container>
        {props.systemSourceLocale && linkHrefValue &&(
          <SourceLinkHrefTranslation
            phrase={props.phrase}
            systemSourceLocale={props.systemSourceLocale}
            linkVariableRef={props.linkRef}
            targetLinkHrefTranslation={linkHrefValue}
            linkVariable={props.linkVariable}
          />
        )}
      </SubContainer>
    </div>
  );
};

export default React.memo(LinkVariable);
