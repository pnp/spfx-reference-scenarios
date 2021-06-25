'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set('serve', result.get('serve-deprecated'));

  return result;
};


// const bundleAnalyzer = require('webpack-bundle-analyzer');
// const path = require('path');
// build.configureWebpack.mergeConfig({

//   additionalConfiguration: (generatedConfiguration) => {
//     const lastDirName = path.basename(__dirname);
//     const dropPath = path.join(__dirname, 'temp', 'stats');
//     generatedConfiguration.plugins.push(new bundleAnalyzer.BundleAnalyzerPlugin({
//       openAnalyzer: false,
//       analyzerMode: 'static',
//       reportFilename: path.join(dropPath, `${lastDirName}.stats.html`),
//       generateStatsFile: true,
//       statsFilename: path.join(dropPath, `${lastDirName}.stats.json`),
//       logLevel: 'error'
//     }));

//     return generatedConfiguration;
//   }

// });

build.initialize(require('gulp'));