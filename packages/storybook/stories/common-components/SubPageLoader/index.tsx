import React from 'react'
import styled from '@emotion/styled';
import FloroIcon from '@floro/common-assets/assets/images/floro_logo.svg';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';


const BackgroundWrapper = styled.div`
  background-color: ${props => props.theme.background};
  display: flex;
  flex: 1;
  height: 100dvh;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const  FloroImage = styled.img`
  max-width: 200px;
  width: 100%;
  margin-bottom: 48px;
`

export interface Props {
  children?: React.ReactElement;
  hideLoad?: boolean;
  isNested?: boolean;
}


const SubPageLoader = (props?: Props): React.ReactElement => {

  return (
    <div style={{zoom: '100%'}}>
      <BackgroundWrapper>
        <FloroImage
          src={FloroIcon}
          style={{
            marginTop: props?.isNested ? -200 : 0
          }}
        />
        {!props?.hideLoad && <DotsLoader size={"large"} color={"purple"}/>}
        {!!props?.children &&
          <>{props?.children}</>
        }
      </BackgroundWrapper>
    </div>
  );
}

export default React.memo(SubPageLoader);