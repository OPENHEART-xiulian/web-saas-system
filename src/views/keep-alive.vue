<template>
  <keep-alive :include="$store.getters.keepAliveData">
    <router-view></router-view>
  </keep-alive>
</template>

<script>
export default {
  
}
</script>
