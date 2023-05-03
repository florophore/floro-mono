
import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { SchemaTypes, useFloroState, useIsFloroInvalid, useQueryRef } from "../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Input from "@floro/storybook/stories/design-system/Input";
import XCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";

const ShadeContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 96px;
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
  width: 40px;
  cursor: grab;
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

const shadeItemVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom,
    },
  }),
};

interface ShadeItemProps {
  shade: SchemaTypes["$(palette).shades.id<?>"];
  index: number;
  onRemove: (shade: SchemaTypes["$(palette).shades.id<?>"]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const ShadeEditItem = (props: ShadeItemProps) => {
  const theme = useTheme();
  const shadeQuery = useQueryRef("$(palette).shades.id<?>", props.shade.id);
  const [shade, setShade] = useFloroState(shadeQuery);
  const controls = useDragControls();
  const isInvalid = useIsFloroInvalid(shadeQuery);
  const [name, setName] = useState(shade?.name ?? "");

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

  let nameTimeout = useRef<NodeJS.Timer>();
  useEffect(() => {
    if (nameTimeout?.current) {
      clearTimeout(nameTimeout?.current);
    }
    nameTimeout.current = setTimeout(() => {
      if (shade) {
        setShade(
          {
            id: shade.id,
            name: name.trimStart(),
          },
          true
        );
      }
    }, 100);

    return () => {
      clearTimeout(nameTimeout.current);
    }
  }, [name]);

  const onRemove = useCallback(() => {
    if (shade) {
      props.onRemove(shade);
    }
  }, [shade, props.onRemove]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault?.();
    controls.start(event);
  }, [controls]);

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.shade}
      variants={shadeItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.shade.id}
      custom={(props.index + 1) * 0.05}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.shade.id}
      style={{position: "relative"}}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      <ShadeContainer>
        <DragShadeContainer
          onPointerDown={onPointerDown}
        >
            <DragIcon src={draggerIcon}/>
        </DragShadeContainer>
        <Input
          value={name ?? ""}
          label={"shade name"}
          placeholder={shade?.id ?? ""}
          onTextChanged={setName}
          isValid={!isInvalid}
        />
        <DeleteShadeContainer onClick={onRemove}>
          <DeleteShade src={xIcon} />
        </DeleteShadeContainer>
      </ShadeContainer>
    </Reorder.Item>
  );
};

export default React.memo(ShadeEditItem);