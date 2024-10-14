<template>
  <div class="flex" style="margin-left:10px;align-items:center;" v-if="isMasterStore && isChainStore">
    <span style="width:115px;font-size:14px;color: #332e29;">选择门店：</span>
    <i-select style="min-width:150px;" v-model="storeModel" @on-change="onSelectChange">
      <i-option v-for="item in storeAdminList" :key="item.value" :value="item._id">{{item.storeName}}</i-option>
    </i-select>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'
import { storage } from '@/assets/js/utils'
export default {
  props: {
    value:{
      type:Boolean,
      default (){
        return true
      }
    }
  },
  computed: {
    ...mapGetters({
      storeAdminList: 'getStoreByUserStoreGroup'
    })
  },
  data () {
    return {
      storeModel:'',
      selfStoreId: storage.get('USER').storeId || '',
      roleName: storage.get('USER').roleName || '',
      isMasterStore: storage.get('STORE').isMasterStore || '',
      isChainStore: storage.get('STORE').isChainStore || ''
    }
  },
  mounted () {
    this.$store.dispatch('actionStoreByUserStoreGroupId',{params:{ isRoot: this.roleName === '店长'? true : false }} );
    storage.remove("selectShareStore")
    this.storeModel = this.selfStoreId
  },
  methods: {
    init(){
      this.storeModel = this.selfStoreId
    },
    onSelectChange(value){
      let isSelf = true
      if(this.selfStoreId !== value){
        isSelf = false
      }else{
        isSelf = true
      }
      storage.set("selectShareStore",this.storeAdminList.find(ele=>ele._id==value))
      this.$emit('input', isSelf);
      this.$emit('on-change',value)
    }
  }
}
</script>
