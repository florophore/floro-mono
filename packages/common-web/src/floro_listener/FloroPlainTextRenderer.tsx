import {
  StaticNode,
  StaticOrderedListNode,
  StaticUnOrderedListNode,
  StaticListNode,
  StaticLinkNode,
  StaticTextNode,
  StaticStyledTextNode,
  StaticContentVariable,
} from "@floro/common-generators/floro_modules/text-generator";

export interface PlainTextRenderers<N extends string> {
  render: (
    nodes: (StaticNode<string> | StaticListNode<string>)[],
    renderers: PlainTextRenderers<N>,
  ) => string;
  renderStaticNodes: (
    nodes: (StaticNode<string> | StaticListNode<string>)[],
    renderers: PlainTextRenderers<N>,
  ) => string;
  renderText: (
    node: StaticTextNode<string>,
    renderers: PlainTextRenderers<N>,
  ) => string;
  renderLinkNode: (
    node: StaticLinkNode<string>,
    renderers: PlainTextRenderers<N>,
  ) => string;
  renderListNode: (
    node: StaticListNode<string>,
    renderers: PlainTextRenderers<N>,
  ) => string;
  renderUnOrderedListNode: (
    node: StaticUnOrderedListNode<string>,
    renderers: PlainTextRenderers<N>,
  ) => string;
  renderOrderedListNode: (
    node: StaticOrderedListNode<string>,
    renderers: PlainTextRenderers<N>,
  ) => string;
  renderStyledContentNode: (
    node: StaticStyledTextNode<string, N>,
    renderers: PlainTextRenderers<N>,
  ) => string;
  renderContentVariable: (
    node: StaticContentVariable<string>
  ) => string;
}

const renderStaticNodes = <N extends string> (
  nodes: (StaticNode<string> | StaticListNode<string>)[],
  renderers: PlainTextRenderers<N>
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

const renderText = <N extends string>(node: StaticTextNode<string>, renderers: PlainTextRenderers<N>) => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return `${node.content}${children}`;
}

const renderLinkNode = <N extends string>(
  node: StaticLinkNode<string>,
  renderers: PlainTextRenderers<N>
): string => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return children;
};

const renderListNode = <N extends string>(
  node: StaticListNode<string>,
  renderers: PlainTextRenderers<N>
): string => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  return children + '\n';
};

const renderUnOrderedListNode = <N extends string>(
  node: StaticUnOrderedListNode<string>,
  renderers: PlainTextRenderers<N>
): string => {
  return node.children?.map(content => {
    return `• ${renderers.renderListNode(content, renderers)}`
  }).join("");
};

const renderOrderedListNode = <N extends string>(
  node: StaticOrderedListNode<string>,
  renderers: PlainTextRenderers<N>
): string => {
  return node.children?.map((content, index) => {
    return `${index + 1}. ${renderers.renderListNode(content, renderers)}`
  }).join("");
};

const renderStyledContentNode = <N extends string,> (
  node: StaticStyledTextNode<string, N>,
  renderers: PlainTextRenderers<N>
): string => {
  let children = renderers.renderStaticNodes(node.children, renderers);
  const content = node?.styleClassFunction?.(children, node.styledContentName) ?? null;
  if (content) {
    return content;
  }
  return "";
};

const renderContentVariable = (
  node: StaticContentVariable<string>
): string => {
  return node.data ?? "";
};

const render = <N extends string>(
  nodes: (StaticNode<string> | StaticListNode<string>)[],
  renderers: PlainTextRenderers<N>,
): string => {
    const content = renderers.renderStaticNodes(nodes, renderers);
    return content
};

export const plainTextRenderers = {
  render,
  renderStaticNodes,
  renderText,
  renderLinkNode,
  renderListNode,
  renderUnOrderedListNode,
  renderOrderedListNode,
  renderStyledContentNode,
  renderContentVariable
};