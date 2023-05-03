
import React, { useMemo } from "react";
import { SchemaTypes, useHasConflict, useIsFloroInvalid, useQueryRef, useWasAdded, useWasRemoved } from "../floro-schema-api";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const ShadeContainer = styled.div`
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ShadeLabel = styled.label`
  padding: 0px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  color: ${props => props.theme.colors.contrastText};
`;

const ShadeDotContainer = styled.div`
  height: 56px;
  width: 32px;
  margin-right: 8px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const ShadeDot = styled.div`
  height: 16px;
  width: 16px;
  background-color: ${props => props.theme.colors.contrastText};
  border-radius: 50%;
`;

const WarningIconImg = styled.img`
  height: 24xpx;
  width: 24x;
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
}

const ShadeReadItem = (props: ShadeItemProps) => {
  const theme = useTheme();
  const shadeQuery = useQueryRef("$(palette).shades.id<?>", props.shade.id);
  const isInvalid = useIsFloroInvalid(shadeQuery);
  const wasRemoved = useWasRemoved(shadeQuery);
  const wasAdded = useWasAdded(shadeQuery);
  const hasConflict = useHasConflict(shadeQuery);

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
    >
      <ShadeContainer>
        <ShadeDotContainer>
          {!isInvalid &&
            <ShadeDot style={{ background: color }}/>
          }
          {isInvalid &&
            <WarningIconImg src={warningIcon}/>
          }
        </ShadeDotContainer>
        <ShadeLabel style={{ color }}>{isInvalid ? props?.shade?.id : props?.shade.name}</ShadeLabel>
      </ShadeContainer>
    </motion.li>
  );
};

export default React.memo(ShadeReadItem);