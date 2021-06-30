import { DirectiveRegistry, Utils } from '../index.js';

const { dashToCamel: d2c, syntaxMethod, memoize, createFunction, NOOP } = Utils;

const dashToCamel = memoize(d2c);
const syntaxRegexp = syntaxMethod();

/** @type {import('../typedefs').Directive} */
const eventDirective = {
  attribute: (_, nodeName) => nodeName.startsWith('@'),
  process: ({
    attributeName,
    targetNode,
    scopeNode,
    expression: ex,
    context,
  }) => {
    const eventName = dashToCamel(attributeName.slice(1));
    const isMethodExecute = syntaxRegexp.test(ex || '');
    const eventHandler = function (/** @type {Event} */ event) {
      let execution = createFunction('event', 'item', `return ${ex};`);
      /** @type {Function|undefined} */
      let method;
      if (!isMethodExecute) {
        method = execution.call(scopeNode);
      }
      if (method) {
        return method(event, context);
      } else {
        return execution.call(
          scopeNode,
          event,
          typeof context === 'function' ? context() : context,
        );
      }
    };
    targetNode.addEventListener(eventName, eventHandler);
    return {
      update: undefined,
      removeAttribute: true,
    };
  },
  // noExecution: true,
};

DirectiveRegistry.add(eventDirective);
