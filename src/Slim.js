
(function(window, document, HTMLElement) {

  const __flags = {
    isWCSupported: 'customElements' in window &&
    'import' in document.createElement('link') &&
    'content' in document.createElement('template'),
    isIE11: !!window['MSInputMethodContext'] && !!document['documentMode']
  }

  const selectorToArr = (__flags.isWCSupported && NodeList.prototype.hasOwnProperty('forEach'))
    ? function (target, selector) {
      return target.querySelectorAll(selector)
    }
    : function (target, selector) {
      return Array.prototype.slice.call( target.querySelectorAll(selector) )
    }

  const _$ = Symbol('Slim')

  class Internals {
    constructor() {
      this.hasCustomTemplate = undefined
      this.uniqueIndex = null
      this.boundChildren = []
      this.boundParent = null
      this.boundRepeater = null
      this.bindings = {}
      this.textBindings = {}
      this.internetExploderClone = null
      this.rootElement = null
      this.createdCallbackInvoked = false
      this.sourceOuterHTML = null
      this.sourceText = null
    }
  }

  class Binding {
    constructor (source, target, expression, executor) {
      this.source = source
      this.target = target
      this.expression = expression
      this.executor = executor

      this._destroy = this.destroy.bind(this)
      this._execute = this.execute.bind(this)

      this.init()
    }

    execute() {
      Slim.asap( () => {
        this.executor(this.target)
      })
    }

    init () {
      this.pName = this.expression.split('.')[0]
      this.source.addEventListener(`__${this.pName}-changed`, this._execute)
      this.source.addEventListener(`__clear-bindings`, this._destroy)
    }

    destroy () {
      this.source.removeEventListener(`__${this.pName}-changed`, this._execute)
      this.source.removeEventListener(`__clear-bindings`, this._destroy)
      delete this.source
      delete this.target
      delete this.expression
      delete this.executor
      delete this._destroy
      delete this._execute
    }
  }

  class SlimError extends Error {
    constructor (message) {
      super(message)
      this.flags = __flags
    }
  }

  class Slim extends HTMLElement {
    static dashToCamel (dash) {
      return dash.indexOf('-') < 0 ? dash : dash.replace(/-[a-z]/g, m => {return m[1].toUpperCase()})
    }
    static camelToDash (camel) {
      return camel.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
    static search (/* object */ obj, /* string */ path) {
      const arr = path.split('.')
      let prop = path[0]
      while (obj && arr.length) {
        obj = obj[prop = arr.shift()]
      }
      return {
        path: path,
        prop: prop,
        obj: obj,
        value: value
      }
    }
    static get rxInject () { return /\{(.+[^(\((.+)\))])\}/ }
    static get rxProp() { return /(.+[^(\((.+)\))])/ }
    static get rxMethod () { return /(.+)(\((.+)\)){1}/ }
    static lookup (target, expression) {
      const chain = expression.split('.')
      let o = target
      let i = 0
      while (i < chain.length) {
        o = o[chain[i++]]
      }
      return o
    }
    static extract (target, expression) {
      const rxP = this.rxProp.exec(expression)
      if (rxP) {
        return target[rxP[1]]
      }
      const rxM = this.rxMethod.exec(expression)
      if (rxM) {
        return target[ [rxM[1]] ].apply(target, rxM[3].replace(' ','').split(','))
      }
    }
    // noinspection JSUnresolvedVariable
    static _$ (target) {
      target[_$] = target[_$] || new Internals()
      return target[_$]
    }
    static polyFill (url) {
      if (!__flags.isWCSupported) {
        const existingScript = document.querySelector('script[data-is-slim-polyfill="true"]')
        if (!existingScript) {
          const script = document.createElement('script')
          script.setAttribute('data-is-slim-polyfill', 'true')
          script.src = url
          document.head.appendChild(script)
        }
      }
    }
    static tag(tagName, tplOrClazz, clazz) {
      if (this.tagToClassDict.has(tagName)) {
        throw new SlimError(`Unable to define tag: ${tagName} already defined`)
      }
      if (clazz === undefined) {
        clazz = tplOrClazz
      } else {
        Slim.tagToTemplateDict.set(tagName, tplOrClazz)
      }
      this.tagToClassDict.set(tagName, clazz)
      this.classToTagDict.set(clazz, tagName)
      customElements.define(tagName, clazz)
    }

    static tagOf (clazz) {
      return this.classToTagDict.get(clazz)
    }

    static classOf (tag) {
      return this.tagToClassDict.get(tag)
    }

    static createUniqueIndex () {
      this[_$].uniqueCounter++
      return this[_$].uniqueCounter.toString(16)
    }

    static plugin (phase, plugin) {
      if (!this.plugins[phase]) {
        throw new SlimError(`Cannot attach plugin: ${phase} is not a supported phase`)
      }
      this.plugins[phase].push(plugin)
    }

    static customDirective (directiveStr, fn) {
      if (this[_$].customDirectives.has(directiveStr)) {
        throw new SlimError(`Cannot register custom directive: ${directiveStr} already registered`)
      }
      this[_$].customDirectives.set(directiveStr, fn)
    }

    static executePlugins (phase, target) {
      this.plugins[phase].forEach( fn => {
        fn(target)
      })
    }

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
      if (this._$(target).boundChildren) {
        target[_$].boundChildren.forEach( child => {
          try {
            this.remove( child[_$].internetExploderClone )
          }
          catch (e) {}
        })
      }
    }

    static moveChildrenBefore (source, target) {
      while (source.firstChild) {
        target.parentNode.insertBefore(source.firstChild, target)
      }
    }

    static moveChildren (source, target) {
      while (source.firstChild) {
        target.appendChild(source.firstChild)
      }
    }

    static wrapGetterSetter (element, expression) {
      const pName = expression.split('.')[0]
      let oSetter = element.__lookupSetter__(pName)
      if (oSetter && oSetter[_$]) return pName
      if (typeof oSetter === 'undefined') {
        oSetter = () => {}
      }

      const srcValue = element[pName]
      this._$(element).bindings[pName] = element[_$].bindings[pName] || {
        chain: [],
        value: srcValue
      }
      element[_$].bindings[pName].value = srcValue
      const newSetter = function (v) {
        if (this[pName] === v) return
        oSetter(v)
        this[_$].bindings[pName].value = v
        this.dispatchEvent(new Event(`__${pName}-changed`))
      }
      newSetter[_$] = true
      element.__defineGetter__(pName, () => element[_$].bindings[pName].value)
      element.__defineSetter__(pName, newSetter)
      return pName
    }

    static bind (source, target, expression, executor) {
      const binding = new Binding(source, target, expression, executor)
      const pName = this.wrapGetterSetter(source, expression)
      source[_$].bindings[pName].chain.push(binding)
    }




    /*
      Class instance
     */



    constructor () {
      super()
      this.createdCallback()
    }

    // Native DOM Api

    createdCallback () {
      Slim._$(this)
      if (this[_$].createdCallbackInvoked) return
      if (!this._isInContext) return
      this._initialize()
      this.onBeforeCreated()
      this._render()
      this[_$].createdCallbackInvoked = true
      Slim.asap(() => {
        this.onCreated()
      })
    }

    connectedCallback () {

    }

    disconnectedCallback () {

    }

    // Slim internal API

    get _isInContext () {
      let node = this
      while (node) {
        node = node.parentNode
        if (!node) {
          return false
        }
        if (node instanceof Document) {
          return true
        }
      }
      return false
    }

    _executeBindings () {
      for (let pName in this[_$].bindings) {
        const o = this[_$].bindings[pName]
        o.chain.forEach(binding => binding.execute())
      }
    }

    _captureBindings () {
      const template = this[_$].hasCustomTemplate || this.template
      if (!template) {
        return
      }
      let frag
      if (template && typeof template === 'string') {
        frag = document.createRange().createContextualFragment(template)
      }
      Slim.asap( () => {
        Slim.moveChildren(frag, this.shadowRoot || this)
      })
      const allChildren = Slim.qSelectAll(frag, '*')
      for (let child of allChildren) {
        Slim._$(child)
        child[_$].sourceOuterHTML = child.outerHTML
        child[_$].boundParent = this
        this[_$].boundChildren.push(child)

        // todo: child.localName === 'style' && this.useShadow -> processStyleNodeInShadowMode
        // todo: handle slim-id

        if (child.attributes) {
          for (let i = 0, n = child.attributes.length; i < n; i++) {
            const source = this
            const attribute = child.attributes[i]
            const attributeName = attribute.localName
            Slim[_$].customDirectives.forEach((fn, matcher) => {
              const match = new RegExp(matcher).exec(attributeName)
              if (match) {
                fn(source, child, attribute, match)
                source.removeAttribute(attributeName)
              }
            })
          }
        }
      }
    }

    _resetBindings () {
      this[_$].bindings = {}
      this.dispatchEvent(new CustomEvent('__reset-bindings'))
    }

    _render (customTemplate) {
      Slim.executePlugins('beforeRender', this)
      this.onBeforeRender()
      this[_$].hasCustomTemplate = customTemplate
      this._resetBindings()
      this._captureBindings()
      this._executeBindings()
      this.onRender()
      Slim.executePlugins('afterRender', this)
    }

    _initialize () {
      this[_$].uniqueIndex = Slim.createUniqueIndex()
      this.setAttribute('slim-uq', this[_$].uniqueIndex)
      const observedAttributes = this.constructor.observedAttributes
      if (observedAttributes) {
        observedAttributes.forEach( attr => {
          const pName = Slim.dashToCamel(attr)
          this[pName] = this.getAttribute(attr)
        })
      }
    }

    // Slim public / protected API

    render (tpl) {
      this._render(tpl)
    }

    onBeforeRender () {}
    onRender() {}
    onBeforeCreated () {}
    onCreated() {}
    onAdded() {}
    onRemoved() {}

    find (selector) {
      return (this[_$].rootElement || this).querySelector(selector)
    }

    findAll (selector) {
      return Slim.qSelectAll(this[_$].rootElement, selector)
    }

    get useShadow () {
      return false
    }

    get template () {
      return Slim.tagToTemplateDict.get( Slim.tagOf(this.constructor) )
    }
  }
  Slim.uniqueIndex = 0
  Slim.qSelectAll = selectorToArr
  Slim.tagToClassDict = new Map()
  Slim.classToTagDict = new Map()
  Slim.tagToTemplateDict = new Map()
  Slim.plugins = {
    'create': [],
    'added': [],
    'beforeRender': [],
    'afterRender': [],
    'removed': []
  }

  Slim.asap = (window && window.requestAnimationFrame)
    ? cb => window.requestAnimationFrame(cb)
    : typeof setImmediate !== 'undefined'
      ? setImmediate
      : cb => setTimeout(cb, 0)

  Slim[_$] = {
    customDirectives: new Map(),
    uniqueCounter: 0,
    supportedNativeEvents: [
      'click',
      'mouseover',
      'mouseout',
      'mousemove',
      'mouseenter',
      'mousedown',
      'mouseup',
      'dblclick',
      'contextmenu',
      'wheel',
      'mouseleave',
      'select',
      'pointerlockchange',
      'pointerlockerror',
      'focus',
      'blur',
      'input',
      'error',
      'invalid',
      'animationstart',
      'animationend',
      'animationiteration',
      'reset',
      'submit',
      'resize',
      'scroll',
      'keydown',
      'keypress',
      'keyup',
      'change'
    ]
  }

  // default binding directive

  Slim.customDirective(/^(repeat)+(\S+)/, (source, target, attribute, match) => {
    console.log('repeater')
  })

  Slim.customDirective(`^${Slim[_$].supportedNativeEvents.join('|')}+$`, (source, target, attribute) => {
    console.log(source, target, attribute)
  })

  Slim.customDirective(/^bind$/, (source, target) => {
    Slim._$(target)
    target[_$].sourceText = target.innerText
    const matches = target.innerText.match(/\{\{(\S+)+\}\}/g)
    if (matches) {
      const paths = matches.map( match => /\{\{(\S+)\}\}/.exec(match)[1] )
      const fnChain = paths.map( path => target => {
        const value = Slim.lookup(source, path)
        target.innerText = target.innerText.replace(`{{${path}}}`, value)
      })
      const chainExecutor = target => {
        target.innerText = target[_$].sourceText
        fnChain.forEach( cb => {
          cb(target)
        })
      }
      paths.forEach(path => {
        Slim.bind(source, target, path, chainExecutor)
      })
    }
  })

  Slim.customDirective(/^(bind):(\S+)/, (source, target, attribute, match) => {
    const tProp = Slim.dashToCamel(match[2])
    const expression = attribute.nodeValue
    const rxM = Slim.rxMethod.exec(expression)
    if (rxM) {
      const fnName = rxM[1]
      const pNames = rxM[3].replace(' ','').split(',')
      pNames.forEach( pName => {
        Slim.bind(source, target, pName, target => {
          const args = pNames.map(pName => source[pName])
          target[tProp] = source[fnName].apply(source, args)
        })
      })
      return
    }
    const rxP = Slim.rxProp.exec(expression)
    if (rxP) {
      Slim.bind(source, target, rxP[1], target => {
        target[tProp] = Slim.lookup(source, expression)
      })
      return
    }
  })

  if (window) {
    window['Slim'] = Slim
  }
  if (typeof module !== 'undefined') {
    module.exports.Slim = Slim
  }

})(window, document, HTMLElement)
