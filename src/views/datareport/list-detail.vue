<template>
  <div class="finance-list">
    <ul>
      <li v-for="(item, index) in list" :key="index">
        <p>{{ item.title }}</p>
        <p>{{ item.value }}</p>
        <p>{{ item.unit }}</p>
      </li>
    </ul>
    <Spin fix v-if="loading"></Spin>
  </div>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    list: Array
  }
}
</script>

<style lang="less">
  .finance-list {
    position: relative;
    margin-bottom: 20px;
    background: #fff;

    ul {
      display: flex;
      padding: 20px;
    }

    li {
      display: inline-block;
      width: 18%;
    }

    p {
      font-size: 14px;
      color: #807D7C;

      &:nth-child(2) {
        font-size: 20px;
        color: #ff8000;
      }
    }
  }
</style>
