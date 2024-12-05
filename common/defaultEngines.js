// 默认搜索引擎配置
export const defaultEngines = [
  {
    name: 'Google',
    url: 'https://www.google.com/search?q=%s',
    timeout: 10000,
    enabled: true,
    isCustom: false
  },
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=%s',
    timeout: 10000,
    enabled: true,
    isCustom: false
  },
  {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=%s',
    timeout: 10000,
    enabled: true,
    isCustom: false
  }
]; 