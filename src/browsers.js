export const isSafari = /Safari/.test(navigator.userAgent);
export const isIE11 =
  // @ts-ignore
  !!window['MSInputMethodContext'] && !!document['documentMode'];
