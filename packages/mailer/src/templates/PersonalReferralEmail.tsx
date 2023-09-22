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

const findFirstChar = (str: string) => {
    for (let i = 0; i < str.length; ++i) {
        if (/[A-z]/.test(str[i])) return str[i].toUpperCase();
    }
    return "";
}

const upcaseFirst = (str: string) => {
    const firstChar = findFirstChar(str);
    const pos = str.toLowerCase().indexOf(firstChar.toLowerCase());
    return firstChar + str.substring(pos + 1);
}

export interface Props {
  firstName: string;
  referrerUserFirstName: string;
  referrerUserLastName: string;
  subsequentAttempt: boolean;
  assetHost: string;
  link: string;
}

const PersonalReferralEmail = (props: Props): React.ReactElement => {
  return (
    <Mjml>
      <MjmlHead>
          <MjmlTitle>{`Invitation from ${upcaseFirst(props.referrerUserFirstName)} ${upcaseFirst(props.referrerUserLastName)} to floro`}</MjmlTitle>
          <MjmlPreview>{`Hi ${upcaseFirst(props.firstName)}, ${upcaseFirst(props.referrerUserFirstName)} ${upcaseFirst(props.referrerUserLastName)} gave you 5GB of free storage on floro.`}</MjmlPreview>
          <MjmlFont name="Maven-Pro" href="https://fonts.googleapis.com/css?family=Maven%20Pro"/>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor={colorPalette.white}>
          <MjmlColumn width={500}>
            <MjmlImage width={200} src={`${props.assetHost}/email_images/floro_with_text_email.png`} />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection paddingTop={0}>
          <MjmlColumn>
            <MjmlText align={'center'} lineHeight={32} fontSize={32} color={colorPalette.mediumGray}>
                {`Hi ${upcaseFirst(props.firstName)}!`}
            </MjmlText>
            <MjmlDivider width={'50%'} borderColor={colorPalette.mediumGray}/>
            <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                {`${upcaseFirst(props.referrerUserFirstName)} ${upcaseFirst(props.referrerUserLastName)} is inviting you to join floro. If you sign up this week you and ${upcaseFirst(props.referrerUserFirstName)} will both `} <b>{'receive 5GB of free additional storage'}</b> {` to use on any of your projects.`}
            </MjmlText>
            <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                {`We're excited to see what you and ${upcaseFirst(props.referrerUserFirstName)} build together!`}
            </MjmlText>
            <MjmlText fontStyle={'italic'} align={'center'} lineHeight={32} fontSize={18} color={colorPalette.mediumGray}>
                {"this link will expire in a week"}
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
                    {"accept invitation"}
                </MjmlText>
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

export const mock: Props = {
  firstName: "jacqueline",
  referrerUserFirstName: "jamie",
  referrerUserLastName: "sunderland",
  subsequentAttempt: false,
  assetHost: "http://localhost:5173",
  link: 'http://google.com'
}

export const existingUserMock: Props = {
  firstName: "jacqueline",
  referrerUserFirstName: "jamie",
  referrerUserLastName: "sunderland",
  subsequentAttempt: false,
  assetHost: "http://localhost:5173",
  link: 'http://google.com'
}

export default PersonalReferralEmail;