import React, { useMemo, useCallback } from "react";
import {
  PointerTypes,
  SchemaTypes,
  useFloroContext,
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";
import { useDiffColor } from "../../diff";

const Container = styled.div`
  padding: 0;
  margin-bottom: 0px;
  margin-left: 0px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.7rem;
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
  margin-left: 16px;
  padding-top: 14px;
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

interface Props {
  variable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  variableRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"];
  index: number;
  onRemove: (
    variable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>"]
  ) => void;
}

const VariableRow = (props: Props) => {
  const theme = useTheme();
  const { commandMode } = useFloroContext();

  const varTypeFormatted = useMemo(() => {
    if (props.variable.varType == "integer") {
      return "Integer";
    }
    if (props.variable.varType == "float") {
      return "Float";
    }
    if (props.variable.varType == "string") {
      return "String";
    }
    if (props.variable.varType == "boolean") {
      return "Bool";
    }
    return null;
  }, [props.variable.varType]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const onRemove = useCallback(() => {
    if (props.variable) {
      props.onRemove(props.variable);
    }
  }, [props.variable, props.onRemove]);

  const diffColor = useDiffColor(props.variableRef, true, "darker");

  return (
    <div>
      <Container>
        <TitleRow>
          <ColorControlsContainer>
            <RowTitle
              style={{
                marginTop: 15,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  color: ColorPalette.white,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  fontSize: "1.4rem",
                  background: ColorPalette.variableGreen,
                  boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableGreenInset}`,
                  borderRadius: 8,
                  padding: 4,
                }}
              >
                {props.variable.name}
              </span>
              <span
                style={{
                  marginTop: -6,
                  color: theme.colors.pluginTitle,
                  fontWeight: 900,
                  fontSize: "2rem",
                  fontFamily: "MavenPro",
                  paddingLeft: 4,
                  paddingRight: 4,
                }}
              >
                {":"}
              </span>
              <span
                style={{
                  color: diffColor,
                  fontWeight: 600,
                  fontFamily: "MavenPro",
                  fontSize: "1.7rem",
                  marginTop: -3,
                }}
              >
                {varTypeFormatted}
              </span>
            </RowTitle>
            {commandMode == "edit" && (
              <DeleteVarContainer onClick={onRemove}>
                <DeleteVar src={xIcon} />
              </DeleteVarContainer>
            )}
          </ColorControlsContainer>
        </TitleRow>
      </Container>
    </div>
  );
};

export default React.memo(VariableRow);
