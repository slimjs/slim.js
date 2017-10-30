module.exports = {
  beforeEach: function(browser, done) {
    browser.deleteCookies().url('http://localhost:8000/tests/lifecycle.test.html');
    global.staticServer.start(done);
  },

  afterEach: function(browser, done) {
    browser.deleteCookies().end(done);
    global.staticServer.stop();
  },

  repeater: function(browser) {
    const expectedOrderOfLifecycleEvents = [
      'ctor', 'createdCallback', '_initialize', 'onBeforeCreated', 'create (plugin)',
      '_render started', 'beforeRender (plugin)', 'onBeforeRender', '_captureBindings',
      '_bindChildren [object NodeList]', '_executeBindings', 'onRender', 'afterRender (plugin)',
      '_render complete', 'ctor ended', 'connectedCallback started', 'onAdded', 'added (plugin)',
      'connectedCallback complete', 'onCreated', 'render started', '_render started', 'beforeRender (plugin)',
      'onBeforeRender', '_captureBindings', '_bindChildren [object NodeList]', '_executeBindings',
      'onRender', 'afterRender (plugin)', '_render complete', 'render complete',
      'disconnectedCallback started', 'onRemoved',
      'removed (plugin)', 'disconnectedCallback complete' ]
    const phase1 = expectedOrderOfLifecycleEvents.slice(0, 20)
    const phase2 = expectedOrderOfLifecycleEvents.slice(20, 11)
    const phase3 = expectedOrderOfLifecycleEvents.slice(31)
    browser.waitForElementPresent('body')
    browser.waitForElementPresent('lifecycle-test')
    browser.waitForElementPresent('#list')

    phase1.forEach((t, i) => {
      const offset = 1
      browser.waitForElementPresent('#list > li:nth-child('+(i+offset)+')')
      browser.assert.containsText('#list > li:nth-child('+(i+offset)+')', t)
    })

    browser.waitForElementPresent('#re-render')
    browser.click('#re-render')
    phase2.forEach((t, i) => {
      const offset = 21
      browser.waitForElementPresent('#list > li:nth-child('+(i+offset)+')')
      browser.assert.containsText('#list > li:nth-child('+(i+offset)+')', t)
    })

    browser.waitForElementPresent('#remove')
    browser.click('#remove')
    phase3.forEach((t, i) => {
      const offset = 32
      browser.waitForElementPresent('#list > li:nth-child('+(i+offset)+')')
      browser.assert.containsText('#list > li:nth-child('+(i+offset)+')', t)
    })
    
  }
};