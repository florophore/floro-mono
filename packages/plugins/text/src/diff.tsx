import { useMemo } from "react";
import {
  PointerTypes,
  useFloroContext,
  useHasConflict,
  useWasAdded,
  useWasRemoved,
} from "./floro-schema-api";
import { useTheme } from "@emotion/react";

type ValueOf<T> = T[keyof T];

export const useDiffColor = (
  query: ValueOf<PointerTypes>,
  fuzzy = true,
  shade: "lighter" | "darker" = "darker"
) => {
  const { compareFrom } = useFloroContext();
  const theme = useTheme();
  const wasAdded = useWasAdded(query as any, fuzzy);
  const wasRemoved = useWasRemoved(query as any, fuzzy);
  const hasConflict = useHasConflict(query as any, fuzzy);
  return useMemo(() => {
    if (hasConflict) {
      return theme.colors.conflictText;
    }
    if (wasRemoved) {
      return theme.colors.removedText;
    }
    if (wasAdded) {
      return theme.colors.addedText;
    }
    return shade == "lighter"
      ? theme.colors.contrastTextLight
      : theme.colors.contrastText;
  }, [
    compareFrom,
    theme.colors.contrastText,
    theme.colors,
    wasAdded,
    wasRemoved,
    hasConflict,
  ]);
};
