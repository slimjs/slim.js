// module.exports = {
//   beforeEach: function(browser, done) {
//     browser.deleteCookies().url('http://localhost:8000/tests/lifecycle.test.html');
//     global.staticServer.start(done);
//   },
//
//   afterEach: function(browser, done) {
//     browser.deleteCookies().end(done);
//     global.staticServer.stop();
//   },
//
//   lifecycle: function(browser) {
//     let offset = 1
//     const phase1 = [
//       'ctor', 'createdCallback', '_initialize', 'onBeforeCreated', 'create (plugin)',
//       'render started', '_render started', 'beforeRender (plugin)',
//       '_bindChildren [object NodeList]', '_executeBindings', 'onRender', 'afterRender (plugin)',
//       '_render complete', 'render complete', 'onCreated', 'ctor ended', 'connectedCallback started', 'onAdded', 'added (plugin)',
//       'connectedCallback complete']
//     const phase2 = [
//       'render started', '_render started', 'beforeRender (plugin)',
//       '_bindChildren [object NodeList]', '_executeBindings', 'onRender', 'afterRender (plugin)', '_render complete', 'render complete']
//     const phase3 = [
//       'disconnectedCallback started', 'onRemoved',
//       'removed (plugin)', 'disconnectedCallback complete' ]
//     browser.waitForElementPresent('body')
//     browser.waitForElementPresent('lifecycle-test')
//     browser.waitForElementPresent('#list')
//
//     const test = (arr) => {
//       let o = offset
//       arr.forEach((t, i) => {
//         let index = o + i
//         console.log(index, t)
//         browser.waitForElementPresent(`#list > li:nth-child(${index})`)
//         browser.assert.containsText(`#list > li:nth-child(${index})`, t)
//         offset++
//       })
//     }
//
//     test(phase1)
//     browser.waitForElementPresent('#re-render')
//     browser.click('#re-render')
//     test(phase2)
//     browser.waitForElementPresent('#remove')
//     browser.click('#remove')
//     test(phase3)
//
//   }
// };