import React, { useMemo, useCallback } from "react";
import { SchemaTypes } from "../../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";

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

const DragShadeContainer = styled.div`
  height: 50px;
  cursor: grab;
  margin-right: 24px;
  margin-top: 14px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const DragIcon = styled.img`
  height: 24px;
  width: 24px;
  pointer-events: none;
  user-select: none;
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
  interpolationVariant: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  index: number;
  onDragStart: () => void;
  onDragEnd: () => void;
  onRemove: (variable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"]) => void;
}

const InterpolationVariantReOrderRow = (props: Props) => {
  const theme = useTheme();
  const controls = useDragControls();

  const draggerIcon = useMemo(() => {
    if (theme.name == "light") {
      return DraggerLight;
    }
    return DraggerDark;
  }, [theme.name]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault?.();
      controls.start(event, {
        snapToCursor: false,
      });
    },
    [controls]
  );

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);


  const onRemove = useCallback(() => {
    if (props.interpolationVariant) {
      props.onRemove(props.interpolationVariant);
    }
  }, [props.interpolationVariant, props.onRemove]);

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.interpolationVariant}
      variants={colorPaletteItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.interpolationVariant.name}
      custom={(props.index + 1) * 0.005}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.interpolationVariant.name}
      style={{ position: "relative" }}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      <Container>
        <TitleRow>
          <ColorControlsContainer>
            <DragShadeContainer onPointerDown={onPointerDown}>
              <DragIcon src={draggerIcon} />
            </DragShadeContainer>
            <RowTitle
              style={{
                fontWeight: 500,
                color: ColorPalette.darkGray,
                marginTop: 15,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                fontSize: "1.4rem",
                background: ColorPalette.variableYellow,
                boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableYellowInset}`,
                borderRadius: 8,
                padding: 4
              }}
            >
              {props.interpolationVariant.name}
            </RowTitle>
            <DeleteVarContainer onClick={onRemove}>
              <DeleteVar src={xIcon} />
            </DeleteVarContainer>
          </ColorControlsContainer>
        </TitleRow>
      </Container>
    </Reorder.Item>
  );
};

export default React.memo(InterpolationVariantReOrderRow);
