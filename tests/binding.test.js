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