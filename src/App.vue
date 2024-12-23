<template>
  <div class="app">
    <workEditor v-model="renderData" />
  </div>
</template>

<script setup>
import { provide, ref } from "vue";
import workEditor from "./work-editor.vue";
// 获取画布区域的数据
import data from "./data.json";
// 获取物料区域的数据，并穿透给子组件
import { registerConfig as config } from "./bridge/editor-config";
const renderData = ref(data);
provide("config", config);
</script>

<style lang="sass" scoped>
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  }
</style>
