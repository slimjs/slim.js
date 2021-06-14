import { Registry } from './directive.js';
import { bind, processDOM } from './template.js';

const repeatContext = Symbol('repeat-ctx');
const internals = Symbol('internals');


function lazyClear(/** @type {any[]} */ queue = []) {
  const iterator = queue[Symbol.iterator]();
  function clearOne(deadline) {
    let next;
    while (deadline.timeRemaining() && (next = iterator.next())) {
      if (!next.done) next.value[internals].unbind();
    }
    if (queue.length) {
      // @ts-ignore
      requestIdleCallback(clearOne, { timeout: 20 });
    }
  }
  // @ts-ignore
  requestIdleCallback(clearOne, { timeout: 20 });
}

/**
 *
 * @param {number} n
 * @param {string} text
 * @returns
 */
const replicate = (n, text) => {
  let temp = text;
  let result = '';
  if (n < 1) return result;
  while (n > 1) {
    if (n & 1) result += temp;
    n >>= 1;
    temp += temp;
  }
  return result + temp;
};


const nodePool = (template) => ({
  pointer: 0,
  /** @type {Element[]} */
  pool: [],
  /**
   * 
   * @param {number} amount 
   */
  allocate (amount) {
    const diff = amount - this.pool.length;
    if (diff > 0) {
      const markup = replicate(diff, template);
      const tpl = document.createElement('template');
      tpl.innerHTML = markup;
      this.pool = this.pool.concat(...tpl.content.children);
    }
  },
  /**
   * @param {number} amount 
   */
  getNodes(amount) {
    if (this.pointer + amount > this.pool.length) {
      this.allocate(this.pointer + amount - this.pool.length);
    }
    const result = this.pool.slice(this.pointer, amount + this.pointer);
    return result;
  },

  /**
   * @param {number} amount 
   */
  recycle(amount) {
    this.pointer -= amount;
    this.pointer < 0 ? this.pointer = 0 : void 0;
  }
});




/**
 * @typedef RepeatMeta
 * @property {number} key
 * @property {Function} unbind
 * @property {Function[]} updates
 * @property {any} data
 */

/**
 * @type {import('./directive.js').Directive}
 */
const repeatDirective = {
  attribute: (attr) => attr.nodeName === ':repeat',
  process: ({ targetNode, scopeNode, expression, bindings, props }) => {
    const proxy = {};
    Object.setPrototypeOf(proxy, scopeNode);
    targetNode.removeAttribute(':repeat');
    const template = /** @type {HTMLElement} */ (targetNode).outerHTML;
    const hook = document.createComment(`--- :repeat ${expression}`);
    const parent =
      targetNode.parentElement || scopeNode.shadowRoot || scopeNode;
    const isTablePart =
      ['', 'tr', 'td', 'thead', 'tbody'].indexOf(targetNode.localName) > 0;
    parent.insertBefore(hook, targetNode);
    requestAnimationFrame(() => targetNode.remove());

    /** @type {DocumentFragment|undefined} */
    let fragment;

    /** @type {(HTMLElement & {[internals]: RepeatMeta})[]} */
    let clones = [];

    /** @type {Function[] | undefined } */
    let clearAll;

    const doUpdate = (/** @type {any[]} */ dataSource = []) => {
      if (!clearAll) {
        clearAll = props.map((prop) =>
          bind(scopeNode, bindings, prop, () => (proxy[prop] = scopeNode[prop]))
        );
      }
      if (dataSource.length < clones.length) {
        const disposables = clones.slice(dataSource.length);
        const range = new Range();
        range.setStartBefore(disposables[0]);
        range.setEndAfter(disposables[disposables.length - 1]);
        range.deleteContents();
        lazyClear(disposables.concat());
        clones.length = dataSource.length;
        if (dataSource.length === 0) {
          clearAll.forEach(fn => fn());
          clearAll = undefined;
          return;
        }
      }

      if (dataSource.length > clones.length) {
        const offset = clones.length;
        const diff = dataSource.length - clones.length;
        const html = isTablePart
          ? `<table><tbody>${replicate(diff, template)}</tbody></table>`
          : replicate(diff, template);
        /** @type {Element|undefined} */
        let content = new DOMParser().parseFromString(html, 'text/html').body;
        if (isTablePart) {
          content = content.children[0].children[0];
        }
        const range = new Range();
        range.selectNodeContents(content);
        fragment = range.extractContents();
        const walker = fragment.ownerDocument.createTreeWalker(
          fragment,
          NodeFilter.SHOW_ELEMENT
        );
        walker.nextNode();
        content = undefined;
        range.detach();

        clones.length = dataSource.length;
        for (let i = 0; i < diff; i++) {
          const idx = i + offset;
          const item = dataSource[idx];
          /** @type {HTMLElement} */
          const clone = /** @type {HTMLElement} */ (walker.currentNode);
          walker.nextSibling();
          Object.defineProperty(clone, repeatContext, {
            value: item,
            configurable: true,
          });
          const { bounds, clear } = processDOM(
            proxy,
            clone,
            () => clone[repeatContext],
            bindings
          );
          Object.defineProperty(clone, internals, {
            value: {
              key: idx,
              unbind: clear,
              updates: bounds,
              data: item,
            },
            configurable: true,
          });
          bounds.forEach((fn) => fn(item));
          // @ts-ignore
          clones[idx] = clone;
        }
      }

      /** @type {Function[]} */
      let noUpdates = [];

      /** @type {Function[]|Function[][]} */
      const updates = dataSource.map((item, i) => {
        const node = clones[i];
        const info = node[internals];
        if (info.data !== item || info.key !== i) {
          Object.defineProperty(node, repeatContext, {
            value: item,
            configurable: true,
          });
          info.data = item;
          info.key = i;
          return info.updates;
        }
        return noUpdates;
      });

      updates.flat().forEach((update) => update());

      requestAnimationFrame(() => {
        if (fragment) {
          parent.insertBefore(fragment, hook);
        }
      });
    };

    return {
      update: (data) => {
        // @ts-ignore
        console.log(performance.memory);
        doUpdate(data);
        // @ts-ignore
        console.log(performance.memory);
      },
    };
  },
  // noExecution: true
};

Registry.register(repeatDirective);
