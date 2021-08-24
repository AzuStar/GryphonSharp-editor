import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';

export default defineConfig({
  input: 'out/editor/nodeEditorMain.js',
  output: {
    file: 'webStatic/js/editorBundle.js'
  },
  // context: "this",
  plugins: [nodeResolve({
    browser: true
  })],
  onwarn: function (warning) {
    switch (warning.code) {
      case "CIRCULAR_DEPENDENCY":
      case "THIS_IS_UNDEFINED":
        return;
    }

    console.warn("Code: " + warning.code + "\n" + warning.message);
  }
});