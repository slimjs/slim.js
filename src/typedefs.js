/**
 * @typedef NodeProcessInfo
 * @property {any|Element} scopeNode
 * @property {Element} targetNode
 * @property {string} targetNodeName
 * @property {Attr} attribute
 * @property {string} attributeName
 * @property {string|null} attributeValue
 * @property {string} expression
 * @property {any} context
 * @property {string[]} props
 */

/**
 * @typedef NodeProcessResult
 * @property {(value: any, forceUpdate: boolean) => any} [update]
 * @property {boolean} [removeAttribute]
 * @property {boolean} [removeNode]
 * @property {boolean} [noInvocation]
 */

/**
 * @typedef {(attr: Attr, nodeName: string, nodeValue: string) => any} AttributeTest
 */

/**
 * @typedef {(info: NodeProcessInfo) => NodeProcessResult} NodeProcessor
 */

/**
 * @typedef {(phase: symbol, target: import('./index.js').Slim) => any} Plugin
 */

/**
 * @typedef Directive
 * @property {AttributeTest} attribute
 * @property {NodeProcessor} process
 * @property {boolean} [noExecution]
 */

export {};
