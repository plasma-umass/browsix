var browserSync = require('browser-sync');
//var historyApiFallback = require('connect-history-api-fallback');

browserSync({
  port: 5000,
  notify: false,
  ghostMode: false,
  logPrefix: 'browsix',
  snippetOptions: {
      rule: {
          match: '<span id="browser-sync-binding"></span>',
          fn: function (snippet) {
              return snippet;
          }
      }
  },
  // Run as an https by uncommenting 'https: true'
  // Note: this uses an unsigned certificate which on first access
  //       will present a certificate warning in the browser.
  // https: true,
  server: {
      baseDir: ['.tmp', 'app'],
      routes: {
          '/bower_components': 'bower_components',
          '/fs': 'fs',
          '/benchfs': 'benchfs',
      },
      middleware: [],
  }
});