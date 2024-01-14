import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
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

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

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
import TextNode from "@floro/storybook/stories/design-system/ContentEditor/editor/nodes/TextNode";
import TermList from "../termdisplay/TermList";

import deepLSourceLocales from "../../deep_l_source_locales.json";
import deepLTargetLocales from "../../deep_l_target_locales.json";
import MLModal from "../mlmodal/MLModal";
import { useTranslationMemory } from "../../memory/TranslationMemoryContext";
import TranslationMemoryList from "../translationmemory/TranslationMemoryList";
import { useDiffColor } from "../../diff";
import TermModal from "../termmodal/TermModal";
import PromptModal from "../promptmodal/PromptModal";

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


const BlankDisclaimer = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${props => props.theme.colors.contrastText};
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  linkVariable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  fallbackLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  linkRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>"];
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
  pinnedPhrases: Array<string>|null;
  onRemove: (variable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>"]) => void;
  searchText: string;
  isSearching: boolean;
  onFocusSearch: () => void;
}

const LinkVariable = (props: Props) => {
  const theme = useTheme();
  const [phraseGroupId, phraseId, linkName] = useExtractQueryArgs(
    props.linkRef
  );
  const { commandMode, applicationState } = useFloroContext();

  const diffColor = useDiffColor(props.linkRef, true, 'darker');

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

  const fallbackLocaleRef = props?.fallbackLocale?.localeCode
    ? makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props?.fallbackLocale.localeCode
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
  const fallbackRef = fallbackLocaleRef
    ? makeQueryRef(
        "$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>",
        phraseGroupId,
        phraseId,
        linkName,
        fallbackLocaleRef
      )
    : (null as unknown as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>"]);


  const sourceLinkTranslation = useReferencedObject(sourceRef);
  const fallbackLinkTranslation = useReferencedObject(fallbackRef);

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

  const terms = useReferencedObject("$(text).terms");
  const localeTerms = useMemo(() => {
    return terms?.flatMap(term => {
      const value = term.localizedTerms.find(localizedTerm => {
        return localizedTerm.id == localeRef;
      })?.termValue ?? term?.name;
      return {
        id: term.id,
        value: value == '' ? term.name : value,
        name: term.name
      }
    }) ?? [];
  }, [terms, localeRef, applicationState]);

  const mentionedTerms = useMemo(() => {
    const json = JSON.parse(linkDisplayValue?.json ?? '{}');
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
  }, [linkDisplayValue?.plainText, linkDisplayValue?.json, localeTerms])

  const enabledMentionedValues = useMemo(() => {
    return mentionedTerms
      ?.filter((mentionedTerm) => {
        return linkDisplayValue?.enabledTerms?.includes(mentionedTerm?.id);
      })
      ?.map((mentionedTerm) => mentionedTerm.value);
  }, [mentionedTerms, linkDisplayValue?.enabledTerms])

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    const interpolationVariants =
      props.phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables = props.phrase.contentVariables.map((v) => v.name);
    const observer = new Observer(
      variables,
      [],
      interpolationVariants,
      enabledMentionedValues ?? [],
      contentVariables
    );
    observer.setSearchString(props.searchText)
    return observer;
  }, [
    props.searchText,
    props.phrase.variables,
    props.phrase.contentVariables,
    enabledMentionedValues,
    props.phrase?.interpolationVariants,
  ]);

  const hrefEditorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    const observer = new Observer(variables);
    observer.setSearchString(props.searchText);
    return observer;
  }, [props.searchText, props.phrase?.variables]);

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
  }, [props.selectedLocale.localeCode, linkDisplayValue?.richTextHtml, editorObserver]);

  const targetEditorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    const interpolationVariants =
      props.phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables =
      props.phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    return new Observer(
      variables,
      [],
      interpolationVariants,
      enabledMentionedValues ?? [],
      contentVariables
    );
  }, [
    props.phrase.variables,
    props.phrase.contentVariables,
    enabledMentionedValues,
    props.phrase?.interpolationVariants,
  ]);

  const targetLinkDisplayEditorDoc = useMemo(() => {
    if (linkDisplayValue) {
      const doc = new EditorDocument(
        targetEditorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(linkDisplayValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      targetEditorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, linkDisplayValue?.richTextHtml, targetEditorObserver]);


  const linkHrefEditorDoc = useMemo(() => {
    if (linkHrefValue) {
      const doc = new EditorDocument(
        hrefEditorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(linkHrefValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      hrefEditorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, hrefEditorObserver]);

  const displayContentIsEmpty = useMemo(() => {
    return (linkDisplayValue?.plainText ?? "") == "";
  }, [linkDisplayValue?.plainText])

  const hrefContentIsEmpty = useMemo(() => {
    return (linkHrefValue?.plainText ?? "") == "";
  }, [linkHrefValue?.plainText])

  const sourceDisplayValueIsEmpty = useMemo(() => {
    return (sourceLinkTranslation?.linkDisplayValue?.plainText ?? "") == "";
  }, [sourceLinkTranslation?.linkDisplayValue?.plainText])

  const timeoutDisplay = useRef<NodeJS.Timeout>();
  const onSetDisplayValueContent = useCallback(
    (richTextHtml: string) => {
      linkDisplayEditorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = linkDisplayEditorDoc.toPlainText();
      const json = linkDisplayEditorDoc.toJSON();
      if (!linkDisplayValue) {
        return;
      }
      if (displayContentIsEmpty && props.globalFilterUntranslated && !props.isPinned) {
        props.setPinnedPhrases([...(props?.pinnedPhrases ?? []), props.phraseRef]);
      }
      if (sourceLinkTranslation) {
        const updateFn =setLinkDisplayValue({
          ...linkDisplayValue,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        }, false);
        if (updateFn) {
          clearTimeout(timeoutDisplay.current);
          setTimeout(updateFn, 300);
        }
      } else {
        const updateFn =setLinkDisplayValue({
          ...linkDisplayValue,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        }, false);
        if (updateFn) {
          clearTimeout(timeoutDisplay.current);
          setTimeout(updateFn, 300);
        }
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

  const highlightableVariables = useMemo(() => {
    const variables = props.phrase.variables?.map((v) => v.name) ?? [];
    const interpolationVariants =
      props.phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables =
      props.phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    return [
      ...variables,
      ...interpolationVariants,
      ...enabledMentionedValues ?? [],
      ...contentVariables ?? [],
    ].join(":");
  }, [
    props.phrase.variables,
    props.phrase.interpolationVariants,
    props.phrase.contentVariables,
    enabledMentionedValues,
  ]);

  const timeoutHref = useRef<NodeJS.Timeout>();
  const onSetHrefValueContent = useCallback(
    (richTextHtml: string) => {
      linkHrefEditorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = linkHrefEditorDoc.toPlainText();
      const json = linkHrefEditorDoc.toJSON();
      if (!linkHrefValue) {
        return;
      }
      if (hrefContentIsEmpty && props.globalFilterUntranslated && !props.isPinned) {
        props.setPinnedPhrases([...(props?.pinnedPhrases ?? []), props.phraseRef]);
      }
      if (sourceLinkTranslation) {
        const updateFn = setLinkHrefValue({
          ...linkHrefValue,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        }, false);
        if (updateFn) {
          clearTimeout(timeoutHref.current);
          timeoutHref.current = setTimeout(updateFn, 300);
        }
      } else {
        const updateFn = setLinkHrefValue({
          ...linkHrefValue,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        }, false);
        if (updateFn) {
          clearTimeout(timeoutHref.current);
          timeoutHref.current = setTimeout(updateFn, 300);
        }
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

  const onSaveContent = useCallback(() => {
    const displayJSON = JSON.stringify(linkDisplayEditorDoc.toJSON());
    if (!linkDisplayValue) {
      return;
    }
    if (displayJSON != linkDisplayValue?.json) {
      setLinkDisplayValue(
        {
          ...linkDisplayValue,
          json: displayJSON,
        },
        true
      );
    }
    if (!linkHrefValue) {
      return;
    }
    const hrefJSON = JSON.stringify(linkHrefEditorDoc.toJSON());
    if (hrefJSON != linkHrefValue?.json) {
      setLinkHrefValue(
        {
          ...linkHrefValue,
          json: hrefJSON,
        },
        true
      );
    }
  }, [
    highlightableVariables,
    linkDisplayValue?.json,
    linkHrefValue?.json,
  ]);

  useEffect(() => {
    if (commandMode != "edit") {
      return;
    }
    const displayJSON = JSON.stringify(linkDisplayEditorDoc.toJSON());
    const hrefJSON = JSON.stringify(linkHrefEditorDoc.toJSON());
    if (
      displayJSON != linkDisplayValue?.json ||
      hrefJSON != linkHrefValue?.json
    ) {
      const timeout = setTimeout(onSaveContent, 300);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [onSaveContent, highlightableVariables, linkDisplayValue?.json, linkHrefValue?.json, commandMode])

  const onMarkDisplayResolved = useCallback(() => {
    if (!linkDisplayValue) {
      return;
    }
    if (sourceLinkTranslation?.linkDisplayValue) {
      setLinkDisplayValue({
        ...linkDisplayValue,
        sourceAtRevision: {
          sourceLocaleRef: sourceLocaleRef,
          richTextHtml: sourceLinkTranslation?.linkDisplayValue.richTextHtml,
          json: sourceLinkTranslation?.linkDisplayValue.json,
          plainText: sourceLinkTranslation?.linkDisplayValue.plainText,
        },
      });
    }
  }, [
    linkDisplayValue,
    linkDisplayEditorDoc?.tree,
    linkHrefEditorDoc?.tree,
    sourceLinkTranslation?.linkDisplayValue,
    setLinkDisplayValue,
    sourceLinkTranslation?.linkDisplayValue?.richTextHtml,
    sourceLinkTranslation?.linkDisplayValue?.json,
    sourceLinkTranslation?.linkDisplayValue?.plainText,
    sourceRef,
  ]);

  const onChangeTerm = useCallback(
    (termId: string) => {
      if (linkDisplayValue?.enabledTerms?.includes(termId)) {
        const enabledTerms =
          linkDisplayValue?.enabledTerms?.filter((t) => t != termId) ?? [];
        if (linkDisplayValue) {
          setLinkDisplayValue?.({
            ...linkDisplayValue,
            enabledTerms,
          });
        }
      } else {
        const enabledTerms = [
          ...(linkDisplayValue?.enabledTerms?.filter((t) => t != termId) ?? []),
          termId,
        ];
        if (linkDisplayValue) {
          setLinkDisplayValue?.({
            ...linkDisplayValue,
            enabledTerms,
          });
        }
      }
    },
    [linkDisplayValue?.enabledTerms, linkDisplayValue, setLinkDisplayValue]
  );

  const onMarkHrefResolved = useCallback(() => {
    if (!linkHrefValue) {
      return;
    }
    if (sourceLinkTranslation?.linkHrefValue) {
      setLinkHrefValue({
        ...linkHrefValue,
        sourceAtRevision: {
          sourceLocaleRef: sourceLocaleRef,
          json: sourceLinkTranslation?.linkHrefValue.json,
          plainText: sourceLinkTranslation?.linkHrefValue.plainText,
          richTextHtml: sourceLinkTranslation?.linkHrefValue.richTextHtml,
        },
      });
    }
  }, [
    linkHrefValue,
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
      (sourceLinkTranslation?.linkDisplayValue?.json ?? "{}") !=
      (linkDisplayValue?.sourceAtRevision?.json ?? "{}")
    );
  }, [
    linkDisplayValue?.sourceAtRevision?.json,
    sourceLinkTranslation?.linkDisplayValue?.json,
  ]);

  const hrefRequireRevision = useMemo(() => {
    if (!sourceLinkTranslation?.linkHrefValue) {
      return false;
    }
    return (
      (sourceLinkTranslation?.linkHrefValue?.json ?? "{}") !=
      (linkHrefValue?.sourceAtRevision?.json ?? "{}")
    );
  }, [
    linkHrefValue?.sourceAtRevision?.json,
    sourceLinkTranslation?.linkHrefValue?.json,
  ]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);


  const onRemove = useCallback(() => {
    if (props.linkVariable) {
      props.onRemove(props.linkVariable);
    }
  }, [props.linkVariable, props.onRemove]);


  const sourceEnabledMentionedValues = useMemo(() => {
    return mentionedTerms
      ?.filter((mentionedTerm) => {
        return sourceLinkTranslation?.linkDisplayValue?.enabledTerms?.includes(mentionedTerm?.id);
      })
      ?.map((mentionedTerm) => mentionedTerm.value);
  }, [mentionedTerms, sourceLinkTranslation?.linkDisplayValue?.enabledTerms])

  const sourceEditorObserver = useMemo(() => {
    const variables = props.phrase.variables?.map((v) => v.name) ?? [];
    const interpolationVariants =
      props.phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables =
      props.phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    return new Observer(
      variables,
      [],
      interpolationVariants,
      sourceEnabledMentionedValues ?? [],
      contentVariables
    );
  }, [
    props.phrase.variables,
    props.phrase.contentVariables,
    props.phrase.interpolationVariants,
    sourceEnabledMentionedValues,
  ]);

  const sourceEditorDoc = useMemo(() => {
    if (sourceLinkTranslation?.linkDisplayValue && props?.systemSourceLocale?.localeCode) {
        const doc = new EditorDocument(sourceEditorObserver, props.systemSourceLocale.localeCode?.toLowerCase() ?? "en");
        doc.tree.updateRootFromHTML(sourceLinkTranslation?.linkDisplayValue?.richTextHtml ?? "")
        return doc;
    }
    return new EditorDocument(sourceEditorObserver, props?.systemSourceLocale?.localeCode?.toLowerCase() ?? "en");
  }, [props?.systemSourceLocale?.localeCode, sourceEditorObserver, sourceLinkTranslation?.linkDisplayValue]);

  const sourceMockHtml = useMemo(() => {
    return sourceEditorDoc.tree.getHtml();
  }, [sourceEditorDoc]);

  const targetMockHtml = useMemo(() => {
    return targetLinkDisplayEditorDoc.tree.getHtml();
  }, [targetLinkDisplayEditorDoc]);

  const [showMLTranslate, setShowMLTranslate] = useState(false);

  const onShowMLTranslate = useCallback(() => {
    setShowMLTranslate(true);
  }, []);

  const onHideMLTranslate = useCallback(() => {
    setShowMLTranslate(false);
  }, []);

  const [showPrompt, setShowPrompt] = useState(false);

  const onShowPrompt = useCallback(() => {
    setShowPrompt(true);
  }, []);

  const onHidePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const [showFindTerms, setShowFindTerms] = useState(false);

  const onShowFindTerms = useCallback(() => {
    setShowFindTerms(true);
  }, []);

  const onHideFindTerms = useCallback(() => {
    setShowFindTerms(false);
  }, []);

  const translationMemory = useTranslationMemory();

  const translationMemories = useMemo(() => {
    if (!sourceLinkTranslation?.linkDisplayValue) {
      return [];
    }
    if (!props.selectedLocale?.localeCode) {
      return [];
    }

    if ((sourceLinkTranslation?.linkDisplayValue?.plainText?.trim() ?? "") == "") {
      return [];
    }

    const memory = translationMemory[props.selectedLocale.localeCode];
    if (!memory) {
      return [];
    }
    if (!memory?.[sourceLinkTranslation?.linkDisplayValue?.plainText?.trim().toLowerCase() as string]) {
      return [];
    }
    const termSet = memory?.[sourceLinkTranslation?.linkDisplayValue?.plainText?.trim().toLowerCase() as string];
    if (!termSet) {
      return [];
    }
    return Array.from(termSet);
  }, [translationMemory, sourceLinkTranslation?.linkDisplayValue, props.selectedLocale]);

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => {
      clearTimeout(timeout);
    }
  }, []);

  const showResult = useMemo(() => {
    if (!props.isSearching) {
      return true;
    }
    return (
      linkDisplayValue?.plainText
        ?.toLowerCase()
        .indexOf(props.searchText.toLowerCase()) != -1 ||
      linkHrefValue?.plainText
        ?.toLowerCase()
        .indexOf(props.searchText.toLowerCase()) != -1
    );
  }, [props.isSearching, props.searchText])

  if (!showContent) {
    return null;
  }

  if (!showResult) {
    return null;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <TermModal
        show={showFindTerms && commandMode == "edit"}
        onDismiss={onHideFindTerms}
        targetPlainText={linkDisplayValue?.plainText ?? ""}
        targetEditorDoc={targetLinkDisplayEditorDoc}
      />
      <PromptModal
        show={showPrompt && commandMode == "edit"}
        selectedLocale={props.selectedLocale}
        systemSourceLocale={props.systemSourceLocale}
        targetRichText={linkDisplayValue?.richTextHtml ?? ""}
        sourceRichText={sourceLinkTranslation?.linkDisplayValue?.richTextHtml}
        sourceMockText={sourceMockHtml}
        targetMockText={targetMockHtml}
        targetEditorDoc={targetLinkDisplayEditorDoc}
        sourceEditorDoc={sourceEditorDoc}
        onDismiss={onHidePrompt}
        enabledTermIds={sourceLinkTranslation?.linkDisplayValue?.enabledTerms ?? []}
        onApplyTranslation={onSetDisplayValueContent}
      />
      {sourceLinkTranslation?.linkDisplayValue?.richTextHtml && commandMode == "edit" && (
        <MLModal
          show={showMLTranslate && commandMode == "edit"}
          selectedLocale={props.selectedLocale}
          systemSourceLocale={props.systemSourceLocale}
          sourceRichText={sourceLinkTranslation?.linkDisplayValue?.richTextHtml}
          sourceMockText={sourceMockHtml}
          sourceEditorDoc={sourceEditorDoc}
          onDismiss={onHideMLTranslate}
          enabledTermIds={sourceLinkTranslation?.linkDisplayValue.enabledTerms}
          onApplyTranslation={onSetDisplayValueContent}
        />
      )}
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
              color: diffColor,
              fontWeight: 600,
            }}
          >
            {` (${props.selectedLocale.localeCode}):`}
          </span>
        </RowTitle>
        {commandMode == "edit" && !props.isSearching && (
          <DeleteVarContainer onClick={onRemove}>
            <DeleteVar src={xIcon} />
          </DeleteVarContainer>
        )}
      </TitleRow>
      <SubContainer style={{borderColor: diffColor}}>
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
                    isDisabled={
                      sourceDisplayValueIsEmpty ||
                      !deepLSourceLocales[
                        props.systemSourceLocale?.localeCode?.toUpperCase()
                      ] ||
                      !deepLTargetLocales?.[
                        props?.selectedLocale?.localeCode?.toUpperCase()
                      ]
                    }
                    label={"ML translate"}
                    bg={"teal"}
                    size={"small"}
                    textSize="small"
                    onClick={onShowMLTranslate}
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
              onOpenGPT={onShowPrompt}
              showGPTIcon={
                (!!sourceLinkTranslation?.linkDisplayValue &&
                  (sourceLinkTranslation.linkDisplayValue?.richTextHtml?.trim() ?? "") != "" &&
                  (linkDisplayValue?.plainText?.trim() ?? "") != "") ||
                (!sourceLinkTranslation?.linkDisplayValue &&
                  (linkDisplayValue?.plainText?.trim() ?? "") != "")
              }
              onSearch={props.onFocusSearch}
            />
          )}
          {commandMode != "edit" && (
            <PlainTextDocument
              lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
              editorDoc={linkDisplayEditorDoc}
              content={linkDisplayValue?.richTextHtml ?? ""}
            />
          )}
          {linkDisplayValue && (
            <TermList
              terms={mentionedTerms ?? []}
              selectedLocale={props.selectedLocale}
              systemSourceLocale={props.systemSourceLocale}
              onChange={onChangeTerm}
              enabledTerms={linkDisplayValue?.enabledTerms ?? []}
              showFindTerms={!props.systemSourceLocale && !props.isSearching}
              onShowFindTerms={onShowFindTerms}
              isEmpty={(linkDisplayValue?.plainText?.trim?.() ?? "") == ""}
              title={
                <>
                  <span style={{ color: theme.colors.contrastText }}>
                    {`Recognized Terms in Display Value`}
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
                </>
              }
            />
          )}
          {translationMemories.length > 0 &&
            (linkDisplayValue?.plainText ?? "").trim() == "" &&
            commandMode == "edit" && !props.isSearching && (
              <TranslationMemoryList
                memories={translationMemories}
                observer={editorObserver}
                onApply={onSetDisplayValueContent}
                lang={props.selectedLocale?.localeCode}
              />
            )}
        </Container>
        {props.systemSourceLocale && linkDisplayValue && (
          <SourceLinkDisplayTranslation
            phrase={props.phrase}
            selectedLocale={props.selectedLocale}
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
                  {commandMode == "edit" && !props.isSearching && (
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
          {(fallbackLinkTranslation?.linkHrefValue?.plainText ?? "") != "" && (
            <div style={{marginBottom: 12}}>
              <BlankDisclaimer>
                <span>{`Okay to leave HREF blank, will fallback to (${props?.fallbackLocale?.localeCode}) "${fallbackLinkTranslation.linkHrefValue?.plainText}"`}</span>
              </BlankDisclaimer>
            </div>
          )}
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
        {props.systemSourceLocale && linkHrefValue && (
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
