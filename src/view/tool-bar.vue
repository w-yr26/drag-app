<template>
  <div class="btn-container">
    <div class="btn-tem" v-for="btn in props.btns" :key="btn.label">
      <el-button @click="btn.handler">{{
        typeof btn.label === "function" ? btn.label() : btn.label
      }}</el-button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  btns: Object,
});
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
