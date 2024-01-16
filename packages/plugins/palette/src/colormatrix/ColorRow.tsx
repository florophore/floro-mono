import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  SchemaTypes,
  useFloroContext,
  useFloroState,
  useHasConflict,
  useHasIndication,
  useIsFloroInvalid,
  useQueryRef,
  useReferencedObject,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import { AnimatePresence, Reorder, motion, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import ColorCell from "./ColorCell";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import Input from "@floro/storybook/stories/design-system/Input";

import XCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";

const Container = styled.div`
  padding: 0;
  margin-bottom: 8px;
  margin-right: 36px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 36px;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 40px;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const WarningIconImg = styled.img`
  height: 24px;
  width: 24x;
  margin-left: 16px;
`;

const ColorControlsContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 72px;
`;

const DeleteShadeContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteShade = styled.img`
  height: 32px;
  width: 32px;
  pointer-events: none;
  user-select: none;
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

const IndicatorCircle = styled.img`
  height: 16px;
  width: 16px;
  border-radius: 50%;
  pointer-events: none;
  user-select: none;
  background: ${(props) => props.theme.colors.contrastText};
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

const paletteCellVariants =  {
  active: {
      marginTop: 0,
      height: 20,
      width: 104,
      y: -30,
      scale: 0.35,
  },
  inactive: {
    scale: 1,
    marginTop: 0,
    transition: { duration: 0.3 }
  }
};

interface Props {
  colorPalette: SchemaTypes["$(palette).colorPalettes.id<?>"];
  index: number;
  onRemove: (
    colorPalette: SchemaTypes["$(palette).colorPalettes.id<?>"]
  ) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isReOrderMode: boolean;
}

const ColorRow = (props: Props) => {
  const theme = useTheme();
  const colorPaletteRef = useQueryRef(
    "$(palette).colorPalettes.id<?>",
    props.colorPalette.id
  );
  const colorPalette = useReferencedObject(colorPaletteRef);
  const isInvalid = useIsFloroInvalid(colorPaletteRef, false);
  const wasRemoved = useWasRemoved(colorPaletteRef, false);
  const wasAdded = useWasAdded(colorPaletteRef, false);
  const hasConflict = useHasConflict(colorPaletteRef, false);
  const { commandMode } = useFloroContext();
  const controls = useDragControls();
  const [name, setName] = useState(props.colorPalette.name ?? "");

  const motionState = useMemo(() => {
    if (props.isReOrderMode && commandMode == "edit") {
      return "active";
    }
    return "inactive";
  }, [props.isReOrderMode, commandMode]);

  const color = useMemo(() => {
    if (hasConflict) {
      return theme.colors.conflictText;
    }
    if (wasRemoved) {
      return theme.colors.removedText;
    }
    if (wasAdded) {
      return theme.colors.addedText;
    }
    return theme.colors.contrastText;
  }, [theme, wasRemoved, wasAdded, hasConflict]);

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const title = useMemo(
    () => (isInvalid ? props.colorPalette.id : props.colorPalette.name),
    [isInvalid, props.colorPalette]
  );

  const shades = useReferencedObject("$(palette).shades");

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return XCircleLight;
    }
    return XCircleDark;
  }, [theme.name]);

  const draggerIcon = useMemo(() => {
    if (theme.name == "light") {
      return DraggerLight;
    }
    return DraggerDark;
  }, [theme.name]);

  //let nameTimeout = useRef<NodeJS.Timer>();
  //useEffect(() => {
  //  if (nameTimeout?.current) {
  //    clearTimeout(nameTimeout?.current);
  //  }
  //  nameTimeout.current = setTimeout(() => {
  //    if (colorPalette) {
  //      setColorPalette(
  //        {
  //          id: colorPalette.id,
  //          name: name.trimStart(),
  //          colorShades: colorPalette?.colorShades,
  //        },
  //      );
  //    }
  //  }, 100);

  //  return () => {
  //    clearTimeout(nameTimeout.current);
  //  }
  //}, [name]);

  const onRemove = useCallback(() => {
    if (colorPalette) {
      props.onRemove(colorPalette);
    }
  }, [colorPalette, props.onRemove]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault?.();
      controls.start(event, {
        snapToCursor: false
      });
    },
    [controls]
  );

  return (

    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.colorPalette}
      variants={colorPaletteItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.colorPalette.id}
      custom={(props.index + 1) * 0.005}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.colorPalette.id}
      style={{position: "relative"}}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
    <Container>
      <TitleRow>
        {commandMode != "edit" && (
          <>
            <DragShadeContainer style={{cursor: "default"}}>
              <IndicatorCircle style={{backgroundColor: color, marginTop: -12}} />
            </DragShadeContainer>
            <RowTitle style={{ color }}>{title}</RowTitle>
            {isInvalid && <WarningIconImg src={warningIcon} />}
          </>
        )}
        {commandMode == "edit" && (
          <>
          {props.isReOrderMode && (
            <ColorControlsContainer>
              <DragShadeContainer onPointerDown={onPointerDown}>
                <DragIcon src={draggerIcon} />
              </DragShadeContainer>
              <RowTitle style={{ color, marginTop: 12 }}>{title}</RowTitle>
              {isInvalid && <WarningIconImg style={{marginTop: 14}} src={warningIcon} />}
            </ColorControlsContainer>
          )}
          {!props.isReOrderMode && (
            <ColorControlsContainer>
              <DragShadeContainer style={{cursor: "default"}}>
                <IndicatorCircle style={{backgroundColor: color}} />
              </DragShadeContainer>
              {false && (
                <Input
                  value={name ?? ""}
                  label={"color name"}
                  placeholder={colorPalette?.id ?? ""}
                  onTextChanged={setName}
                  isValid={!isInvalid}
                />
              )}
              <RowTitle style={{ color, marginTop: 12, width: 168 }}>{title}</RowTitle>
              <DeleteShadeContainer onClick={onRemove}>
                <DeleteShade src={xIcon} />
              </DeleteShadeContainer>
              {isInvalid && <WarningIconImg style={{marginTop: 14}} src={warningIcon} />}
            </ColorControlsContainer>
          )}
          </>
        )}
      </TitleRow>
      <motion.div
          variants={paletteCellVariants}
          animate={motionState}
          style={{zIndex: 0}}
      >
        <RowWrapper>
          <Row>
            {shades?.map((shade) => {
              return (
                <ColorCell
                  key={shade.id}
                  shade={shade}
                  colorPalette={props.colorPalette}
                  isReOrderMode={props.isReOrderMode}
                />
              );
            })}
          </Row>
        </RowWrapper>
      </motion.div>
    </Container>
    </Reorder.Item>
  );
};

export default React.memo(ColorRow);
