module.exports = {
  setupFilesAfterEnv: ["react-testing-library/cleanup-after-each"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
