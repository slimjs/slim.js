/**
 * @typedef ProcessInfo
 * @property {HTMLElement } targetNode
 * @property {HTMLElement } scopeNode
 * @property {Attr} attribute
 * @property {string} expression
 * @property {string[]} props
 * @property {any} context
 * @property {Record<string, Function[]>} bindings
 */

/**
 * @typedef ProcessResult
 * @property {(value: any, forceUpdate?: boolean) => any} update
 * @property {any} [context]
 */

/**
 * @typedef Directive
 * @property {((attr: Attr) => any)} attribute
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
