<template>
  <div
    :style="blockStyle"
    class="block-item"
    :class="[props.block.focus && 'active-block', props.isPreview && 'editing']"
    @mousedown="(e) => onMouseDown(e, props.block)"
  >
    <component :is="getComponent(props.block.key)"></component>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  block: Object,
  isPreview: Boolean,
});

const blockStyle = computed(() => {
  return {
    top: `${props.block.top}px`,
    left: `${props.block.left}px`,
    zIndex: `${props.block.zIndex}`,
    color: props.block.props.color,
    fontSize: props.block.props.size,
  };
});

console.log("props.block.props", props.block.props);

const { componentMap } = inject("config");

const getComponent = (key) => {
  return componentMap[key].render({ props: props.block.props });
};

const emits = defineEmits(["clearActive", "mouseDown"]);

// const clearActiveBlock = () => {
//   emits("clearActive");
// };

const onMouseDown = (e, block) => {
  emits("mouseDown", e, block);
};
</script>

<style lang="scss" scoped>
.block-item {
  position: absolute;
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.active-block {
  &::after {
    border: 3px dashed red;
  }
}

.editing {
  &::after {
    display: none;
  }
}
</style>
