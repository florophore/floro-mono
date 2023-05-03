import React, { useMemo } from "react";
import { useFloroState, useHasIndication, useIsFloroInvalid } from "../floro-schema-api";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import ShadeReadItem from "./ShadeReadItem";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const AddShadeLayout = styled.div`
  min-width: 642px;
`;

const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  padding: 0;
  margin: 0;
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
  margin-top: 4px;
`;

const ShadeReadList = () => {
  const theme = useTheme();
  const [shades] = useFloroState(
    "$(palette).shades",
    [
      {
        id: "light",
        name: "Light",
      },
      {
        id: "regular",
        name: "Regular",
      },
      {
        id: "dark",
        name: "Dark",
      },
    ],
    false
  );

  const hasIndication = useHasIndication("$(palette).shades");
  const isInvalid = useIsFloroInvalid("$(palette).shades");

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name])

  // change this later
  if (!hasIndication) {
    return null;
  }

  return (
    <div style={{ marginBottom: 36 }}>
      <TitleRow>
        <SectionTitle>{"Shades"}</SectionTitle>
        {isInvalid && <WarningIconImg src={warningIcon}/>}
      </TitleRow>
      <AnimatePresence>
        <AddShadeLayout>
          <motion.ul
            className={css(`
              padding: 24px 0px 0px 0px;
          `)}
          >
            <AnimatePresence>
              {shades?.map((shade, index) => {
                return (
                  <ShadeReadItem key={shade.id} shade={shade} index={index} />
                );
              })}
            </AnimatePresence>
          </motion.ul>
        </AddShadeLayout>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ShadeReadList);
