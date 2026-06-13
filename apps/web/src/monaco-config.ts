// src/monaco.ts
import 'monaco-editor'

// ✅ 定义 Worker 路径（Vite 原生支持）
self.MonacoEnvironment = {
  getWorker: function (_moduleId: string, label: string) {
    switch (label) {
      case 'json':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/json/json.worker.js',
            import.meta.url,
          ),
          { type: 'module' },
        )
      case 'css':
      case 'scss':
      case 'less':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/css/css.worker.js',
            import.meta.url,
          ),
          { type: 'module' },
        )
      case 'html':
      case 'handlebars':
      case 'razor':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/html/html.worker.js',
            import.meta.url,
          ),
          { type: 'module' },
        )
      case 'typescript':
      case 'javascript':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/typescript/ts.worker.js',
            import.meta.url,
          ),
          { type: 'module' },
        )
      default:
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/editor/editor.worker.js',
            import.meta.url,
          ),
          { type: 'module' },
        )
    }
  },
}
