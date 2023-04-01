
import React, { useMemo, useCallback, useState } from "react";
import { SchemaTypes, useFloroState, useIsFloroInvalid, useQueryRef } from "./floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Input from "@floro/storybook/stories/design-system/Input";
import XCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";

const ColorContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 96px;
`;

const DeleteColorContainer = styled.div`
  cursor: pointer;
  margin-left: 24px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteColor = styled.img`
  height: 32px;
  width: 32px;
  pointer-events: none;
  user-select: none;
`;

const DragColorContainer = styled.div`
  height: 50px;
  width: 50px;
  cursor: grab;
  margin-right: 24px;
  margin-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const DragIcon = styled.img`
  height: 32px;
  width: 32px;
  pointer-events: none;
  user-select: none;
`;

const colorItemVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom,
    },
  }),
};

interface ColorItemProps {
  color: SchemaTypes["$(palette).colors.id<?>"];
  index: number;
  onRemove: (color: SchemaTypes["$(palette).colors.id<?>"]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const ColorEditItem = (props: ColorItemProps) => {
  const theme = useTheme();
  const colorQuery = useQueryRef("$(palette).colors.id<?>", props.color.id);
  const [color, setColor] = useFloroState(colorQuery);
  const controls = useDragControls();
  const isInvalid = useIsFloroInvalid(colorQuery);

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

  const onUpdateName = useCallback(
    (name: string) => {
      if (color) {
        setColor(
          {
            id: color.id,
            name: name.trimStart(),
          },
          true
        );
      }
    },
    [color]
  );

  const onRemove = useCallback(() => {
    if (color) {
      props.onRemove(color);
    }
  }, [color, props.onRemove]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault?.();
    controls.start(event);
  }, [controls]);

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.color}
      variants={colorItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.color.id}
      custom={(props.index + 1) * 0.05}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.color.id}
      style={{position: "relative"}}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      <ColorContainer>
        <DragColorContainer
          onPointerDown={onPointerDown}
        >
            <DragIcon src={draggerIcon}/>
        </DragColorContainer>
        <Input
          value={color?.name ?? ""}
          label={"color name"}
          placeholder={color?.id ?? ""}
          onTextChanged={onUpdateName}
          isValid={!isInvalid}
        />
        <DeleteColorContainer onClick={onRemove}>
          <DeleteColor src={xIcon} />
        </DeleteColorContainer>
      </ColorContainer>
    </Reorder.Item>
  );
};

export default React.memo(ColorEditItem);