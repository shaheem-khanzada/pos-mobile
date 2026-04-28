module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Worklets plugin must be last for Reanimated 4.
      'react-native-worklets/plugin',
    ],
    overrides: [
      {
        test: /node_modules\/@nozbe\/watermelondb/,
        plugins: [
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          [
            '@babel/plugin-transform-runtime',
            {
              helpers: true,
              regenerator: true,
            },
          ],
        ],
      },
      {
        test: /database\/model\/.+\.(ts|js)$/,
        plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
      },
    ],
  };
};
