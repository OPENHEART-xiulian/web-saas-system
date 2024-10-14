<template>
  <div>
    <saas-bread title="配件类别管理">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回列表</i-button>
        <saas-toggle-btn 
          v-model="openAll" 
          type="default" 
          :titles="['收起所有子类别', '展开所有子类别']" 
          @on-change="toggleAllChild">
        </saas-toggle-btn>
        <i-button type="primary" @click="addChild">
          <i class="iconfont icon-xinzeng left-icon" style="position: relative; top: 1px;"></i>
          <span>新增配件类别</span>
        </i-button>
      </template>
    </saas-bread>
    <cate-admin 
      ref="storeCate" 
      request="repairCate"
      @toggle-change="toggleChange"
      :lists="lists">
    </cate-admin>
  </div>
</template>

<script>
  import CateAdmin from '@/components/cate-admin';
  export default {
    components: { CateAdmin },
    data () {
      return {
        openAll: false,
      }
    },
    mounted () {
      this.getCateList();
      this.$store.commit("setKeepAliveData", { name: "InventoryStock", value: false });
    },
    methods: {
      addChild () {
        this.$refs.storeCate.addChild();
      },
      toggleAllChild () {
        if (this.lists.length === 0) return;
        this.openAll = !this.openAll;
        this.$refs.storeCate.toggleAllChild(this.openAll);
      },
      toggleChange (v) {
        this.openAll = v;
      },
      getCateList () {
        this.$store.dispatch({
          type: 'repairCateList'
        })
      }
    },
    computed: {
      lists () {
        return this.$store.getters.getMaintainCateList;
      }
    }
  }
</script>
