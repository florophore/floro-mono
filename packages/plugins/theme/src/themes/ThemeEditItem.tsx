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
import ColorPalette from "@floro/styles/ColorPalette";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

const ThemeContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 72px;
`;

const DeleteThemeContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteTheme = styled.img`
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

const CardContainer = styled.div`
  display: flex;
`;

const Card = styled.div`
  position: relative;
  height: 136px;
  width: 216px;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.colorPaletteCard};
  border: 2px solid;
`;

const CardInterior = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h4`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  text-align: center;
  padding: 0;
  margin: 16px 0 0 0;
`;

const NoneText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.black};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
`;

const ColorDisplayCircle = styled.div`
  border: 2px solid ${ColorPalette.black};
  height: 72px;
  width: 72px;
  border-radius: 50%;
  margin-top: 8px;
  background: ${ColorPalette.white};
  position: relative;
  overflow: hidden;
  position: relative;
`;

const ColorCircle = styled.div`
  border: 0;
  outline: 0;
  appearance: none;
  height: 72px;
  width: 72px;
  position: absolute;
`;

const HiddenColorInput = styled.input`
    height: 32px;
    width: 32px;
    position: absolute;
    appearance: none;
    opacity: 0;
`

const ColorTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.black};
  text-align: center;
  padding: 0;
  margin: 4px 0 0 0;
`;

const EditIndicatorWrapper = styled.div`
  height: 32px;
  width: 32px;
  position: absolute;
  top: 4px;
  right: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
`;

const EditIndicatorImg = styled.img`
  height: 20px;
  width: 20px;
  cursor: pointer;
`;


const ExitIndicatorWrapper = styled.div`
  height: 32px;
  width: 32px;
  position: absolute;
  top: 4px;
  left: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
`;

const ExitIndicatorImg = styled.img`
  height: 20px;
  width: 20px;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 40px;
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

interface ShadeItemProps {
  themeObject: SchemaTypes["$(theme).themes.id<?>"];
  index: number;
  onRemove: (shade: SchemaTypes["$(theme).themes.id<?>"]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const ShadeEditItem = (props: ShadeItemProps) => {
  const theme = useTheme();
  const themeQuery = useQueryRef("$(theme).themes.id<?>", props.themeObject.id);
  const [themeObject, setTheme] = useFloroState(themeQuery);
  const controls = useDragControls();
  const isInvalid = useIsFloroInvalid(themeQuery);
  const colorCircle = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(themeObject?.name ?? "");

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const title = useMemo(
    () => (isInvalid ? props.themeObject.id : props.themeObject.name),
    [isInvalid, props.themeObject]
  );

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditLight;
    }
    return EditDark;
  }, [theme.name]);

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
      if (themeObject) {
        setTheme(
          {
            id: themeObject.id,
            name: name.trimStart(),
            backgroundColor: themeObject.backgroundColor
          }
        );
      }
    }, 100);

    return () => {
      clearTimeout(nameTimeout.current);
    }
  }, [name]);

  const onRemove = useCallback(() => {
    if (themeObject) {
      props.onRemove(themeObject);
    }
  }, [themeObject, props.onRemove]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault?.();
    controls.start(event);
  }, [controls]);

  const onShowEditor = useCallback(() => {
    //setIsEdittingHex(true);
    if (inputRef?.current?.value && themeObject) {
        setTheme({
          ...themeObject,
          backgroundColor: {
            ...themeObject.backgroundColor,
            hexcode: inputRef.current.value?.toUpperCase(),
          }
        });
    }
  }, [setTheme, themeObject]);


  const onBlurHiddenInput = useCallback(() => {
    if (inputRef?.current?.value && themeObject) {
        setTheme({
          ...themeObject,
          backgroundColor: {
            ...themeObject.backgroundColor,
            hexcode: inputRef.current.value?.toUpperCase(),
          }
        });
    }
  }, [setTheme, themeObject])

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (themeObject) {
        setTheme({
          ...themeObject,
          backgroundColor: {
            ...themeObject.backgroundColor,
            hexcode: event.target.value?.toUpperCase(),
          }
        });
    }
  }, [setTheme, themeObject])

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      value={props.themeObject}
      variants={shadeItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.themeObject.id}
      custom={(props.index + 1) * 0.05}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.themeObject.id}
      style={{ position: "relative" }}
      onDragStart={props.onDragStart}
      onDragEnd={props.onDragEnd}
    >
      <ThemeContainer>
        <DragShadeContainer onPointerDown={onPointerDown}>
          <DragIcon src={draggerIcon} />
        </DragShadeContainer>
        {false && (
          <Input
            value={name ?? ""}
            label={"theme name"}
            placeholder={themeObject?.id ?? ""}
            onTextChanged={setName}
            isValid={!isInvalid}
          />
        )}

        <RowTitle style={{ color: theme.colors.contrastText, marginTop: 12, width: 168 }}>{title}</RowTitle>
        <DeleteThemeContainer onClick={onRemove}>
          <DeleteTheme src={xIcon} />
        </DeleteThemeContainer>
        {isInvalid && <WarningIconImg style={{marginTop: 14}} src={warningIcon} />}
      </ThemeContainer>
      <RowWrapper>
        <Row>
          <Card style={{ borderColor: "transparent" }}>
            <CardInterior>
              <ColorDisplayCircle>
                <ColorCircle
                  ref={colorCircle}
                  style={{
                    background:
                      themeObject?.backgroundColor?.hexcode ?? "transparent",
                  }}
                />
              </ColorDisplayCircle>
              <ColorTitle>{`${themeObject?.backgroundColor?.hexcode}`}</ColorTitle>
            </CardInterior>
            <EditIndicatorWrapper onClick={onShowEditor}>
              <EditIndicatorImg src={editIcon} />
              <HiddenColorInput
                ref={inputRef}
                onChange={onChange}
                onBlur={onBlurHiddenInput}
                type={"color"}
                defaultValue={
                  themeObject?.backgroundColor?.hexcode ?? "#000000"
                }
              />
            </EditIndicatorWrapper>
          </Card>
        </Row>
      </RowWrapper>
    </Reorder.Item>
  );
};

export default React.memo(ShadeEditItem);