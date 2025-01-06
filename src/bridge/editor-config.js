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

const createInputProps = (label) => {
  return {
    type: "input",
    label,
  };
};

const createColorProps = (label) => {
  return {
    type: "color",
    label,
  };
};

const createSelectProps = (label, options) => {
  return {
    type: "select",
    label,
    options,
  };
};

registerConfig.register({
  label: "文本",
  preview: () => <span>预览文本</span>,
  render: () => <span>渲染文本</span>,
  key: "text",
  props: {
    text: createInputProps("文本内容"),
    size: createSelectProps("字体大小", [
      { label: "默认", value: "14px", key: "14px" },
      { label: "小号字体", value: "12px", key: "12px" },
      { label: "大号字体", value: "16px", key: "16px" },
    ]),
  },
});

registerConfig.register({
  label: "按钮",
  preview: () => <el-button>预览按钮</el-button>,
  render: () => <el-button>渲染按钮</el-button>,
  key: "button",
  props: {
    text: createInputProps("按钮文本"),
    color: createColorProps("颜色"),
    type: createSelectProps("按钮主题", [
      { label: "默认按钮", value: "primary", key: "primary" },
      { label: "警告按钮", value: "warning", key: "warning" },
      { label: "危险按钮", value: "danger", key: "danger" },
      { label: "信息按钮", value: "info", key: "info" },
    ]),
    size: createSelectProps("字体大小", [
      { label: "默认", value: "14px", key: "14px" },
      { label: "小号字体", value: "12px", key: "12px" },
      { label: "大号字体", value: "16px", key: "16px" },
    ]),
  },
});

registerConfig.register({
  label: "输入框",
  preview: () => <el-input placeholder="预览输入框" />,
  render: () => <el-input placeholder="渲染输入框" />,
  key: "input",
  text: createInputProps("文本内容"),
});
