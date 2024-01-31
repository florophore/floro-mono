import React, { useEffect, useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
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
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";

import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { useDeepLContext } from "../../deepl/DeepLContext";
import SourceDisplay from "./SelectedConditionList";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import { useDeepLFetch } from "../../deepl/deepLHelpers";
import { ConditionalStatement, useChatGPTPluralizationRequest, useChatGPTTermSearch } from "../../chatgpt/chatGPTHelpers";
import { useChatGPTContext } from "../../chatgpt/ChatGPTContext";
import SelectTermList from "./SelectedConditionList";
import SelectedConditionList from "./SelectedConditionList";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

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

const AutoPluralizeText = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.2rem;
`;
interface Props {
  show: boolean;
  onDismiss: () => void;
  targetRichText: string;
  targetEditorDoc: EditorDocument;
  targetEditorObserver: Observer;
  varName: string;
  varType: string;
  locale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
  localRuleTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>"];
  varRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  hasGender: boolean;
}

const PluralizeModal = (props: Props) => {
  const { applicationState } = useFloroContext();
  const { data, isError, isLoading, reset, sendRequest } = useChatGPTPluralizationRequest();
  const [phraseGroupId, phraseId] = useExtractQueryArgs(props.varRef);
  const genderVarRef = useQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>", phraseGroupId, phraseId, "gender:string");
  const [includeGender, setIncludeGender] = useState(false);

  const [_, setConditionals] = useFloroState(`${props.localRuleTranslationRef}.conditionals`)

  useEffect(() => {
    if (props.show) {
      reset();
      setIncludeGender(!!props.hasGender);
    }
  }, [props.show, props.hasGender]);

  const { apiKey, setApiKey } = useChatGPTContext();

  const onSendRequest = useCallback(() => {
    if (!props.locale?.localeCode) {
      return;
    }
    sendRequest({
      openAIKey: apiKey ?? "",
      richText: props.targetRichText,
      localeCode: props?.locale?.localeCode,
      varName: props.varName,
      varType: props.varType,
      isGenderized: includeGender
    });
  }, [
    apiKey,
    props.targetRichText,
    props.varName,
    props.varType,
    props?.locale,
    sendRequest,
    includeGender
  ]);

  const onSetApiKey = useCallback((value) => {
    setApiKey(value ? value : "");
  }, [setApiKey])

  const [selectedConditions, setSelectedConditions] = useState<ConditionalStatement[]>([]);

  const potentialConditions = useMemo((): Array<ConditionalStatement> => {
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

  const onAddPlurals = useCallback(() => {
    const conditionals: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals"] =
      conditionsToAdd.map((condition) => {
        const doc = new EditorDocument(
          props.targetEditorObserver,
          props.locale.localeCode?.toLowerCase() ?? "en"
        );
        doc.tree.updateRootFromHTML(condition.translation);
        const json = doc.toJSON();
        const plainText = doc.toPlainText();
        if (condition.operator == "is_fractional") {
          return {
            booleanComparatorValue: undefined,
            floatComparatorValue: undefined,
            intComparatorValue: undefined,
            stringComparatorValue: undefined,
            operator: "is_fractional",
            resultant: {
              json: JSON.stringify(json),
              plainText,
              richTextHtml: condition.translation,
            },
            subconditions: condition.subconditions.map((subcondition) => {
              if (subcondition.operator == "is_fractional") {
                return {
                  conjunction: "AND",
                  variableRef: props.varRef,
                  booleanComparatorValue: undefined,
                  floatComparatorValue: undefined,
                  intComparatorValue: undefined,
                  stringComparatorValue: undefined,
                  operator: "is_fractional",
                };
              } else if (subcondition.operator == "gender") {
                return {
                  conjunction: "AND",
                  variableRef: genderVarRef,
                  booleanComparatorValue: undefined,
                  floatComparatorValue: undefined,
                  intComparatorValue: undefined,
                  stringComparatorValue: subcondition.condition as string,
                  operator: "eq",
                };
              } else {
                return {
                  conjunction: "AND",
                  variableRef: props.varRef,
                  intComparatorValue:
                    props.varType == "integer"
                      ? subcondition.condition as number
                      : undefined,
                  floatComparatorValue:
                    props.varType == "float"
                      ? subcondition.condition as number
                      : undefined,
                  booleanComparatorValue: undefined,
                  stringComparatorValue: undefined,
                  operator: subcondition.operator,
                };
              }
            }),
          };
        } else {
          return {
            intComparatorValue:
              props.varType == "integer" ? condition.condition : undefined,
            floatComparatorValue:
              props.varType == "float" ? condition.condition : undefined,
            booleanComparatorValue: undefined,
            stringComparatorValue: undefined,
            operator: condition.operator,
            resultant: {
              json: JSON.stringify(json),
              plainText,
              richTextHtml: condition.translation,
            },
            subconditions: condition.subconditions.map((subcondition) => {
              if (subcondition.operator == "is_fractional") {
                return {
                  conjunction: "AND",
                  variableRef: props.varRef,
                  booleanComparatorValue: undefined,
                  floatComparatorValue: undefined,
                  intComparatorValue: undefined,
                  stringComparatorValue: undefined,
                  operator: "is_fractional",
                };
              } else if (subcondition.operator == "gender") {
                return {
                  conjunction: "AND",
                  variableRef: genderVarRef,
                  booleanComparatorValue: undefined,
                  floatComparatorValue: undefined,
                  intComparatorValue: undefined,
                  stringComparatorValue: subcondition.condition as string,
                  operator: "eq",
                };
              } else {
                return {
                  conjunction: "AND",
                  variableRef: props.varRef,
                  intComparatorValue:
                    props.varType == "integer"
                      ? subcondition.condition as number
                      : undefined,
                  floatComparatorValue:
                    props.varType == "float"
                      ? subcondition.condition as number
                      : undefined,
                  booleanComparatorValue: undefined,
                  stringComparatorValue: undefined,
                  operator: subcondition.operator,
                };
              }
            }),
          };
        }
      });
    setConditionals(conditionals)
    props.onDismiss();
  }, [
    props.onDismiss,
    conditionsToAdd,
    props.varName,
    props.varType,
    props.varRef,
    setConditionals,
    applicationState,
    genderVarRef
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
          <HeaderTitle>{"Find Plural Conditions"}</HeaderTitle>
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
            {!data && props.hasGender && (
              <Row
                style={{
                  marginTop: 24,
                  justifyContent: "flex-end",
                  maxWidth: 504
                }}
              >
                <AutoPluralizeText style={{ marginRight: 12 }}>
                  {"Include Genderization"}
                </AutoPluralizeText>
                <Checkbox
                  isChecked={includeGender}
                  onChange={function () {
                    setIncludeGender(!includeGender);
                  }}
                />
              </Row>
            )}
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
                      potentialConditions={potentialConditions}
                      selectedConditions={selectedConditions}
                      varName={props.varName}
                      targetEditorObserver={props.targetEditorObserver}
                      onSelectCondition={(potentialCondition: ConditionalStatement) => {
                        setSelectedConditions([...selectedConditions, potentialCondition])
                      }}
                      onUnSelectCondition={(potentialCondition: ConditionalStatement) => {
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
                label={"pluralize phrase"}
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
                    label={"add plurals"}
                    bg={"purple"}
                    size={"medium"}
                    onClick={onAddPlurals}
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

export default React.memo(PluralizeModal);