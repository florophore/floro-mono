import React from "react";
import {  useFloroState } from "./floro-schema-api";
import { AnimatePresence, motion } from "framer-motion";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import ShadeReadItem from "./ShadeReadItem";

const AddShadeLayout = styled.div`
  min-width: 642px;
`;

const ShadeReadList = () => {
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
  return (
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
                <ShadeReadItem
                  key={shade.id}
                  shade={shade}
                  index={index}
                />
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </AddShadeLayout>
    </AnimatePresence>
  );
};

export default React.memo(ShadeReadList);
