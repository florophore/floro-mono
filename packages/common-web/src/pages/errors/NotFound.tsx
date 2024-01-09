import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {Helmet} from "react-helmet";
import { useLocation } from "react-router-dom";
import { useIsOnline } from "@floro/common-react/src/hooks/offline";
import Button from '@floro/storybook/stories/design-system/Button';
import { useDaemonIsConnected, useFloroSocket } from '@floro/common-react/src/pubsub/socket';
import PageWrapper from '../../components/wrappers/PageWrapper';
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useRichText } from '../../floro_listener/hooks/locales';
import { useIcon } from '../../floro_listener/FloroIconsProvider';
import ColorPalette from '@floro/styles/ColorPalette';

const ContentWrapper = styled.div`
  width: 100%;
  min-height: calc(100dvh - 100px);
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  margin-bottom: 36px;
  padding: 16px;
`;

const TitleSpan = styled.h3`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.contrastText};
  margin-top: 36px;
  text-align: center;
`;

const TitleSubSpan = styled.h4`
  font-size: 1.44rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${ColorPalette.gray};
  margin-top: 18px;
  text-align: center;
`;

const Image = styled.img`
  margin-top: 10%;
  max-width: 404px;
  width: 100%;
`;

const Icon = styled.img`
  margin-top: 36px;
  width: 56px
`;

function NotFound(): React.ReactElement {
  const fourOhFourIcon = useIcon("site-images.404");
  const warning = useIcon("site-images.error");

  const pageNotFound = useRichText("site_copy.page_not_found");
  const doesNotExist = useRichText("site_copy.page_looking_for_does_not_exist");

  return (
    <PageWrapper isCentered>
      <Helmet>
        <title>{"Floro | 404"}</title>
      </Helmet>
      <ContentWrapper>
        <Row
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          <Col>
            <Image src={fourOhFourIcon}/>
            <TitleSpan>{pageNotFound}</TitleSpan>
            <TitleSubSpan>{doesNotExist}</TitleSubSpan>
            <Icon src={warning}/>
          </Col>
        </Row>
      </ContentWrapper>
    </PageWrapper>
  );
}

export default NotFound;