
export default async () => {
  return {
    testPathIgnorePatterns: ['/old-src/'],
    testURL: 'http://localhost/',
    testEnvironment: 'jsdom'
  };
};
