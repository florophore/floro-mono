import {
  StaticNode,
  StaticOrderedListNode,
  StaticUnOrderedListNode,
  StaticListNode,
  StaticLinkNode,
  StaticTextNode,
} from "@floro/common-generators/floro_modules/text-generator";

export interface PlainTextRenderers {
  render: (
    nodes: (StaticNode | StaticListNode)[],
    renderers: PlainTextRenderers,
  ) => string;
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
  render,
  renderStaticNodes,
  renderText,
  renderLinkNode,
  renderListNode,
  renderUnOrderedListNode,
  renderOrderedListNode,
};

