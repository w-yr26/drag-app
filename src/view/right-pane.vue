<template>
  <div class="pane-container">
    <h3>属性控制栏目</h3>
    <el-form label-width="auto" label-position="top">
      <div v-if="!currentNode">
        <collapse-block :title="'宽度'">
          <el-input-number v-model="state.editData.width" />
        </collapse-block>
        <collapse-block :title="'高度'">
          <el-input-number v-model="state.editData.height" />
        </collapse-block>
      </div>
      <div class="attribute-container" v-else>
        <div
          class="attribute-item"
          v-for="(val, key) in curAttribute"
          :key="key"
        >
          <collapse-block :title="val.label">
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
          </collapse-block>
        </div>
      </div>
    </el-form>
    <div class="footer">
      <el-button type="primary" @click="submitAttribute">应用</el-button>
      <el-button @click="resetAttribute">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { inject, reactive, ref, watch } from "vue";
import collapseBlock from "@/components/collapse-block.vue";

const props = defineProps({
  data: Object,
  currentNode: Object,
  focusData: Array,
});

// 选中元素的属性
const curAttribute = ref();

// 当前的属性状态
const state = reactive({
  editData: {},
  resetDate: {},
});

const { componentList } = inject("config");

watch(
  () => props.currentNode,
  (newVal) => {
    if (newVal) {
      // 选中了元素
      const target = componentList.find((item) => item.key === newVal.key);
      // 当前选中元素的style属性
      state.editData = props.currentNode.props;

      // console.log("画布数据", props.data.blocks);
      // console.log("元素style", state.editData);

      // 获取当前选中元素的可配置属性
      curAttribute.value = target.props;
      console.log("当前可设置的属性", curAttribute.value);
    } else {
      // 没有选中元素
      state.editData = { ...props.data.container };
    }

    // 考虑到属性都是以键值对的形式存在，所以使用浅拷贝
    state.resetDate = { ...state.editData };
  },
  {
    immediate: true,
  }
);

const emits = defineEmits(["setAttribute"]);

const submitAttribute = () => {
  emits("setAttribute", { ...state.editData });
};

// 重置用户选择
const resetAttribute = () => {
  state.editData = state.resetDate;
  emits("setAttribute", { ...state.editData });
};
</script>

<style lang="scss" scoped>
.pane-container {
  padding: 10px;
}

.attribute-container {
  .attribute-item {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
}

.footer {
  margin-top: 20px;
}
</style>
