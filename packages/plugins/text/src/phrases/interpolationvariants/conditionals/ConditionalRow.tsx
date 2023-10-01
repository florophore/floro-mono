import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  useFloroContext,
  useFloroState,
} from "../../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import Input from "@floro/storybook/stories/design-system/Input";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import ContentEditor from "@floro/storybook/stories/design-system/ContentEditor";
import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";
import NewSubCondition from "./subconditions/NewSubCondition";
import SubCondition from "./subconditions/SubCondition";

const Container = styled.div`
  padding: 0;
  margin-bottom: 0px;
  margin-left: 0px;
  margin-top: 24px;
`;

const ContentRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const EditRow = styled.div`
  font-family: "MavenPro";
  font-weight: 400;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ColorControlsContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DeleteVarContainer = styled.div`
  cursor: pointer;
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

const options = [
  {
    value: "eq",
    label: "equal to",
  },
  {
    value: "neq",
    label: "NOT equal to",
  },
  {
    value: "gt",
    label: "greater than",
  },
  {
    value: "gte",
    label: "greater than or equal to",
  },
  {
    value: "lt",
    label: "less than",
  },
  {
    value: "lte",
    label: "less than or equal to",
  },
];

const floatOptions = [
  {
    value: "eq",
    label: "equal to",
  },
  {
    value: "neq",
    label: "NOT equal to",
  },
  {
    value: "gt",
    label: "greater than",
  },
  {
    value: "gte",
    label: "greater than or equal to",
  },
  {
    value: "lt",
    label: "less than",
  },
  {
    value: "lte",
    label: "less than or equal to",
  },
  {
    value: "is_fractional",
    label: "a fractional quantity",
  },
];

const partialOperators = [
  {
    value: "eq",
    label: "equal to",
  },
  {
    value: "neq",
    label: "NOT equal to",
  },
];

const booleanOptions = [
  {
    value: "true",
    label: "TRUE",
  },
  {
    value: "false",
    label: "FALSE",
  },
];

const AddSubCondition = styled.p`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${ColorPalette.linkBlue};
  cursor: pointer;
  padding: 0;
`;

const colorPaletteItemVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom,
    },
  }),
};

interface Props {
  lang: string;
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  variable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  interpolationVariant: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  conditional: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]"];
  conditionalRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]"];
  onRemove: (
    index: number,
    conditional: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]"]
  ) => void;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
  index: number;
}

const ConditionalRow = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const { commandMode } = useFloroContext();

  const [conditional, setConditional] = useFloroState(props.conditionalRef);
  const [resultant, setResultant] = useFloroState(
    `${props.conditionalRef}.resultant`
  );
  const [integerValue, setIntegerValue] = useState<string>(
    props?.conditional?.intComparatorValue?.toString?.() ?? ""
  );
  const [floatValue, setFloatValue] = useState<string>(
    props?.conditional?.floatComparatorValue?.toString?.() ?? ""
  );

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    return new Observer(variables, [], []);
  }, [props.phrase.variables]);

  const conditionalEditorDoc = useMemo(() => {
    if (conditional) {
      const doc = new EditorDocument(
        editorObserver,
        props.lang?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(conditional?.resultant?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      editorObserver,
      props.lang?.toLowerCase() ?? "en"
    );
  }, [conditional, props.lang, editorObserver]);

  const onUpdateIntegerValue = useCallback((value: string) => {
    try {
      if (value == "") {
        setIntegerValue("");
        return;
      }
      const int = parseInt(value);
      if (!Number.isNaN(int)) {
        setIntegerValue(int.toString());
      }
      return;
    } catch (e) {}
  }, []);

  const onUpdateFloatValue = useCallback((value: string) => {
    try {
      if (value == "") {
        setFloatValue("");
        return;
      }
      if (/^\d+\.$/.test(value)) {
        setFloatValue(value);
        return;
      }
      const float = parseFloat(value);
      if (!Number.isNaN(float)) {
        setFloatValue(float.toString());
      }
      return;
    } catch (e) {}
  }, []);

  const isValueValid = useMemo(() => {
    if (props.variable.varType == "integer") {
      return /^\d+$/.test(integerValue);
    }
    if (props.variable.varType == "float") {
      return /^(\d+|\d+\.\d+)$/.test(floatValue);
    }
    if (props.variable.varType == "string") {
      return (conditional?.stringComparatorValue?.trim?.() ?? "") != "";
    }
    return true;
  }, [props.variable.varType, integerValue, conditional?.stringComparatorValue, floatValue]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const onRemove = useCallback(() => {
    if (props.conditional) {
      props.onRemove(props.index, props.conditional);
    }
  }, [props.index, props.conditional, props.onRemove]);

  const varValue = useMemo(() => {
    if (props.variable.varType == "integer") {
      return props.conditional?.intComparatorValue;
    }
    if (props.variable.varType == "float") {
      return props.conditional?.floatComparatorValue;
    }
    if (props.variable.varType == "string") {
      return props.conditional?.stringComparatorValue;
    }
    if (props.variable.varType == "boolean") {
      return props.conditional?.booleanComparatorValue ? "TRUE" : "FALSE";
    }
    return null;
  }, [props.variable.varType, props.conditional]);

  const operandText = useMemo(() => {
    if (props.conditional.operator == "eq") {
      return `is equal to`;
    }
    if (props.conditional.operator == "neq") {
      return `is NOT equal to`;
    }

    if (props.conditional.operator == "gt") {
      return `is greater than`;
    }
    if (props.conditional.operator == "gte") {
      return `is greater than or equal to`;
    }

    if (props.conditional.operator == "lt") {
      return `is less than`;
    }
    if (props.conditional.operator == "lte") {
      return `is less than or equal to`;
    }
    if (props.conditional.operator == "is_fractional") {
      return `is a fractional quantity`;
    }
    return null;
  }, [props.conditional.operator]);

  const [showAddSubcondition, setShowAddSubcondition] = useState(false);

  const onShowAddSubcondition = useCallback(() => {
    setShowAddSubcondition(true);
  }, []);

  const onHideAddSubcondition = useCallback(() => {
    setShowAddSubcondition(false);
  }, []);

  const defaultValueIsEmpty = useMemo(() => {
    return (conditional?.resultant?.plainText ?? "") == "";
  }, [conditional?.resultant?.plainText]);

  const onSetResultantValueContent = useCallback(
    (richTextHtml: string) => {
      conditionalEditorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = conditionalEditorDoc.tree.rootNode.toUnescapedString();
      const json = conditionalEditorDoc.tree.rootNode.toJSON();
      if (
        defaultValueIsEmpty &&
        props.globalFilterUntranslated &&
        !props.isPinned
      ) {
        props.setPinnedPhrases([
          ...(props?.pinnedPhrases ?? []),
          props.phraseRef,
        ]);
      }
      setResultant({
        richTextHtml,
        plainText,
        json: JSON.stringify(json),
      });
    },
    [
      conditionalEditorDoc?.tree,
      conditional,
      setResultant,
      defaultValueIsEmpty,
      props.isPinned,
      props.setPinnedPhrases,
      props.pinnedPhrases,
      props.phraseRef,
      props.globalFilterUntranslated,
    ]
  );

  return (
    <Container>
      <TitleRow>
        <ColorControlsContainer
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          {commandMode != "edit" && (
            <RowTitle
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                height: 96,
                marginTop: -24,
              }}
            >
              <span
                style={{
                  fontSize: "1.4rem",
                  color: theme.colors.contrastText,
                  fontWeight: 600,
                  marginRight: 12,
                }}
              >
                {props.index == 0 ? "If " : "Otherwise if "}
              </span>
              <span
                style={{
                  fontSize: "1.4rem",
                  background: ColorPalette.variableGreen,
                  boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableGreenInset}`,
                  borderRadius: 8,
                  padding: 4,
                  fontWeight: 500,
                  color: ColorPalette.white,
                }}
              >
                {props.variable.name}
              </span>
              <span
                style={{
                  fontWeight: 600,
                  marginLeft: 12,
                  marginRight: 12,
                  fontSize: "1.4rem",
                }}
              >
                {operandText}
              </span>
              {props.conditional.operator != "is_fractional_quantity" && (
                <span>{varValue}</span>
              )}
            </RowTitle>
          )}
          {commandMode == "edit" && (
            <EditRow
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
                minHeight: 96,
              }}
            >
              <ContentRow>
                <div>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      color: theme.colors.contrastText,
                      fontWeight: 600,
                      marginRight: 12,
                    }}
                  >
                    {props.index == 0 ? "If " : "Otherwise if"}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      background: ColorPalette.variableGreen,
                      boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableGreenInset}`,
                      borderRadius: 8,
                      padding: 4,
                      fontWeight: 400,
                      color: ColorPalette.white,
                    }}
                  >
                    {props.variable.name}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      color: theme.colors.contrastText,
                      fontWeight: 600,
                      marginLeft: 12,
                    }}
                  >
                    {"is"}
                  </span>
                </div>
                <div
                  style={{ marginRight: 24, marginLeft: 12, marginTop: -12 }}
                >
                  <InputSelector
                    options={
                      props.variable.varType == "integer" ?
                      options :
                      props.variable.varType == "float"
                        ? floatOptions
                        : partialOperators
                    }
                    label={"operand"}
                    placeholder={"select a variable"}
                    value={conditional?.operator as string}
                    size={
                      props.variable.varType == "integer" ||
                      props.variable.varType == "float"
                        ? "semi-short"
                        : "short"
                    }
                    onChange={(option) => {
                      if (option?.value && conditional) {
                        if (props.variable.varType == "float" && conditional.floatComparatorValue == undefined) {
                          setConditional({
                            ...conditional,
                            operator: option.value as string,
                            floatComparatorValue: 0
                          })
                          setFloatValue("0");
                        } else {
                          setConditional({
                            ...conditional,
                            operator: option.value as string
                          })
                        }
                      }
                    }}
                  />
                </div>
                <div style={{ marginTop: -12 }}>
                  <span>
                    {props.variable.varType == "boolean" && (
                      <InputSelector
                        label={"value"}
                        placeholder={"value"}
                        isValid={isValueValid}
                        value={conditional?.booleanComparatorValue ? "true" : "false"}
                        options={booleanOptions}
                        size="shortest"
                        onChange={(option) => {
                          if (option?.value && conditional) {
                            setConditional({
                              ...conditional,
                              booleanComparatorValue: option.value != "false"
                            })
                          }
                        }}
                      />
                    )}
                    {props.variable.varType == "string" && (
                      <Input
                        label={"value"}
                        placeholder={"value"}
                        value={conditional?.stringComparatorValue ?? ""}
                        widthSize="semi-short"
                        isValid={isValueValid}
                        onTextChanged={(stringComparatorValue) => {
                          if (conditional) {
                            setConditional({
                              ...conditional,
                              stringComparatorValue
                            })
                          }
                        }}
                      />
                    )}
                    {props.variable.varType == "integer" && (
                      <Input
                        label={"value"}
                        placeholder={"value"}
                        isValid={isValueValid}
                        value={integerValue}
                        widthSize="shortest"
                        onTextChanged={(text) => {
                          if (/^\d+$/.test(text) && conditional) {
                            setConditional({
                              ...conditional,
                              intComparatorValue: parseInt(text)
                            })
                          }
                          onUpdateIntegerValue(text)
                        }}
                      />
                    )}
                    {props.variable.varType == "float" && props.conditional.operator != "is_fractional" &&  (
                      <Input
                        label={"value"}
                        placeholder={"value"}
                        isValid={isValueValid}
                        value={floatValue}
                        widthSize="shortest"
                        onTextChanged={(text) => {
                          if (/^\d+\.$/.test(text) && conditional) {
                            setConditional({
                              ...conditional,
                              floatComparatorValue: parseFloat(text)
                            })
                          }
                          onUpdateFloatValue(text)
                        }}
                      />
                    )}
                  </span>
                </div>
              </ContentRow>
              <div></div>
            </EditRow>
          )}
          {commandMode == "edit" && (
            <DeleteVarContainer onClick={onRemove}>
              <DeleteVar src={xIcon} />
            </DeleteVarContainer>
          )}
        </ColorControlsContainer>
      </TitleRow>
      {conditional?.subconditions?.map((subcondition, index) => {
        return (
          <SubCondition
            key={index}
            index={index}
            phraseRef={props.phraseRef}
            variableRef={subcondition.variableRef}
            conditionalRef={props.conditionalRef}
            subconditionRef={`${props.conditionalRef}.subconditions.[${index}]`}
            subcondition={subcondition}
            onHideAddSubcondition={onHideAddSubcondition}
          />
        )
      })}
      {showAddSubcondition && commandMode == "edit" && (
        <NewSubCondition
          variableRef={props.interpolationVariant.variableRef}
          phraseRef={props.phraseRef}
          condtionalRef={props.conditionalRef}
          onHideAddSubcondition={onHideAddSubcondition}
        />
      )}
      <TitleRow>
        <RowTitle
          style={{
            fontWeight: 600,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "1.4rem",
            width: "100%",
          }}
        >
          <span style={{ color: theme.colors.contrastText }}>
            {`Then (${props.lang}):`}
          </span>
          {commandMode == "edit" && !showAddSubcondition && (
            <>
              <AddSubCondition onClick={onShowAddSubcondition}>
                {"+ add subcondition"}
              </AddSubCondition>
            </>
          )}
        </RowTitle>
      </TitleRow>
      <div style={{ marginTop: 12 }}>
        {commandMode == "edit" && (
          <ContentEditor
            lang={props.lang?.toLowerCase() ?? "en"}
            editorDoc={conditionalEditorDoc}
            content={resultant?.richTextHtml ?? ""}
            onSetContent={onSetResultantValueContent}
            placeholder={`write the resultant value...`}
          />
        )}
        {commandMode != "edit" && (
          <PlainTextDocument
            lang={props.lang?.toLowerCase() ?? "en"}
            editorDoc={conditionalEditorDoc}
            content={resultant?.richTextHtml ?? ""}
          />
        )}
      </div>
    </Container>
  );
};

export default React.memo(ConditionalRow);
