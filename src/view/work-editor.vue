<template>
  <div class="editor">
    <div class="editor-left">
      <leftMenu @dragstart="onMenuItemDragStart" @dragend="onMenuItemDragEnd" />
    </div>
    <div class="editor-top">
      <toolBar :btns="btns" />
    </div>
    <div class="editor-right">
      <right-pane
        :data="data"
        :currentNode="currentNode"
        :focusData="focusData.focus"
        @setAttribute="updateAttribute"
      />
    </div>
    <div class="editor-container">
      <div class="editor-container-canvas">
        <div
          class="editor-container-canvas-content"
          :style="containerStyle"
          ref="containerRef"
          @mousedown="handleContainerClick"
        >
          <div v-for="(block, index) in data.blocks" :key="index">
            <blockItem
              :block="block"
              :isPreview="isPreview"
              @mouseDown="handleMouseDown"
            ></blockItem>
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-dialog v-model="dialogVisible" title="导入" width="500">
    <div>
      <el-input
        v-model="importData"
        style="width: 100%"
        :rows="2"
        type="textarea"
        placeholder="Please input"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="initImport">取消</el-button>
        <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import blockItem from "./block-item.vue";
import leftMenu from "./left-menu.vue";
import toolBar from "./tool-bar.vue";
import rightPane from "./right-pane.vue";
import { cloneDeep } from "lodash";
import { useMenuDrag } from "../hooks/useMenuDrag";
// 指令操作逻辑
import { operateCommand } from "@/bridge/instruction-config";
import { events } from "@/utils/event";

const props = defineProps({
  modelValue: Object,
});

const isPreview = ref(false);
// 指令操作栏
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
  {
    label: "导入",
    icon: "",
    handler: () => (dialogVisible.value = true),
  },
  {
    label: "导出",
    icon: "",
    handler: () => handleExpose(),
  },
  {
    label: "置底",
    icon: "",
    handler: () => handleToBottom(),
  },
  {
    label: "置顶",
    icon: "",
    handler: () => handleToTop(),
  },
  {
    label: "删除",
    icon: "",
    handler: () => handleDel(),
  },
  {
    label: () => (isPreview.value ? "编辑" : "预览"),
    icon: "",
    handler: () => handlePreview(),
  },
];

const emits = defineEmits(["update:modelValue"]);
const data = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emits("update:modelValue", cloneDeep(newValue));
  },
});

const { commands } = operateCommand(data);

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

// 当前选中元素
const currentNode = ref();

// 选中元素
const handleMouseDown = (e, block) => {
  if (isPreview.value) return;
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
    currentNode.value = block;
  } else {
    // 如果自身不是选中的，则选中状态为true；如果已经是选中了，再点击自身，则不做处理
    if (!block.focus) {
      // 清空其他元素的active状态
      clearActiveBlock();
      block.focus = true;
      currentNode.value = block;
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
  if (isPreview.value) return;
  clearActiveBlock();
  currentNode.value = null;
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

  events.emit("start");

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
  events.emit("end");

  document.removeEventListener("mousemove", handleBlockMove);
  document.removeEventListener("mouseup", handleBlockUp);
}

const dialogVisible = ref(false);
const importData = ref("");

// 导出的时候显示当前画布的JSON数据
const handleExpose = () => {
  dialogVisible.value = true;
  importData.value = JSON.stringify(data.value);
};

// 导入的时候，要保留当前快照，用于后续撤回重做
const handleConfirm = () => {
  data.value = JSON.parse(importData.value);
  commands.expose(JSON.parse(importData.value));

  initImport();
};

const initImport = () => {
  dialogVisible.value = false;
  importData.value = "";
};

// 置顶操作
const handleToTop = () => {
  commands.pinToTop(focusData);
};

// 置底操作
const handleToBottom = () => {
  commands.pinToBottom(focusData);
};

// 删除操作
const handleDel = () => {
  commands.delete(focusData);
};

// 编辑/预览操作
const handlePreview = () => {
  // 从 编辑 -> 预览时，要先清空已选中的元素
  if (!isPreview.value) clearActiveBlock();
  isPreview.value = !isPreview.value;
};

// 更新用户设置的属性
const updateAttribute = (newAttribute) => {
  if (!currentNode.value) {
    data.value.container = newAttribute;
  } else {
    data.value.blocks.forEach((item) => {
      if (item.focus) {
        item.props = newAttribute;
      }
    });
  }
};
</script>

<style lang="sass" scoped>
.editor {
  width: 100%;
  height: 100%;

  &-left,
  &-right {
    position: absolute;
    width: 270px;
    background-color: #fff;
    top: 0;
    bottom: 0;
    }

  &-left {
      left: 0;
      border-right: 1px solid #ededed;
    }

  &-right {
    right: 0;
      border-left: 1px solid #ededed;
    }

  &-top {
    position: absolute;
    right: 280px;
    left: 280px;
    height: 80px;
    background-color: #fff;
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
            background-color: #f1f2f5;
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
