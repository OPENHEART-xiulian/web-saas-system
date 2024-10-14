<template>
  <div id="app">
    <!-- <router-view/> -->
    <my-keep-alive v-if="!loading"></my-keep-alive>
    <Spin fix v-if="loading"></Spin>
  </div>
</template>

<script>
  // import { storage } from '@/assets/js/utils.js';
  import '@/styles/app.less';
  import MyKeepAlive from "./views/keep-alive";
  import { setCityData } from "@/store/json/city";
  export default {
    name: 'App',
    components: { MyKeepAlive },
    data () {
      return {
        loading: true,
      }
    },

    created () {
      this.authVersion();
      this.getCityData();
      this.getStoreSelectData();
    },

    methods: {
      authVersion () {
        let version = this.$storage.get("version");
        let nowVersion = 250;
        if (!version || (version < nowVersion)) {
          this.$storage.clear();
        }
        this.$storage.set("version", nowVersion);
      },
      async getCityData () {
        let cityVersion = this.$storage.get("city-version");
        let nowCityVersion = 1;
        if (!cityVersion || (cityVersion < nowCityVersion)) {
          try {
            let res = await this.$store.dispatch({
              name: "areaCode",
              type: "actionGet",
            });
            let cityData = {}
            for (const key in res.data) {
              const elm = res.data[key]
              cityData[key] = elm.map(elm => ({ name: elm.n, value: elm.c }));
            }
            // 七天一次
            this.$storage.set('province', cityData.province);
            this.$storage.set('city', cityData.city);
            this.$storage.set('county', cityData.county);
            this.$storage.set('street', cityData.street);
            this.$storage.set("city-version", nowCityVersion);
          } catch (error) {
            console.log(error);
          }
        }

        let data = {
          province: this.$storage.get("province"),
          city: this.$storage.get("city"),
          county: this.$storage.get("county"),
          street: this.$storage.get("street"),
        }

        setCityData(data);
        this.loading = false;
      },
      getStoreSelectData(){
        this.$store.dispatch('getStoreSelectData')
      }
    }
  }
</script>
<style>
 .imgCode .ivu-form-item-content{
display: flex;
height: 50px;
/* align-items: flex-start; */
 }
</style>
