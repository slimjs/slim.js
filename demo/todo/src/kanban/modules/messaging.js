export function eventBus() {
  const emitter = document.createElement('p');
  return ({
    emit: function (type, data) {
      emitter.dispatchEvent(new CustomEvent(type, { detail: data }));
    },
    on: function (type, callback) {
      const handler = (event) => callback(event.detail);
      emitter.addEventListener(type, handler);
      return () => emitter.removeEventListener(type, handler, {
        passive: true // faster execution on supported browsers
      });
    }
  });
}

/**
 * Note on performance
 * If you aim for memory performant implementation, use the DOM API.
 * For faster execution time, but less memory conservation, use array of listeners instead, like most polyfills of EventTarget provide
 * 
 * Both solutions are savvy.
 */
