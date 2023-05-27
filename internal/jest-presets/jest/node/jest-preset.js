

module.exports = {
  roots: ["<rootDir>"],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      useESM: true,
    },],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node","mjs"],
  modulePathIgnorePatterns: [
    "<rootDir>/test/__fixtures__",
    "<rootDir>/node_modules",
    "<rootDir>/dist",
  ],
  preset: 'ts-jest/presets/default-esm', 
  extensionsToTreatAsEsm: ['.ts']
};  