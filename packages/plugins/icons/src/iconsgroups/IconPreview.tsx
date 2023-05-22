import React, { useMemo, useCallback } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useBinaryData,
  useBinaryRef,
  useExtractQueryArgs,
  useFloroContext,
  useHasConflict,
  useIsFloroInvalid,
  useReferencedObject,
  useWasAdded,
  useWasRemoved,
} from "../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import ColorPalette from "@floro/styles/ColorPalette";
import { getColorDistance } from "../colorhooks";


const Container = styled.div`
    margin-right: 8px;
`;

const PreviewIconcontainer = styled.div`
  height: 40px;
  width: 40px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PreviewIcon = styled.img`
  height: 32px;
  width: 32px;
`;


interface Props {
  iconRef: PointerTypes["$(icons).iconGroups.id<?>.icons.id<?>"];
  icon: SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"];
  index: number;
}

const IconPreview = (props: Props) => {
  const theme = useTheme();
  const isInvalid = useIsFloroInvalid(props.iconRef, false);
  const wasRemoved = useWasRemoved(props.iconRef, false);
  const wasAdded = useWasAdded(props.iconRef, false);
  const hasConflict = useHasConflict(props.iconRef, false);
  const { commandMode } = useFloroContext();

  const defaultIconTheme = useReferencedObject(props.icon.defaultIconTheme);
  const binRef = useBinaryRef(props.icon.svg);

  const contrastColor = useMemo(() => {
    if (!defaultIconTheme?.backgroundColor) {
      if (theme.name == "dark") {
        return ColorPalette.white;
      }
      return ColorPalette.mediumGray;
    }
    const lightDistance = getColorDistance(
      ColorPalette.white,
      defaultIconTheme?.backgroundColor?.hexcode
    );

    const darkDistance = getColorDistance(
      ColorPalette.mediumGray,
      defaultIconTheme.backgroundColor.hexcode
    );

    if (lightDistance <= darkDistance) {
      return ColorPalette.mediumGray;
    }
    return ColorPalette.white;
  }, [defaultIconTheme?.backgroundColor, theme]);

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
    return contrastColor;
    //return theme.colors.colorPaletteCard;
  }, [
    contrastColor,
    wasAdded,
    wasRemoved,
    wasRemoved,
    hasConflict,
    theme,
    commandMode,
  ]);

  if (!binRef) {
    return null;
  }

  return (
      <Container>
        <PreviewIconcontainer style={{
            background: defaultIconTheme?.backgroundColor?.hexcode,
            border: `2px solid ${contrastColor}`
        }}>
            <PreviewIcon src={binRef}/>
        </PreviewIconcontainer>

      </Container>
  );
};

export default React.memo(IconPreview);
