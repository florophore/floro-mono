import React, { useEffect, useCallback, useState, useMemo } from "react";
import styled from "@emotion/styled";
import { Link as RouterLink } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";
import LinkWhiteIcon from "@floro/common-assets/assets/images/icons/link.white.svg";
import LinkBlueIcon from "@floro/common-assets/assets/images/icons/link.blue.svg";
import { useLocation } from "react-router-dom";

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
`;

const LinkIcon = styled.img`
  margin-left: 12px;
  height: 24px;
  width: 24px;
  margin-bottom: -4px;
  cursor: pointer;
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
  //@ts-ignore next-line
  const homeLink = window?.REDIRECT_URL ?? "floro.io";
  const location = useLocation();
  const [isHovering, setIsHovering] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const onMouseOver = useCallback(() => {
    setIsHovering(true);
  }, [])
  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, [])

  const onClickLink = useCallback(() => {
    const value = homeLink + "/web-redirect" + location.pathname + location.search;
    navigator.clipboard.writeText(value);
    setShowCopied(true);
  }, [location]);

  useEffect(() => {
    if (showCopied) {
      const timeout = setTimeout(() => {
        setShowCopied(false);
      }, 500);

      return () => {
        clearTimeout(timeout);
      }
    }

  }, [showCopied])

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
        <LinkIcon
          onMouseOver={onMouseOver}
          onMouseLeave={onMouseLeave}
          onClick={onClickLink}
          src={isHovering ? LinkBlueIcon : LinkWhiteIcon}
        />
        <LinkComponentContainer style={{marginLeft: 12, opacity: showCopied ? 1 : 0}}>
            <ChainLink>{'copied!'}</ChainLink>
        </LinkComponentContainer>
      </LinkContainer>
    );
  }, [props.chain, isHovering, onClickLink, showCopied]);
  return link;
};

export const useLinkTitle = (chain: LinkChain, deps: unknown[]) => {
  return useMemo(() => <HeaderLink chain={chain} />, [chain, ...(deps ?? [])]);
};

export default React.memo(HeaderLink);