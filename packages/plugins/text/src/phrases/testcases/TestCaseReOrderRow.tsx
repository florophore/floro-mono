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
  localeCase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.testCases.id<?>.localeTests.description<?>"];
  index: number;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const TestCaseReOrderRow = (props: Props) => {
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

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.localeCase}
      variants={colorPaletteItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.localeCase.description}
      custom={(props.index + 1) * 0.005}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.localeCase.description}
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
                fontWeight: 600,
                color: theme.colors.titleText,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                fontSize: "1.7rem",
                marginTop: 12
              }}
            >
              {props.localeCase.description}
            </RowTitle>
          </ColorControlsContainer>
        </TitleRow>
      </Container>
    </Reorder.Item>
  );
};

export default React.memo(TestCaseReOrderRow);
