import React from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import {
  StaticNode,
  StaticOrderedListNode,
  StaticUnOrderedListNode,
  StaticListNode,
  StaticLinkNode,
  StaticTextNode,
  DebugInfo,
  StaticContentVariable,
  StaticStyledTextNode,
} from "@floro/common-generators/floro_modules/text-generator";

export interface TextRenderers<N extends string> {
  render: (
    nodes: (StaticNode<React.ReactElement> | StaticListNode<React.ReactElement>)[],
    renderers: TextRenderers<N>,
    isDebugMode: boolean,
    debugInfo: DebugInfo,
    debugHex?: `#${string}`,
    debugTextColorHex?: string,
  ) => React.ReactElement;
  renderStaticNodes: (
    nodes: (StaticNode<React.ReactElement> | StaticListNode<React.ReactElement>)[],
    renderers: TextRenderers<N>
  ) => React.ReactElement;
  renderText: (
    node: StaticTextNode<React.ReactElement>,
    renderers: TextRenderers<N>
  ) => React.ReactElement;
  renderLinkNode: (
    node: StaticLinkNode<React.ReactElement>,
    renderers: TextRenderers<N>
  ) => React.ReactElement;
  renderListNode: (
    node: StaticListNode<React.ReactElement>,
    renderers: TextRenderers<N>
  ) => React.ReactElement;
  renderUnOrderedListNode: (
    node: StaticUnOrderedListNode<React.ReactElement>,
    renderers: TextRenderers<N>
  ) => React.ReactElement;
  renderOrderedListNode: (
    node: StaticOrderedListNode<React.ReactElement>,
    renderers: TextRenderers<N>
  ) => React.ReactElement;
  renderStyledContentNode: (
    node: StaticStyledTextNode<React.ReactElement, N>,
    renderers: TextRenderers<N>
  ) => React.ReactElement;
  renderContentVariable: (
    node: StaticContentVariable<React.ReactElement>
  ) => React.ReactElement;
}

const renderStaticNodes = <N extends string,>(
  nodes: (
    | StaticNode<React.ReactElement>
    | StaticListNode<React.ReactElement>
    | StaticContentVariable<React.ReactElement>
    | StaticStyledTextNode<React.ReactElement, N>
  )[],
  renderers: TextRenderers<N>
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
            {staticNode.type == "styled-content" &&
              renderers.renderStyledContentNode(staticNode, renderers)}
            {staticNode.type == "content" &&
              renderers.renderContentVariable(staticNode)}
          </React.Fragment>
        );
      })}
    </>
  );
};

const renderText = <N extends string,>(node: StaticTextNode<React.ReactElement>, renderers: TextRenderers<N>) => {
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

const renderLinkNode = <N extends string,>(
  node: StaticLinkNode<React.ReactElement>,
  renderers: TextRenderers<N>
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return <a href={node.href}>{children}</a>;
};

const renderListNode = <N extends string,>(
  node: StaticListNode<React.ReactElement>,
  renderers: TextRenderers<N>
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return <li>{children}</li>;
};

const renderUnOrderedListNode = <N extends string,>(
  node: StaticUnOrderedListNode<React.ReactElement>,
  renderers: TextRenderers<N>
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return <ul>{children}</ul>;
};

const renderOrderedListNode = <N extends string,>(
  node: StaticOrderedListNode<React.ReactElement>,
  renderers: TextRenderers<N>
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return <ol>{children}</ol>;
};

const renderStyledContentNode = <N extends string,>(
  node: StaticStyledTextNode<React.ReactElement, N>,
  renderers: TextRenderers<N>
): React.ReactElement => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  const content = node?.styleClassFunction?.(children, node.styledContentName) ?? null;
  if (content) {
    return content;
  }
  return <>{children}</>
};

const renderContentVariable = (
  node: StaticContentVariable<React.ReactElement>
): React.ReactElement => {
  return node.data ?? <></>;
};

const render = <N extends string>(
  nodes: (
    | StaticNode<React.ReactElement>
    | StaticListNode<React.ReactElement>
  )[],
  renderers: TextRenderers<N>,
  isDebugMode: boolean,
  debugInfo: DebugInfo,
  debugHex: `#${string}` = "#FF0000",
  debugTextColorHex: string = "white"
): React.ReactElement => {
  const content = renderers.renderStaticNodes(nodes, renderers);
  if (isDebugMode) {
    return (
      <span
        onMouseEnter={(e) => {
          if (e?.currentTarget?.lastChild) {
            const div = e.currentTarget.lastChild as HTMLDivElement;
            div.style.display = "block";
          }
        }}
        onMouseLeave={(e) => {
          if (e?.currentTarget?.lastChild) {
            const div = e.currentTarget.lastChild as HTMLDivElement;
            div.style.display = "none";
          }
        }}
        onClick={(e) => {
          if (e?.currentTarget?.lastChild) {
            const div = e.currentTarget.lastChild as HTMLDivElement;
            div.style.display = "block";
          }
        }}
        style={{
          position: "relative",
          boxShadow: `inset 0px 0px 0px 1px ${debugHex}`,
          display: "inherit",
          fontFamily: "inherit",
        }}
      >
        {content}
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: `${debugHex}CC`,
            padding: 8,
            color: debugTextColorHex,
            fontWeight: 500,
            fontSize: "1.2rem",
            display: "none",
            fontFamily: "inherit",
            zIndex: 100,
          }}
        >
          <span
            style={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <span style={{ display: "block" }}>
              <span style={{ display: "block" }}>
                {"Phrase Group: "}
                <b>{debugInfo?.groupName}</b>
              </span>
              <span style={{ display: "block" }}>
                {"Phrase Key: "}
                <b>{debugInfo?.phraseKey}</b>
              </span>
              <span
                onClick={() => {
                  const channel = new BroadcastChannel("floro:plugin:message");
                  channel.postMessage({
                    repositoryId: metaFile.repositoryId,
                    plugin: "text",
                    eventName: "open:phrase",
                    message: {
                      ...debugInfo,
                    },
                  });
                }}
                style={{
                  display: "block",
                  textDecoration: "underline",
                  marginTop: 4,
                  cursor: "pointer",
                }}
              >
                <b>{"OPEN"}</b>
              </span>
            </span>
            <span style={{ marginLeft: 24, display: "block" }}>
              <span
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    e?.currentTarget?.parentElement?.parentElement
                      ?.parentElement
                  ) {
                    const div =
                      e?.currentTarget?.parentElement?.parentElement
                        ?.parentElement;
                    div.style.display = "none";
                  }
                }}
              >
                {"X"}
              </span>
            </span>
          </span>
        </span>
      </span>
    );
  }
  return content;
};

export const richTextRenderers = {
  render,
  renderStaticNodes,
  renderText,
  renderLinkNode,
  renderListNode,
  renderUnOrderedListNode,
  renderOrderedListNode,
  renderStyledContentNode,
  renderContentVariable,
};