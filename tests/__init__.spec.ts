import { Slim } from '../dist/index';
import 'jsdom-global';

beforeAll(() => {
  console.log(window);
  global.Slim = window.Slim;
  console.log(Slim);
});

describe('Slim Module', () => {
  it('Should place on window', () => {
    expect(window.Slim).toBeTruthy;
  })
});