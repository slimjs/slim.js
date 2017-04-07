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
        browser.waitForElementVisible('h1');
        browser.assert.containsText('h1', 'Hello, eavichay');
        browser.assert.attributeEquals('#check-prop', 'attr', 'eavichay');
        browser.assert.attributeEquals('#check-method', 'attr', 'yahcivae');
        browser.click('h1');
        browser.assert.containsText('h1', 'Hello, slim.js');
        browser.assert.attributeEquals('#check-prop', 'attr', 'slim.js');
        browser.assert.attributeEquals('#check-method', 'attr', 'sj.mils');
        browser.execute(`
            document.querySelector('test-binding').myName = 'test';
        `);
        browser.assert.containsText('h1', 'Hello, test');
        browser.assert.attributeEquals('#check-prop', 'attr', 'test');
        browser.assert.attributeEquals('#check-method', 'attr', 'tset');
    }
};