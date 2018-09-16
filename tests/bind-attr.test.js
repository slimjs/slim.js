module.exports = {
  beforeEach: function(browser, done) {
    browser.deleteCookies().url('http://localhost:8000/tests/bind-attr.test.html');
    global.staticServer.start(done);
  },

  afterEach: function(browser, done) {
    browser.deleteCookies().end(done);
    global.staticServer.stop();
  },

  'bind-attr': function(browser) {
    browser.waitForElementPresent('body');
    browser.waitForElementPresent('test-tag');
    browser.assert.elementNotPresent('span[good-bye]');
    browser.assert.elementNotPresent('span[hello]');
    browser.click('button#goodbye');
    browser.waitForElementPresent('span[good-bye]');
    browser.click('button#goodbye');
    browser.assert.elementNotPresent('span[good-bye]');
    browser.click('button#hello');
    browser.assert.elementPresent('span[hello="I have a value now"');
  }
};