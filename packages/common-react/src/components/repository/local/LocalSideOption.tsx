import React, { useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plugin,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

import { ApiResponse } from "floro/dist/src/repo";
import { useLocalVCSNavContext } from "./vcsnav/LocalVCSContext";

const NavOption = styled.div`
  height: 72px;
  width: 72px;
  position: relative;
  padding-top: 2px;
`;

const NavIcon = styled.img`
  width: 40px;
  height: 40px;
`;

const NavText = styled.p`
  margin-top: 4px;
  margin-bottom: 0px;
  padding: 0 2px;
  font-weight: 600;
  font-size: 0.8rem;
  font-family: "MavenPro";
  text-align: center;
  white-space: nowrap;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
  max-width: 68px;
`;

const NavIconWrapper = styled.div`
  height: 72px;
  width: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  position: relative;
`;

const XCircleImage = styled.img`
  position: absolute;
  right: 6px;
  top: 0px;
  height: 20px;
  width: 20px;
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
  background: ${(props) => props.theme.background};
`;

const ChangeDot = styled.div`
  position: absolute;
  right: 10px;
  bottom: 20px;
  height: 16px;
  width: 16px;
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
`;

const ConflictDot = styled.div`
  position: absolute;
  left: 10px;
  bottom: 20px;
  height: 16px;
  width: 16px;
  border: 2px solid ${ColorPalette.white};
  background: ${props => props.theme.colors.conflictBackground};
  border-radius: 50%;
`;

interface Props {
  isSelected: boolean;
  isInvalid: boolean;
  locationPath: string;
  plugin: Plugin;
  apiResponse?: ApiResponse | null;
}

const LocalSideOption = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const { compareFrom } = useLocalVCSNavContext();
  const icon = useMemo(
    () =>
      props.isSelected
        ? theme.name == "light"
          ? (props.plugin.selectedLightIcon as string)
          : (props.plugin.selectedDarkIcon as string)
        : theme.name == "light"
        ? (props.plugin.lightIcon as string)
        : (props.plugin.darkIcon as string),
    [props.plugin, theme.name]
  );

  const xCircle = useMemo(() => {
    if (theme.name == "light") {
      return WarningLight;
    }
    return WarningDark;
  }, [theme.name]);

  const iconRef = useRef<HTMLImageElement>(null);
  const onIconError = useCallback(() => {
    if (iconRef.current) {
      if (theme.name == "light") {
        iconRef.current.src = WarningLight;
        return;
      }
      iconRef.current.src = WarningDark;
    }
  }, [theme.name]);

  const hasAdditions = useMemo(() => {
    if (
      props?.apiResponse?.repoState?.commandMode != "compare" ||
      compareFrom != "after"
    ) {
      return false;
    }
    return (
      (props?.apiResponse?.apiDiff?.store?.[props?.plugin?.name ?? ""]?.added
        ?.length ?? 0) > 0
    );
  }, [
    props.plugin.name,
    compareFrom,
    props?.apiResponse?.apiDiff,
    props?.apiResponse?.repoState?.commandMode,
  ]);

  const hasRemovals = useMemo(() => {
    if (
      props?.apiResponse?.repoState?.commandMode != "compare" ||
      compareFrom != "before"
    ) {
      return false;
    }
    return (
      (props?.apiResponse?.apiDiff?.store?.[props?.plugin?.name ?? ""]?.removed
        ?.length ?? 0) > 0
    );
  }, [
    props.plugin.name,
    compareFrom,
    props?.apiResponse?.apiDiff,
    props?.apiResponse?.repoState?.commandMode,
  ]);

    const hasConflicts = useMemo(() => {
      if (!props?.apiResponse?.repoState?.isInMergeConflict) {
        return false;
      }
    return (
      (props?.apiResponse?.conflictResolution?.store?.[props?.plugin?.name ?? ""]
        ?.length ?? 0) > 0
    );
    }, [
      props?.apiResponse?.conflictResolution,
      props?.apiResponse?.repoState?.isInMergeConflict
    ]);
  return (
    <NavOption>
      <Link
        to={props.locationPath + `&plugin=${props.plugin.name}`}
        style={{ textDecoration: "none", display: "contents" }}
      >
        <NavIconWrapper>
          <NavIcon src={icon} ref={iconRef} onError={onIconError} />
          <NavText
            style={{
              color: props.isSelected
                ? theme.colors.pluginSelected
                : theme.colors.pluginUnSelected,
            }}
          >
            {props.plugin.displayName}
          </NavText>
        </NavIconWrapper>
        {props.isInvalid && <XCircleImage src={xCircle} />}
        {hasAdditions && (
          <ChangeDot
            style={{
              background: theme.colors.addedBackground,
            }}
          />
        )}
        {hasRemovals && (
          <ChangeDot
            style={{
              background: theme.colors.removedBackground,
            }}
          />
        )}
        {hasConflicts && <ConflictDot/>}
      </Link>
    </NavOption>
  );
};

export default React.memo(LocalSideOption);
