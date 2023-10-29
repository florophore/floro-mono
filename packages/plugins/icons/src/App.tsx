import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { ThemeProvider } from "@emotion/react";
import styled from '@emotion/styled';
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import "./index.css";
import {
  FileRef,
  FloroProvider, PointerTypes, SchemaTypes, useFloroContext,
} from "./floro-schema-api";
import IconHeader from './iconsheader/IconHeader';
import AddIconModal from './AddIconModal';
import UpdateIconModal from './UpdateIconModal';
import IconGroups from './iconsgroups/IconGroups';

const Container = styled.div`
  width: 100%;
  padding: 24px 24px 24px 24px;
  flex: 1;
  overflow-y: scroll;
  position: relative;

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

const Layout = () => {

  const container = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [addedSVGFileRef, setAddedSVGFileRef] = useState<FileRef|null>(null);
  const [svgFileName, setSvgFileName] = useState<string>("");
  const { commandMode} = useFloroContext();
  const [searchText, setSearchText] = useState<string>("");
  const [isEditGroups, setIsEditGroups] = useState<boolean>(false);
  const [updateIconRef, setUpdateIconRef] = useState<PointerTypes["$(icons).iconGroups.id<?>.icons.id<?>"]>();
  const [updateIcon, setUpdateIcon] = useState<SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"]>();


  const onShowAddSVG = useCallback((svgFileRef: FileRef, svgFileName: string) => {
    setAddedSVGFileRef(svgFileRef);
    setSvgFileName(svgFileName);
    setShow(true);
  }, []);

  const onHideAddSVG = useCallback(() => {
    setShow(false);
  }, []);

  const onHideUpdateSVG = useCallback(() => {
    setShowUpdate(false);
  }, []);

  const onShowEditGroups = useCallback(() => {
    setIsEditGroups(true);
  }, []);

  const onHideEditGroups = useCallback(() => {
    setIsEditGroups(false);
  }, []);

  const onEdit = useCallback((
    iconRef: PointerTypes["$(icons).iconGroups.id<?>.icons.id<?>"],
    icon: SchemaTypes["$(icons).iconGroups.id<?>.icons.id<?>"]
  ) => {
    setUpdateIconRef(iconRef);
    setUpdateIcon(icon);
    setShowUpdate(true);
  }, []);

  useEffect(() => {
    if (!show) {
      setSvgFileName("");
      setAddedSVGFileRef(null);
    }
  }, [show])

  useEffect(() => {
    if (!showUpdate) {
      setUpdateIcon(undefined);
      setUpdateIconRef(undefined);
    }
  }, [showUpdate])

  useEffect(() => {
    if (commandMode != "edit") {
      setShow(false);
      setShowUpdate(false);
    }
  }, [commandMode])

  return (
    <Container ref={container}>
      <IconHeader
        isEditGroups={isEditGroups}
        onShowEditGroups={onShowEditGroups}
        onHideEditGroups={onHideEditGroups}
        onUploaded={onShowAddSVG}
        searchText={searchText ?? ""}
        onSetSearchText={setSearchText}
      />
      <AddIconModal
        show={show}
        onDismiss={onHideAddSVG}
        fileRef={addedSVGFileRef}
        svgFileName={svgFileName}
      />
      <UpdateIconModal
        show={showUpdate}
        onDismiss={onHideUpdateSVG}
        iconRef={updateIconRef}
        originalIcon={updateIcon}
      />
      <IconGroups searchText={searchText} onEdit={onEdit} isEditGroups={isEditGroups} />
    </Container>
  );
};

function App() {
  const colorTheme = useColorTheme();

  return (
    <FloroProvider>
      <ThemeProvider theme={colorTheme}>
        <Layout />
      </ThemeProvider>
    </FloroProvider>
  );
}

export default App;
