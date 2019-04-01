/**
 @license
 Copyright (c) 2018 Eyal Avichay <eavichay@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */


let alreadyExists = false

try {
  const { Slim } = window
  if (!!Slim && Slim.plugins && Slim.asap) {
    const warn = console.error || console.warn || console.log
    warn('Warning: slim.js already initialized on window')
    alreadyExists = true
  }
} catch (err) {}
Symbol.Slim = Symbol('@SlimInternals')

export const _$ = Symbol.Slim

export const isReadOnly = (target, prop) => {
  const descriptor = Object.getOwnPropertyDescriptor(target, prop)
  return descriptor && descriptor.writable === false
}

const __flags = {
  isIE11: !!window['MSInputMethodContext'] && !!document['documentMode'],
  isChrome: undefined,
  isEdge: undefined,
  isSafari: undefined,
  isFirefox: undefined
}

try {
  __flags.isChrome = /Chrome/.test(navigator.userAgent)
  __flags.isEdge = /Edge/.test(navigator.userAgent)
  __flags.isSafari = /Safari/.test(navigator.userAgent)
  __flags.isFirefox = /Firefox/.test(navigator.userAgent)

  if (__flags.isIE11 || __flags.isEdge) {
    __flags.isChrome = false
    Object.defineProperty(Node.prototype, 'children', function () {
      return this.childNodes
    })
  }
} catch (err) {}

class Internals {
  constructor () {
    this.boundParent = null
    this.repeater = {}
    this.bindings = {}
    this.inbounds = {}
    this.eventHandlers = {}
    this.rootElement = null
    this.createdCallbackInvoked = false
    this.sourceText = null
    this.excluded = false
    this.autoBoundAttributes = []
  }
}

export class Slim extends HTMLElement {

  /**
   * Replaces dashed-expression (i.e. some-value) to a camel-cased expression (i.e. someValue)
   * @returns {function(string): string}
   */
  static get dashToCamel () {
    return dash => dash.indexOf('-') < 0 ? dash : dash.replace(/-[a-z]/g,
      m => m[1].toUpperCase())
  }

  /**
   * Replaces camel-cased expression (i.e. someValue) to a dashed-expression (i.e. some-value)
   * @returns {function(string): string}
   */
  static get camelToDash () {
    return camel => camel.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  /**
   * Regular expression for testing if an expression describes property accessor
   * @returns {RegExp}
   */
  static get rxProp () {
    return /(.+[^(\((.+)\))])/ // eslint-disable-line
  }

  /**
   * Regular expression for testing if an expression describes method invocation with arguments
   * Example expression: someFunction(someArgument, someOtherArgument)
   * @returns {RegExp}
   */
  static get rxMethod () {
    return /(.+)(\((.+)\)){1}/ // eslint-disable-line
  }

  /**
   * Takes a target object, a dot-notation path and possibly a repeated element and attempts to find the value.
   * @param target
   * @param expression
   * @param maybeRepeated
   * @returns {*}
   */
  static lookup (target, expression, maybeRepeated) {
    const chain = expression.split('.')
    let o
    if (maybeRepeated && maybeRepeated[_$].repeater[chain[0]]) {
      o = maybeRepeated[_$].repeater
    } else {
      o = target
    }
    let i = 0
    while (o && i < chain.length) {
      o = o[chain[i++]]
    }
    return o
  }

  /**
   * Accesses the @SlimInternals symbol of any target. Creates one if non-existent.
   * @param target
   * @returns {Object}
   * @private
   */
  static _$ (target) {
    target[_$] = target[_$] || new Internals()
    return target[_$]
  }

  /**
   * Creates and defines a new custom element.
   * Can work in two forms:
   * @example Slim.tag('my-tag', 'template-html', class extends Slim {...}
   * @example Slim.tag('my-tag', class extends Slim {...})
   *
   * In case where a class was provided instead of a template, the class should hold an accessor with a name 'template' to provide the
   * HTML markup on runtime
   *
   * @public
   * @param {string} tagName
   * @param {string|function} tplOrClazz
   * @param {function} clazz?
   */
  static tag (tagName, tplOrClazz, clazz) {
    if (clazz === undefined) {
      clazz = tplOrClazz
    } else {
      Object.defineProperty(clazz.prototype, 'template', {
        value: tplOrClazz
      })
    }
    this.classToTagDict.set(clazz, tagName)
    customElements.define(tagName, clazz)
  }

  /**
   * Returns the tag name of any given class that was created via Slim.tag
   * @param {function} clazz
   * @returns {string}
   */
  static tagOf (clazz) {
    return this.classToTagDict.get(clazz)
  }

  /**
   *
   * @param {string} phase The desired phase which the plugin is to be executed on a component's lifecycle
   * @param {function(HTMLElement)} plugin The plugin function that is executed on every Slim element during the desired phase
   * @returns {function(): boolean} Function that removes the plugin from the phase
   */
  static plugin (phase, plugin) {
    /* @type Set */
    const set = this.plugins[phase]
    if (set) {
      set.add(plugin)
    } else {
      throw new Error(`Cannot attach plugin: ${phase} is not a supported phase`)
    }

    return () => set.delete(plugin)
  }

  static checkCreationBlocking (element) {
    if (element.attributes) {
      for (let i = 0, n = element.attributes.length; i < n; i++) {
        const attribute = element.attributes[i]
        for (let [test, directive] of Slim[_$].customDirectives) {
          const value = directive.isBlocking && test(attribute)
          if (value) {
            return true
          }
        }
      }
    }
    return false
  }

  /**
   * Adds a new directive to be executed on components creation.
   * @see {@link https://github.com/slimjs/slim.js/wiki/Extending-slim-with-custom-directives}
   * @param { function(attribute: Node): * }  testFn Function that checks
   * @param { function(source: HTMLElement, target: HTMLElement, attribute: Node, match: *) } fn The executed function that is invoked when an attribute is found
   * @param { boolean? } isBlocking If set to true, conditional rendering will stop the creation phase of the specific target element
   */
  static customDirective (testFn, fn, isBlocking) {
    if (this[_$].customDirectives.has(testFn)) {
      throw new Error(
        `Cannot register custom directive: ${testFn} already registered`
      )
    }
    fn.isBlocking = isBlocking
    this[_$].customDirectives.set(testFn, fn)
  }

  /**
   * @private
   * Executes the plugins
   * @param phase
   * @param target
   */
  static executePlugins (phase, target) {
    this.plugins[phase].forEach(fn => {
      fn(target)
    })
  }

  /**
   * Returns target::querySelectAll as Array
   * @param {HTMLElement} target
   * @param {string} selector
   * @returns {HTMLElement[]}
   */
  static qSelectAll (target, selector) {
    return [...target.querySelectorAll(selector)]
  }

  /**
   * Clears binding between source and target
   * @param {HTMLElement|object} source
   * @param {HTMLElement|object} target
   */
  static unbind (source, target) {
    const bindings = source[_$].bindings
    Object.keys(bindings).forEach(key => {
      const chain = bindings[key].chain
      if (chain.has(target)) {
        chain.delete(target)
      }
    })
  }

  /**
   * @private
   * Returns the Shadow root of an element (if exists) or the element itself
   * @param { HTMLElement} target
   * @returns {HTMLElement}
   */
  static root (target) {
    return target.__isSlim && target.useShadow
      ? target[_$].rootElement || target
      : target
  }

  /**
   * Safely removes an element from the DOM
   * @param target
   */
  static removeChild (target) {
    if (typeof target.remove === 'function') {
      target.remove()
    }
    if (target.parentNode) {
      target.parentNode.removeChild(target)
    }
    if (this._$(target).internetExploderClone) {
      this.removeChild(this._$(target).internetExploderClone)
    }
  }

  /**
   * @private
   * @param element
   * @param expression
   * @returns {*}
   */
  static wrapGetterSetter (element, expression) {
    const pName = expression.split('.')[0]
    let oSetter = element.__lookupSetter__(pName)
    if (oSetter && oSetter[_$]) return pName
    const srcValue = element[pName]
    const { bindings } = this._$(element)
    bindings[pName] = {
      chain: new Set(),
      value: srcValue
    }
    bindings[pName].value = srcValue
    const newSetter = v => {
      oSetter && oSetter.call(element, v)
      bindings[pName].value = v
      element._executeBindings(pName)
    }
    newSetter[_$] = true
    element.__defineGetter__(pName, () => element[_$].bindings[pName].value)
    element.__defineSetter__(pName, newSetter)
    return pName
  }

  /**
   * Wraps {@link bind} when source and target are the same
   * @param target
   * @param expression
   * @param executor
   * @returns {*}
   */
  static bindOwn (target, expression, executor) {
    return Slim.bind(target, target, expression, executor)
  }

  /**
   * Creates a one-way binding between a source and a target
   * @param {HTMLElement|Object} source
   * @param {HTMLElement|Object} target
   * @param {string} expression
   * @param {function(HTMLElement|Object, HTMLElement|Object, string)} executor function when the binding is triggered
   * @returns {function} Function that removes the binding
   */
  static bind (source, target, expression, executor) {
    Slim._$(source)
    Slim._$(target)
    if (target[_$].excluded) return
    executor.source = source
    executor.target = target
    const pName = this.wrapGetterSetter(source, expression)
    if (!target[_$].repeater[pName]) {
      source[_$].bindings[pName].chain.add(target)
    }
    target[_$].inbounds[pName] = target[_$].inbounds[pName] || new Set()
    target[_$].inbounds[pName].add(executor)
    return function unbind () {
      const bindings = source[_$].bindings
      if (bindings[pName] && bindings[pName].chain) {
        bindings[pName].chain.delete(executor)
      }
    }
  }

  /**
   * Forces updates of all bindings on the DOM tree
   * @param target
   * @param props
   * @returns {*}
   */
  static update (target, ...props) {
    if (props.length === 0) {
      return Slim.commit(target)
    }
    for (const prop of props) {
      Slim.commit(target, prop)
    }
  }

  /**
   * Forces DOM tree update by a single bound property. If not provided it executes all bindings
   * @param {HTMLElement|Object} target
   * @param {string} propertyName?
   */
  static commit (target, propertyName) {
    let $ = Slim._$(target)
    const props = propertyName ? [propertyName] : Object.keys($.bindings)
    for (const prop of props) {
      const inbounds = $.inbounds[prop]
      if (inbounds) {
        for (const fn of inbounds) {
          fn()
        }
      }
      const bindings = $.bindings[prop]
      if (bindings) {
        const nodes = bindings.chain
        for (const node of nodes) {
          Slim.commit(node, prop)
        }
      }
    }
  }

  /*
    Class instance
    */

  constructor () {
    super()
    Slim._$(this)
    this.__isSlim = true
    const init = () => {
      if (!Slim.checkCreationBlocking(this)) {
        this.createdCallback()
      }

    }
    if (__flags.isSafari) {
      Slim.asap(init)
    } else init()
  }

  /**
   * @protected
   */
  createdCallback () {
    if (this[_$] && this[_$].createdCallbackInvoked) return
    this._initialize()
    this[_$].createdCallbackInvoked = true
    this.onBeforeCreated()
    Slim.executePlugins('create', this)
    this.render()
    this.onCreated()
  }

  /**
   * @protected
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements}
   */
  connectedCallback () {
    super.connectedCallback && super.connectedCallback()
    if (!Slim.checkCreationBlocking(this)) this.createdCallback()
    this.onAdded()
    Slim.executePlugins('added', this)
  }

  /**
   * @protected
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements}
   */
  disconnectedCallback () {
    this.onRemoved()
    Slim.executePlugins('removed', this)
  }

  /**
   * @protected
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements}
   * @param {string} attr
   * @param {string} oldValue
   * @param {string} newValue
   */
  attributeChangedCallback (attr, oldValue, newValue) {
    if (newValue !== oldValue && this.autoBoundAttributes.includes[attr]) {
      const prop = Slim.dashToCamel(attr)
      this[prop] = newValue
    }
  }

  // Slim internal API

  /**
   * @param {string} prop
   * @private
   */
  _executeBindings (prop) {
    Slim.debug('_executeBindings', this.localName, this)
    Slim.commit(this, prop)
  }

  /**
   *
   * @param {Element[]} children
   * @private
   */
  _bindChildren (children) {
    Slim.debug('_bindChildren', this.localName)
    if (!children) {
      children = Slim.qSelectAll(this, '*')
    }
    for (let child of children) {
      Slim._$(child)
      if (child[_$].boundParent === this) continue
      child[_$].boundParent = child[_$].boundParent || this

      // todo: child.localName === 'style' && this.useShadow -> processStyleNodeInShadowMode

      if (child.attributes.length) {
        const attributes = Array.from(child.attributes)
        let i = 0
        let n = child.attributes.length
        while (i < n) {
          const source = this
          const attribute = attributes[i]
          if (!child[_$].excluded) {
            for (let [check, directive] of Slim[_$].customDirectives) {
              const match = check(attribute)
              if (match) {
                directive(source, child, attribute, match)
              }
            }
          }
          i++
        }
      }

      if (!child[_$].excluded) {
        scanNode(this, child)
      }
    }
  }

  /**
   * @private
   */
  _resetBindings () {
    Slim.debug('_resetBindings', this.localName)
    this[_$].bindings = {}
  }

  /**
   *
   * @param {string} customTemplate?
   * @private
   */
  _render (customTemplate) {
    Slim.debug('_render', this.localName)
    Slim.executePlugins('beforeRender', this)
    this._resetBindings()
    ;[...this.children].forEach(childNode => {
      if (childNode.localName === 'style') {
        this[_$].externalStyle = document.importNode(childNode).cloneNode()
      }
    })
    Slim.root(this).innerHTML = ''
    const templateString = customTemplate || this.template
    const template = document.createElement('template')
    template.innerHTML = templateString
    const frag = template.content.cloneNode(true)
    const { externalStyle } = this[_$]
    if (externalStyle) {
      frag.appendChild(this[_$])
    }
    const scopedChildren = Slim.qSelectAll(frag, '*')
    const doRender = () => {
      (this[_$].rootElement || this).appendChild(frag)
      this._bindChildren(scopedChildren)
      this._executeBindings()
      this.onRender()
      Slim.executePlugins('afterRender', this)
    }
    if (this.useShadow) {
      doRender()
    } else {
      Slim.asap(doRender)
    }
  }

  /**
   *
   * @private
   */
  _initialize () {
    Slim.debug('_initialize', this.localName)
    if (this.useShadow) {
      if (typeof HTMLElement.prototype.attachShadow === 'undefined') {
        this[_$].rootElement = this.createShadowRoot()
      } else {
        this[_$].rootElement = this.attachShadow({ mode: 'open' })
      }
    } else {
      this[_$].rootElement = this
    }
    const observedAttributes = this.constructor.observedAttributes
    if (observedAttributes) {
      observedAttributes.forEach(attr => {
        const pName = Slim.dashToCamel(attr)
        this[pName] = this.getAttribute(attr)
      })
    }
  }

  // Slim public / protected API

  /**
   * @protected
   * @returns {string[]}
   */
  get autoBoundAttributes () {
    return []
  }

  /**
   * Forces DOM Update for a set of properties (if none, executes all bindings)
   * @param args
   */
  commit (...args) {
    Slim.commit(this, ...args)
  }

  /**
   * @see {commit}
   * @param args
   */
  update (...args) {
    Slim.update(this, ...args)
  }

  /**
   * @protected
   * @param {string} tpl?
   */
  render (tpl) {
    this._render(tpl)
  }

  /**
   * Executed during the render lifecycle
   * @protected
   */
  onRender () {}

  /**
   * Executed in the beginning of the creation lifecycle
   * @protected
   */
  onBeforeCreated () {}

  /**
   * Executed in the end of the creation lifecycle
   * @protected
   */
  onCreated () {}

  /**
   * Executed after {@see connectedCallback} is invoked
   */
  onAdded () {}

  /**
   * Executed after {@see disconnectedCallback} is invoked
   */
  onRemoved () {}

  /**
   * Wrapper for querySelector, auto detects use of shadow DOM
   * @param selector
   * @returns {Element}
   */
  find (selector) {
    return this[_$].rootElement.querySelector(selector)
  }

  /**
   * Wrapper for querySelectorAll, auto detects use of shadow DOM
   * @param selector
   * @returns {HTMLElement[]}
   */
  findAll (selector) {
    return Slim.qSelectAll(this[_$].rootElement, selector)
  }

  /**
   * Executes a bound callback derived from the template.
   * Best used for inter-component callbacks without binding process
   * @param {string} attr
   * @param {*} data
   * @returns {*}
   */
  callAttribute (attr, data) {
    const fnName = this.getAttribute(attr)
    if (fnName) {
      return this[_$].boundParent[fnName](data)
    }
  }

  /**
   * Whether the component uses shadow DOM. Defaults to false
   * @returns {boolean}
   * @protected
   */
  get useShadow () {
    return false
  }

  /**
   * Returns the HTML template string that should be generated during the render phase
   * @returns {string}
   * @protected
   */
  get template () {
    return ''
  }
}

Slim.classToTagDict = new Map()

// noinspection JSAnnotator
Slim.plugins = {
  create: new Set(),
  added: new Set(),
  beforeRender: new Set(),
  afterRender: new Set(),
  removed: new Set()
}

/* Helpers */

Slim.debug = () => {}
Slim.asap =
  window && window.requestAnimationFrame
    ? cb => window.requestAnimationFrame(cb)
    : typeof setImmediate !== 'undefined'
      ? setImmediate
      : cb => setTimeout(cb, 0)

Slim[_$] = {
  customDirectives: new Map(),
  uniqueCounter: 0,
  supportedNativeEvents: Object.keys(HTMLElement.prototype).filter(key => key.startsWith('on'))
}
Slim.isReadOnly = isReadOnly

// supported events (i.e. click, mouseover, change...)
Slim.customDirective(
  attr => Slim[_$].supportedNativeEvents.indexOf(attr.nodeName.slice(2)),
  (source, target, attribute) => {
    const eventName = attribute.nodeName
    const delegate = attribute.value
    Slim._$(target).eventHandlers = target[_$].eventHandlers || {}
    const allHandlers = target[_$].eventHandlers
    allHandlers[eventName] = allHandlers[eventName] || new WeakSet()
    let handler = e => {
      try {
        source[delegate].call(source, e) // eslint-disable-line
      } catch (err) {
        err.message = `Could not respond to event "${eventName}" on ${target.localName} -> "${delegate}" on ${source.localName} ... ${err.message}`
        console.warn(err)
      }
    }
    allHandlers[eventName].add(handler)
    target.addEventListener(eventName, handler)
    handler = null
  }
)

const scanNode = (source, target) => {
  const textNodes = Array.from(target.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
  const masterNode = target
  const repeater = Slim._$(target).repeater
  textNodes.forEach(target => {
    let updatedText = ''
    const matches = target.nodeValue.match(/\{\{([^\}\}]+)+\}\}/g) // eslint-disable-line
    const aggProps = {}
    const textBinds = {}
    if (matches) {
      Slim._$(target).sourceText = target.nodeValue
      target[_$].repeater = repeater
      matches.forEach(expression => {
        let oldValue
        const rxM = /\{\{(.+)(\((.+)\)){1}\}\}/.exec(expression)
        if (rxM) {
          const fnName = rxM[1]
          const pNames = rxM[3]
            .split(' ')
            .join('')
            .split(',')
          pNames
            .map(path => path.split('.')[0])
            .forEach(p => (aggProps[p] = true))
          textBinds[expression] = target => {
            const args = pNames.map(path => Slim.lookup(source, path, target))
            const fn = source[fnName]
            const value = fn ? fn.apply(source, args) : undefined
            if (oldValue === value) return
            updatedText = updatedText.split(expression).join(value || '')
          }
          return
        }
        const rxP = /\{\{(.+[^(\((.+)\))])\}\}/.exec(expression) // eslint-disable-line
        if (rxP) {
          const path = rxP[1]
          aggProps[path] = true
          textBinds[expression] = target => {
            const value = Slim.lookup(source, path, masterNode)
            if (oldValue === value) return
            updatedText = updatedText.split(expression).join(value || '')
          }
        }
      })
      const chainExecutor = () => {
        updatedText = target[_$].sourceText
        Object.keys(textBinds).forEach(expression => {
          textBinds[expression](target)
        })
        target.nodeValue = updatedText
      }
      Object.keys(aggProps).forEach(prop => {
        Slim.bind(source, masterNode, prop, chainExecutor)
      })
    }
  })
}

Slim.customDirective(
  attr => attr.nodeName === 's:id',
  (source, target, attribute) => {
    Slim._$(target).boundParent[attribute.value] = target
  }
)

// bind:property
Slim.customDirective(
  attr => /^(bind):(\S+)/.exec(attr.nodeName),
  (source, target, attribute, match) => {
    const tAttr = match[2]
    const tProp = Slim.dashToCamel(tAttr)
    const expression = attribute.value
    let oldValue
    const rxM = Slim.rxMethod.exec(expression)
    if (rxM) {
      const pNames = rxM[3]
        .split(' ')
        .join('')
        .split(',')
      pNames.forEach(pName => {
        Slim.bind(source, target, pName, () => {
          const fn = Slim.lookup(source, rxM[1], target)
          const args = pNames.map(prop => Slim.lookup(source, prop, target))
          const value = fn.apply(source, args)
          if (oldValue === value) return
          if (!isReadOnly(target, tProp)) {
            target[tProp] = value
          }
          target.setAttribute(tAttr, value)
        })
      })
      return
    }
    const rxP = Slim.rxProp.exec(expression)
    if (rxP) {
      const prop = rxP[1]
      Slim.bind(source, target, prop, () => {
        const value = Slim.lookup(source, expression, target)
        if (oldValue === value) return
        target.setAttribute(tAttr, value)
        if (!isReadOnly(target, tProp)) {
          target[tProp] = value
        }
      })
    }
  }
)

if (!alreadyExists && window) {
  window['Slim'] = Slim
}

