import React from 'react';
import {
    Mjml,
    MjmlHead,
    MjmlTitle,
    MjmlPreview,
    MjmlBody,
    MjmlSection,
    MjmlColumn,
    MjmlButton,
    MjmlImage,
    MjmlText
  } from 'mjml-react';

export interface Props {
  title: string;
  anotherThing: number;
}

const TestEmail = (props: Props): React.ReactElement => {
  return (
    <Mjml>
      <MjmlHead>
          <MjmlTitle>Last Minute Offer</MjmlTitle>
          <MjmlPreview>Last Minute Offer...</MjmlPreview>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor="#efefef">
          <MjmlColumn>
            <MjmlImage src="https://static.wixstatic.com/media/5cb24728abef45dabebe7edc1d97ddd2.jpg" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection>
          <MjmlColumn>
            <MjmlButton
              padding="20px"
              backgroundColor="#346DB7"
              href="https://www.wix.com/"
            >
              {props?.title}
            </MjmlButton>
            <MjmlText>
              {"here is the number " + props?.anotherThing}
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

export const mock: Props = {
  title: "Mock Title!",
  anotherThing: 789
}

export const altTitleMock: Props = {
  title: "Alt Mock Title",
  anotherThing: 456
}

export default TestEmail;