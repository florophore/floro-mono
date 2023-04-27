import React, { useMemo } from "react";
import { useTheme } from "@emotion/react";
import {  useFloroState, useHasIndication, useIsFloroInvalid } from "./floro-schema-api";
import { AnimatePresence, motion } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import ColorReadItem from "./ColorReadItem";


import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const AddColorLayout = styled.div`
  min-width: 642px;
`;

const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${props => props.theme.colors.pluginTitle};
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

const ColorReadList = () => {
  const theme = useTheme();
  const [colors] = useFloroState(
    "$(palette).colors",
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


  const isInvalid = useIsFloroInvalid("$(palette).colors");
  const hasIndication = useHasIndication("$(palette).colors");

  const warningIcon = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  if (!hasIndication) {
    return null;
  }

  return (
    <div style={{marginBottom: 36}}>
      <TitleRow>
        <SectionTitle>{"Colors"}</SectionTitle>
        {isInvalid && (
          <WarningIconImg src={warningIcon}/>
        )}
      </TitleRow>
      <AnimatePresence>
        <AddColorLayout>
          <motion.ul
            className={css(`
              padding: 24px 0px 0px 0px;
          `)}
          >
            <AnimatePresence>
              {colors?.map((color, index) => {
                return (
                  <ColorReadItem
                    key={color.id}
                    color={color}
                    index={index}
                  />
                );
              })}
            </AnimatePresence>
          </motion.ul>
        </AddColorLayout>
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ColorReadList);
