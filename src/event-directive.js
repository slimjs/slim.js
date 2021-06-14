import { Registry } from './directive.js';
import { dashToCamel, syntaxMethod } from './utils.js';

/**
 * @type {import('./directive.js').Directive}
 */
const eventDirective = {
  attribute: (attr) => attr.nodeName.startsWith('@'),
  process: ({ attribute, targetNode, scopeNode, expression, context }) => {
    const eventName = dashToCamel()(attribute.nodeName.slice(1));
    const isMethodExecute = syntaxMethod().exec(expression || '');
    const eventHandler = (/** @type {Event} */ event) => {
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
    return {
      update: () => targetNode.addEventListener(eventName, eventHandler),
    };
  },
  noExecution: true,
};

Registry.register(eventDirective);
