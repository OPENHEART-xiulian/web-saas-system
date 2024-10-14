<template>
  <div class='remind-setting'>
    <ul class="remindSettingItems">
      <li class="remindSettingItem">
        <div class="title">生日提醒</div>
        <ul>
          <li class="contentItem">
            <div class="left">距离客户生日日期</div>
            <div class="right">
              <div>
                <format-input reg="PRECISION" v-model="formData.birthDayRemind" @on-blur="update">
                  <span slot="append">天</span>
                </format-input>
              </div>
              <span class="tipsText">提醒</span>
            </div>
          </li>
        </ul>
      </li>
      <li class="remindSettingItem">
        <div class="title">保险提醒</div>
        <ul>
          <li class="contentItem">
            <div class="left">距离车辆保险到期日期</div>
            <div class="right">
              <div>
                <format-input reg="PRECISION" v-model="formData.insuranceRemind" @on-blur="update" >
                  <span slot="append">天</span>
                </format-input>
              </div>
              <span class="tipsText">提醒</span>
            </div>
          </li>
        </ul>
      </li>
      <li class="remindSettingItem">
        <div class="title">年检提醒</div>
        <ul>
          <li class="contentItem">
            <div class="left">距离车辆年检日期</div>
            <div class="right">
              <div>
                <format-input reg="PRECISION" v-model="formData.annualCheckRemind" @on-blur="update">
                  <span slot="append">天</span>
                </format-input>
              </div>
              <span class="tipsText">提醒</span>
            </div>
          </li>
        </ul>
      </li>
      <li class="remindSettingItem">
        <div class="title">保养提醒</div>
        <ul>
          <li class="contentItem">
            <div class="left">距离车辆下次保养日期</div>
            <div class="right">
              <div>
                <format-input reg="PRECISION" v-model="formData.maintainRemind" @on-blur="update">
                  <span slot="append">天</span>
                </format-input>
              </div>
              <span class="tipsText">提醒</span>
            </div>
          </li>
        </ul>
      </li>
    </ul>
    <self-dialog :showModal="showModal" :showClose="false" :width="240" >
      <div slot="content" class="first_intro_modal">
        <img src="@/assets/images/course/remind/remind.png" alt="" class="tipsImg">
        <h4 class="font1">关怀提醒功能上线啦</h4>
        <p class="descr">完善资料可享受更多专属服务哦</p>
        <i-button type="primary" class="completeBtn" @click="complete">立即完善</i-button>
        <p @click="showModal=false" class="font2" style="cursor:pointer">取消</p>
      </div>

    </self-dialog>
  </div>

</template>
<script>
import selfDialog from '@/components/dialog/self-dialog'
import '@/styles/views/customer/remind-setting.less'
import formatInput from '@/components/format-input'
export default {
  components: { formatInput, selfDialog },
  data () {
    return {
      a: 10,
      showModal: false,
      formData: {
        birthDayRemind: 7,
        insuranceRemind: 30,
        annualCheckRemind: 30,
        maintainRemind: 30
      }
    }
  },

  created () {
    this.init()
  },

  watch: {},

  computed: {},

  methods: {
    async init () {
      try {
        const data = await this.$store.dispatch('actionGet', { name: 'getRemindSet' })
        if (data.code === '0') {
          Object.assign(this.formData, data.data)
        }
        const newFeaturesData = await this.$store.dispatch('actionGet', { name: 'pcFeatureCheck' })
        if (newFeaturesData.code === '0') {
          const newFeatures = newFeaturesData.data.list
          const customerRemind = newFeatures.find(item => item.key === 'customerRemind')
          if (customerRemind) {
            this.showModal = true
            const params = {}
            params.featureId = customerRemind._id
            this.$store.dispatch('actionPost', { name: 'pcFeatureRead', params: params })
          }
        }
      } catch (error) {
        console.log(error)
      }
    },

    complete () {
      this.$router.push('/customer')
    },

    update () {
      const params = Object.assign({}, this.formData)
      for (let key in params) {
        if (!isNaN(params[key])) {
          params[key] = Number(params[key])
        }
      }
      params.id = params._id
      delete params._id
      this.$store.dispatch('actionPost', { name: 'updateRemindSet', params: params } ).then(res => {
        if (res.code === '0') {
          this.$Message.success('修改成功')
        } else {
          console.log(res)
        }
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>
