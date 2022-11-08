import React from 'react';
import {
    Mjml,
    MjmlHead,
    MjmlTitle,
    MjmlPreview,
    MjmlBody,
    MjmlSection,
    MjmlDivider,
    MjmlColumn,
    MjmlButton,
    MjmlImage,
    MjmlFont,
    MjmlText,
  } from 'mjml-react';
  import colorPalette from '@floro/styles/ColorPalette';

export interface Props {
  assetHost: string;
  link: string;
}

const LoginEmail = (props: Props): React.ReactElement => {
  return (
    <Mjml>
      <MjmlHead>
          <MjmlTitle>Floro Login</MjmlTitle>
          <MjmlPreview>Login to Floro</MjmlPreview>
          <MjmlFont name="Maven-Pro" href="https://fonts.googleapis.com/css?family=Maven%20Pro"/>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor={colorPalette.white}>
          <MjmlColumn width={500}>
            <MjmlImage width={200} src={`${props.assetHost}/assets/images/floro_v3_with_text_email.png`} />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection paddingTop={0}>
          <MjmlColumn>
            <MjmlText align={'center'} lineHeight={32} fontSize={32} color={colorPalette.mediumGray}>
                {"Welcome back to floro!"}
            </MjmlText>
            <MjmlDivider width={'50%'} borderColor={colorPalette.mediumGray}/>
            <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                {"please click the button below to sign in to floro."}
            </MjmlText>
            <MjmlText fontStyle={'italic'} align={'center'} lineHeight={32} fontSize={18} color={colorPalette.mediumGray}>
                {"this link will expire in an hour"}
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection paddingTop={0}>
          <MjmlColumn>
            <MjmlButton
              href={props.link}
              backgroundColor={colorPalette.purple}
              borderRadius={8}
              width={300}
              height={60}
              fontSize={30}
            >
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"sign in to floro"}
                </MjmlText>
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

export const mock: Props = {
  assetHost: "http://localhost:5173",
  link: 'http://google.com'
}

export default LoginEmail;