import React, { useEffect, useCallback, useState, useMemo } from "react";
import styled from "@emotion/styled";
import { Link as RouterLink } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";

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
`;

const Prefix = styled.span`
  margin-left: 6px;
  margin-right: 6px;

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

const HeaderLink = (props: Props) => {
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
  return useMemo(() => <HeaderLink chain={chain} />, [chain, ...(deps ?? [])]);
};

export default React.memo(HeaderLink);