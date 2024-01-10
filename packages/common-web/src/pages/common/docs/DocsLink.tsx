import React, { useEffect, useCallback, useState, useMemo } from "react";
import styled from "@emotion/styled";
import { Link as RouterLink } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";
import LinkWhiteIcon from "@floro/common-assets/assets/images/icons/link.white.svg";
import LinkBlueIcon from "@floro/common-assets/assets/images/icons/link.blue.svg";
import { useLocation } from "react-router-dom";
import { useSelectedTheme } from "../../../hooks/color-theme";
import { useLocales } from "../../../floro_listener/hooks/locales";

const LinkContainer = styled.div`
  user-select: none;
`;

const ChainLink = styled.span`
  user-select: none;
`;

const ChainLinkHighlight = styled.span`
  user-select: none;
  cursor: pointer;
  &:hover {
    cursor: pointer;
    color: ${ColorPalette.linkBlue};
  }
`;

const LinkComponentContainer = styled.div`
  display: inline-block;
  transition: opacity 300ms;
`;

const Prefix = styled.span`
  margin-left: 6px;
  margin-right: 6px;
  color: ${props => props.theme.colors.contrastTextLight};
  font-weight: 600;
`;

export interface LinkChain {
  label: string;
  prefix?: null | "/" | "@"| ">";
  value?: string;
  next?: LinkChain | null;
}

interface Props {
  chain: LinkChain;
}

const DocsLink = (props: Props) => {

  const link = useMemo(() => {
    const children: React.ReactElement[] = [];
    for (
      let current: LinkChain | null = props?.chain;
      current != null;
      current = current?.next ?? null
    ) {
      if ((current.prefix == "/" || current.prefix == "@") && current.value) {
        children.push(
          <LinkComponentContainer>
            <Prefix>{current.prefix}</Prefix>
            <RouterLink to={current.value}>
              <ChainLinkHighlight>{current.label}</ChainLinkHighlight>
            </RouterLink>
          </LinkComponentContainer>
        );
      } else if (current.prefix == ">") {
        children.push(
          <LinkComponentContainer>
            <Prefix>{current.prefix}</Prefix>
            <ChainLink>{current.label}</ChainLink>
          </LinkComponentContainer>
        );
      } else {
        if (current.value) {
          children.push(
            <LinkComponentContainer>
              <RouterLink to={current.value}>
                <ChainLinkHighlight>{current.label}</ChainLinkHighlight>
              </RouterLink>
            </LinkComponentContainer>
          );
        } else {
          children.push(
            <LinkComponentContainer>
              <ChainLink>{current.label}</ChainLink>
            </LinkComponentContainer>
          );
        }
      }
    }

    return (
      <LinkContainer>
        {children.map((child, index) => {
          return <React.Fragment key={index}>{child}</React.Fragment>;
        })}
      </LinkContainer>
    );
  }, [props.chain]);
  return link;
};

export const useLinkTitle = (chain: LinkChain, deps: unknown[]) => {
  const { selectedLocaleCode } = useLocales();
  return useMemo(() => <DocsLink chain={chain} />, [selectedLocaleCode, chain, ...(deps ?? [])]);
};

export default React.memo(DocsLink);