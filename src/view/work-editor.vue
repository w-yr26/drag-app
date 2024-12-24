<template>
  <div class="editor">
    <div class="editor-left">
      <leftMenu @dragstart="onMenuItemDragStart" @dragend="onMenuItemDragEnd" />
    </div>
    <div class="editor-top">
      <div class="btn-container">
        <div class="btn-tem" v-for="btn in btns" :key="btn.label">
          <el-button @click="btn.handler">{{ btn.label }}</el-button>
        </div>
      </div>
    </div>
    <div class="editor-right">属性控制栏目</div>
    <div class="editor-container">
      <div class="editor-container-canvas">
        <div
          class="editor-container-canvas-content"
          :style="containerStyle"
          ref="containerRef"
          @mousedown="handleContainerClick"
        >
          <div v-for="(block, index) in data.blocks" :key="index">
            <blockItem :block="block" @mouseDown="handleMouseDown"></blockItem>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import blockItem from "./block-item.vue";
import leftMenu from "./left-menu.vue";
// import toolBar from "./tool-bar.vue";
import { cloneDeep } from "lodash";
import { useMenuDrag } from "../hooks/useMenuDrag";
const props = defineProps({
  modelValue: Object,
});

const emits = defineEmits(["update:modelValue"]);
const data = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emits("update:modelValue", cloneDeep(newValue));
  },
});

const containerStyle = computed(() => {
  return {
    width: props.modelValue.container.width + "px",
    height: props.modelValue.container.height + "px",
  };
});

const containerRef = ref();

const { onDragEnd, onDragStart } = useMenuDrag(data, containerRef);

// 开始拖拽
const onMenuItemDragStart = (component) => {
  onDragStart(component);
};

// 结束拖拽
const onMenuItemDragEnd = () => {
  onDragEnd();
};

// 选中元素
const handleMouseDown = (e, block) => {
  // 阻止默认事件
  e.preventDefault();
  e.stopPropagation();
  // 如果按住的是 shift 键
  if (e.shiftKey) {
    // 当前只有一个被选中时，按住shift键再来选中元素，则不修改它的状态
    if (focusData.value.focus.length <= 1) {
      block.focus = true;
    } else {
      block.focus = !block.focus;
    }
  } else {
    // 如果自身不是选中的，则选中状态为true；如果已经是选中了，再点击自身，则不做处理
    if (!block.focus) {
      // 清空其他元素的active状态
      clearActiveBlock();
      block.focus = true;
    }
  }

  // 按下之后可能就直接开始拖动了
  handleMove(e);
};

// 选中元素之前先清空以选中的
const clearActiveBlock = () => {
  data.value.blocks.forEach((block) => (block.focus = false));
};

// 点击整个画布区域 -> 清空所有选中状态
const handleContainerClick = () => {
  clearActiveBlock();
};

// 当前选中的元素 & 未选中的元素
const focusData = computed(() => {
  const focus = [];
  const unFocus = [];
  data.value.blocks.forEach((block) =>
    (block.focus ? focus : unFocus).push(block)
  );

  return {
    focus,
    unFocus,
  };
});

let dragState = {
  startX: 0,
  startY: 0,
  startPos: [],
};

const handleMove = (e) => {
  // 选中的元素真正开始移动之前先记录起始位置
  dragState = {
    startX: e.clientX,
    startY: e.clientY,
    startPos: focusData.value.focus.map(({ top, left }) => ({ left, top })),
  };

  document.addEventListener("mousemove", handleBlockMove);
  document.addEventListener("mouseup", handleBlockUp);
};

function handleBlockMove(e) {
  const { clientX: moveX, clientY: moveY } = e;
  let durX = moveX - dragState.startX;
  let durY = moveY - dragState.startY;
  focusData.value.focus.forEach((block, index) => {
    block.top = dragState.startPos[index].top + durY;
    block.left = dragState.startPos[index].left + durX;
  });
}

function handleBlockUp() {
  document.removeEventListener("mousemove", handleBlockMove);
  document.removeEventListener("mouseup", handleBlockUp);
}

// 撤销操作逻辑
import { unReDoCommand } from "@/bridge/undo-redo-config";

const { commands } = unReDoCommand(data);

const btns = [
  {
    label: "撤销",
    icon: "",
    handler: () => commands.undo(),
  },
  {
    label: "重做",
    icon: "",
    handler: () => commands.redo(),
  },
];
</script>

<style lang="sass" scoped>
.editor {
  width: 100%;
  height: 100%;

  &-left,
  &-right {
    position: absolute;
    width: 270px;
    background-color: #8bcaac;
    top: 0;
    bottom: 0;
    }

  &-left {
      left: 0;
    }

  &-right {
    right: 0;
    }

  &-top {
    position: absolute;
    right: 280px;
    left: 280px;
    height: 80px;
    background-color: #9ba0ca;
    }

  &-container {
    padding: 80px 270px 0;
    height: 100%;
    box-sizing: border-box;
    &-canvas {
        overflow: scroll;
        height: 100%;
        &-content {
            position: relative;
            margin: 20px auto;
            width: 800px;
            height: 800px;
            background-color: #eee;
          }
      }
    }
}

  .btn-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;

  .btn-tem {
    margin-right: 10px;
  }
}
</style>
