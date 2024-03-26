import React, { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";

export interface Props {
  show?: boolean;
  onDismiss?: () => void;
  children?: React.ReactElement | React.ReactElement[];
  disableBackgroundDismiss?: boolean;
  zIndex?: number;
}

const ModalBackdrop = (props: Props): React.ReactElement => {
  const onDismiss = useCallback(() => {
      if (!props?.disableBackgroundDismiss) {
        props?.onDismiss?.();
      }
    },
    [props?.disableBackgroundDismiss, props?.onDismiss]
  );

  const onClickStopPropagation = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
    },
    []
  );

  const theme = useTheme();

  return (
    <AnimatePresence>
      {props.show && (
        <motion.div
          onClick={onDismiss}
          initial={{
            background: theme.colors.modalBackdropHidden,
          }}
          exit={{
            background: theme.colors.modalBackdropHidden,
          }}
          animate={{
            background: theme.colors.modalBackdropShown,
            transition: {
              duration: 0.5,
            },
          }}
          style={{
            zIndex: props?.zIndex ?? 2,
          }}
          className={css`
            top: 0;
            left: 0;
            position: absolute;
            display: flex;
            flex: 1;
            height: 100vh;
            width: 100vw;
            justify-content: center;
            align-items: center;
            flex-direction: column;

            @media screen and (max-width: 767px) {
              padding: 16px;
            }
          `}
        >
          <motion.div
            onClick={onClickStopPropagation}
            initial={{
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              transition: {
                duration: 0.25,
              },
            }}
          >
            {props?.children}
          </motion.div>
          {/* DIV HERE SO THAT MODAL DOESNT DISMISS WHEN DRAGGING HEADER */}
          <div
            onClick={onClickStopPropagation}
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              height: 72,
              pointerEvents: "none",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(ModalBackdrop);
