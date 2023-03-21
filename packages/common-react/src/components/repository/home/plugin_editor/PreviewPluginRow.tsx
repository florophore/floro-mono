import React, { useMemo, useCallback, useRef } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";
import Button from "@floro/storybook/stories/design-system/Button";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  height: 72px;
  box-sizing: border-box;
  padding: 8px;
`;

const Icon = styled.img`
  height: 56px;
  width: 56px;
`;

const MidSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex-grow: 1;
  padding-left: 16px;
`;

const Title = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme?.colors.pluginDisplayNameTitleColor};
  margin-bottom: 4px;
`;

const SubTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 0.9rem;
  color: ${(props) => props.theme?.colors.contrastText};
`;



interface Props {
  onChangePluginVersion?: (
    plugin?: Plugin,
    pluginVersion?: PluginVersion
  ) => void;
  plugin: Plugin;
  isEven: boolean;
}

const PreviewPluginRow = (props: Props) => {
    const theme = useTheme();
    const backgroundColor = useMemo(() => {
      if (props.isEven) {
        return theme.colors.evenBackground;
      }
      return theme.colors.oddBackground;
    }, [theme, props.isEven]);

    const pluginVersion = useMemo(() => {
      if (props.plugin?.versions?.[0]?.version == "dev" && props.plugin?.versions?.[1]) {
        return props.plugin?.versions?.[1] as PluginVersion;
      }
      return props.plugin?.versions?.[0] as PluginVersion;

    }, [props.plugin]);
    const icon = useMemo(() => {
      if (theme.name == "light") {
        return pluginVersion?.selectedLightIcon as string;
      }
      return pluginVersion?.selectedDarkIcon as string;
    }, [pluginVersion, theme.name]);

    const onClick = useCallback(() => {
      props?.onChangePluginVersion?.(props.plugin, pluginVersion as PluginVersion);
    }, [props.onChangePluginVersion, props.plugin, pluginVersion]);

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
        <Container style={{backgroundColor}}>
          <Icon src={icon} ref={iconRef} onError={onIconError}/>
          <MidSection>
            <Title>
                {props.plugin.displayName}
            </Title>
            <SubTitle>
                {props.plugin.name}
            </SubTitle>

          </MidSection>
          <Button label={"view"} bg={"orange"} size={"extra-small"} onClick={onClick}/>
        </Container>
    );
}

export default React.memo(PreviewPluginRow);