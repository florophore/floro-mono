import React, { useState, useCallback } from "react";
import {
  StaticNode,
  StaticOrderedListNode,
  StaticUnOrderedListNode,
  StaticListNode,
  StaticLinkNode,
  StaticTextNode,
  DebugInfo
} from "@floro/common-generators/floro_modules/text-generator";

export interface TextRenderers {
  render: (
    nodes: (StaticNode | StaticListNode)[],
    renderers: TextRenderers,
    isDebugMode: boolean,
    debugInfo: DebugInfo,
    debugHex?: `#${string}`,
    debugTextColorHex?: string,
  ) => React.ReactElement;
  renderStaticNodes: (
    nodes: (StaticNode | StaticListNode)[],
    renderers: TextRenderers
  ) => React.ReactElement;
  renderText: (
    node: StaticTextNode,
    renderers: TextRenderers
  ) => React.ReactElement;
  renderLinkNode: (
    node: StaticLinkNode,
    renderers: TextRenderers
  ) => React.ReactElement;
  renderListNode: (
    node: StaticListNode,
    renderers: TextRenderers
  ) => React.ReactElement;
  renderUnOrderedListNode: (
    node: StaticUnOrderedListNode,
    renderers: TextRenderers
  ) => React.ReactElement;
  renderOrderedListNode: (
    node: StaticOrderedListNode,
    renderers: TextRenderers
  ) => React.ReactElement;
}

const renderStaticNodes = (
  nodes: (StaticNode | StaticListNode)[],
  renderers: TextRenderers
): React.ReactElement => {
  return (
    <>
      {nodes?.map((staticNode, index) => {
        return (
          <React.Fragment key={index}>
            {staticNode.type == "text" &&
              renderers.renderText(staticNode, renderers)}
            {staticNode.type == "link" &&
              renderers.renderLinkNode(staticNode, renderers)}
            {staticNode.type == "li" &&
              renderers.renderListNode(staticNode, renderers)}
            {staticNode.type == "ul" &&
              renderers.renderUnOrderedListNode(staticNode, renderers)}
            {staticNode.type == "ol" &&
              renderers.renderOrderedListNode(staticNode, renderers)}
          </React.Fragment>
        );
      })}
    </>
  );
};

const renderText = (node: StaticTextNode, renderers: TextRenderers) => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  const lineBreaks = node?.content?.split?.("\n") ?? [];
  const breakContent = lineBreaks.map((c, i) => (
    <React.Fragment key={i}>
      {c}
      {lineBreaks.length -1 != i && (
        <br/>
      )}
    </React.Fragment>
  ));
  let content = (
    <>
      {breakContent}
      {children}
    </>
  );
  if (node.styles.isBold) {
    content = <b>{content}</b>;
  }
  if (node.styles.isItalic) {
    content = <i>{content}</i>;
  }
  if (node.styles.isUnderlined) {
    content = <u>{content}</u>;
  }
  if (node.styles.isStrikethrough) {
    content = <s>{content}</s>;
  }
  if (node.styles.isSuperscript) {
    content = <sup>{content}</sup>;
  }
  if (node.styles.isSubscript) {
    content = <sub>{content}</sub>;
  }
  return content;
};

const renderLinkNode = (
  node: StaticLinkNode,
  renderers: TextRenderers
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return <a href={node.href}>{children}</a>;
};

const renderListNode = (
  node: StaticListNode,
  renderers: TextRenderers
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return <li>{children}</li>;
};

const renderUnOrderedListNode = (
  node: StaticUnOrderedListNode,
  renderers: TextRenderers
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return <ul>{children}</ul>;
};

const renderOrderedListNode = (
  node: StaticOrderedListNode,
  renderers: TextRenderers
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return <ol>{children}</ol>;
};

const render = (
  nodes: (StaticNode | StaticListNode)[],
  renderers: TextRenderers,
  isDebugMode: boolean,
  debugInfo: DebugInfo,
  debugHex: `#${string}` = '#FF0000',
  debugTextColorHex: string = 'white'
): React.ReactElement => {
    const content = renderers.renderStaticNodes(nodes, renderers);
    if (isDebugMode) {
        return (
          <span
            onMouseEnter={(e) => {
                if (e?.currentTarget?.lastChild) {
                    const div = e.currentTarget.lastChild as HTMLDivElement;
                    div.style.display = 'block';
                }
            }}
            onMouseLeave={(e) => {
                if (e?.currentTarget?.lastChild) {
                    const div = e.currentTarget.lastChild as HTMLDivElement;
                    div.style.display = 'none';
                }
            }}
            onClick={(e) => {

                if (e?.currentTarget?.lastChild) {
                    const div = e.currentTarget.lastChild as HTMLDivElement;
                    div.style.display = 'block';
                }
            }}
            style={{
              position: "relative",
              boxShadow: `inset 0px 0px 0px 1px ${debugHex}`,
              display: "inherit",
              fontFamily: 'inherit'
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                top: 0,
                background: `${debugHex}CC`,
                padding: 8,
                color: debugTextColorHex,
                fontWeight: 500,
                fontSize: '1.2rem',
                display: 'none',
                fontFamily: 'inherit',
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'row'
              }}>
                <div>
                  <p>{"Phrase Group: "}<b>{debugInfo.groupName}</b></p>
                  <p>{"Phrase Key: "}<b>{debugInfo.phraseKey}</b></p>
                </div>
                <div style={{marginLeft: 24}}>
                  <p style={{cursor: 'pointer'}} onClick={(e) => {
                    if (e?.currentTarget?.parentElement?.parentElement?.parentElement) {
                      e.stopPropagation();
                      const div = e?.currentTarget?.parentElement?.parentElement?.parentElement;
                      div.style.display = 'none';
                    }
                  }}>{'X'}</p>
                </div>
              </div>
            </div>
          </span>
        );
    }
    return content
};



export const renderers: TextRenderers = {
  render,
  renderStaticNodes,
  renderText,
  renderLinkNode,
  renderListNode,
  renderUnOrderedListNode,
  renderOrderedListNode,
};

