
import React, { useMemo } from "react";
import { SchemaTypes, useFloroContext, useHasConflict, useIsFloroInvalid, useQueryRef, useWasAdded, useWasRemoved } from "./floro-schema-api";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";

const ColorContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ColorLabel = styled.label`
  padding: 0px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  color: ${props => props.theme.colors.contrastText};
`;

const ColorDotContainer = styled.div`
  height: 56px;
  width: 56px;
  margin-right: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ColorDot = styled.div`
  height: 16px;
  width: 16px;
  background-color: ${props => props.theme.colors.contrastText};
  border-radius: 50%;
`;

const WarningIconImg = styled.img`
  height: 24xpx;
  width: 24x;
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
}

const ColorReadItem = (props: ColorItemProps) => {
  const theme = useTheme();
  const colorQuery = useQueryRef("$(palette).colors.id<?>", props.color.id);
  const isInvalid = useIsFloroInvalid(colorQuery);
  const wasRemoved = useWasRemoved(colorQuery);
  const wasAdded = useWasAdded(colorQuery);
  const hasConflict = useHasConflict(colorQuery);

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

  return (
    <motion.li
      variants={colorItemVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      layoutId={props.color.id}
      custom={0.05}
      whileHover={{ scale: 1 }}
      whileDrag={{ scale: 1.02 }}
      key={props.color.id}
      style={{ position: "relative" }}
    >
      <ColorContainer>
        <ColorDotContainer>
          {!isInvalid && <ColorDot style={{ background: color }} />}
          {isInvalid && <WarningIconImg src={warningIcon} />}
        </ColorDotContainer>
        <ColorLabel style={{ color }}>
          {isInvalid ? props?.color?.id : props?.color.name}
        </ColorLabel>
      </ColorContainer>
    </motion.li>
  );
};

export default React.memo(ColorReadItem);