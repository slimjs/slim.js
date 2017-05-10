module.exports = {
    beforeEach: function(browser, done) {
        browser.deleteCookies().url('http://localhost:8000/tests/find.test.html');
        global.staticServer.start(done);
    },

    afterEach: function(browser, done) {
        browser.deleteCookies().end(done);
        global.staticServer.stop();
    },

    find: function(browser) {
        browser.waitForElementPresent('body');
        browser.waitForElementPresent('test-find');
        browser.useCss().waitForElementPresent('test-find::shadow #output');
        browser.setValue('test-find::shadow #inp', 'after');
        browser.click('test-find::shadow #btn');
        browser.assert.containsText('test-find::shadow #output', 'after');

    }
};