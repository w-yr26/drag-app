export function useMenuDrag(data, containerRef) {
  let currentComponent = null;

  // 开始拖拽
  const onDragStart = (component) => {
    currentComponent = component;

    containerRef.value.addEventListener("dragenter", dragenter);
    containerRef.value.addEventListener("dragover", dragover);
    containerRef.value.addEventListener("dragleave", dragleave);
    containerRef.value.addEventListener("drop", drop);
  };

  // 结束拖拽
  const onDragEnd = () => {
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
    console.log("经过画布触发");
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
        },
      ],
    };
    currentComponent = null;
    console.log("exe");
  };

  return {
    onDragStart,
    onDragEnd,
  };
}
