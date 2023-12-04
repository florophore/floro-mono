import React, { useEffect, useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import {
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useReferencedObject,
} from "../../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { useDeepLContext } from "../../deepl/DeepLContext";
import SourceDisplay from "./SourceDisplay";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import { useDeepLFetch } from "../../deepl/deepLHelpers";

const OuterContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const planOptions = [
  {
    label: "Free Plan",
    value: "free",
  },
  {
    label: "Pro Plan",
    value: "pro",
  },
];

interface Props {
  show: boolean;
  onDismiss: () => void;
  sourceRichText: string;
  sourceMockText: string;
  sourceEditorDoc: EditorDocument;
  enabledTermIds: string[];
  selectedLocale?: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale?:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  onApplyTranslation: (richText: string) => void;
}

const MLModal = (props: Props) => {
  const { applicationState } = useFloroContext();

  const { data, isError, isLoading, reset, sendRequest } = useDeepLFetch();

  useEffect(() => {
    if (props.show) {
      reset();
    }
  }, [props.show]);

  const terms = useReferencedObject("$(text).terms");
  const tsvEntries = useMemo(() => {
    const enabledTermIds = new Set(props.enabledTermIds);
    const targetLocaleRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      props.selectedLocale?.localeCode ?? ""
    );
    const sourceLocaleRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      props.systemSourceLocale?.localeCode ?? ""
    );
    const seenSource = new Set<string>([]);
    return (
      terms
        ?.filter((t) => enabledTermIds.has(t.id))
        .flatMap((term) => {
          const sourceValue =
            term.localizedTerms.find((localizedTerm) => {
              return localizedTerm.id == sourceLocaleRef;
            })?.termValue ?? term?.name;

          const targetValue =
            term.localizedTerms.find((localizedTerm) => {
              return localizedTerm.id == targetLocaleRef;
            })?.termValue ?? term?.name;

          return {
            source: (sourceValue == "" ? term.name : sourceValue)
              .replaceAll("\n", " ")
              .replaceAll("\t", " "),
            target: (targetValue == "" ? term.name : targetValue)
              .replaceAll("\n", " ")
              .replaceAll("\t", " "),
          };
        })
        ?.filter(({ source }) => {
          if (!seenSource.has(source)) {
            seenSource.add(source);
            return true;
          }
          return false;
        })
        ?.map(({ source, target }) => {
          return `${source}\t${target}`;
        }) ?? []
    );
  }, [terms, props.selectedLocale, applicationState, props.enabledTermIds]);

  const { apiKey, setApiKey, isFreePlan, setIsFreePlan } = useDeepLContext();

  const onChangePlan = useCallback(
    (option) => {
      if (option.value) {
        setIsFreePlan(option.value == "free");
      }
    },
    [setIsFreePlan]
  );

  const escapedRichText = useMemo(() => {
    const tags = props.sourceEditorDoc.observer.getAllTags();
    return tags.reduce((s: string, tag) => {
      const targetTag = `{${tag}}`
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;")
      .replaceAll("&", "&amp;");
      const escapedTag = `<x>{${tag}}</x>`;
      return s.replaceAll(targetTag, escapedTag);
    }, props.sourceRichText);
  }, [props.sourceRichText, props.sourceEditorDoc]);

  const onSendDeepLTranslateRequest = useCallback(() => {
    sendRequest({
      isFreePlan,
      deepLKey: apiKey ?? "",
      tsvEntries: tsvEntries.join("\n"),
      targetLang: props.selectedLocale?.localeCode ?? "",
      sourceLang: props.systemSourceLocale?.localeCode ?? "",
      text: escapedRichText,
    });
  }, [
    isFreePlan,
    apiKey,
    props.selectedLocale?.localeCode,
    props?.systemSourceLocale?.localeCode,
    escapedRichText,
    tsvEntries,
    sendRequest,
  ]);

  const translatedString = useMemo(() => {
    if (!data?.translation) {
      return null;
    }
    const tags = props.sourceEditorDoc.observer.getAllTags();
    return tags.reduce((s: string, tag) => {
      const targetTag = `{${tag}}`;
      const escapedTag = `<x>{${tag}}</x>`;
      return s.replaceAll(escapedTag, targetTag);
    }, data?.translation);
  }, [data, data?.translation, props.sourceEditorDoc]);

  const mockTranslatedString = useMemo(() => {
    if (!translatedString) {
      return null;
    }
    props.sourceEditorDoc.tree.updateRootFromHTML(translatedString);
    return props.sourceEditorDoc.tree.getHtml();
  }, [translatedString]);

  const onApplyTranslation = useCallback(() => {
    if (translatedString) {
        props.onApplyTranslation?.(translatedString);
        props.onDismiss();
    }
  }, [translatedString, props.onApplyTranslation, props.onDismiss])

  const onSetApiKey = useCallback((value) => {
    setApiKey(value ? value : "");
  }, [setApiKey])

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"ML Translate"}</HeaderTitle>
        </HeaderWrapper>
      }
    >
      <OuterContainer>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div>
            <Row
              style={{
                justifyContent: "center",
              }}
            >
              <InputSelector
                options={planOptions}
                value={isFreePlan ? "free" : "pro"}
                label={"DeepL plan type"}
                placeholder={"select your DeepL Plan Type"}
                onChange={onChangePlan}
                size="wide"
              />
            </Row>
            <Row
              style={{
                marginTop: 12,
                justifyContent: "center",
              }}
            >
              <Input
                value={apiKey ?? ""}
                onTextChanged={onSetApiKey}
                widthSize={"wide"}
                label={"DeepL api key"}
                placeholder={"DeepL API Key"}
              />
            </Row>
            <Row
              style={{
                marginTop: 24,
                flexDirection: "row",
                justifyContent: "center",
                width: "100%",
                alignSelf: "center",
              }}
            >
              <div style={{ width: 470 }}>
                <SourceDisplay
                  value={props.sourceMockText}
                  label={"source to translate"}
                  maxHeight={192}
                />
              </div>
            </Row>
            {mockTranslatedString && (
              <Row
                style={{
                  marginTop: 24,
                  flexDirection: "row",
                  justifyContent: "center",
                  width: "100%",
                  alignSelf: "center",
                }}
              >
                <div style={{ width: 470 }}>
                  <SourceDisplay
                    value={mockTranslatedString}
                    label={"DeepL translation"}
                    maxHeight={192}
                  />
                </div>
              </Row>
            )}
            {isError && (
              <Row
                style={{
                  marginTop: 24,
                  flexDirection: "row",
                  justifyContent: "center",
                  width: "100%",
                  alignSelf: "center",
                }}
              >
                <div style={{ width: 470 }}>
                    <WarningLabel label={"Please check your DeepL Api Keys and Plan to ensure they are correct."} size={"small"}/>
                </div>
              </Row>
            )}
          </div>
          {!mockTranslatedString && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Button
                isDisabled={apiKey?.trim() == ""}
                label={"translate phrase"}
                bg={"orange"}
                size={"extra-big"}
                isLoading={isLoading}
                onClick={onSendDeepLTranslateRequest}
              />
            </div>
          )}
          {mockTranslatedString && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div style={{ width: 470 }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Button
                    label={"cancel"}
                    bg={"gray"}
                    size={"medium"}
                    onClick={props.onDismiss}
                  />
                  <Button
                    label={"apply translation"}
                    bg={"purple"}
                    size={"medium"}
                    onClick={onApplyTranslation}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(MLModal);