import { events } from "@/utils/event";
import { ElMessage } from "element-plus";
import { cloneDeep } from "lodash";
import { onUnmounted } from "vue";

export function unReDoCommand(data) {
  const state = {
    current: -1,
    queue: [], // 存放操作过程中涉及到的“操作指令”
    commandArr: [], // 存放项目能提供的“操作指令”
    commands: {},
    destoryArr: [],
  };

  const register = (command) => {
    state.commandArr.push(command);

    state.commands[command.name] = () => {
      const { redo, undo } = command.execute();
      redo();

      if (command.pushQueue) {
        const { queue, current } = state;
        // 操作过程中存在： 组件1拖入 -> 组件2拖入 -> 撤销(撤销是current--) -> 组件3拖入的情况，过程中存在撤销，那么对应的指令也要移除
        // 通过当前指针，更新当前操作过程中的“操作指令”队列
        if (queue.length > 0) {
          state.queue = queue.slice(0, current + 1);
        }
        // 当前组件的添加指令入队 -> 添加操作的undo、redo分别记录了改变前、改变后的视图数据
        state.queue.push({ redo, undo });
        // 指针前进
        state.current = current + 1;
      }
    };
  };

  // 以下指令在 unReDoCommand 执行时默认触发

  register({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          const item = state.queue[state.current + 1];
          if (!item) return ElMessage.warning("不可重做!!!");
          item.redo && item.redo();
          state.current++;
        },
      };
    },
  });

  register({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          if (state.current === -1) return ElMessage.warning("不可撤销!!!");
          const item = state.queue[state.current];
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });

  register({
    name: "drag",
    pushQueue: true,
    init() {
      this.prev = null;
      const start = () => {
        this.prev = cloneDeep(data.value.blocks);
      };
      const end = () => {
        state.commands.drag();
      };
      events.on("start", start);
      events.on("end", end);

      return () => {
        events.off("start", start);
        events.off("end", end);
      };
    },
    execute() {
      let prev = this.prev;
      // last这里拿到画布上最新的blocks
      // 为什么data.value.blocks要先保存在last中？这里保存完在redo()中不是又还给data.value.blocks了吗？
      // 主要是考虑到“先撤销、再重做”的情况，如果先撤销，就需要先保留撤销前的 data.value.blocks
      let last = data.value.blocks;
      return {
        // 重做 -> 拿到相对较新的东西(默认一松手就执行)
        redo() {
          data.value = {
            ...data.value,
            blocks: last,
          };
        },
        // 撤销，拿到较旧的东西
        undo() {
          data.value = {
            ...data.value,
            blocks: prev,
          };
        },
      };
    },
  });

  (() => {
    state.commandArr.forEach(
      (command) => command.init && state.destoryArr.push(command.init())
    );
  })();

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    state.destoryArr.forEach((fn) => fn());
  });

  return state;
}

// export function unReDoCommand(data) {
//   const state = {
//     current: -1,
//     queue: [], // 操作过程中涉及的指令
//     commands: {},
//     commadnArr: [], // 项目能提供的指令
//     destoryArr: [],
//   };

//   function register(command) {
//     state.commadnArr.push(command);
//     state.commands[command.name] = () => {
//       const { redo, undo } = command.executer();
//       redo();
//       // pushQueue字段为true，说明是需要记录前后画布状态的指令(如拖拽元素添加至画布)
//       if (command.pushQueue) {
//         const { queue, current } = state;

//         // 存在新增元素过程中中途撤销的情况，所以要保证操作指令队列数据最新
//         if (state.queue) {
//           state.queue = queue.slice(0, current + 1);
//         }
//         state.queue.push({ undo, redo });
//         // 操作指令队列数据增加，指针加一
//         state.current = current + 1;
//       }
//     };
//   }

//   register({
//     name: "undo",
//     keyboadr: "ctrl+z",
//     executer() {
//       return {
//         redo() {
//           if (state.current === -1) return ElMessage.warning("没有可撤销操作");
//           const item = state.queue[state.current];
//           if (item) {
//             item.undo && item.undo();
//             state.current--;
//           }
//           console.log(state.current, "exe undo");
//         },
//       };
//     },
//   });

//   register({
//     name: "redo",
//     keyboadr: "ctel+y",
//     executer() {
//       return {
//         redo() {
//           const item = state.queue[state.current + 1];
//           if (!item) return ElMessage.warning("无可前进操作!!!");
//           item.redo && item.redo();
//           state.current++;
//         },
//       };
//     },
//   });

//   register({
//     name: "drag",
//     pushQueue: true,
//     init() {
//       this.prev = null;
//       // 初始化：监听拖动元素的start、end事件，用于保存拖拽前后的视图信息
//       const start = () => (this.prev = cloneDeep(data.value.blocks));
//       const end = () => {
//         // 拖拽结束后，执行应用中已经注册的拖拽命令
//         state.commands.drag();
//       };
//       events.on("start", start);
//       events.on("end", end);
//     },
//     executer() {
//       const prev = this.prev;
//       const last = data.value.blocks;
//       return {
//         undo() {
//           data.value = {
//             ...data.value,
//             blocks: prev,
//           };
//         },
//         redo() {
//           data.value = {
//             ...data.value,
//             blocks: last,
//           };
//         },
//       };
//     },
//   });

//   (() => {
//     state.commadnArr.forEach(
//       (command) => command.init && state.destoryArr.push(command.init())
//     );
//   })();

//   onUnmounted(() => {
//     state.destoryArr.forEach((fn) => fn());
//   });

//   return state;
// }

/**
 * 实现思路：
 * 1. 注册对应的指令：撤销、重做、拖拽
 * 2. 在拖拽指令中，只需要保存上一步、下一步的视图情况(当前指令指针并不是在这里进行更改)
 *    1. 在拖拽指令中，需要进行初始化，监听“start”和“end”事件
 *    2. 由于在拖拽开始、拖拽结束的时候，我们已经执行EventBus.emit("start")\EventBus.emit("end")，所以每一个拖拽操作都会触发这里的逻辑
 *    3. 在每一次的拖拽操作中，都会记录视图数据前后的状态，并保存到queue[redo,undo]中(注意，此处的redo、undo指代可获取新视图、旧视图的方法)
 * 3. 执行撤销操作时，从queue[]中取出上一步的undo并执行，获取上一步的视图
 * 4. 执行重做操作时，从queue[]中取出下一步的redo并执行，获取下一步的视图
 *
 * 其他说明：
 * 1. 注册指令的执行时机：当我们引入 unReDoCommand 的时候，整个函数执行，里面的 register({}) 也就被执行
 *    1. 其中就包含了 drag 类型的执行，又由于 drag 类型的指令具有 init，所以 init 被执行
 *    2. init 内部又监听 start 和 end，当拖拽结束，触发 end 的回调，返回去执行 state.commands.drag();
 */
