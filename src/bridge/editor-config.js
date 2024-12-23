function createEditorConfig() {
  const componentList = [];
  const componentMap = {};

  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    },
  };
}

export let registerConfig = createEditorConfig();

registerConfig.register({
  label: "文本",
  preview: () => <span>预览文本</span>,
  render: () => <span>渲染文本</span>,
  key: "text",
});

registerConfig.register({
  label: "按钮",
  preview: () => <el-button>预览按钮</el-button>,
  render: () => <el-button>渲染按钮</el-button>,
  key: "button",
});

registerConfig.register({
  label: "输入框",
  preview: () => <el-input placeholder="预览输入框" />,
  render: () => <el-input placeholder="渲染输入框" />,
  key: "input",
});
