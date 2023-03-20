import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ApiReponse } from "@floro/floro-lib/src/repo";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useRepoManifestList, useUpdateDescription, useUpdateLicenses } from "../local/hooks/local-hooks";
import EditIconLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditIconDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import RedXLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import AddLicenseModal from "./AddLicenseModal";
import RootFindPluginModal from "../../RootFindPluginModal";
import { useQueryClient } from "react-query";
import { transformLocalManifestToPartialPlugin } from "../local/hooks/manifest-transforms";
import { Manifest } from "@floro/floro-lib/src/plugins";
import PluginEditor from "./plugin_editor/PluginEditor";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow: scroll;
  padding: 24px 40px 48px 40px;
  user-select: text;

  ::-webkit-scrollbar {
    width: 4px;
    background: ${props => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${props => props.theme.background};
  }
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 528px;
  margin-bottom: 48px;
`;

const Icon = styled.img`
  width: 80px;
  height: 80px;
  margin-right: 24px;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-stretch: 1;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const SubTitleWrapper = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SubTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.pluginDisplaySubTitle};
`;

const SectionContainer = styled.div`
  max-width: 528px;
  margin-bottom: 48px;
`;

const BigSectionContainer = styled.div`
  max-width: 624px;
  margin-bottom: 48px;
`;

const SectionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-right: 6px;
  height: 40px;
`;

const SectionTitleWrapper = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const EditIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-left: 6px;
  cursor: pointer;
`;

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 184px;
  position: relative;
  display: grid;
  width: 100%;
  margin: 0;

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
    font-weight: 400;
    font-size: 1rem;
    display: block;
    margin-top: -38px;
  }
`;

const BlurbTextArea = styled.textarea`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  resize: none;
  background: none;
  width: 100%;
  padding: 0;
  min-height: 100%;
  display: inline-table;
  outline: none;
  border: none;
  margin: 0;
  resize: none;
  background: none;
  appearance: none;
`;

const BlurbPlaceholder = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  position: absolute;
  top: 0;
  left: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  left: 16px;
  top: 16px;
  pointer-events: none;
`;

const BlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 184px;
`;

const NoLicenseContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-height: 184px;
`;

const NoLicensesText = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.blurbBorder};
`;


const LicenseRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 24px;
  height: 32px;
`;

const LicenseTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.blurbBorder};
`;

const LicenseRemoveIcon = styled.img`
  height: 32px;
  width: 32px;
  cursor: pointer;
`;

interface Props {
  repository: Repository;
  apiResponse: ApiReponse;
}

const HomeWrite = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(
    () => (theme.name == "light" ? "purple" : "lightPurple"),
    [theme.name]
  );

  const queryClient = useQueryClient();
  const repoManifestList = useRepoManifestList(props.repository);

  const installedPlugins = useMemo(() => {
    if (!repoManifestList?.data) {
      return [];
    }
    return props.apiResponse.applicationState.plugins.map((pluginKV) => {
      const manifest = repoManifestList.data.find(
        (v) => v.name == pluginKV.key && v.version == pluginKV.value
      );
      if (!manifest) {
        return null;
      }
      return transformLocalManifestToPartialPlugin(
        pluginKV.key,
        pluginKV.value,
        manifest as Manifest,
        repoManifestList?.data
      );
    })?.filter(v => v != null) as Array<Plugin>;
  }, [repoManifestList, props.apiResponse.applicationState.plugins]);

  useEffect(() => {
    queryClient.invalidateQueries(["manifest-list:" + props.repository.id])
  }, [props.apiResponse.applicationState.plugins, queryClient, props.repository]);

  const readDescription = useMemo((): string => {
    return props?.apiResponse?.applicationState?.description?.join?.("") ?? "";
  }, [props?.apiResponse?.applicationState?.description]);

  const [description, setDescription] = useState(readDescription);
  const textareaContainer = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const [showAddLicenseModal, setShowAddLicenseModal] = useState(false);
  const [showSearchPlugin, setShowSearchPlugin] = useState(false);

  const updateDescriptionMutation = useUpdateDescription(props.repository);
  const updateLicensesMutation = useUpdateLicenses(props.repository);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const onFocusDescription = useCallback(() => {
    setIsDescriptionFocused(true);
  }, []);
  const onBlurDescription = useCallback(() => {
    setIsDescriptionFocused(false);
  }, []);

  const onTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setDescription(event.target.value);

      updateDescriptionMutation.mutate(event.target.value);
    },
    []
  );

  const onShowAddLicense = useCallback(() => {
    setShowAddLicenseModal(true);
  }, []);

  const onHideAddLicense = useCallback(() => {
    setShowAddLicenseModal(false);
  }, []);

  const onShowSearchPlugin = useCallback(() => {
    setShowSearchPlugin(true);
  }, []);

  const onHideSearchPlugin = useCallback(() => {
    setShowSearchPlugin(false);
  }, []);

  const textareaBorderColor = useMemo(() => {
    if (!isDescriptionFocused) {
      return theme.colors.blurbBorder;
    }
    return ColorPalette.linkBlue;
  }, [theme, isDescriptionFocused]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditIconLight;
    }
    return EditIconDark;
  }, [theme.name]);

  const xCircleIcon = useMemo(() => {
    if (theme.name == "light") {
      return RedXLight;
    }
    return RedXDark;
  }, [theme.name]);


  const hasNoLicense = useMemo(() => {
    return (props?.apiResponse?.applicationState?.licenses?.length ?? 0) == 0;
  }, [props.apiResponse]);

  useEffect(() => {
    if (textareaContainer?.current) {
      textareaContainer.current.dataset.value = description;
    }
  }, [description]);

  const onAddLicense = useCallback((licenses: Array<{key: string, value: string}>) => {
    updateLicensesMutation.mutate(licenses);
    setShowAddLicenseModal(false);
  }, []);

  const onRemoveLicense = useCallback(({key}: {key: string}) => {
    const licenses = props?.apiResponse?.applicationState?.licenses?.filter?.((license) => {
      return license.key != key;
    }) ?? [];
    updateLicensesMutation.mutate(licenses);
  }, [props?.apiResponse?.applicationState?.licenses]);

  const onClickEditIcon = useCallback(() => {
    if (textarea.current) {
      textarea.current?.focus?.();
    }
  }, []);


  const [selectedPlugin, setSelectedPlugin] =
    useState<Plugin | undefined>(undefined);
  const [selectedPluginVersion, setSelectedPluginVersion] =
    useState<PluginVersion | undefined>(undefined);

  const onChangePluginVersion = useCallback((plugin?: Plugin, pluginVersion?: PluginVersion) => {
    setSelectedPlugin(plugin);
    setSelectedPluginVersion(pluginVersion);
  }, []);

  const onChangePluginVersionFromPluginEditor = useCallback((plugin?: Plugin, pluginVersion?: PluginVersion) => {
    setSelectedPlugin(plugin);
    setSelectedPluginVersion(pluginVersion);
    setShowSearchPlugin(true);
  }, []);

  return (
    <Container>
      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Description"}</SectionTitle>
          </SectionTitleWrapper>
          {updateDescriptionMutation.isLoading && (
            <DotsLoader size={"small"} color={loaderColor} />
          )}
          {!updateDescriptionMutation.isLoading && (
            <EditIcon onClick={onClickEditIcon} src={editIcon} />
          )}
        </SectionRow>
        <TextAreaBlurbBox
          style={{
            border: `1px solid ${textareaBorderColor}`,
          }}
          ref={textareaContainer}
        >
          {description == "" && (
            <BlurbPlaceholder>
              {"What is this repository for?"}
            </BlurbPlaceholder>
          )}
          <BlurbTextArea
            ref={textarea}
            onFocus={onFocusDescription}
            onBlur={onBlurDescription}
            defaultValue={readDescription}
            onChange={onTextBoxChanged}
          />
        </TextAreaBlurbBox>
      </BigSectionContainer>

      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Licenses"}</SectionTitle>
          </SectionTitleWrapper>
          <Button
            label={"add license"}
            bg={"purple"}
            size={"small"}
            textSize={"small"}
            onClick={onShowAddLicense}
          />
        </SectionRow>
        <BlurbBox style={{ paddingTop: 0, paddingBottom: 0 }}>
          {hasNoLicense && (
            <NoLicenseContainer>
              <NoLicensesText>{"No licenses selected"}</NoLicensesText>
            </NoLicenseContainer>
          )}
          {props.apiResponse.applicationState.licenses.map((license, index) => {
            return (
              <LicenseRow key={index}>
                <LicenseTitle>{license.value}</LicenseTitle>
                <LicenseRemoveIcon
                  src={xCircleIcon}
                  onClick={() => onRemoveLicense(license)}
                />
              </LicenseRow>
            );
          })}
        </BlurbBox>
      </BigSectionContainer>
      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Installed Plugins"}</SectionTitle>
          </SectionTitleWrapper>
          <Button
            label={"find plugins"}
            bg={"purple"}
            size={"small"}
            textSize={"small"}
            onClick={onShowSearchPlugin}
          />
        </SectionRow>
        <BlurbBox style={{ paddingTop: 0, paddingBottom: 0 }}>
          {installedPlugins.length > 0 && (
            <PluginEditor
              repository={props.repository}
              apiReponse={props.apiResponse}
              plugins={installedPlugins}
              onChangePluginVersion={onChangePluginVersionFromPluginEditor}
            />
          )}
        </BlurbBox>
      </BigSectionContainer>
      <AddLicenseModal
        apiReponse={props.apiResponse}
        show={showAddLicenseModal}
        onDismiss={onHideAddLicense}
        onAddLicense={onAddLicense}
        isLoading={updateLicensesMutation.isLoading}
      />
      <RootFindPluginModal
        onDismiss={onHideSearchPlugin}
        show={showSearchPlugin}
        apiReponse={props.apiResponse}
        repository={props.repository}
        repoManifestList={repoManifestList?.data ?? []}
        onChangePluginVersion={onChangePluginVersion}
        selectedPlugin={selectedPlugin}
        selectedPluginVersion={selectedPluginVersion}
      />
    </Container>
  );
};

export default React.memo(HomeWrite);
