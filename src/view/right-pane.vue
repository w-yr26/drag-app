<template>
  <div class="pane-container">
    <h3>属性控制栏目</h3>
    <el-form label-width="auto" label-position="top">
      <div v-if="!currentNode">
        <el-form-item label="宽度">
          <el-input-number v-model="state.editData.width" />
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number v-model="state.editData.height" />
        </el-form-item>
      </div>
      <div class="attribute-container" v-else>
        <div
          class="attribute-item"
          v-for="(val, key) in curAttribute"
          :key="key"
        >
          <span class="label">{{ val.label }}</span>
          <div class="option">
            <div class="color-box" v-if="val.type === 'color'">
              <el-color-picker v-model="state.editData[key]" />
            </div>
            <div class="input-box" v-if="val.type === 'input'">
              <el-input
                style="width: 240px"
                v-model="state.editData[key]"
                placeholder="Please input"
              />
            </div>
            <div class="select-box" v-if="val.type === 'select'">
              <el-select
                placeholder="Select"
                size="large"
                style="width: 240px"
                v-model="state.editData[key]"
              >
                <el-option
                  v-for="item in val.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </el-form>
    <div class="footer">
      <el-button type="primary">应用</el-button>
      <el-button>重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue";

const props = defineProps({
  data: Object,
  currentNode: Object,
});

// 选中元素的属性
const curAttribute = ref();

// 当前的属性状态
const state = reactive({
  editData: {},
});

const { componentList } = inject("config");

watch(
  () => props.currentNode,
  (newVal) => {
    if (newVal) {
      // 选中了元素
      const target = componentList.find((item) => item.key === newVal.key);
      // 当前选中元素的style属性
      // 不能根据data(画布上的数据)进行筛选，因为一个画布上会有相同key的情况(比如画布有两个按钮，它们的key都是button)
      state.editData = props.data.blocks.find(
        (item) => item.key === newVal.key && item.focus
      ).props;

      console.log("画布数据", props.data.blocks);
      console.log("元素style", state.editData);

      // 获取当前选中元素的可配置属性
      curAttribute.value = target.props;
      console.log("当前可设置的属性", curAttribute.value);
    } else {
      // 没有选中元素
      state.editData = props.data.container;
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss" scoped>
.pane-container {
  padding: 10px;
}

.attribute-container {
  background-color: #f1f2f5;

  .attribute-item {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    .label {
      font-weight: 500;
      color: #333;
      font-size: 15px;
    }

    .option {
      margin-top: 5px;
      padding: 4px;
    }
  }
}
</style>
