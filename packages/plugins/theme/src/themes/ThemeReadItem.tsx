import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { SchemaTypes, useFloroState, useHasConflict, useIsFloroInvalid, useQueryRef, useReferencedObject, useWasAdded, useWasRemoved } from "../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Input from "@floro/storybook/stories/design-system/Input";
import XCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";


import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 24px;
`;
const ThemeContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 96px;
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

const ColorTitle = styled.h4`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.black};
  text-align: center;
  padding: 0;
  margin: 4px 0 0 0;
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

const IndicatorCircle = styled.img`
  height: 16px;
  width: 16px;
  border-radius: 50%;
  pointer-events: none;
  user-select: none;
  background: ${(props) => props.theme.colors.contrastText};
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

interface ShadeItemProps {
  themeObject: SchemaTypes["$(theme).themes.id<?>"];
  index: number;
}

const ThemeReadItem = (props: ShadeItemProps) => {
  const theme = useTheme();
  const themeQuery = useQueryRef("$(theme).themes.id<?>", props.themeObject.id);
  const themeObject = useReferencedObject(themeQuery);

  const isInvalid = useIsFloroInvalid(themeQuery, true);
  const wasRemoved = useWasRemoved(themeQuery, true);
  const wasAdded = useWasAdded(themeQuery, true);
  const hasConflict = useHasConflict(themeQuery, true);

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
    () => (isInvalid ? props.themeObject.id : props.themeObject.name),
    [isInvalid, props.themeObject]
  );

  const cardBorderColor = useMemo(() => {
    if (hasConflict) {
      return theme.colors.conflictBackground;
    }
    if (wasRemoved) {
      return theme.colors.removedBackground;
    }
    if (wasAdded) {
      return theme.colors.addedBackground;
    }
    return theme.colors.colorPaletteCard;
  }, [wasAdded, wasRemoved, wasRemoved, hasConflict, theme]);

  return (
    <Container>
      <ThemeContainer>
        <DragShadeContainer>
          <IndicatorCircle style={{ backgroundColor: color }} />
        </DragShadeContainer>
        <RowTitle style={{ color, marginTop: 12 }}>{title}</RowTitle>
        {isInvalid && <WarningIconImg style={{marginTop: 14}} src={warningIcon} />}
      </ThemeContainer>
      <RowWrapper>
        <Row>
          <Card style={{ borderColor: cardBorderColor }}>
            <CardInterior>
              <ColorDisplayCircle>
                <ColorCircle
                  style={{
                    background:
                      themeObject?.backgroundColor?.hexcode ?? "transparent",
                  }}
                />
              </ColorDisplayCircle>
              <ColorTitle>{`${themeObject?.backgroundColor?.hexcode}`}</ColorTitle>
            </CardInterior>
          </Card>
        </Row>
      </RowWrapper>
    </Container>
  );
};

export default React.memo(ThemeReadItem);