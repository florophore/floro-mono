import React, { useMemo, useCallback, useState } from "react";
import { PointerTypes, SchemaTypes, useFloroContext, useFloroState } from "../../../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import Input from "@floro/storybook/stories/design-system/Input";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import ContentEditor from "@floro/storybook/stories/design-system/ContentEditor";
import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";

const Container = styled.div`
  padding: 0;
  margin-bottom: 0px;
  margin-left: 0px;
  margin-top: 24px;
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
  height: 72px;
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
]



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
  condtional: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]"];
  condtionalRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]"];
  onRemove: (conditional: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals.[?]"]) => void;
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
  index: number;
}

const ConditionalRow = (props: Props) => {
  const theme = useTheme();
  const { commandMode} = useFloroContext();

  const [conditional, setConditional] = useFloroState(props.condtionalRef);
  const [resultant, setResultant] = useFloroState(`${props.condtionalRef}.resultant`);

  const [operator, setOperator] = useState<string>(props.condtional?.operator);
  const [stringValue, setStringValue] = useState<string>(props?.condtional?.stringComparatorValue ?? "");
  const [booleanValue, setBooleanValue] = useState<boolean>(props?.condtional?.booleanComparatorValue ?? true);
  const [integerValue, setIntegerValue] = useState<string>(props?.condtional?.intComparatorValue?.toString?.() ?? "");
  const [floatValue, setFloatValue] = useState<string>(props?.condtional?.floatComparatorValue?.toString?.() ?? "");

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    return new Observer(variables);
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
    } catch(e) {
    }
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
    } catch(e) {
    }
  }, []);

  const isValueValid = useMemo(() => {
    if (props.variable.varType == "integer") {
      return /^\d+$/.test(integerValue)
    }
    if (props.variable.varType == "float") {
      return /^(\d+|\d+\.\d+)$/.test(integerValue)
    }
    if (props.variable.varType == "string") {
      return stringValue.trim() != "";
    }
    return true;
  }, [props.variable.varType, integerValue, stringValue, floatValue]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);


  const onRemove = useCallback(() => {
    if (props.condtional) {
      props.onRemove(props.condtional);
    }
  }, [props.condtional, props.onRemove]);

  const varValue = useMemo(() => {
    if (props.variable.varType == "integer") {
      return props.condtional?.intComparatorValue;
    }
    if (props.variable.varType == "float") {
      return props.condtional?.floatComparatorValue;
    }
    if (props.variable.varType == "string") {
      return props.condtional?.stringComparatorValue;
    }
    if (props.variable.varType == "boolean") {
      return props.condtional?.booleanComparatorValue;
    }
    return null;
  }, [props.variable.varType, props.condtional]);

  const operandText = useMemo(() => {
    if (props.condtional.operator == "eq") {
      return `is equal to`;
    }
    if (props.condtional.operator == "neq") {
      return `is NOT equal to`;
    }

    if (props.condtional.operator == "gt") {
      return `is greater than`;
    }
    if (props.condtional.operator == "gte") {
      return `is greater than or equal to`;
    }

    if (props.condtional.operator == "lt") {
      return `is less than`;
    }
    if (props.condtional.operator == "lte") {
      return `is less than or equal to`;
    }
    return null;
  }, [props.condtional.operator]);

  const defaultValueIsEmpty = useMemo(() => {
    return (conditional?.resultant?.plainText ?? "") == "";
  }, [conditional?.resultant?.plainText])

  const onSetResultantValueContent = useCallback(
    (richTextHtml: string) => {
      conditionalEditorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = conditionalEditorDoc.tree.rootNode.toUnescapedString();
      const json = conditionalEditorDoc.tree.rootNode.toJSON();
      if (defaultValueIsEmpty && props.globalFilterUntranslated && !props.isPinned) {
        props.setPinnedPhrases([...(props?.pinnedPhrases ?? []), props.phraseRef]);
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
      props.globalFilterUntranslated
    ]
  );

  return (
      <Container>
        <TitleRow>
          <ColorControlsContainer style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}>
            {commandMode != "edit" && (
              <RowTitle
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  height: 96,
                  marginTop: -24
                }}
              >
                  <span
                    style={{
                      fontSize: "1.4rem",
                      color: theme.colors.contrastText,
                      fontWeight: 600,
                      marginRight: 12
                    }}
                  >
                  {props.index == 0 ? 'If ': 'Otherwise if '}
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
                <span style={{fontWeight: 600, marginLeft: 12, marginRight: 12, fontSize: '1.4rem' }}>
                  {operandText}
                </span>
                <span>
                  {varValue}
                </span>
              </RowTitle>
            )}
            {commandMode == "edit" && (
              <EditRow
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  height: 96,
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      color: theme.colors.contrastText,
                      fontWeight: 600,
                      marginRight: 12
                    }}
                  >
                    {props.index == 0 ? 'If ': 'Otherwise if'}
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
                      marginLeft: 12
                    }}
                  >
                    {'is'}
                  </span>
                </div>
                <div style={{ marginRight: 24, marginLeft: 12, marginTop: -12 }}>
                  <InputSelector
                    options={
                      props.variable.varType == "integer" ||
                      props.variable.varType == "float"
                        ? options
                        : partialOperators
                    }
                    label={"operand"}
                    placeholder={"select a variable"}
                    value={operator}
                    size={
                      props.variable.varType == "integer" ||
                      props.variable.varType == "float"
                        ? "semi-short"
                        : "short"
                    }
                    onChange={(option) => {
                      if (option?.value) {
                        setOperator(option.value as string);
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
                        value={booleanValue ? "true" : "false"}
                        options={booleanOptions}
                        size="shortest"
                        onChange={(option) => {
                          if (option?.value) {
                            setBooleanValue(option.value != "false");
                          }
                        }}
                      />
                    )}
                    {props.variable.varType == "string" && (
                      <Input
                        label={"value"}
                        placeholder={"value"}
                        value={stringValue}
                        widthSize="semi-short"
                        onTextChanged={setStringValue}
                      />
                    )}
                    {props.variable.varType == "integer" && (
                      <Input
                        label={"value"}
                        placeholder={"value"}
                        value={integerValue}
                        widthSize="shortest"
                        onTextChanged={onUpdateIntegerValue}
                      />
                    )}
                    {props.variable.varType == "float" && (
                      <Input
                        label={"value"}
                        placeholder={"value"}
                        value={floatValue}
                        widthSize="shortest"
                        onTextChanged={onUpdateFloatValue}
                      />
                    )}
                  </span>
                </div>
                <div>
                </div>
              </EditRow>
            )}
            {commandMode == "edit" && (
              <DeleteVarContainer onClick={onRemove}>
                <DeleteVar src={xIcon} />
              </DeleteVarContainer>
            )}
          </ColorControlsContainer>
        </TitleRow>
        <TitleRow>
          <RowTitle
            style={{
              fontWeight: 600,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontSize: '1.4rem'
            }}
          >
            <span style={{ color: theme.colors.contrastText }}>
              {`Then (${props.lang}):`}
            </span>
            </RowTitle>
        </TitleRow>
        <div style={{marginTop: 12}}>
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
