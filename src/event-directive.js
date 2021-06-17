import { Registry } from './directive.js';
import { dashToCamel as d2c, syntaxMethod, memoize } from './utils.js';

const dashToCamel = memoize(d2c)();

/**
 * @type {import('./directive.js').Directive}
 */
const eventDirective = {
  attribute: (attr) => attr.nodeName.startsWith('@'),
  process: ({ attributeName, targetNode, scopeNode, expression, context }) => {
    const eventName = dashToCamel(attributeName.slice(1));
    const isMethodExecute = syntaxMethod().exec(expression || '');
    const eventHandler = function (/** @type {Event} */ event) {
      let execution = new Function('event', 'item', `return ${expression};`);
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
      update: () => { }
    };
  },
  noExecution: true,
};

Registry.register(eventDirective);
