import { defineStore } from "pinia";
import { ref } from "vue";

export const useUnReDoStore = defineStore("unreDo", () => {
  const data = ref({});
  const updateData = (newData) => {
    data.value = newData;
  };
  return {
    data,
    updateData,
  };
});
