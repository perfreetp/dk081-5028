export default defineAppConfig({
  pages: [
    'pages/todo/index',
    'pages/assistant/index',
    'pages/materials/index',
    'pages/messages/index',
    'pages/enterprise/index',
    'pages/task-guide/index',
    'pages/submit-package/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '企业开办一窗通',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#9ca3af',
    selectedColor: '#1677ff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/todo/index',
        text: '待办首页'
      },
      {
        pagePath: 'pages/assistant/index',
        text: '填报助手'
      },
      {
        pagePath: 'pages/materials/index',
        text: '材料袋'
      },
      {
        pagePath: 'pages/messages/index',
        text: '进度消息'
      },
      {
        pagePath: 'pages/enterprise/index',
        text: '我的企业'
      }
    ]
  }
})
