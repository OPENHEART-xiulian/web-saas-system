<template>
  <!-- 项目信息 -->
  <div>
    <Modal
      title="备注"
      v-model="modal"
      ok-text="保存"
      @on-ok="remark"
      :mask-closable="false"
    >
      <i-input type="textarea" :maxlength="50" :show-word-limit="true" placeholder="请输入备注" v-model="remarkText"></i-input>
    </Modal>

  </div>
</template>

<script>
import mixins from './mixins.js'
import { storage } from '@/assets/js/utils.js'
import { formatTime } from '@/assets/js/utils'
import '@/styles/views/workorder/receive-material.less'
export default {
  mixins: [mixins],
  props: {

  },
  data () {
    return {
      modal: false,
      remarkText:'',
      orderType:1
    }
  },
  created () {
  },
  methods:{
    showModal(params,orderType){
      this.id = params.id
      this.orderType = orderType
      this.remarkText = params.text
      this.modal = true
    },
    async remark(){
      try{
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name:'updateWorkOrderRemark',
          params: {
            id: this.id,
            orderType: this.orderType+'',
            workOrderRemark: this.remarkText
          }
        })
        if(Number(res.code) === 0){
          if (res.code === '0') {
            this.$Message.success('备注成功');
            this.$emit('remarkOk')
          }
        }else{
          this.$store.commit('REQUEST_ERROR', { err:res.err });
        }
      }catch(error){
        console.log(error)
      }

    }
  }
}
</script>
