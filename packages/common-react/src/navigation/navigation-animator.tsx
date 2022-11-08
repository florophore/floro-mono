import React, { useState, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

const NavigationAnimatorContext = React.createContext<{
  dashboardView: boolean;
  setIsDashboardView: (dashboardView: boolean) => void;
  outerNavTab: null | string;
  setOuterNavTab: (outerNavTab: null | string) => void;
  repoId: null | string;
  setRepoId: (repoId: null | string) => void;
  innerNavTab: null | string;
  setInnerNavTab: (innerNavTab: null | string) => void;
}>({
  dashboardView: false,
  setIsDashboardView: () => null,
  repoId: null,
  setRepoId: () => null,
  outerNavTab: null,
  setOuterNavTab: () => null,
  innerNavTab: null,
  setInnerNavTab: () => null,
});

interface Props {
  children: React.ReactElement;
}

export const NavigationAnimatorProvider = (props: Props) => {
  const [dashboardView, setIsDashboardView] = useState(false);
  const [outerNavTab, setOuterNavTab] = useState<string | null>(null);
  const [repoId, setRepoId] = useState<string | null>(null);
  const [innerNavTab, setInnerNavTab] = useState<string | null>(null);

  return (
    <NavigationAnimatorContext.Provider
      value={{
        dashboardView,
        setIsDashboardView,
        outerNavTab,
        setOuterNavTab,
        repoId,
        setRepoId,
        innerNavTab,
        setInnerNavTab,
      }}
    >
      {props.children}
    </NavigationAnimatorContext.Provider>
  );
};

export const useNavigationAnimatorContext = () => {
  return useContext(NavigationAnimatorContext);
};

export interface UseNavigationAnimatorArgs {
  dashboardView?: boolean;
  outerNavTab?: null | string;
  repoId?: null | string;
  innerNavTab?: null | string;
}

export const useNavigationAnimator = (
  args: UseNavigationAnimatorArgs
): UseNavigationAnimatorArgs => {
  const context = useNavigationAnimatorContext();
  const location = useLocation();
  useEffect(() => {
    context.setIsDashboardView(args?.dashboardView ?? false);
    context.setOuterNavTab(args?.outerNavTab ?? null);
    context.setRepoId(args?.repoId ?? null);
    context.setInnerNavTab(args?.innerNavTab ?? null);
  }, [
    location.pathname,
    location.key,
    location.search,
    args?.dashboardView,
    args?.outerNavTab,
    args?.repoId,
    args?.innerNavTab,
  ]);

  return useMemo(
    () => ({
      dashboardView: context.dashboardView,
      outerNavTab: context.outerNavTab,
      repoId: context.repoId,
      innerNavTab: context.innerNavTab,
    }),
    [
      context.dashboardView,
      context.outerNavTab,
      context.repoId,
      context.innerNavTab,
    ]
  );
};
