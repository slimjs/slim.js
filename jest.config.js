import('jsdom');
import 'jsdom-global/register.js';

export default async () => {
  const SlimModule = await import('./dist/index.js');
  global.Slim = SlimModule.Slim;
  return {
    testPathIgnorePatterns: ['/old-src/'],
    testURL: 'http://localhost/',
    testEnvironment: 'jsdom',
    globals: {
      window: {},
    },
  };
};
