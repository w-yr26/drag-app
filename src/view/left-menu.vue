<template>
  <div class="menu-container">
    <div
      class="material-item"
      v-for="(item, index) in componentList"
      :key="index"
      draggable="true"
      @dragstart="onDragStart(item)"
      @dragend="onDragEnd"
    >
      <span class="label"> {{ item.label }} </span>
      <div class="com">
        <component :is="item.preview()" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";
const emits = defineEmits(["dragstart", "dragend"]);

const { componentList } = inject("config");

const onDragStart = (component) => {
  emits("dragstart", component);
};

const onDragEnd = () => {
  emits("dragend");
};
</script>

<style lang="scss" scoped>
.menu-container {
  width: 100%;
  height: 100%;

  .material-item {
    position: relative;
    height: 50px;
    width: 250px;
    margin: 10px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    box-sizing: border-box;
    cursor: move;
    user-select: none;

    .label {
      position: absolute;
      top: 0;
      left: 0;
      width: 40px;
      height: 25px;
      line-height: 25px;
      text-align: center;
      font-size: 12px;
      color: #fff;
      background-color: #7fbbe3;
      padding: 2px;
    }

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      opacity: 0.2;
    }
  }
}
</style>
