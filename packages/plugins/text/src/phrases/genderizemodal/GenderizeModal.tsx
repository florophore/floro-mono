import React, { useEffect, useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import {
  PointerTypes,
  SchemaTypes,
  useFloroContext,
  useFloroState,
} from "../../floro-schema-api";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import { GenderCondition, useChatGPTGenderizationRequest, } from "../../chatgpt/chatGPTHelpers";
import { useChatGPTContext } from "../../chatgpt/ChatGPTContext";
import SelectedConditionList from "./SelectedConditionList";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";

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

interface Props {
  show: boolean;
  onDismiss: () => void;
  targetRichText: string;
  targetEditorDoc: EditorDocument;
  targetEditorObserver: Observer;
  locale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
  localRuleTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>"];
  varRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
}

const GenderizeModal = (props: Props) => {
  const { applicationState } = useFloroContext();
  const { data, isError, isLoading, reset, sendRequest } = useChatGPTGenderizationRequest();

  const [_, setConditionals] = useFloroState(`${props.localRuleTranslationRef}.conditionals`)

  useEffect(() => {
    if (props.show) {
      reset();
    }
  }, [props.show]);

  const { apiKey, setApiKey } = useChatGPTContext();

  const onSendRequest = useCallback(() => {
    if (!props.locale?.localeCode) {
      return;
    }
    sendRequest({
      openAIKey: apiKey ?? "",
      richText: props.targetRichText,
      localeCode: props?.locale?.localeCode,
    });
  }, [
    apiKey,
    props.targetRichText,
    props?.locale,
    sendRequest,
  ]);

  const onSetApiKey = useCallback((value) => {
    setApiKey(value ? value : "");
  }, [setApiKey])

  const [selectedConditions, setSelectedConditions] = useState<GenderCondition[]>([]);

  const potentialConditions = useMemo((): Array<GenderCondition> => {
    if (data) {
      return data;
    }
    return [];
  }, [data]);
  useEffect(() => {
    setSelectedConditions([...potentialConditions]);
  }, [potentialConditions]);

  const conditionsToAdd = useMemo(() => {
    return potentialConditions.filter(condition => {
      return selectedConditions.includes(condition);
    })
  }, [potentialConditions, selectedConditions])

  const onAddGenders = useCallback(() => {
    const conditionals: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals"] =
      conditionsToAdd.map((condition) => {
        const doc = new EditorDocument(
          props.targetEditorObserver,
          props.locale.localeCode?.toLowerCase() ?? "en"
        );
        doc.tree.updateRootFromHTML(condition.translation);
        const json = doc.toJSON();
        const plainText = doc.toPlainText();
        return {
          intComparatorValue: undefined,
          floatComparatorValue: undefined,
          booleanComparatorValue: undefined,
          stringComparatorValue: condition.condition,
          operator: "eq",
          resultant: {
            json: JSON.stringify(json),
            plainText,
            richTextHtml: condition.translation,
          },
          subconditions: []
        };
      });
    setConditionals(conditionals)
    props.onDismiss();
  }, [
    props.onDismiss,
    conditionsToAdd,
    props.varRef,
    setConditionals,
    applicationState,
  ]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismiss}
      disableBackgroundDismiss
      headerSize={"small"}
      topOffset={80}
      zIndex={5}
      headerChildren={
        <HeaderWrapper>
          <HeaderTitle>{"Find Gender Conditions"}</HeaderTitle>
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
                  {potentialConditions.length == 0 && (
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
                        label={"No plurals to add"}
                        size={"large"}
                      />
                    </div>
                  )}
                  {potentialConditions.length > 0 && (
                    <SelectedConditionList
                      label={"plurals"}
                      locale={props.locale}
                      varName="gender"
                      potentialConditions={potentialConditions}
                      selectedConditions={selectedConditions}
                      targetEditorObserver={props.targetEditorObserver}
                      onSelectCondition={(potentialCondition: GenderCondition) => {
                        setSelectedConditions([...selectedConditions, potentialCondition])
                      }}
                      onUnSelectCondition={(potentialCondition: GenderCondition) => {
                        setSelectedConditions(
                          selectedConditions.filter(c => c != potentialCondition)
                        )
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
                label={"genderize phrase"}
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
                    isDisabled={potentialConditions.length == 0}
                    label={"add genders"}
                    bg={"purple"}
                    size={"medium"}
                    onClick={onAddGenders}
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

export default React.memo(GenderizeModal);