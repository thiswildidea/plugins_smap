import uglify from 'rollup-plugin-uglify';
import base from './base.config.js';

export default Object.assign({}, base, {
  dest: 'dist/umd/Plugins.min.js',
  plugins: [
    uglify()
  ]
});
