module.exports = {
    beforeEach: function(browser, done) {
        browser.deleteCookies().url('http://localhost:8000/tests/binding.test.html');
        global.staticServer.start(done);
    },

    afterEach: function(browser, done) {
        browser.deleteCookies().end(done);
        global.staticServer.stop();
    },

    binding: function(browser) {
        browser.waitForElementPresent('body');
        browser.waitForElementPresent('test-binding');
        browser.waitForElementPresent('h1');
        browser.waitForElementPresent('h2');
        browser.assert.containsText('h1', 'Hello, eavichay');
        browser.assert.containsText('h2', 'yahcivae');
        browser.assert.attributeEquals('#check-prop', 'attr', 'eavichay');
        browser.assert.attributeEquals('#check-method', 'attr', 'yahcivae');
        browser.click('h1');
        browser.assert.containsText('h1', 'Hello, slim.js');
        browser.assert.containsText('h2', 'sj.mils');
        browser.assert.attributeEquals('#check-prop', 'attr', 'slim.js');
        browser.assert.attributeEquals('#check-method', 'attr', 'sj.mils');
        browser.assert.containsText('#check-undefined-method', '[[undefinedMethod(prop)]]');
        browser.assert.containsText('#log-error', 'Could not execute function undefinedMethod in element test-binding');
        browser.assert.containsText('#log-info', `TypeError: Cannot read property 'apply' of undefined`);
        browser.execute(`
            document.querySelector('test-binding').myName = 'test';
        `);
        browser.assert.containsText('h1', 'Hello, test');
        browser.assert.containsText('h2', 'tset');
        browser.assert.attributeEquals('#check-prop', 'attr', 'test');
        browser.assert.attributeEquals('#check-method', 'attr', 'tset');
        browser.assert.containsText('#check-undefined-method', '[[undefinedMethod(prop)]]');
        browser.assert.containsText('#log-error', 'Could not execute function undefinedMethod in element test-binding');
        browser.assert.containsText('#log-info', `TypeError: Cannot read property 'apply' of undefined`);


    }
};