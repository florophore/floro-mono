import React, { useRef, useMemo, useState, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import {
  SchemaTypes,
  makeQueryRef,
  useFloroContext,
  useReferencedObject,
} from "../../floro-schema-api";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import { useTheme } from "@emotion/react";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { useDeepLContext } from "../../deepl/DeepLContext";
import SourceDisplay from "./SourceDisplay";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import { useDeepLFetch } from "../../deepl/deepLHelpers";
import { useChatGPTContext } from "../../chatgpt/ChatGPTContext";
import { useChatGPTFetch } from "../../chatgpt/chatGPTHelpers";
import ChatDisplay from "./ChatDisplay";
import ColorPalette from "@floro/styles/ColorPalette";
import sanitizeHtml from 'sanitize-html';

const CommentBox = styled.div`
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 8px;
  border-radius: 8px;
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const GrowWrap = styled.div`
  display: grid;
  margin-bottom: 6px;
  &:after {
    content: attr(data-replicated-value) " ";
    white-space: pre-wrap;
    border: 0;

    font: inherit;
    /* Place on top of each other */
    grid-area: 1 / 1 / 2 / 2;
    padding: 0px;
    margin-right: 12px;

    color: ${props => props.theme.colors.contrastText};
    font-size: 1.2rem;
    font-family: "MavenPro";
    font-weight: 400;
    pointer-events: none;
    outline: none;
    padding: 4px;
  }
`;

const TextArea = styled.textarea`
  resize: none;
  overflow: hidden;
  font: inherit;

  border: 0;
  /* Place on top of each other */
  grid-area: 1 / 1 / 2 / 2;
  padding: 0px;
  margin-right: 12px;

  color: ${props => props.theme.colors.contrastText};
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 400;
  outline: none;
  padding: 4px;
  background: none;
  &::-webkit-input-placeholder {
    color: ${props => props.theme.colors.contrastTextLight};
  }

  &:-moz-placeholder { /* Firefox 18- */
    color: ${props => props.theme.colors.contrastTextLight};
  }

  textarea:-ms-input-placeholder {
    color: ${props => props.theme.colors.contrastTextLight};
  }
`;



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

const GrowCommentContainer = styled.div`
  flex-grow: 1;
  overflow-y: scroll;
`;

const ClearMessages = styled.span`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.linkColor};
  font-weight: 600;
  font-size: 1.44rem;
  cursor: pointer;
`;

interface Props {
  show: boolean;
  onDismiss: () => void;
  targetRichText?: string;
  sourceRichText?: string;
  sourceMockText: string;
  targetMockText: string;
  targetEditorDoc: EditorDocument;
  sourceEditorDoc: EditorDocument;
  enabledTermIds: string[];
  selectedLocale?: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale?:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  onApplyTranslation: (richText: string) => void;
}

const PromptModal = (props: Props) => {
  const theme = useTheme();
  const { applicationState } = useFloroContext();
  const [prompt, setPrompt] = useState("");

  const hasMultipleSources = useMemo(() => {
    return (
      !!props.systemSourceLocale?.localeCode &&
      props.systemSourceLocale?.localeCode != props?.selectedLocale?.localeCode
    );
  }, [props.systemSourceLocale?.localeCode, props?.selectedLocale?.localeCode]);

  const disabledColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.lightGray;
    }
    return ColorPalette.mediumGray;
  }, [theme.name])

  const disabledBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name])

  useEffect(() => {

    if (growWrap?.current) {
      growWrap.current.dataset.replicatedValue = prompt;
    }
  }, [prompt])

  const onInput = useCallback(() => {
    if (growWrap?.current && growTextarea?.current) {
        growWrap.current.dataset.replicatedValue = growTextarea.current.value;
    }
  }, []);

  const onChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  }, [])


  const growWrap = useRef<HTMLDivElement>(null);
  const growTextarea = useRef<HTMLTextAreaElement>(null);

  const { data, isError, isLoading, reset, sendRequest } = useChatGPTFetch();
  const [messages, setMessages] = useState<Array<{
    prompt: string
    includeSource: boolean
    promptResponse: string
  }>>([]);

  const [lastPrompt, setLastPrompt] = useState("");

  useEffect(() => {
    if (props.show) {
      reset();
    }
  }, [props.show]);

  useEffect(() => {
    setMessages([]);
  }, [props.selectedLocale?.localeCode]);

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

  const { apiKey, setApiKey } = useChatGPTContext();

  useEffect(() => {
    if (!data) {
      return;
    }
    reset();
    setMessages([...messages, {
      prompt: data.prompt,
      promptResponse: data.promptResponse,
      includeSource: data.includeSource
    }])
  }, [data, isLoading, messages])

  const processedMessages = useMemo(() => {
    return messages.map(message => {
      props.targetEditorDoc.tree.updateRootFromHTML(message.promptResponse);
      const promptResponse = props.targetEditorDoc.tree.getHtml();
      return {
        includeSource: message.includeSource,
        prompt: message.prompt,
        promptResponse
      }
    });
  }, [props?.targetRichText, props?.targetEditorDoc, messages]);


  const isDisabled = useMemo(() => {
    if (!apiKey) {
      return true;
    }
    return false;
  }, [apiKey, props.targetRichText])

  const onSend = useCallback(() => {
    if (isDisabled) {
      return;
    }
    setLastPrompt(prompt);
    setPrompt("");
    if (!apiKey || !props?.selectedLocale?.localeCode) {
      return;
    }

    if (hasMultipleSources) {
      sendRequest({
        prompt,
        openAIKey: apiKey,
        targetText: props?.targetRichText ?? "",
        sourceText: props?.sourceRichText ?? "",
        targetLang: props?.selectedLocale?.localeCode,
        sourceLang: props.systemSourceLocale?.localeCode ?? "",
        includeSource: !!hasMultipleSources,
        termBase: tsvEntries.join("\t"),
        messages,
      });
    } else {
      sendRequest({
        prompt,
        openAIKey: apiKey,
        targetText: props?.targetRichText ?? "",
        sourceText: "",
        targetLang: props?.selectedLocale?.localeCode,
        sourceLang: "",
        includeSource: false,
        termBase: "",
        messages,
      });
    }
  }, [
    prompt,
    isDisabled,
    apiKey,
    props.targetRichText,
    props.selectedLocale?.localeCode,
    props?.systemSourceLocale?.localeCode,
    tsvEntries,
    sendRequest,
    messages,
    hasMultipleSources,
  ])

  const onClear = useCallback(() => {
    setMessages([]);
  }, [])

  const onSetApiKey = useCallback((value) => {
    setApiKey(value ? value : "");
  }, [setApiKey]);

  const onApply = useCallback((index: number) => {
    if (!messages[index]) {
      return;
    }
    const sanitizizedString: string = sanitizeHtml(messages[index].promptResponse, {
      allowedTags: [
        "b",
        "i",
        "u",
        "br",
        "sup",
        "s",
        "strike",
        "sub",
        "ul",
        "ol",
        "li",
      ],
    });
    props.onApplyTranslation?.(sanitizizedString)
    props.onDismiss();
  }, [messages, props.onApplyTranslation, props.onDismiss]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      width={1040}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"ChatGPT"}</HeaderTitle>
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
                justifyContent: "flex-start",
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
            <Row
              style={{
                marginTop: 24,
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "100%",
                alignSelf: "center",
              }}
            >
              {hasMultipleSources && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                  <SourceDisplay
                    value={props.targetMockText}
                    label={"target document"}
                    maxHeight={132}
                  />
                  <div style={{width: 24}}/>
                  <SourceDisplay
                    value={props.sourceMockText}
                    label={"source document"}
                    maxHeight={132}
                  />
                </div>

              )}
              {!hasMultipleSources && props?.targetMockText?.trim() != "" && (
                <div style={{ width: '100%' }}>
                  <SourceDisplay
                    value={props.targetMockText}
                    label={"target document"}
                    maxHeight={132}
                  />
                </div>
              )}
            </Row>
            <Row
              style={{
                marginTop: 24,
                flexDirection: "row",
                justifyContent: "flex-start",
                width: "100%",
                alignSelf: "center",
              }}
            >
              <div style={{ width: '100%', height: 300 }}>
                <ChatDisplay
                  maxHeight={300}
                  messages={processedMessages}
                  pendingPrompt={lastPrompt ?? ""}
                  isLoading={isLoading}
                  isError={isError}
                  onApply={onApply}
                  isEmpty={props.targetRichText?.trim() == ""}
                />
              </div>
            </Row>
            <Row
              style={{
                marginTop: 24,
                flexDirection: "row",
                justifyContent: "flex-end",
                width: "100%",
              }}
            >
              {messages.length > 0 && (
                <ClearMessages onClick={onClear}>{'clear messages'}</ClearMessages>
              )}
            </Row>
            {false && (
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
                    <WarningLabel label={"Please check your OpenAI Api Key and Plan to ensure they are correct."} size={"small"}/>
                </div>
              </Row>
            )}
          </div>
          <div>
      <CommentBox
        style={
          isDisabled
            ? {
                background: disabledColor,
                borderColor: disabledBorderColor,
                cursor: "not-allowed",
              }
            : {}
        }
      >
        <GrowCommentContainer style={{ maxHeight: 60 }}>
          <GrowWrap ref={growWrap}>
            <TextArea
              style={isDisabled ? { cursor: "not-allowed" } : {}}
              disabled={isDisabled}
              value={prompt}
              onChange={onChange}
              onInput={onInput}
              rows={1}
              ref={growTextarea}
              placeholder={props.targetRichText?.trim() == "" ? `Ask ChatGRP to write something for you`: `Request edits (e.g. "please correct grammar", "please edit tone to be warmer, yet technical")...`}
            />
          </GrowWrap>
        </GrowCommentContainer>
        <Button
          isLoading={isLoading}
          isDisabled={isDisabled || prompt.trim() == ""}
          label={"send"}
          bg={"orange"}
          size={"small"}
          onClick={onSend}
        />
      </CommentBox>
          </div>
        </div>
      </OuterContainer>
    </RootLongModal>
  );
};

export default React.memo(PromptModal);