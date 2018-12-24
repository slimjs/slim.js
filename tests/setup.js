const pptr = require('puppeteer');
const StaticServer = require('static-server')
const static = new StaticServer({
  port: 1337,
  rootPath: './'
});

before(async () => {
  static.start();
  global.browser = await pptr.launch({
    headless: false,
    slowMo: 5
  });

  global.page = await browser.newPage();

  global.loadPage = async page => {
    await global.page.goto('http://localhost:1337/tests/' + page, {
      waitUntil: 'networkidle2'
    });
    await global.page.evaluate(() => {
      // @ts-ignore
      if (!window.queryDeepSelector) {
        /**
         * @param {string} selectorStr
         * @param {any} container
         */
        const queryDeepSelector = (selectorStr, container = document) => {
          const selectorArr = selectorStr.replace(new RegExp('//', 'g'), '%split%//%split%').split('%split%');
          for (const index in selectorArr) {
            const selector = selectorArr[index].trim();

            if (!selector) continue;

            if (selector === '//') {
              container = container.shadowRoot;
            } else if (selector === 'document') {
              container = document;
            }
            else {
              container = container.querySelector(selector);
            }
            if (!container) break;
          }
          return container;
        };
        window['queryDeepSelector'] = queryDeepSelector;
      }
    });
    global.find = async path => await global.page.evaluateHandle(selector => window.queryDeepSelector(selector), path)
  }
});

after(async () => {
  await browser.close();
});