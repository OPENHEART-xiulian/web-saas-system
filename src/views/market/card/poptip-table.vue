<template>
  <table class="card-poptip-table" style="margin:0px;">
    <thead>
      <tr>
        <th>项目</th>
        <th>总次数</th>
        <th>剩余次数</th>
        <th>已用次数</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in servictList" :key="item.serviceId">
        <td>{{ item.name }}</td>
        <td>{{ item.count }}</td>
        <td>{{ item.remainCount }}</td>
        <td>{{ item.usedCount }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import '@/styles/views/market/card-poptip.less';

export default {
  props: {
    servictList: Array
  }
}
</script>
