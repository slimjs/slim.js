module.exports = {
    beforeEach: function(browser, done) {
        browser.deleteCookies().url('http://localhost:8000/tests/if.test.html');
        global.staticServer.start(done);
    },

    afterEach: function(browser, done) {
        browser.deleteCookies().end(done);
        global.staticServer.stop();
    },

    'slim-switch': function(browser) {
        browser.waitForElementNotPresent('#caseTwo');
        browser.execute(`
            window.unit.letter = "b";
        `);
        browser.waitForElementPresent('#caseTwo');
        browser.execute(`
            window.unit.letter = "a";
        `);
        browser.waitForElementNotPresent('#caseTwo')
    }
};