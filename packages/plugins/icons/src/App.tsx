import { useCallback, useState, useRef, useEffect } from 'react';
import { ThemeProvider } from "@emotion/react";
import styled from '@emotion/styled';
import { useColorTheme } from "@floro/common-web/src/hooks/color-theme";
import "./index.css";
import {
  FileRef,
  FloroProvider, useBinaryData, useUploadFile,
} from "./floro-schema-api";
import RootModal from './RootModal';
import IconHeader from './iconsheader/IconHeader';
import AddIconModal from './AddIconModal';

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
  const [addedSVGFileRef, setAddedSVGFileRef] = useState<FileRef|null>(null);
  const [svgFileName, setSvgFileName] = useState<string>("");

  const onShowAddSVG = useCallback((svgFileRef: FileRef, svgFileName: string) => {
    setAddedSVGFileRef(svgFileRef);
    setSvgFileName(svgFileName);
    setShow(true);
  }, []);

  const onHideAddSVG = useCallback(() => {
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) {
      setSvgFileName("");
      setAddedSVGFileRef(null);
    }
  }, [show])

  return (
    <Container ref={container}>
      <IconHeader onUploaded={onShowAddSVG} />
      <AddIconModal show={show} onDismiss={onHideAddSVG} fileRef={addedSVGFileRef} svgFileName={svgFileName}/>
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
