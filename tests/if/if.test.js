const assert = require('assert')

describe('s:id', function () {

  beforeEach(async () => await loadPage('if/if.html'))

  it('Should display initial values', async () => {
    const div_show_1 = await find('test-if // div[show_1]')
    const div_dont_show_1 = await find('test-if // div[show_1_negative]')
    const div_show_2 = await find('test-if // div[show_2]')
    const div_dont_show_2 = await find('test-if // div[show_2_negative')

    assert.equal(div_show_1._remoteObject.subtype, 'node');
    assert.equal(div_dont_show_1._remoteObject.subtype, 'null');
    assert.equal(div_show_2._remoteObject.subtype, 'node');
    assert.equal(div_dont_show_2._remoteObject.subtype, 'null');
  });

  it('Should switch values', async () => {
    const toggle1 = await find('test-if // #toggle1');
    const toggle2 = await find('test-if // #toggle2');

    await toggle1.click();

    const div_show_1 = await find('test-if // div[show_1]')
    const div_dont_show_1 = await find('test-if // div[show_1_negative]')

    assert.equal(div_show_1._remoteObject.subtype, 'null');
    assert.equal(div_dont_show_1._remoteObject.subtype, 'node');

    await toggle2.click();

    const div_show_2 = await find('test-if // div[show_2]')
    const div_dont_show_2 = await find('test-if // div[show_2_negative')

    assert.equal(div_show_2._remoteObject.subtype, 'null');
    assert.equal(div_dont_show_2._remoteObject.subtype, 'node');
  })

  it('Should switch values back and forth', async () => {
    const toggle1 = await find('test-if // #toggle1');
    const toggle2 = await find('test-if // #toggle2');

    const node = await find('test-if // div[show_1]')
    let lastValue = node._remoteObject.subtype;

    for (let i = 10; i > 0; i--) {
      await toggle1.click();
      const node = await find('test-if // div[show_1]')
      assert(['null', 'node'].includes(node._remoteObject.subtype))
      assert(node._remoteObject.subtype !== lastValue)
      lastValue = node._remoteObject.subtype
    }
  })


});