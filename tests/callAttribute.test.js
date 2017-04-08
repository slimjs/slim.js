module.exports = {
    beforeEach: function(browser, done) {
        browser.deleteCookies().url('http://localhost:8000/tests/callAttribute.test.html');
        global.staticServer.start(done);
    },

    afterEach: function(browser, done) {
        browser.deleteCookies().end(done);
        global.staticServer.stop();
    },

    callAttribute: function(browser) {
        browser.waitForElementPresent('body');
        browser.waitForElementPresent('parent-node');
        browser.waitForElementPresent('child-node');
        browser.assert.containsText('parent-node div', 'Waiting');
        browser.execute(`
            window.unit.doIt('new message');
        `);
        browser.assert.containsText('parent-node div', 'new message');
        browser.execute(`
            window.unit.doIt('third message');
        `);
        browser.assert.containsText('parent-node div', 'third message');
    }
};