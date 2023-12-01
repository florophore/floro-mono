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
  styleClass: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>"];
  styleClassRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>"];
  index: number;
  onRemove: (
    styleClass: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styleClasses.id<?>"]
  ) => void;
}

const StyledClassRow = (props: Props) => {
  const theme = useTheme();
  const { commandMode } = useFloroContext();

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const onRemove = useCallback(() => {
    if (props.styleClass) {
      props.onRemove(props.styleClass);
    }
  }, [props.styleClass, props.onRemove]);

  const diffColor = useDiffColor(props.styleClassRef, true, "lighter", theme.colors.titleText);

  return (
    <div>
      <Container>
        <TitleRow>
          <ColorControlsContainer>
            <RowTitle
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  color: diffColor,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  fontSize: "2rem",
                }}
              >
                {props.styleClass.name}
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

export default React.memo(StyledClassRow);
