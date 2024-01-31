import React, { useRef, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import { ConditionalStatement } from "../../chatgpt/chatGPTHelpers";
import ColorPalette from "@floro/styles/ColorPalette";
import SubConditionDisplay from "./SubConditionDisplay";
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
  condition: ConditionalStatement;
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
    if (props.condition.operator == "eq") {
      return `is equal to`;
    }
    if (props.condition.operator == "neq") {
      return `is NOT equal to`;
    }

    if (props.condition.operator == "gt") {
      return `is greater than`;
    }
    if (props.condition.operator == "gte") {
      return `is greater than or equal to`;
    }

    if (props.condition.operator == "lt") {
      return `is less than`;
    }
    if (props.condition.operator == "lte") {
      return `is less than or equal to`;
    }
    if (props.condition.operator == "ends_with") {
      return `ends with`;
    }
    if (props.condition.operator == "is_fractional") {
      return `is a fractional quantity`;
    }
    return null;
  }, [props.condition.operator]);

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
            {condition + " "}
          </span>

          {props.condition.operator != "is_fractional" && (
            <span style={{ fontSize: "1rem", color: theme.colors.contrastText }}>
              {props.condition.condition}
            </span>
          )}
        </div>
      </Row>
      {props.condition.subconditions.map((subcondition, index) => {
        return (
          <SubConditionDisplay
            varName={props.varName}
            key={index}
            subcondition={subcondition}
            index={index}
          />
        );
      })}
      <Display>
        <div dangerouslySetInnerHTML={{__html: targetEditorDoc.tree.getHtml()}}/>
      </Display>
    </div>
  );
};

export default React.memo(ConditionDisplay);
