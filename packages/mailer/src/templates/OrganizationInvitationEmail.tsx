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
  organizationName: string;
  invitingUserFirstName: string;
  invitingUserLastName: string;
  userExistedAlready: boolean;
  assetHost: string;
  link: string;
}

const LoginEmail = (props: Props): React.ReactElement => {
  return (
    <Mjml>
      <MjmlHead>
          <MjmlTitle>{`Invitation to ${upcaseFirst(props.organizationName)}'s floro`}</MjmlTitle>
          <MjmlPreview>{`Hi ${upcaseFirst(props.firstName)}, ${upcaseFirst(props.invitingUserFirstName)} ${upcaseFirst(props.invitingUserLastName)} is inviting you to join ${upcaseFirst(props.organizationName)}'s floro organization`}</MjmlPreview>
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
                {`Hi ${upcaseFirst(props.firstName)}!`}
            </MjmlText>
            <MjmlDivider width={'50%'} borderColor={colorPalette.mediumGray}/>
            <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                {`${upcaseFirst(props.invitingUserFirstName)} ${upcaseFirst(props.invitingUserLastName)} is inviting you to join ${upcaseFirst(props.organizationName)}'s floro organization.`}
            </MjmlText>
            {!props.userExistedAlready && (
                <MjmlText fontStyle={'italic'} align={'center'} lineHeight={32} fontSize={18} color={colorPalette.mediumGray}>
                    {`You can click the link below to setup your floro account and get started with ${upcaseFirst(props.organizationName)}.`}
                </MjmlText>
            )}
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
  invitingUserFirstName: "jamie",
  invitingUserLastName: "sunderland",
  organizationName: "airbnb",
  userExistedAlready: false,
  assetHost: "http://localhost:5173",
  link: 'http://google.com'
}

export const existingUserMock: Props = {
  firstName: "jacqueline",
  invitingUserFirstName: "jamie",
  invitingUserLastName: "sunderland",
  organizationName: "cheqout",
  userExistedAlready: true,
  assetHost: "http://localhost:5173",
  link: 'http://google.com'
}

export default LoginEmail;