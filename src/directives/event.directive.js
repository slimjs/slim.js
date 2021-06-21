import { DirectiveRegistry, Utils } from '../index.js';

const { dashToCamel: d2c, syntaxMethod, memoize, createFunction, NOOP } = Utils;

const dashToCamel = memoize(d2c);
const syntaxRegexp = syntaxMethod();

/**
 * @type {import('./directive.js').Directive}
 */
const eventDirective = {
  attribute: (attr, nodeName) => nodeName.startsWith('@'),
  process: ({ attributeName, targetNode, scopeNode, expression, context }) => {
    const eventName = dashToCamel(attributeName.slice(1));
    const isMethodExecute = syntaxRegexp.test(expression || '');
    const eventHandler = function (/** @type {Event} */ event) {
      let execution = createFunction('event', 'item', `return ${expression};`);
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
          typeof context === 'function' ? context() : context
        );
      }
    };
    targetNode.addEventListener(eventName, eventHandler);
    return {
      update: NOOP
    };
  },
  noExecution: true,
};

DirectiveRegistry.add(eventDirective);
