module.exports = {
    moduleFileExtensions: ["js", "json", "vue", "ts"],
    transform: {
        ".+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
        "^.+\\.ts$": "ts-jest",
        ".*\\.(vue)$": "vue-jest",
    },
    transformIgnorePatterns: ["/node_modules/"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    snapshotSerializers: ["jest-serializer-vue"],
    testMatch: ["**/tests/unit/**/*.test.(js|ts)|**/__tests__/*.(js|ts)"],
    testURL: "http://localhost/",
    watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
    globals: {
        "ts-jest": {
            babelConfig: true,
        },
    },
};
