import React, { useMemo, useCallback } from 'react';
import styled from "@emotion/styled";
import { ApiReponse } from '@floro/floro-lib/src/repo';
import { Repository, Plugin, PluginVersion  } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import PluginEditorRow from './PluginEditorRow';

const Container = styled.div`
    padding-top: 16px;
    padding-bottom: 16px;
`;

interface Props {
    repository: Repository;
    apiReponse: ApiReponse;
    plugins: Array<Plugin>;
    onChangePluginVersion: (plugin?: Plugin, pluginVersion?: PluginVersion) => void;
}

const PluginEditor = (props: Props) => {

    return (
        <Container>
            {props.apiReponse.applicationState.plugins.map((pluginKV, index) => {
                return (
                  <PluginEditorRow
                    key={index}
                    plugins={props.plugins}
                    repository={props.repository}
                    pluginName={pluginKV.key}
                    pluginVersion={pluginKV.value}
                    onChangePluginVersion={props.onChangePluginVersion}
                  />
                );

            })}
        </Container>
    );
}

export default React.memo(PluginEditor);