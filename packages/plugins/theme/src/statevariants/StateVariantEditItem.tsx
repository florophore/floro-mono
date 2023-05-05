
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

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

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

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const WarningIconImg = styled.img`
  height: 24px;
  width: 24x;
  margin-left: 16px;
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

interface Props {
  stateVariant: SchemaTypes["$(theme).stateVariants.id<?>"];
  index: number;
  onRemove: (stateVariant: SchemaTypes["$(theme).stateVariants.id<?>"]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const StateVariantEditItem = (props: Props) => {
  const theme = useTheme();
  const stateVariantQuery = useQueryRef("$(theme).stateVariants.id<?>", props.stateVariant.id);
  const [stateVariant, setStateVariant] = useFloroState(stateVariantQuery);
  const controls = useDragControls();
  const isInvalid = useIsFloroInvalid(stateVariantQuery);
  const [name, setName] = useState(stateVariant?.name ?? "");

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
      if (stateVariant) {
        setStateVariant(
          {
            id: stateVariant.id,
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
    if (stateVariant) {
      props.onRemove(stateVariant);
    }
  }, [stateVariant, props.onRemove]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault?.();
    controls.start(event);
  }, [controls]);

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const title = useMemo(
    () => (isInvalid ? props.stateVariant.id : props.stateVariant.name),
    [isInvalid, props.stateVariant]
  );

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.stateVariant}
      variants={shadeItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.stateVariant.id}
      custom={(props.index + 1) * 0.05}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.stateVariant.id}
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

        {false && (
        <Input
          value={name ?? ""}
          label={"variant name"}
          placeholder={stateVariant?.id ?? ""}
          onTextChanged={setName}
          isValid={!isInvalid}
        />
        )}

        <RowTitle style={{ color: theme.colors.contrastText, marginTop: 12, width: 168 }}>{title}</RowTitle>
        <DeleteShadeContainer onClick={onRemove}>
          <DeleteShade src={xIcon} />
        </DeleteShadeContainer>
        {isInvalid && <WarningIconImg style={{marginTop: 14}} src={warningIcon} />}
      </ShadeContainer>
    </Reorder.Item>
  );
};

export default React.memo(StateVariantEditItem);