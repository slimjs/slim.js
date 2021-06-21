/**
 * @typedef NodeProcessInfo
 * @property {any|Element} scopeNode
 * @property {Element} targetNode
 * @property {Attr} attribute
 * @property {string} attributeName
 * @property {string|null} attributeValue
 * @property {string} expression
 * @property {any} context
 * @property {string[]} props
 */

/**
 * @typedef NodeProcessResult
 * @property {(value: any) => any} update
 * @property {boolean} [removeAttribute]
 * @property {boolean} [removeNode]
 */

/**
 * @typedef {(attr: Attr, nodeName: string, nodeValue: string | null) => any} AttributeTest
 */

/**
 * @typedef {(info: NodeProcessInfo) => NodeProcessResult} NodeProcessor
 */

/**
 * @typedef Directive
 * @property {AttributeTest} attribute
 * @property {NodeProcessor} process
 */
