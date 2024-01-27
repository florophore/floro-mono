import React, {
  useRef,
  useMemo,
  useEffect,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes } from "../floro-schema-api";
import CheckLight from '@floro/common-assets/assets/images/icons/check_mark_circle.light.svg'
import CheckDark from '@floro/common-assets/assets/images/icons/check_mark_circle.dark.svg'
import RedXLight from '@floro/common-assets/assets/images/icons/red_x_circle.light.svg'
import RedXDark from '@floro/common-assets/assets/images/icons/red_x_circle.dark.svg'
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";

const PhraseTitle = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1.44rem;
  padding: 0;
  text-align: center;
  word-break: break-word;
`;

const JobStatus = styled.p`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1rem;
  font-style: italic;
  padding: 0;
  text-align: center;
`;

const JobStatusIcon = styled.img`
  height: 32px;
  width: 32px;
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  status: 'enqueued'|'processing'|'succeeded'|'failed';
}

const JobPhraseRow = (props: Props) => {
  const theme = useTheme();
  const check = useMemo(() => {
    if (theme.name == 'light') {
      return CheckLight;
    }
    return CheckDark;
  }, [theme.name])
  const cross = useMemo(() => {
    if (theme.name == 'light') {
      return RedXLight;
    }
    return RedXDark;
  }, [theme.name])
  const statusInfo = useMemo(() => {
    if (props.status == 'enqueued') {
      return (
        <JobStatus>{'enqueued'}</JobStatus>
      )
    }
    if (props.status == 'processing') {
      return (
        <DotsLoader color={theme.name == 'dark' ? "white" : 'mediumGray'} size={"small"}/>
      )
    }
    if (props.status == 'failed') {
      return (
        <JobStatusIcon src={cross}/>
      )
    }
    return (
      <JobStatusIcon src={check}/>
    )
  }, [props.status, theme.name, check, cross]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.status == "succeeded" || props.status == "failed") {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [props.status])

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 8,
      }}
    >
        <div style={{
            width: 120,
            display: "flex",
            justifyContent: 'center',
            alignItems: 'center',
        }}>
          {statusInfo}
        </div>
      <PhraseTitle>{props.phrase.phraseKey}</PhraseTitle>
    </div>
  );
};

export default React.memo(JobPhraseRow);
