import React from "react";
import {  useFloroState } from "./floro-schema-api";
import { AnimatePresence, motion } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import ColorReadItem from "./ColorReadItem";

const AddColorLayout = styled.div`
  min-width: 642px;
`;

const ColorReadList = () => {
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
  return (
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
  );
};

export default React.memo(ColorReadList);
