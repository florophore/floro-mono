import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { GenderCondition } from "../../chatgpt/chatGPTHelpers";
import ColorPalette from "@floro/styles/ColorPalette";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import { SchemaTypes } from "../../floro-schema-api";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";

const Display = styled.div`
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  border-radius: 8px;
  margin-top: 24px;
  padding: 8px;
  font-weight: 400;
  color: ${props => props.theme.colors.contrastText};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

interface Props {
  condition: GenderCondition;
  varName: string;
  index: number;
  targetEditorObserver: Observer;
  locale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
}

const ConditionDisplay = (props: Props) => {
  const theme = useTheme();

  const targetEditorDoc = useMemo(() => {
    const doc = new EditorDocument(
      props.targetEditorObserver,
      props.locale.localeCode?.toLowerCase() ?? "en"
    );
    doc.tree.updateRootFromHTML(props.condition.translation);
    return doc;
  }, [
    props.condition.translation,
    props.locale.localeCode,
    props.targetEditorObserver,
  ]);
  const condition = useMemo(() => {
    if (props.condition.condition == "male") {
      return `is male`;
    }
    if (props.condition.condition == "female") {
      return `is female`;
    }
    if (props.condition.condition == "neutral") {
      return `is neutral`;
    }

    return null;
  }, [props.condition.condition]);

  return (
    <div style={{ marginTop: 12 }}>
      <Row>
        <div>
          <span
            style={{
              fontSize: "1rem",
              color: theme.colors.contrastText,
              fontWeight: 600,
              marginRight: 12,
              whiteSpace: "nowrap"
            }}
          >
            {props.index == 0 ? "If " : "Otherwise if"}
          </span>
        </div>
        <div>
          <span
            style={{
              fontSize: "1rem",
              background: ColorPalette.variableGreen,
              boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableGreenInset}`,
              borderRadius: 8,
              padding: 4,
              fontWeight: 400,
              color: ColorPalette.white,
            }}
          >
            {props.varName}
          </span>
        </div>
        <div style={{textAlign: "right"}}>
          <span
            style={{
              fontSize: "1rem",
              color: theme.colors.contrastText,
              fontWeight: 600,
              marginLeft: 12,
            }}
          >
            {condition}
          </span>
        </div>
      </Row>
      <Display>
        <div dangerouslySetInnerHTML={{__html: targetEditorDoc.tree.getHtml()}}/>
      </Display>
    </div>
  );
};

export default React.memo(ConditionDisplay);
