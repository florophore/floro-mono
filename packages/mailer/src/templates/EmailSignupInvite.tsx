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
    MjmlFont,
    MjmlText,
  } from 'mjml-react';
  import colorPalette from '@floro/styles/ColorPalette';

interface Props {
  assetHost: string;
  link: string;
}

const EmailSignupAccountAlreadyExists = (props: Props): React.ReactElement => {
  return (
    <Mjml>
      <MjmlHead>
          <MjmlTitle>Floro Sigup</MjmlTitle>
          <MjmlPreview>Sign up for floro</MjmlPreview>
          <MjmlFont name="Maven-Pro" href="https://fonts.googleapis.com/css?family=Maven%20Pro"/>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor={colorPalette.lightPurple}>
          <MjmlColumn width={500}>
            <MjmlImage height={200} width={200} src={`${props.assetHost}/src/assets/images/floro_logo.png`} />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection>
          <MjmlColumn>
            <MjmlText lineHeight={32} fontSize={24} color={colorPalette.darkGray}>
                {"Hello,"}
            </MjmlText>
            <MjmlText lineHeight={32} fontSize={24} color={colorPalette.darkGray}>
                {"We recently received a request to create a floro account associated with this email."}
            </MjmlText>
            <MjmlText fontSize={20} color={colorPalette.darkGray}>
                {"If this wasn't you please ignore (and sorry for spamming you)."}
            </MjmlText>
            <MjmlText lineHeight={32} fontSize={24} color={colorPalette.darkGray}>
                {"If it was you, welcome! Click the button below while the floro app is running to finish the sign up process."}
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection>
          <MjmlColumn>
            <MjmlButton
              padding={24}
              href={props.link}
              backgroundColor={colorPalette.purple}
              borderRadius={8}
              width={300}
              height={60}
              fontSize={30}
            >
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"Create Account"}
                </MjmlText>
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

export const mock: Props = {
  assetHost: "http://localhost:9000",
  link: 'http://google.com'
}

export default EmailSignupAccountAlreadyExists;