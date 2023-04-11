import { useMemo } from 'react'
import { useLocalVCSNavContext } from './local/vcsnav/LocalVCSContext';

export const useSourceGraphIsShown = () => {
  const { subAction } = useLocalVCSNavContext();
  return useMemo(() => {
    if (subAction == "branches") {
      return true;
    }

    if (subAction == "new_branch") {
      return true;
    }

    return false;
  }, [subAction]);
};