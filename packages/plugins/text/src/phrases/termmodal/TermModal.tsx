import React, { useEffect, useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import {
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "../../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { useDeepLContext } from "../../deepl/DeepLContext";
import SourceDisplay from "./SelectTermList";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import { useDeepLFetch } from "../../deepl/deepLHelpers";
import { useChatGPTTermSearch } from "../../chatgpt/chatGPTHelpers";
import { useChatGPTContext } from "../../chatgpt/ChatGPTContext";
import SelectTermList from "./SelectTermList";

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
  targetPlainText: string;
  targetEditorDoc: EditorDocument;
}

const TermModal = (props: Props) => {
  const { applicationState } = useFloroContext();

  const { data, isError, isLoading, reset, sendRequest } = useChatGPTTermSearch();

  useEffect(() => {
    if (props.show) {
      reset();
    }
  }, [props.show]);

  const [terms, setTerms] = useFloroState("$(text).terms");

  const { apiKey, setApiKey } = useChatGPTContext();

  const defaultLocale = useReferencedObject(applicationState?.text.localeSettings.defaultLocaleRef);

  const escapedPlainText = useMemo(() => {
    const tags = props.targetEditorDoc.observer.getAllTags();
    return tags.reduce((s: string, tag) => {
      const targetTag = `{${tag}}`;
      const escapedTag = `[do not include placeholder]`;
      return s.replaceAll(targetTag, escapedTag);
    }, props.targetPlainText);
  }, [props.targetPlainText, props.targetEditorDoc]);

  const onSendRequest = useCallback(() => {
    if (!defaultLocale.localeCode) {
      return;
    }
    sendRequest({
      openAIKey: apiKey ?? "",
      plainText: escapedPlainText,
      localeCode: defaultLocale.localeCode
    });
  }, [
    apiKey,
    escapedPlainText,
    defaultLocale,
    sendRequest,
  ]);

  const onSetApiKey = useCallback((value) => {
    setApiKey(value ? value : "");
  }, [setApiKey])

  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  const potentialNewTerms = useMemo(() => {
    if (!data) {
      return [];
    }
    const termSet = new Set<string>(terms?.map?.(t => t.id) ?? []);
    return data.filter(foundTerm => {
      const foundTermId = foundTerm?.trim?.()?.replaceAll?.(/ +/g, "_")?.toLowerCase?.();
      return !termSet.has(foundTermId);
    });
  }, [terms, data]);

  useEffect(() => {
    setSelectedTerms([...potentialNewTerms]);
  }, [potentialNewTerms])

  const onAppendNewTerms = useCallback(() => {
    if (!applicationState?.text.localeSettings.defaultLocaleRef || !terms) {
      return;
    }
    const newTerms = selectedTerms.map((term): SchemaTypes['$(text).terms.id<?>'] => {
      const id = term.trim().replaceAll(/ +/g, "_")?.toLowerCase();
      const localizedTerm: SchemaTypes['$(text).terms.id<?>.localizedTerms.id<?>'] = {
        id: applicationState?.text.localeSettings.defaultLocaleRef,
        termValue: term
      }
      return {
        id,
        name: term,
        localizedTerms: [localizedTerm]
      }
    });
    setTerms(
      [
        ...newTerms,
        ...terms,
      ]
    )
    props.onDismiss();
  }, [props.onDismiss, setTerms, terms, selectedTerms, applicationState?.text.localeSettings.defaultLocaleRef])

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"Find Terms"}</HeaderTitle>
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
                marginTop: 12,
                justifyContent: "center",
              }}
            >
              <Input
                value={apiKey ?? ""}
                onTextChanged={onSetApiKey}
                widthSize={"wide"}
                label={"Open AI api key"}
                placeholder={"Open AI API Key"}
              />
            </Row>
            {data && (
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
                  {potentialNewTerms.length == 0 && (
                    <div
                      style={{
                        marginTop: 24,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        paddingRight: 12,
                      }}
                    >
                      <WarningLabel
                        label={"No new terms found"}
                        size={"large"}
                      />
                    </div>
                  )}
                  {potentialNewTerms.length > 0 && (
                    <SelectTermList
                      label={"found terms"}
                      potentialTerms={potentialNewTerms}
                      selectedTerms={selectedTerms}
                      onSelectTerm={function (term: string): void {
                        setSelectedTerms([...selectedTerms, term]);
                      }}
                      onUnSelectTerm={function (term: string): void {
                        setSelectedTerms(
                          selectedTerms.filter((t) => t != term)
                        );
                      }}
                    />
                  )}
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
                  <WarningLabel
                    label={
                      "Please check your Open AI Api Keys and Plan to ensure they are correct."
                    }
                    size={"small"}
                  />
                </div>
              </Row>
            )}
          </div>
          {!data && (
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
                label={"find new glossary terms"}
                bg={"orange"}
                size={"extra-big"}
                isLoading={isLoading}
                onClick={onSendRequest}
              />
            </div>
          )}
          {data && (
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
                    isDisabled={selectedTerms.length == 0}
                    label={"add terms"}
                    bg={"purple"}
                    size={"medium"}
                    onClick={onAppendNewTerms}
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

export default React.memo(TermModal);