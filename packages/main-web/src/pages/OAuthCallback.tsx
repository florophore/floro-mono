import React, { useEffect, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import FloroIcon from '../assets/images/floro_logo.svg';
import DotsLoader from '@floro/storybook/stories/DotsLoader';
import colorPalette from '@floro/styles/ColorPalette';


const BackgroundWrapper = styled.div`
  background-color: ${props => props.theme.background};
  display: flex;
  flex: 1;
  height: 100vh;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const  FloroImage = styled.img`
  max-width: 200px;
  width: 100%;
  margin-bottom: 48px;
`


function OAuthCallback() {

    const params = useParams();
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (window?.OAuthAPI?.isDesktopApp) {
          if (error) {
            window.OAuthAPI.sendResult(false, params?.provider);
          } else {
            window.OAuthAPI.sendResult(true, params?.provider, code);
          }
        }
      }, 1000);
      return () => {
        clearTimeout(timeout);
      }
    }, [error, code, params.provider]);

    return (
      <BackgroundWrapper>
        <FloroImage
          src={FloroIcon}
        />
        <DotsLoader size={"large"} color={"purple"}/>
      </BackgroundWrapper>
    );
}

export default OAuthCallback;