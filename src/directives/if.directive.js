import { DirectiveRegistry } from '../index.js';
const ifDirective = {
  attribute: (attribute) => attribute.nodeName === ':if',
  process: ({ targetNode, expression, props }) => {
    const template = /** @type {HTMLElement} */ (targetNode.cloneNode(true));
    template.removeAttribute(':if');
    const hook = document.createComment(`--- :if ${expression}`);
    targetNode.parentNode?.insertBefore(hook, targetNode);
    requestAnimationFrame(() => targetNode.remove());
    /** @type {HTMLElement|undefined} */
    let copy;
    const update = (/** @type {any} */ update) => {
      if (!!update) {
        if (copy) {
          copy.remove();
        }
        copy = /** @type {HTMLElement} */ (template.cloneNode(true));
        hook.parentNode?.insertBefore(/** @type {HTMLElement} */ (copy), hook);
      } else if (!update && copy) {
        copy.remove();
        copy = undefined;
      }
    };
    return {
      update,
    };
  },
};
DirectiveRegistry.add(ifDirective);
