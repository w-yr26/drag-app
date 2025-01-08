<template>
  <div class="collapse">
    <div class="collapse-hd">
      <slot v-if="$slots.title" name="title"></slot>
      <span v-else-if="title" class="title">{{ title }}</span>
    </div>
    <div class="collapse-bd">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
});
console.log(props.title);
</script>

<style lang="scss" scoped>
.collapse {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  max-height: 640px;
  overflow-y: auto;
  .collapse-hd {
    line-height: 24px;
    margin-top: -4px;
    margin-bottom: -4px;
  }
  .title {
    font-weight: bold;
    color: #333;
  }
  .collapse-hd + .collapse-bd {
    margin-top: 8px;
  }
  .collapse-bd {
    .collapse {
      padding-left: 0;
      padding-right: 0;
    }
    .collapse-inner {
      padding-top: 12px;
      padding-bottom: 12px;
      border-bottom: none;
      border-top: 1px solid #eee;
    }
  }
}
</style>
