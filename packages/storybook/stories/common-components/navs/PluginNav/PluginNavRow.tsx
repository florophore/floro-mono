import React, { useMemo } from 'react';
import styled from "@emotion/styled";
import PluginDefaultLight from '@floro/common-assets/assets/images/icons/plugin_default.unselected.light.svg';
import PluginDefaultDark from '@floro/common-assets/assets/images/icons/plugin_default.unselected.dark.svg';
import { Plugin } from '@floro/graphql-schemas/build/generated/main-graphql';
import { useTheme } from '@emotion/react';

const Container = styled.div`
  background-color: ${(props) => props.theme.background};
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: space-between;
`;

interface Props {
    plugin: Plugin;
    icon: {
        light: string;
        dark: string;
        selected: {
            light: string;
            dark: string;
        }
    }
    isSelected: boolean;
}

const PluginNavRow = (props: Props) => {
    const theme = useTheme();
    //const icon = useMemo(() => {
    //    if ()

    //}, [theme.name, props.icon, props.isSelected]);
    return (
        <Container>

        </Container>
    )
}

export default React.memo(PluginNavRow);