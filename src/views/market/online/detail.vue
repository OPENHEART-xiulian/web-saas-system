<template>
  <div class="online">
    <saas-bread title="发布线上项目">
      <i-button slot="actions" @click="cancel">返回</i-button>
    </saas-bread>
    <div class="online_body">
      <div class="online_body_step">
        <div class="stepBox">
          <div class="steps">
            <Steps :current="current" ref="steps">
              <Step :title="item"  v-for="(item,index) in stepList" :key="index" ></Step>
            </Steps>
          </div>
        </div>
      </div>
      <step1 v-if="current===0" ref="step1" v-model="onlineData"/>
      <step2 v-else ref="step2" v-model="onlineData" />
    </div>
    <bottom-submit  @on-cancel="cancel" :defaultBtn="current===0?'取消':'上一步'" :sumbitBtn="current===0?'下一步':'发布项目'"  @on-confirm="submit" :loading="btnLoading"></bottom-submit>
  </div>
</template>

<script>
import '@/styles/components/form.less';
import '@/styles/views/store/online-index.less'
import { storage } from '@/assets/js/utils';
import UploadImg from '@/components/upload-image';
import step1 from './step1'
import step2 from './step2'
export default {
  components: { UploadImg, step1, step2 },
  data () {
    return {
      btnLoading: false,
      current: 0,
      stepList: ['基本信息', '图文详情'],
      headers: {
        Authorization: storage.get('TOKEN')
      },
      // 存储各个步骤的数据
      onlineData: {
        priceModel: '0',
        price: 0,
        unitId: '',
        hierarchicalPrices: [
          {
            vehicleType: '',
            price: 0,
            unitId: ''
          }
        ],
        type: '0'
      },
       // 存储各个步骤的初始化数据 用于清空当前步骤的数据
      onlineDataInit: [
        {
          name: '',
          profile: '',
          type: '0',
          introduceImgIds: [],
          priceModel: '0',
          price: 0,
          unitId: '',
          hierarchicalPrices: [
            {
              vehicleType: '',
              price: 0,
              unitId: ''
            }
          ],
        },
        {
          process: '',
          carModel: '',
          serviceDuration: '',
          freeProvide: '',
          description: '',
          showImgIds: []
        }
      ]

    }
  },

  mounted () {
    this.bindStepClick()
    this.init()
    // this.getServiceUnit()
  },
  destroyed () {
    storage.remove('onlineCurrent')
    storage.remove('onlineStep1')
    storage.remove('isFirstInter')
  },
  
  methods: {
    init () {
      let id = this.$route.params.id
      this.current = storage.get('onlineCurrent') || 0
      if (storage.get('onlineData')) {
        this.onlineData = storage.get('onlineData')
      }
      switch (this.current) {
        case 0:
          if (id !== 'create') {
            this.getDetail(id)
          } else {
            this.clearCurrentStep(0)
          }
          break
        default:
          this.clearCurrentStep(this.current)
      }
    },
    clearCurrentStep (index) {
      let onlineDataInit = JSON.parse(
        JSON.stringify(this.onlineDataInit[index])
      )
      Object.assign(this.onlineData, onlineDataInit)
      storage.set('onlineData', this.onlineData)
    },

    bindStepClick () {
      const that = this
      this.$nextTick(function () {
        this.$refs.steps.$children.map((item, index) => {
          item.$el.children[1].addEventListener('click', function (e) {
            let current = that.current
            const STEP = 'step' + ++current
            // console.log(`current=${current}`)
            // console.log(`index=${index}`)
            // 步骤往后则直接跳  否则先验证当前页面form规则
            if (index < that.current) {
              that.$refs[STEP].asyncData()
              that.current = index
              storage.set('onlineCurrent', index)
            } else {
              let backResult = that.$refs[STEP].submit()
              if (backResult) {
                // console.log(index)
                that.afterSubmit(that.current)
                that.current = index
                storage.set('onlineCurrent', index)
              }
            }
          })
        })
      })
    },

    async getDetail (id) {
      try {
        let res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'getOnlineProject',
          params: { id: id }
        });
        if ( Number(res.code) === 0 ) {
          this.onlineData = Object.assign({}, this.onlineData, res.data)
          this.onlineData.price = String(this.onlineData.price)
          storage.get('isFirstInter') ? this.clearCurrentStep(0) : storage.set('isFirstInter', true)
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },
    cancel () {
      const step = `step${this.current + 1}`
      const asyncOK = this.$refs[step].asyncData()
      if (this.current === 0) {
        this.$router.go(-1)
      } else {
        this.current--
        storage.set('onlineCurrent', this.current)
      }
    },
     // 提交后公用逻辑（提交后的下一步和点击步骤条）
    afterSubmit (current, stepData) {
      switch (current) {
        case 0:
          this.current = 1
          storage.set('onlineCurrent', 1)
          Object.assign(this.onlineData, stepData)
          storage.set('onlineData', this.onlineData)
      }
    },
    async submit () {
      if (this.current === 0) {
        let backResult = this.$refs.step1.submit()
        if (backResult) {
          this.afterSubmit(0, backResult)
        }
      } else {
        let params = JSON.parse(JSON.stringify(this.$refs.step2.submit()))
        params.price = parseFloat(params.price)
        params.hierarchicalPrices.map(item => {
          item.price = parseFloat(item.price)
          item.unitId ? item.unitId = item.unitId : item.unitId = ""
        })
        // params.introduceImgId = params.introduceImgId.join('')
        if (params.type !== '2' || params.priceModel === '0' ) {
          delete params.hierarchicalPrices
        }
        if (params._id) {
          params.id = params._id
          delete params._id
        }
        try {
          let res = await this.$store.dispatch({
            type: 'actionPost',
            name: params.id ? 'updateOnlineProject' : 'addOnlineProject',
            params: params
          });
          if ( Number(res.code) === 0 ) {
            this.$Message.success({
              content: '发布成功',
              onClose: () => {
                this.$router.push('/market/online')
              }
            })
          } else {
            this.$Message.error(res.msg)
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
}
</script>
