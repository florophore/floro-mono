import React, { useMemo } from "react";
import EditorDocument from "./editor/EditorDocument";
import Cursor from "./editor/Cursor";
import Observer from "./editor/Observer";
import * as linkify from 'linkifyjs';


export const findUrls = (text: string): Array<string> => {
  const observer = new Observer();
  const editorDoc = new EditorDocument(observer);
    editorDoc.tree.updateRootFromHTML(text);
  const plainText= editorDoc.tree.rootNode.toUnescapedString();
  const values = new Set(linkify
    .find(plainText)
    .filter((v) => v.type == "url")
    .map((v) => v.value));

	return Array.from(values);
};


interface UnprocessedNode {
  type: string;
  content: string;
  marks?: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  };
  children: UnprocessedNode[];
}

const getNodeType = (tagType: string): 'text'|'li'|'ul'|'ol'|'link' => {
  if (tagType == 'mentioned-link-tag') {
    return 'link';
  }
  if (tagType == 'li-tag') {
    return 'li';
  }
  if (tagType == 'ul-tag') {
    return 'ul';
  }
  if (tagType == 'ol-tag') {
    return 'ol';
  }
  return 'text';
}

export interface StaticTextNode {
  type: "text";
  content: string;
  styles: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
  children: StaticNode[]
}

export interface StaticLinkNode {
  type: "link";
  content: string;
  href: string;
  styles: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
  children: StaticNode[]
}

export interface StaticUnOrderedListNode {
  type: "ul";
  children: StaticListNode[]
}

export interface StaticOrderedListNode {
  type: "ol";
  children: StaticListNode[]
}

export interface StaticListNode {
  type: "li";
  children: StaticNode[]
}

export type StaticNode = StaticTextNode | StaticLinkNode | StaticUnOrderedListNode | StaticOrderedListNode;

export interface TextRenderers {
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
  const lineBreaks = node.content.split("\n");
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
  return <a href={node.href}>{node.content}{children}</a>;
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




export const renderers: TextRenderers = {
  renderStaticNodes,
  renderText,
  renderLinkNode,
  renderListNode,
  renderUnOrderedListNode,
  renderOrderedListNode,
};



const processNodes = (
  nodes: UnprocessedNode[]
): StaticNode[] => {
  return nodes.map((node): StaticNode => {
    const children = processNodes(
      node.children
    );
    if (getNodeType(node.type) == "link") {
        return {
            children,
            content: node.content,
            href: node.content,
            type: "link",
            styles: {
                isBold: node?.marks?.isBold ?? false,
                isItalic: node?.marks?.isItalic ?? false,
                isUnderlined: node?.marks?.isUnderlined ?? false,
                isStrikethrough: node?.marks?.isStrikethrough ?? false,
                isSuperscript: node?.marks?.isSuperscript ?? false,
                isSubscript: node?.marks?.isSubscript ?? false,
            },
        };
    }
    return {
      children,
      content: node.content,
      type: getNodeType(node.type) as "text",
      styles: {
        isBold: node?.marks?.isBold ?? false,
        isItalic: node?.marks?.isItalic ?? false,
        isUnderlined: node?.marks?.isUnderlined ?? false,
        isStrikethrough: node?.marks?.isStrikethrough ?? false,
        isSuperscript: node?.marks?.isSuperscript ?? false,
        isSubscript: node?.marks?.isSubscript ?? false,
      },
    };
  });
};

const getTextNodes = (children: UnprocessedNode[]): (StaticNode|StaticListNode)[] => {
  return processNodes(children ?? []);
}


export const useRichText = (text: string, textRenderers: TextRenderers = renderers) => {

  const mentionedLinks = useMemo(() => {
    return findUrls(text ?? "");
  }, [text])
  const observer = useMemo(() => new Observer(mentionedLinks), [mentionedLinks]);
  const editorDoc = useMemo(() => new EditorDocument(observer), [observer])
  const children = useMemo(() => {
    editorDoc.tree.updateRootFromHTML(text);
    return (editorDoc.tree.rootNode.toJSON()?.children ?? []) as UnprocessedNode[];
  },[editorDoc, text])
  const textNodes = useMemo(() => getTextNodes(children), [children]);
  return textRenderers.renderStaticNodes(textNodes, textRenderers);
}