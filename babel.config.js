module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // WatermelonDB models use legacy decorators — must come before class-properties
      ["@babel/plugin-proposal-decorators", { version: "legacy" }],
      ["@babel/plugin-transform-class-properties", { loose: true }],
    ],
  };
};
