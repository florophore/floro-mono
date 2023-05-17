import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";

import DropIconPurple from "@floro/common-assets/assets/images/icons/drop_icon.purple.svg";
import DropIconLightPurple from "@floro/common-assets/assets/images/icons/drop_icon.light_purple.svg";

import DropIconRed from "@floro/common-assets/assets/images/icons/drop_icon.red.svg";
import DropIconLightRed from "@floro/common-assets/assets/images/icons/drop_icon.light_red.svg";

import DropIconTeal from "@floro/common-assets/assets/images/icons/drop_icon.teal.svg";
import DropIconLightTeal from "@floro/common-assets/assets/images/icons/drop_icon.light_teal.svg";
import { FileRef, useBinaryData, useUploadFile } from "../floro-schema-api";
import { optimize } from "svgo";
import { parse } from "svg-parser";

const dropzoneDash = (color: string) => {
    return `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='8' ry='8' stroke='${encodeURIComponent(
      color
    )}' stroke-width='4' stroke-dasharray='8%2c 8' stroke-dashoffset='8' stroke-linecap='round'/%3e%3c/svg%3e")`;
}

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
`;

const SectionTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginTitle};
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  height: 72px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const DropzoneSection = styled.div`
  margin-top: 24px;
  height: 300px;
  flex-grow: 1;
  border-radius: 8px;
  padding: 8px;
  transition: background-color 300ms;
`;

const InnerDropzone = styled.div`
  height: 100%;
  width: 100%;
  flex-grow: 1;
  border-radius: 8px;
  position: relative;
  transition: background-image 300ms;
`;

const DropFile = styled.input`
  height: 100%;
  width: 100%;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
`;

const DropMarkup = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const DropSvgTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  padding: 0;
  margin: 0;
  transition: color 300ms;
`;

const DropIcon = styled.img`
  width: 72px;
  height: 72px;
  margin-top: 24px;
  margin-bottom: -48px;
`;

const getSVGTextBlob = (svgUrl: string) => {
  const xhr = new XMLHttpRequest();
  return new Promise<string>(
    (resolve, reject) => {
      xhr.responseType = "text";
      xhr.open("GET", svgUrl);
      xhr.onerror = function (e) {
        reject(e);
      };
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            resolve(xhr.response);
          } else {
            reject(e);
          }
        }
      };
      xhr.send();
    }
  );
}



interface Props {
    onUploaded: (fileRef: FileRef, fileName: string) => void;
}

const IconHeader = (props: Props) => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isDragOverValid, setIsDragOverValid] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const { fileRef, status, uploadFile, uploadBlob } = useUploadFile();

  useEffect(() => {
    if (status == "success" && fileRef) {
        props.onUploaded(fileRef, fileName);
        if (input.current) {
            input.current.value = '';
            if(!/safari/i.test(navigator.userAgent)){
                input.current.type = ''
                input.current.type = 'file'
            }
        }
    }
  }, [status, props.onUploaded]);

  const searchBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);

  const dropIcon = useMemo(() => {
    if (isDraggingOver) {
      if (isDragOverValid) {
        if (theme.name == "light") {
          return DropIconTeal;
        }
        return DropIconLightTeal;
      } else {
        if (theme.name == "light") {
          return DropIconRed;
        }
        return DropIconLightRed;
      }
    }
    if (theme.name == "light") {
      return DropIconPurple;
    }
    return DropIconLightPurple;
  }, [theme.name, isDragOverValid, isDraggingOver]);

  const dropzoneBackgroundColor = useMemo(() => {

    if (isDraggingOver) {
        if (isDragOverValid) {
            return theme.colors.dropzoneValidBackground;
        } else {
            return theme.colors.dropzoneInvalidBackground;
        }
    }
    return theme.colors.dropzoneBackground;
  }, [theme, theme.name, isDragOverValid, isDraggingOver]);

  const dropzoneContentColor = useMemo(() => {
    if (isDraggingOver) {
        if (isDragOverValid) {
            return theme.colors.dropzoneValidContentColor;
        } else {
            return theme.colors.dropzoneInvalidContentColor;
        }
    }
    return theme.colors.dropzoneContentColor;
  }, [theme, theme.name, isDragOverValid, isDraggingOver]);

  const dropzoneCursor = useMemo(() => {
    if (isDraggingOver) {
        if (isDragOverValid) {
            return 'copy'
        } else {
            return 'no-drop'
        }
    }
    return 'pointer'
  }, [isDragOverValid, isDraggingOver]);

  const dropzoneBackgroundImage = useMemo(() => {
    return dropzoneDash(dropzoneContentColor);
  }, [theme.name, dropzoneContentColor]);

  const onDragEnter = useCallback((event: React.DragEvent<HTMLInputElement>) => {
    event?.preventDefault();
    if (event?.dataTransfer?.items?.[0]?.type == 'text/uri-list') {
      return;
    }
    setIsDragOverValid(
      event?.dataTransfer?.items?.[0]?.type == "image/svg+xml"
    );
    setIsDraggingOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLInputElement>) => {
    event?.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent<HTMLInputElement>) => {
    event?.preventDefault();
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLInputElement>) => {
    if (event?.dataTransfer?.items[0].type == "text/uri-list") {
      event?.dataTransfer?.items[0].getAsString(async (url: string) => {
        if (url.endsWith(".svg")) {
          const fileName = url.split("/")[url.split("/").length -1];
          setFileName(fileName);
          try {
            const svg = await getSVGTextBlob(url);
            if (svg) {
              uploadBlob([svg], "image/svg+xml");
            }
          } catch(e) {
          }
        }
      });
      setIsDraggingOver(false);
      return;
    }
    setIsDraggingOver(false);
    if (event?.dataTransfer?.items?.[0]?.type == "image/svg+xml" && event?.dataTransfer.files[0]) {
        setFileName(event?.dataTransfer.files[0]?.name ?? '')
        uploadFile(event?.dataTransfer.files[0])
    }
  }, [uploadFile]);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsDraggingOver(false);
      if (
        event?.target?.files?.[0]?.type == "image/svg+xml" &&
        event?.target.files[0]
      ) {
        setFileName(event?.target.files[0]?.name ?? '')
        uploadFile(event?.target.files[0]);
      }
    },
    [uploadFile]
  );

  return (
    <div>
      <Container>
        <TitleRow>
          <SectionTitle>{"Icons"}</SectionTitle>
          <div style={{ marginLeft: 24 }}>
            <SearchInput
              value={searchText}
              placeholder={"search icons"}
              onTextChanged={setSearchText}
              borderColor={searchBorderColor}
            />
          </div>
          <div style={{ marginLeft: 24, display: "flex", width: 120 }}>
            <Button
              label={"edit groups"}
              bg={"purple"}
              size={"small"}
              textSize={"small"}
            />
          </div>
        </TitleRow>
        <DropzoneSection style={{ background: dropzoneBackgroundColor }}>
          <InnerDropzone
            style={{
              backgroundImage: dropzoneBackgroundImage,
              cursor: dropzoneCursor,
            }}
          >
            <DropMarkup style={{ cursor: dropzoneCursor }}>
              <DropSvgTitle style={{ color: dropzoneContentColor }}>
                {"drag & drop SVG files"}
              </DropSvgTitle>
              <DropIcon src={dropIcon} />
            </DropMarkup>
            <DropFile
              ref={input}
              style={{ cursor: dropzoneCursor }}
              onDrop={onDrop}
              onChange={onChange}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDragEnd={onDragOver}
              type="file"
              accept="image/svg+xml"
            />
          </InnerDropzone>
        </DropzoneSection>
      </Container>
    </div>
  );
};

export default React.memo(IconHeader);