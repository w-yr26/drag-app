<template>
  <div class="btn-container">
    <div class="btn-tem" v-for="btn in btns" :key="btn.label">
      <el-button @click="btn.handler">{{ btn.label }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { unReDoCommand } from "@/bridge/undo-redo-config";

const props = defineProps({
  data: Object,
});

const { commands } = unReDoCommand(props.data);

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

<style lang="scss" scoped>
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
