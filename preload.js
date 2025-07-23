const { contextBridge, ipcRenderer } = require('electron');
let marked;
try {
  marked = require('marked');
} catch (error) {
  console.error('marked库加载失败:', error);
  marked = null;
}

contextBridge.exposeInMainWorld('api', {
  markdownToHtml: (markdown) => {
  try {
      if (!marked) {
        throw new Error('marked库未加载，请检查依赖 (marked为' + marked + ')');
      }
      // 支持marked.parse和直接调用marked两种方式
      const parseMethod = typeof marked.parse === 'function' ? marked.parse : marked;
      if (typeof parseMethod !== 'function') {
        throw new Error(`marked解析方法不是函数 (marked类型: ${typeof marked}, parseMethod类型: ${typeof parseMethod})`);
      }
      return parseMethod(markdown);
    } catch (error) {
      return `<div style="color: red;">解析错误: ${error.message}</div>`;
    }
},
  saveFile: (content) => ipcRenderer.invoke('save-file', content),
  openFile: () => ipcRenderer.invoke('open-file')
});