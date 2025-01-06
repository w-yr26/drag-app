import { events } from "@/utils/event";

export function useMenuDrag(data, containerRef) {
  let currentComponent = null;

  // 开始拖拽
  const onDragStart = (component) => {
    currentComponent = component;
    // 派发开始拖动事件
    events.emit("start");
    console.log(containerRef.value);

    containerRef.value.addEventListener("dragenter", dragenter);
    containerRef.value.addEventListener("dragover", dragover);
    containerRef.value.addEventListener("dragleave", dragleave);
    containerRef.value.addEventListener("drop", drop);
  };

  // 结束拖拽
  const onDragEnd = () => {
    // 派发结束拖动事件
    events.emit("end");

    containerRef.value.removeEventListener("dragenter", dragenter);
    containerRef.value.removeEventListener("dragover", dragover);
    containerRef.value.removeEventListener("dragleave", dragleave);
    containerRef.value.removeEventListener("drop", drop);
  };

  const dragenter = (e) => {
    console.log("拖拽进入");
    e.dataTransfer.dropEffect = "move";
  };

  const dragover = (e) => {
    e.preventDefault();
  };

  const dragleave = (e) => {
    console.log("拖拽超出范围");
    e.dataTransfer.dropEffect = "none";
  };

  const drop = (e) => {
    const blocks = data.value.blocks;
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          props: getCurDefaultProps(currentComponent.key),
        },
      ],
    };
    currentComponent = null;
  };

  return {
    onDragStart,
    onDragEnd,
  };
}

function getCurDefaultProps(key) {
  let res = undefined;
  switch (key) {
    case "text":
      res = {
        text: "默认文本内容",
        color: "#409EFF",
        size: "12px",
        lineHeight: 1,
      };
      break;
    case "button":
      res = {
        text: "默认按钮文案",
        type: "warning",
        size: "large",
      };
      break;
    case "input":
      {
        res = {
          text: "默认文本内容",
        };
      }
      break;
    default:
      break;
  }

  return res;
}
