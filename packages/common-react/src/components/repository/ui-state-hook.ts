import { useMemo } from 'react'
import { useLocalVCSNavContext } from './local/vcsnav/LocalVCSContext';

export const useSourceGraphIsShown = () => {
  const { subAction } = useLocalVCSNavContext();
  return useMemo(() => {
    if (subAction == "branches") {
      return true;
    }

    if (subAction == "edit_branch") {
      return true;
    }

    if (subAction == "new_branch") {
      return true;
    }

    if (subAction == "select_comparison_sha") {
      return true;
    }

    return false;
  }, [subAction]);
};