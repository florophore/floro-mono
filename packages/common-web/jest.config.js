export default {
  preset: "ts-jest",
  resolver: "ts-jest-resolver",
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  transform: {
    "^.+\\.svg$": "jest-transformer-svg"
 },
};