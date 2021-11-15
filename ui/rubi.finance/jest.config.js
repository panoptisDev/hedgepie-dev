const { defaults: { moduleFileExtensions } } = require('jest-config');

module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  roots: ["<rootDir>"],
  testPathIgnorePatterns: ["node_modules/", "cache/"],
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(antd)/)',
  ],
  moduleFileExtensions: [
    ...moduleFileExtensions,
    'png',
    'jpg',
    'webp'
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "identity-obj-proxy",
    "Pages/(.*)$": '<rootDir>/src/pages/$1',
    "Generated/(.*)$": "<rootDir>/src/generated/$1",
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: true
    },
    NODE_ENV: 'test'
  },
  setupFiles: ['<rootDir>/jest-setup.js']
};
