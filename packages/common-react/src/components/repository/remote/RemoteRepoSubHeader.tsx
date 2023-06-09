
import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  width: 100%;
  height: 72px;
  border-bottom: 1px solid
    ${(props) => props.theme.colors.localRemoteBorderColor};
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 40px;
  box-shadow: -10px 2px 3px 4px
    ${(props) => props.theme.shadows.versionControlSideBarShadow};
  z-index: 1;
  position: relative;
`;

const LeftContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
`;

const InvalidState = styled.img`
  height: 32px;
  width: 32px;
`;

const InvalidText = styled.span`
  color: ${(props) => props.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1rem;
  font-family: "MavenPro";
  margin-left: 8px;
`;

const ChangeDot = styled.div`
  position: absolute;
  right: -12px;
  top: -2px;
  height: 12px;
  width: 12px;
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
`;

interface Props {
  repository: Repository;
  plugin?: string;
}

const LocalRepoSubHeader = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(
    () => (theme.name == "light" ? "purple" : "lightPurple"),
    [theme.name]
  );

  const warning = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const isInvalid = useMemo(() => {
    return false;
    //if (
    //  repoData?.repoState?.commandMode == "compare" &&
    //  compareFrom == "before"
    //) {
    //  return (
    //    (repoData?.beforeApiStoreInvalidity?.[props?.plugin ?? ""]?.length ??
    //      0) > 0
    //  );
    //}
    //return (
    //  (repoData?.apiStoreInvalidity?.[props?.plugin ?? ""]?.length ?? 0) > 0
    //);
  }, [
  ]);

  //const hasAdditions = useMemo(() => {
  //  if (repoData?.repoState?.commandMode != "compare") {
  //    return false;
  //  }
  //  if ((repoData?.apiDiff?.description?.added?.length ?? 0) > 0) {
  //    return true;
  //  }
  //  if ((repoData?.apiDiff?.licenses?.added?.length ?? 0) > 0) {
  //    return true;
  //  }
  //  if ((repoData?.apiDiff?.plugins?.added?.length ?? 0) > 0) {
  //    return true;
  //  }
  //  for (const plugin in repoData?.apiDiff?.store ?? {}) {
  //    if ((repoData?.apiDiff?.store?.[plugin]?.added?.length ?? 0) > 0) {
  //      return true;
  //    }
  //  }
  //  return false;
  //}, [repoData?.apiDiff, repoData?.repoState?.commandMode]);

  //const hasRemovals = useMemo(() => {
  //  if (repoData?.repoState?.commandMode != "compare") {
  //    return false;
  //  }
  //  if ((repoData?.apiDiff?.description?.removed?.length ?? 0) > 0) {
  //    return true;
  //  }
  //  if ((repoData?.apiDiff?.licenses?.removed?.length ?? 0) > 0) {
  //    return true;
  //  }
  //  if ((repoData?.apiDiff?.plugins?.removed?.length ?? 0) > 0) {
  //    return true;
  //  }
  //  for (const plugin in repoData?.apiDiff?.store ?? {}) {
  //    if ((repoData?.apiDiff?.store?.[plugin]?.removed?.length ?? 0) > 0) {
  //      return true;
  //    }
  //  }
  //  return false;
  //}, [repoData?.apiDiff, repoData?.repoState?.commandMode]);

  return (
    <>
        <Container>
          <LeftContainer>
            {isInvalid && (
              <>
                <InvalidState src={warning} />
                <InvalidText>{`(invalid)`}</InvalidText>
              </>
            )}
          </LeftContainer>
        </Container>
    </>
  );
};

export default React.memo(LocalRepoSubHeader);