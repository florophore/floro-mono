import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { PointerTypes, SchemaTypes, makeQueryRef } from "../floro-schema-api";
import JobPhraseRow from "./JobPhraseRow";

const PhraseGroupTitle = styled.p`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.titleText};
  font-weight: 600;
  font-size: 1.7rem;
  padding: 0;
  text-align: center;
  word-break: break-word;
  margin-bottom: 24px;
`;

interface Props {
  phraseGroups: SchemaTypes['$(text).phraseGroups'];
  jobs: Record<PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"], "succeeded" | "failed" | "enqueued" | "processing">;
}

const JobList = (props: Props) => {
  const theme = useTheme();

  return (
    <div
      style={{
        width: "100%",
        height: 540,
        overflow: "scroll",
        borderRadius: 8,
        paddingTop: 24,
        paddingLeft: 24,
        paddingRight: 24,
        border: `1px solid ${theme.colors.inputBorderColor}`,
      }}
    >
      {props.phraseGroups.map((phraseGroup, index) => {
        return (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              textAlign: "left",
              marginBottom: 24
            }}
            key={index}
          >
            <PhraseGroupTitle>{phraseGroup.name}</PhraseGroupTitle>
            {phraseGroup.phrases.map((phrase, index) => {
              const phraseRef = makeQueryRef(
                "$(text).phraseGroups.id<?>.phrases.id<?>",
                phraseGroup.id,
                phrase.id
              );
              return (
                <div key={index}>
                  <JobPhraseRow
                    phrase={phrase}
                    phraseRef={phraseRef}
                    status={props.jobs[phraseRef]}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(JobList);
