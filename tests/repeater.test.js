module.exports = {
    beforeEach: function(browser, done) {
        browser.deleteCookies().url('http://localhost:8000/tests/repeater.test.html');
        global.staticServer.start(done);
    },

    afterEach: function(browser, done) {
        browser.deleteCookies().end(done);
        global.staticServer.stop();
    },

    repeater: function(browser) {
        browser.waitForElementPresent('body');
        browser.waitForElementPresent('repeater-test');
        browser.waitForElementPresent('ul');
        browser.assert.containsText('li[slim-repeat-index="0"]', "item 0");
        browser.assert.containsText('li[slim-repeat-index="1"]', "item 1");
        browser.assert.containsText('li[slim-repeat-index="2"]', "item 2");
        browser.waitForElementNotPresent('li[slim-repeat-index="3"]');
        browser.execute(`
            window.unit.addOne();
        `);
        browser.assert.containsText('li[slim-repeat-index="3"]', "item 3");
    }
};