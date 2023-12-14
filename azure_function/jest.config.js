// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageReporters: ['text', 'cobertura'],
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.js$',
};