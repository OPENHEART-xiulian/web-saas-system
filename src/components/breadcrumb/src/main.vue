<template>
  <!-- 面包屑组件 -->
  <div class="saas-bread">
    <!-- 面包屑标题 -->
    <div class="saas-bread__title">
      <slot name="title" v-if="$slots.title"></slot>
      <span v-else>{{title}}</span>
    </div>
    <div class="saas-bread__slots">
      <slot></slot>
    </div>
    <!-- 功能列表 -->
    <div class="saas-bread__action">
      <slot name="actions"></slot>
      <template v-for="(item, index) in actions">
        <i-button :key="index" :type="item.type" @click="clickHandle(item.callback)">{{ item.text }}</i-button>
      </template>
    </div>
  </div>
</template>

<script>
import { validArrayInArray } from "@/commons/utils";

export default {
  name: "saasBreadcrumb",
  props: {
    title: {
      type: String,
      default: ""
    },
    actions: { // [{ text: "返回", type: "default", callback: callback }]
      type: Array,
      validator (v) {
        let types = v.map(elm => elm.type);
        return validArrayInArray(types, ["default", "primary", "dashed", "text", "info", "success", "warning", "error"]);
      }
    }
  },

  data () {
    return {
    }
  },

  methods: {
    clickHandle (callback) {
      if (typeof callback === "string") {
        let actions = ["goBack"];
        if (actions.find(elm => callback === elm)) {
          this[callback]();
        }
      } else if (callback) {
        callback();
      }
    },

    // 返回
    goBack () {
      this.$router.go(-1);
    }
  }
}
</script>
