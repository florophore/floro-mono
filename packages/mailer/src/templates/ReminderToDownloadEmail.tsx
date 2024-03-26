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

const ReminderToDownloadEmail = (props: Props): React.ReactElement => {
  return (
    <Mjml>
      <MjmlHead>
          <MjmlTitle>Floro Download Reminder</MjmlTitle>
          <MjmlPreview>Download Floro</MjmlPreview>
          <MjmlFont name="Maven-Pro" href="https://fonts.googleapis.com/css?family=Maven%20Pro"/>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor={colorPalette.white}>
          <MjmlColumn width={500}>
            <MjmlImage width={240} src={`${props.assetHost}/email_images/floro_with_text_email.png`} />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection paddingTop={0}>
          <MjmlColumn>
            <MjmlText align={'center'} lineHeight={32} fontSize={32} color={colorPalette.mediumGray}>
                {"Reminder To Download Floro"}
            </MjmlText>
            <MjmlDivider width={'50%'} borderColor={colorPalette.mediumGray}/>
            <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                {"You requested a reminder email to download floro when you're on a desktop device."}
            </MjmlText>
            <MjmlText fontStyle={'italic'} align={'center'} lineHeight={32} fontSize={18} color={colorPalette.mediumGray}>
                {"(if you did not request this email, we're sorry, please disregard this email)"}
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
                    {"download floro"}
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
  link: 'https://floro.io'
}

export default ReminderToDownloadEmail;