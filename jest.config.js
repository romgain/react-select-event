module.exports = {
  setupFilesAfterEnv: ["@testing-library/react/cleanup-after-each"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
