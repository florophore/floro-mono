import React, { useMemo, useState, useCallback } from "react";
import { PluginVersion } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import PluginVersionRow from "./PluginVersionRow";
import DualToggle from "../../design-system/DualToggle";

const SectionContainer = styled.div`
  max-width: 624px;
  margin-bottom: 48px;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const DependencyBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export interface Props {
  versions: PluginVersion[];
  currentVersion: PluginVersion;
  icons: { [key: string]: string };
  linkPrefix: string;
  canRelease: boolean;
  onClickReleaseVersion: (version: PluginVersion) => void;
}

const PluginVersionList = (props: Props) => {
  const [versionFilter, setVersionFilter] = useState("all");

  const onChangeFilter = useCallback((value) => {
    setVersionFilter(value);
  }, []);

  const hasAReleasedVersion = useMemo(() => {
    // REALLY HAS RELEASED VERSION AND NOT JUST A SINGLE VERSION
    return props?.versions?.length > 1 && (
      props?.versions?.reduce?.((hasRelease, version) => {
        if (hasRelease) {
          return true;
        }
        return version?.state == "released";
      }, false) ?? false
    );
  }, [props.versions]);

  const versions = useMemo(() => {
    if (!hasAReleasedVersion || versionFilter == "all") {
      return props.versions;
    }
    return props.versions.filter((v) => {
      return v.state == "released";
    });
  }, [props.versions, versionFilter, hasAReleasedVersion]);

  return (
    <SectionContainer>
      <TopRow>
        <SectionTitle>{"Versions"}</SectionTitle>
        {hasAReleasedVersion && (
          <DualToggle
            leftOption={{
              value: "all",
              label: "all",
            }}
            rightOption={{
              value: "released",
              label: "released",
            }}
            value={versionFilter}
            onChange={onChangeFilter}
          />
        )}
      </TopRow>
      <DependencyBox>
        {versions?.map((pluginVersion, index) => {
          return (
            <PluginVersionRow
              isFirst={0 == index}
              key={index}
              isEven={index % 2 == 0}
              isSelected={
                pluginVersion?.version == props.currentVersion?.version
              }
              version={pluginVersion}
              linkPrefix={props.linkPrefix}
              onClickReleaseVersion={props.onClickReleaseVersion}
              canRelease={props.canRelease}
            />
          );
        })}
      </DependencyBox>
    </SectionContainer>
  );
};

export default React.memo(PluginVersionList);
