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
    MjmlDivider,
    MjmlFont,
    MjmlText,
  } from 'mjml-react';
  import colorPalette from '@floro/styles/ColorPalette';

export interface Props {
  assetHost: string;
  link: string;
  action: 'signup'|'login';
}

const VerifyGithubOAuthEmail = (props: Props): React.ReactElement => {
  return (
    <Mjml>
      <MjmlHead>
        {props.action == "login" &&
          <>
            <MjmlTitle>Floro Github Sign In</MjmlTitle>
            <MjmlPreview>Floro Github Sign In</MjmlPreview>
          </>
        }
        {props.action == "signup" &&
          <>
            <MjmlTitle>Floro Github Sign Up</MjmlTitle>
            <MjmlPreview>Floro Github Sign Up</MjmlPreview>
          </>
        }
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
            {props.action == "signup" &&
              <MjmlText align={'center'} lineHeight={32} fontSize={32} color={colorPalette.mediumGray}>
                  {"Welcome to floro!"}
              </MjmlText>
            }
            {props.action == "login" &&
              <MjmlText align={'center'} lineHeight={32} fontSize={32} color={colorPalette.mediumGray}>
                  {"Welcome back to floro!"}
              </MjmlText>
            }
            <MjmlDivider width={'50%'} borderColor={colorPalette.mediumGray}/>
            {props.action == "signup" &&
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {"please click the button below to sign up for floro."}
              </MjmlText>
            }
            {props.action == "login" &&
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {"please click the button below to sign in to floro."}
              </MjmlText>
            }
            {props.action == "signup" &&
              <MjmlText align={'center'} lineHeight={32} fontSize={18} fontWeight={700} color={colorPalette.mediumGray}>
                  {"After signing up with think link below, you will be able to sign in directly with Github."}
              </MjmlText>
            }
            {props.action == "login" &&
              <MjmlText align={'center'} lineHeight={32} fontSize={18} fontWeight={700} color={colorPalette.mediumGray}>
                  {"After signing in with think link below, you will be able to sign in directly with Github."}
              </MjmlText>
            }
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
            {props.action == "signup" &&
              <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                  {"complete sign up"}
              </MjmlText>
            }
            {props.action == "login" &&
              <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                  {"sign in to floro"}
              </MjmlText>
            }
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

export const mock: Props = {
  assetHost: "http://localhost:5173",
  link: 'http://google.com',
  action: 'login'
}

export const signupMock: Props = {
  assetHost: "http://localhost:5173",
  link: 'http://google.com',
  action: 'signup'
}

export default VerifyGithubOAuthEmail;