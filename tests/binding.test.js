module.exports = {
    beforeEach: function(browser) {
        browser.deleteCookies().url('http://localhost:8000/tests/binding.test.html');
    },

    afterEach: function(browser, done) {
        browser.deleteCookies().end(done);
    },

    binding: function(browser) {
        browser.waitForElementVisible('h1');
        browser.assert.containsText('h1', 'Hello, eavichay');
        browser.click('h1');
        browser.assert.containsText('h1', 'Hello, slim.js');
    }
};