/**
 * @typedef ProcessInfo
 * @property {HTMLElement } scopeNode
 * @property {HTMLElement } targetNode
 * @property {Attr} attribute
 * @property {string} attributeName
 * @property {string|null} attributeValue
 * @property {string} expression
 * @property {string[]} props
 * @property {any} context
 */

/**
 * @typedef ProcessResult
 * @property {(value: any, forceUpdate?: boolean) => any} update
 * @property {any} [context]
 * @property {boolean} [removeAttribute]
 * @property {boolean} [removeNode]
 */

/**
 * @typedef Directive
 * @property {((attr: Attr, nodeName: string, nodeValue: string|null) => any)} attribute
 * @property {(info: ProcessInfo) => ProcessResult} process
 * @property {boolean} [noExecution]
 */

class DirectiveRegistry {
  /**
   * @private
   * @type { Set<Directive>}
   */
  _directives = new Set();

  /**
   * @public
   * @param {Directive} directive
   */
  register(directive) {
    this._directives.add(directive);
  }

  /**
   *
   * @returns {Directive[]}
   */
  getDirectives() {
    return Array.from(this._directives);
  }
}

export const Registry = new DirectiveRegistry();
