import React, { useRef, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

interface Props {
  subcondition: {
    operator: string;
    condition: number|string;
  };
  varName: string;
  index: number;
}

const SubConditionDisplay = (props: Props) => {
  const theme = useTheme();
  const condition = useMemo(() => {
    if (props.subcondition.operator == "gender") {
      return `is`;
    }
    if (props.subcondition.operator == "eq") {
      return `is equal to`;
    }
    if (props.subcondition.operator == "neq") {
      return `is NOT equal to`;
    }

    if (props.subcondition.operator == "gt") {
      return `is greater than`;
    }
    if (props.subcondition.operator == "gte") {
      return `is greater than or equal to`;
    }

    if (props.subcondition.operator == "lt") {
      return `is less than`;
    }
    if (props.subcondition.operator == "lte") {
      return `is less than or equal to`;
    }
    if (props.subcondition.operator == "ends_with") {
      return `ends with`;
    }
    if (props.subcondition.operator == "is_fractional") {
      return `is a fractional quantity`;
    }
    return null;
  }, [props.subcondition.operator]);

  return (
    <div style={{marginTop: 12}}>
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
            {"AND"}
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
            {props.subcondition.operator == "gender" ? "gender" : props.varName}
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

          {props.subcondition.operator != "is_fractional" && (
            <span style={{ fontSize: "1rem", color: theme.colors.contrastText }}>
              {props.subcondition.condition}
            </span>
          )}
        </div>
      </Row>
    </div>
  );
};

export default React.memo(SubConditionDisplay);
