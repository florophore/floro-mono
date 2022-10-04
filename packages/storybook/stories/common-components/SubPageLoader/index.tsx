import React from 'react'
import styled from '@emotion/styled';
import FloroIcon from '@floro/common-assets/assets/images/floro_logo.svg';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';


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

const SubPageLoader = (): React.ReactElement => {

  return (
    <BackgroundWrapper>
      <FloroImage
        src={FloroIcon}
      />
      <DotsLoader size={"large"} color={"purple"}/>
    </BackgroundWrapper>
  );
}

export default React.memo(SubPageLoader);