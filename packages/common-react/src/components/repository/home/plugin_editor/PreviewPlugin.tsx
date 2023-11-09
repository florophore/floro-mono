import React, { useMemo, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { ApiResponse } from "floro/dist/src/repo";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import Button from "@floro/storybook/stories/design-system/Button";

const Container = styled.div`
  width: 146px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const Icon = styled.img`
  height: 56px;
  width: 56px;
  margin-bottom: 8px;
`;

const Title = styled.span`
  align-self: center;
  text-align: center;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 0.9rem;
  color: ${(props) => props.theme?.colors.contrastText};
  margin-bottom: 12px;
`;



interface Props {
  onChangePluginVersion?: (
    plugin?: Plugin,
    pluginVersion?: PluginVersion
  ) => void;
  developmentPlugin: Plugin;
}

const PreviewPlugin = (props: Props) => {
    const theme = useTheme();

    const pluginVersion = useMemo(() => {
        return (
          (props.developmentPlugin?.versions?.[0] as PluginVersion) ??
          (props.developmentPlugin
            ?.lastReleasedPublicVersion as PluginVersion) ??
          (props.developmentPlugin?.lastReleasedPrivateVersion as PluginVersion)
        );

    }, [props.developmentPlugin]);
    const icon = useMemo(() => {
      if (theme.name == "light") {
        return pluginVersion?.selectedLightIcon as string;
      }
      return pluginVersion?.selectedDarkIcon as string;
    }, [pluginVersion, theme.name]);

    const onClick = useCallback(() => {
      props?.onChangePluginVersion?.(props.developmentPlugin, pluginVersion as PluginVersion);
    }, [props.onChangePluginVersion, props.developmentPlugin, pluginVersion]);

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
    return (
        <Container>
            <Icon src={icon} ref={iconRef} onError={onIconError}/>
            <Title>
                {props.developmentPlugin.displayName}
            </Title>
            <Button label={"view"} bg={"orange"} size={"extra-small"} onClick={onClick}/>
        </Container>
    );
}

export default React.memo(PreviewPlugin);