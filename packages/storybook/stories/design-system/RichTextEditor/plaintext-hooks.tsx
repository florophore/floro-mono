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

export interface PlainTextRenderers {
  renderStaticNodes: (
    nodes: (StaticNode | StaticListNode)[],
    renderers: PlainTextRenderers
  ) => string;
  renderText: (
    node: StaticTextNode,
    renderers: PlainTextRenderers
  ) => string;
  renderLinkNode: (
    node: StaticLinkNode,
    renderers: PlainTextRenderers
  ) => string;
  renderListNode: (
    node: StaticListNode,
    renderers: PlainTextRenderers
  ) => string;
  renderUnOrderedListNode: (
    node: StaticUnOrderedListNode,
    renderers: PlainTextRenderers
  ) => string;
  renderOrderedListNode: (
    node: StaticOrderedListNode,
    renderers: PlainTextRenderers
  ) => string;
}

const renderStaticNodes = (
  nodes: (StaticNode | StaticListNode)[],
  renderers: PlainTextRenderers
): string => {
return nodes?.map((staticNode) => {
  if (staticNode.type == "text") {
      return renderers.renderText(staticNode, renderers);
  }
  if (staticNode.type == "link") {
    return renderers.renderLinkNode(staticNode, renderers);
  }
  if (staticNode.type == "li") {
    return renderers.renderListNode(staticNode, renderers);
  }
  if (staticNode.type == "ul") {
    return renderers.renderUnOrderedListNode(staticNode, renderers);
  }
  if (staticNode.type == "ol") {
    return renderers.renderOrderedListNode(staticNode, renderers);
  }
  return "";
  }).join("");
};

const renderText = (node: StaticTextNode, renderers: PlainTextRenderers) => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return `${node.content}${children}`;
}

const renderLinkNode = (
  node: StaticLinkNode,
  renderers: PlainTextRenderers
): string => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return children;
};

const renderListNode = (
  node: StaticListNode,
  renderers: PlainTextRenderers
): string => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return children + '\n';
};

const renderUnOrderedListNode = (
  node: StaticUnOrderedListNode,
  renderers: PlainTextRenderers
): string => {
  return node.children?.map(content => {
    return `• ${renderers.renderListNode(content, renderers)}`
  }).join("");
};

const renderOrderedListNode = (
  node: StaticOrderedListNode,
  renderers: PlainTextRenderers
): string => {
  return node.children?.map((content, index) => {
    return `${index + 1}. ${renderers.renderListNode(content, renderers)}`
  }).join("");
};

const render = (
  nodes: (StaticNode | StaticListNode)[],
  renderers: PlainTextRenderers,
): string => {
    const content = renderers.renderStaticNodes(nodes, renderers);
    return content
};

export const renderers: PlainTextRenderers = {
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


export const usePlainText = (text: string, textRenderers: PlainTextRenderers = renderers) => {

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

export const getPlainText = (text: string, textRenderers: PlainTextRenderers = renderers) => {
  const mentionedLinks = findUrls(text ?? "");
  const observer = new Observer(mentionedLinks);
  const editorDoc = new EditorDocument(observer)
  editorDoc.tree.updateRootFromHTML(text);
  const children = (editorDoc.tree.rootNode.toJSON()?.children ?? []) as UnprocessedNode[]
  const textNodes = getTextNodes(children);
  return textRenderers.renderStaticNodes(textNodes, textRenderers);
}