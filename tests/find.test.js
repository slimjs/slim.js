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
        // this workaround is needed since chrome driver for chrome 65+ has selenium issue
        const setValueWorkaround = function(selector, value) {
            document.querySelector(selector).value = value;
        };
        browser.waitForElementPresent('body');
        browser.waitForElementPresent('test-find');
        browser.useCss().waitForElementPresent('test-find::shadow #output');
        browser.execute(setValueWorkaround, ['test-find::shadow #inp', 'after']);
        browser.click('test-find::shadow #btn');
        browser.waitForElementPresent('test-find::shadow #output');
        browser.assert.containsText('test-find::shadow #output', 'after');
    }
};