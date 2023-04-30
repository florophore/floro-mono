import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import {
  useCurrentRepoState,
  useUpdateCurrentCommand,
} from "./hooks/local-hooks";
import Button from "@floro/storybook/stories/design-system/Button";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import DualToggle from "@floro/storybook/stories/design-system/DualToggle";
import { useLocalVCSNavContext } from "./vcsnav/LocalVCSContext";
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
  const { data: repoData } = useCurrentRepoState(props.repository);
  const updateCommand = useUpdateCurrentCommand(props.repository);
  const { compareFrom, setCompareFrom } = useLocalVCSNavContext();

  const updateToViewMode = useCallback(() => {
    updateCommand.mutate("view");
  }, [updateCommand]);

  const updateToEditMode = useCallback(() => {
    updateCommand.mutate("edit");
  }, [updateCommand]);

  const warning = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const isInvalid = useMemo(() => {
    if (
      repoData?.repoState?.commandMode == "compare" &&
      compareFrom == "before"
    ) {
      return (
        (repoData?.beforeApiStoreInvalidity?.[props?.plugin ?? ""]?.length ??
          0) > 0
      );
    }
    return (
      (repoData?.apiStoreInvalidity?.[props?.plugin ?? ""]?.length ?? 0) > 0
    );
  }, [
    repoData?.apiStoreInvalidity,
    repoData?.beforeApiStoreInvalidity,
    props.plugin,
    repoData?.repoState?.commandMode,
    compareFrom,
  ]);

  useEffect(() => {
    if (repoData?.repoState?.commandMode == "compare") {
      setCompareFrom("after");
    }
  }, [repoData?.repoState?.commandMode]);

  const onChangeComparison = useCallback((compareFrom: "before" | "after") => {
    setCompareFrom(compareFrom);
  }, []);

  const hasAdditions = useMemo(() => {
    if (repoData?.repoState?.commandMode != "compare") {
      return false;
    }
    if ((repoData?.apiDiff?.description?.added?.length ?? 0) > 0) {
      return true;
    }
    if ((repoData?.apiDiff?.licenses?.added?.length ?? 0) > 0) {
      return true;
    }
    if ((repoData?.apiDiff?.plugins?.added?.length ?? 0) > 0) {
      return true;
    }
    for (const plugin in repoData?.apiDiff?.store ?? {}) {
      if ((repoData?.apiDiff?.store?.[plugin]?.added?.length ?? 0) > 0) {
        return true;
      }
    }
    return false;
  }, [repoData?.apiDiff, repoData?.repoState?.commandMode]);

  const hasRemovals = useMemo(() => {
    if (repoData?.repoState?.commandMode != "compare") {
      return false;
    }
    if ((repoData?.apiDiff?.description?.removed?.length ?? 0) > 0) {
      return true;
    }
    if ((repoData?.apiDiff?.licenses?.removed?.length ?? 0) > 0) {
      return true;
    }
    if ((repoData?.apiDiff?.plugins?.removed?.length ?? 0) > 0) {
      return true;
    }
    for (const plugin in repoData?.apiDiff?.store ?? {}) {
      if ((repoData?.apiDiff?.store?.[plugin]?.removed?.length ?? 0) > 0) {
        return true;
      }
    }
    return false;
  }, [repoData?.apiDiff, repoData?.repoState?.commandMode]);

  return (
    <>
      {repoData?.repoState?.commandMode == "compare" && (
        <Container>
          <LeftContainer>
            <div style={{ marginRight: 12 }}>
              <DualToggle
                onChange={onChangeComparison as (_: string) => void}
                value={compareFrom}
                leftOption={{
                  label: (
                    <span style={{ position: "relative" }}>
                      {"removed"}
                      {hasRemovals && (
                        <ChangeDot
                          style={{ background: theme.colors.removedBackground }}
                        />
                      )}
                    </span>
                  ),
                  value: "before",
                }}
                rightOption={{
                  label: (
                    <span style={{ position: "relative" }}>
                      {"added"}
                      {hasAdditions && (
                        <ChangeDot
                          style={{ background: theme.colors.addedBackground }}
                        />
                      )}
                    </span>
                  ),
                  value: "after",
                }}
              />
            </div>
            {isInvalid && (
              <>
                <InvalidState src={warning} />
                <InvalidText>{`(invalid)`}</InvalidText>
              </>
            )}
          </LeftContainer>
          <Button
            label={"done comparing"}
            bg={"gray"}
            size={"medium"}
            textSize={"small"}
            onClick={updateToViewMode}
          />
        </Container>
      )}
      {repoData?.repoState?.commandMode == "view" && (
        <Container>
          <LeftContainer>
            {isInvalid && (
              <>
                <InvalidState src={warning} />
                <InvalidText>{`(invalid)`}</InvalidText>
              </>
            )}
          </LeftContainer>
          <Button
            label={"edit"}
            bg={"orange"}
            size={"small"}
            onClick={updateToEditMode}
          />
        </Container>
      )}
      {repoData?.repoState?.commandMode == "edit" && (
        <Container>
          <LeftContainer>
            {isInvalid && (
              <>
                <InvalidState src={warning} />
                <InvalidText>{`(invalid)`}</InvalidText>
              </>
            )}
          </LeftContainer>

          <Button
            label={"preview"}
            bg={"purple"}
            size={"small"}
            onClick={updateToViewMode}
          />
        </Container>
      )}
    </>
  );
};

export default React.memo(LocalRepoSubHeader);
