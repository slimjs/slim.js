module.exports = {
  beforeEach: function(browser, done) {
    browser.deleteCookies().url('http://localhost:8000/tests/switch.test.html');
    global.staticServer.start(done);
  },

  afterEach: function(browser, done) {
    browser.deleteCookies().end(done);
    global.staticServer.stop();
  },

  's:switch': function(browser) {
    browser.waitForElementPresent('slim-test');
    browser.waitForElementPresent('#monitor');
    browser.waitForElementPresent('#monitor2');
    browser.waitForElementPresent('#caseA');
    browser.waitForElementNotPresent('#caseB');
    browser.waitForElementNotPresent('test-child');
    browser.waitForElementNotPresent('#caseDefault');
    browser.waitForElementNotPresent('test-child2');
    browser.expect.element('#monitor').text.to.equal('Not created');
    browser.execute(`
      window.unit.switchValue = 'b';
    `);
    browser.waitForElementNotPresent('#caseA');
    browser.waitForElementPresent('#caseB');
    browser.waitForElementNotPresent('test-child');
    browser.waitForElementNotPresent('#caseDefault');
    browser.waitForElementNotPresent('test-child2');
    browser.expect.element('#monitor').text.to.equal('Not created');
    browser.execute(`
      window.unit.switchValue = 'c';
    `);
    browser.waitForElementNotPresent('#caseA');
    browser.waitForElementNotPresent('#caseB');
    browser.waitForElementPresent('test-child');
    browser.waitForElementNotPresent('#caseDefault');
    browser.waitForElementNotPresent('test-child2');
    browser.expect.element('#monitor').text.to.equal('Created');
    browser.execute(`
      window.unit.switchValue = 'other';
    `);
    browser.waitForElementNotPresent('#caseA');
    browser.waitForElementNotPresent('#caseB');
    browser.waitForElementNotPresent('test-child');
    browser.waitForElementPresent('#caseDefault');
    browser.waitForElementPresent('test-child2');
    browser.expect.element('#monitor2').text.to.equal('Created');
    browser.waitForElementPresent('test-rep');
    browser.waitForElementPresent('#main > test-rep > ul > li:nth-child(1)');
    browser.waitForElementPresent('#main > test-rep > ul > li:nth-child(2)');
    browser.waitForElementPresent('#main > test-rep > ul > li:nth-child(3)');
  }
};