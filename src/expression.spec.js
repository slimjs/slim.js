import { parse } from './expression.js';
import assert from 'assert';

describe('expression', () => {
  describe('parse', () => {
    it('should find multiple property accessors', () => {
      const result = parse(`this.something + 4 + this.somethingElse`).paths;
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0], 'something');
      assert.strictEqual(result[1], 'somethingElse');
    });
    it('should find one property accessor', () => {
      const result = parse(`this.name`).paths;
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0], 'name');
    });
    it('should find one property accessor with wrapping expressions', () => {
      const result = parse(`42 + this.name`).paths;
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0], 'name');
    });
    it('should find method call', () => {
      const result = parse(`this.fn(4)`).paths;
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0], 'fn');
    });
    it('should find method call with argument', () => {
      const result = parse(`this.fn(this.prop)`).paths;
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0], 'fn');
      assert.strictEqual(result[1], 'prop');
    });
    it('should find nested function calls', () => {
      const result = parse(`this.fn(this.fn2(this.someProp + 50))`).paths;
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0], 'fn');
      assert.strictEqual(result[1], 'fn2');
      assert.strictEqual(result[2], 'someProp');
    });
    it('should find nested calls with multiple accessors', () => {
      const result = parse(
        `this.say(this.myName + ' i am from ', this.getCity(this.address))`
      ).paths;
      assert.strictEqual(result.length, 4);
      assert.strictEqual(result[0], 'say');
      assert.strictEqual(result[1], 'myName');
      assert.strictEqual(result[2], 'getCity');
      assert.strictEqual(result[3], 'address');
    });
  });
});
