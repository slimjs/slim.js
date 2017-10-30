
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
      this.isDestoyed = false
      this.boundParent = null
      this.repeater = {}
      this.bindings = {}
      this.eventHandlers = {}
      this.internetExploderClone = null
      this.rootElement = null
      this.createdCallbackInvoked = false
      this.sourceText = null
    }
  }

  class Binding {
    static executePending () {
      if (this.isExecuting) return
      this.isExecuting = true
      Binding.running = Binding.pending.concat()
      Binding.pending = []
      Binding.running.forEach(x => x())
      this.isExecuting = false
      if (Binding.pending.length) {
        Binding.executePending()
      }
    }

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
      if (this.target[_$].isDestoyed) {
        this.destroy()
        return
      }
      Binding.pending.push(this.executor.bind(this.source, this.target, Slim.extract(this.source, this.expression, this.target)))
      Binding.executePending()
      // Slim.asap( () => {
      // })
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

  Binding.pending = []
  Binding.running = []
  Binding.isExecuting = false

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
    static lookup (target, expression, maybeRepeated) {
      const chain = expression.split('.')
      let o
      if (maybeRepeated[_$].repeater[chain[0]]) {
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
    static extract (target, expression, maybeRepeated) {
      const rxP = this.rxProp.exec(expression)
      if (rxP) {
        return Slim.lookup(target, rxP[1], maybeRepeated)
      }
      const rxM = this.rxMethod.exec(expression)
      if (rxM) {
        const fn = Slim.lookup(target, rxM[1])
        const args = rxM[3].replace(' ','').split(',').map(arg => Slim.lookup(target, arg, maybeRepeated))
        fn.apply(target, args)
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

    static unbind (source, target) {
      const bindings = source[_$].bindings
      Object.keys(bindings).forEach(key => {
        const chain = bindings[key].chain.filter(binding => {
          if (binding.target === target) {
            binding.destroy()
            return false
          }
          return true
        })
        bindings[key].chain = chain
      })
    }

    static selectRecursive(target, excludeParent) {
      if (excludeParent) {
        return Slim.qSelectAll(target, '*')
      }
      return [target].concat(Slim.qSelectAll(target, '*'))
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

    static convertToComment (target) {
      target.outerHTML = '<!-- [slim:if]' + target.outerHTML + ' -->'
      return target
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

    static bindOwn(target, expression, executor) {
      Slim._$(target)
      const pName = this.wrapGetterSetter(target, expression)
      const binding = new Binding(target, target, expression, executor)
      target[_$].bindings[pName].chain.push(binding)
      return binding
    }

    static bind (source, target, expression, executor) {
      Slim._$(source)
      const pName = this.wrapGetterSetter(source, expression)
      const binding = new Binding(source, target, expression, executor)
      source[_$].bindings[pName].chain.push(binding)
      return binding
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
      Slim.executePlugins('create', this)
      this._render()
      this[_$].createdCallbackInvoked = true
      Slim.asap(() => {
        this.onCreated()
      })
    }

    connectedCallback () {
      this.onAdded()
      Slim.executePlugins('added', this)
    }

    disconnectedCallback () {
      this.onRemoved()
      Slim.executePlugins('removed', this)
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


    _executeBindings (prop) {
      let all = this[_$].bindings
      if (prop) {
        all = {[prop]: true}
      }
      for (let pName in all) {
        const o = this[_$].bindings[pName]
        o.chain.forEach(binding => {
          binding.execute()
        })
      }
    }

    _bindChildren(children, exclude) {
      if (!children) {
        children = Slim.qSelectAll(this, '*')
      }
      for (let child of children) {
        Slim._$(child)
        if (child[_$].boundParent === this) continue
        child[_$].boundParent = this

        // todo: child.localName === 'style' && this.useShadow -> processStyleNodeInShadowMode
        // todo: handle slim-id

        if (child.attributes) {
          for (let i = 0, n = child.attributes.length; i < n; i++) {
            const source = this
            const attribute = child.attributes[i]
            const attributeName = attribute.localName
            if (exclude && exclude.directive && exclude.directives.indexOf(attributeName) >= 0) continue
            if (exclude && exclude.values && exclude.values.indexOf(attribute.nodeValue) >= 0) continue
            Slim[_$].customDirectives.forEach((fn, matcher) => {
              const match = new RegExp(matcher).exec(attributeName)
              if (match) {
                fn(source, child, attribute, match)
              }
            })
          }
        }
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
        Slim.moveChildren(frag, this[_$].rootElement || this)
      })
      const allChildren = Slim.qSelectAll(frag, '*')
      this._bindChildren(allChildren)
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
      if (typeof customTemplate === 'string') {
        this.innerHTML = ''
      }
      this._captureBindings()
      this._executeBindings()
      this.onRender()
      Slim.executePlugins('afterRender', this)
    }

    _initialize () {
      this[_$].uniqueIndex = Slim.createUniqueIndex()
      if (this.useShadow) {
        this.createShadowRoot()
        this[_$].rootElement = this.shadowRoot
      } else {
        this[_$].rootElement = this
      }
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

    callAttribute (attr, data) {
      const fnName = this.getAttribute(attr)
      if (fnName) {
        this[_$].boundParent[fnName](data)
      }
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
      'click', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'wheel',
      'mouseleave', 'select', 'pointerlockchange', 'pointerlockerror', 'focus', 'blur', 'input', 'error', 'invalid', 'animationstart',
      'animationend', 'animationiteration', 'reset', 'submit', 'resize', 'scroll', 'keydown', 'keypress', 'keyup','change'
    ]
  }

  // supported events (i.e. click, mouseover, change...)
  Slim.customDirective(`^${Slim[_$].supportedNativeEvents.join('|')}+$`, (source, target, attribute, match) => {
    const eventName = match[0]
    const delegate = attribute.nodeValue
    Slim._$(target).eventHandlers = target[_$].eventHandlers || {}
    const allHandlers = target[_$].eventHandlers
    allHandlers[eventName] = allHandlers[eventName] || []
    let handler = (e) => {
      try {
        source[delegate].call(source, e)
      }
      catch (err) {
        err.message = `Could not respond to event "${eventName}" on ${target.localName} -> "${delegate}" on ${source.localName} ... ${err.message}`
        console.warn(err)
      }
    }
    allHandlers[eventName].push(handler)
    target.addEventListener(eventName, handler)
    handler = null
  })

  Slim.customDirective(/^slim:repeat$/, (source, target, attribute) => {
    const repeaterId = Slim.createUniqueIndex()
    const hook = document.createElement('slim-repeater-hook');
    let path = attribute.nodeValue
    let tProp = 'data'
    if (path.indexOf(' as' )) {
      tProp = path.split(' as ')[1] || tProp
      path = path.split(' as ')[0]
    }
    let template = target.cloneNode(true)
    template.removeAttribute('slim:repeat')
    template.setAttribute('slim-repeat-hook', repeaterId)
    const startAnchor = document.createComment(`repeat:${path} start`)
    const endAnchor = document.createComment(`repeat:${path} end`)
    let clones = []
    target.parentNode.insertBefore(startAnchor, target)
    target.parentNode.insertBefore(endAnchor, target)
    target.parentNode.insertBefore(hook, endAnchor)
    Slim.removeChild(target)
    const dataSourceChanged = (target, dataSource) => {
      // get rid of existing clones
      clones.forEach(clone => {
        Slim.selectRecursive(clone).forEach(e => {
          Slim.unbind(source, e)
          Slim.removeChild(e)
        })
      })
      // create new clones
      clones = dataSource.map( (dataItem, index) => {
        hook.insertAdjacentHTML('afterEnd', template.outerHTML)
        const clone = startAnchor.parentNode.querySelector(`*[slim-repeat-hook="${repeaterId}"]`)
        clone.removeAttribute('slim-repeat-hook')
        Slim._$(clone).repeater[tProp] = dataItem
        clone.setAttribute('slim-repeat-index', index.toString())
        clone[tProp] = dataItem
        Slim.selectRecursive(clone).forEach(e => {
          source._bindChildren([e], {
            values: [attribute.nodeValue],
            directives: [attribute.nodeName]
          })
        })
        startAnchor.parentNode.insertBefore(clone, endAnchor)
        return clone
      })
      source.dispatchEvent(new Event(`__${tProp}-changed`))
    }
    Slim.bind(source, target, path, dataSourceChanged)
  })

  Slim.customDirective(/^slim:if$/, (source, target, attribute) => {
    const path = attribute.nodeValue
    const anchor = document.createComment(`if:${path}`)
    target.parentNode.insertBefore(anchor, target)
    const fn = (target, value) => {
      if (value) {
        anchor.parentNode.insertBefore(target, anchor.nextSibling)
      } else {
        Slim.removeChild(target)
      }
    }
    Slim.bind(source, target, path, fn)
  })

  // bind (text nodes)
  Slim.customDirective(/^bind$/, (source, target) => {
    Slim._$(target)
    target[_$].sourceText = target.innerText
    const matches = target.innerText.match(/\{\{([^\}\}]+)+\}\}/g)
    const aggProps = {}
    const textBinds = {}
    if (matches) {
      matches.forEach(expression => {
        const rxM = /\{\{(.+)(\((.+)\)){1}\}\}/.exec(expression)
        if (rxM) {
          const fnName = rxM[1]
          const pNames = rxM[3].replace(' ','').split(',')
          pNames.map(path => path.split('.')[0]).forEach(p => aggProps[p] = true)
          textBinds[expression] = target => {
            try {
              const args = pNames.map(path => Slim.lookup(source, path, target))
              const value = source[fnName].apply(source, args)
              target.innerText = target.innerText.split(expression).join(value)
            }
            catch (err) {}
          }
          return
        }
        const rxP = /\{\{(.+[^(\((.+)\))])\}\}/.exec(expression)
        if (rxP) {
          const path = rxP[1]
          aggProps[path] = true
          textBinds[expression] = target => {
            try {
              const value = Slim.lookup(source, path, target)
              target.innerText = target.innerText.replace(new RegExp(expression, 'g'), value)
            }
            catch (err) {}
          }
        }
      })
      const chainExecutor = target => {
        target.innerText = target[_$].sourceText
        Object.keys(textBinds).forEach(expression => {
          textBinds[expression](target)
        })
      }
      Object.keys(aggProps).forEach(prop => {
        Slim.bind(source, target, prop, chainExecutor)
      })
    }
  })

  // bind:property
  Slim.customDirective(/^(bind):(\S+)/, (source, target, attribute, match) => {
    const tAttr = match[2]
    const tProp = Slim.dashToCamel(tAttr)
    const expression = attribute.nodeValue
    const rxM = Slim.rxMethod.exec(expression)
    if (rxM) {
      const pNames = rxM[3].replace(' ','').split(',')
      pNames.forEach( pName => {
        Slim.bind(source, target, pName, (target) => {
          const fn = Slim.extract(source, rxM[1], target)
          const args = pNames.map(prop => Slim.extract(source, prop, target))
          const value = fn.apply(source, args)
          target[tProp] = value
          target.setAttribute(tAttr, value)
        })
      })
      return
    }
    const rxP = Slim.rxProp.exec(expression)
    if (rxP) {
      const prop = rxP[1]
      Slim.bind(source, target, prop, (target, value) => {
        target.setAttribute(tAttr, value)
        target[tProp] = value
      })
    }
  })

  if (window) {
    window['Slim'] = Slim
  }
  if (typeof module !== 'undefined') {
    module.exports.Slim = Slim
  }

})(window, document, HTMLElement)
