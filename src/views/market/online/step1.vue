<template>
  <div class="online">
    <div class="online_body">
      <Form ref="formValidate" class="w-form" :model="formData" :rules="rules" :label-width="200">
        <div class="form-title">项目信息</div>
        <FormItem class="form-item" label="项目名称" prop="name">
          <Input v-model="formData.name" placeholder="请输入项目名称，如：五座轿车全车清洗"  maxlength="20"/>
        </FormItem>
        <FormItem class="form-item" label="项目简介" prop="profile">
          <textarea v-model="formData.profile" @blur="formValidate" placeholder="请输入项目简介，例子：整车泡沫冲洗擦干、轮胎冲洗清洁、轮胎打蜡、边缝清洗、发动机舱清洗、车内清洗。"  maxlength="300" />
        </FormItem>
        <FormItem class="form-item" label="项目类型" prop="type">
          <ul class="itemTypes">
            <li v-for="(item,index) in itemTypes" :class="{'active': index === Number(formData.type)}" @click="toggleItemType(index)" :key="index">
              <i :class="['iconfont ', item.iconName]" style="font-size: 16px;margin-right: 8px;"></i>
              {{item.text}}
            </li>
          </ul>
        </FormItem>
        <FormItem class="form-item" label="介绍图" prop="introduceImgIds">
          <upload-img 
            :cover-tip="true"
            class="cover-img"
            v-model="formData.introduceImgIds"
            :maxCount="10"
            :headers="headers"
            :imgSize="250"
            :cutScale="[200, 200]"
            :isCut="true">
          </upload-img>
          <span class="tip">最多上传10张图，第一张图作为封面，拖拽更改顺序；</span>
        </FormItem>
        <div class="form-title">价格信息</div>
        <!-- 当项目类型不为保养的时候 -->
        <div v-if="Number(formData.type)!==2" key="itemType1">
          <FormItem class="form-item" label="项目价格" prop="price">
            <div class="self_formItemBox">
              <ul class="self_formItem">
                <li>
                  <div>
                    <format-input
                      prelen="2"
                      v-model="formData.price"
                      placeholder="请输入项目价格"
                      max="99999.99"
                      reg="PRECISION"
                    >
                      <span slot="append">元</span>
                    </format-input>
                  </div>
                </li>
                <li>
                  <span class="label">项目单位</span>
                  <div>
                    <i-select v-model="formData.unitId">
                      <Option v-for="item in itemUnit" :key="item._id" :value="item._id">{{item.name}}</Option>
                    </i-select>
                  </div>
                </li>
              </ul>
            </div>
          </FormItem>
          
        </div>
        <div v-else  key="itemType2">
          <FormItem class="form-item" label="定价方式" prop="priceModel">
            <RadioGroup v-model="formData.priceModel">
                <Radio v-for="item in pricingModeList" :key="item.value" :label="item.value">{{item.label}}</Radio>
            </RadioGroup>
          </FormItem>
          <!-- 根据定价方式显示不同的选项 -->
          <div v-if="formData.priceModel ==='0'" key="pricingMode1">
            <FormItem class="form-item" label="项目价格" prop="price">
              <div class="self_formItemBox">
                <ul class="self_formItem">
                  <li>
                    <div>
                      <format-input
                        prelen="2"
                        v-model="formData.price"
                        placeholder="请输入项目价格"
                        max="99999.99"
                        reg="PRECISION"
                      >
                        <span slot="append">元</span>
                      </format-input>
                    </div>
                  </li>
                  <li>
                    <span class="label">项目单位</span>
                    <div>
                      <i-select v-model="unitId">
                        <Option v-for="item in itemUnit" :key="item._id" :value="item._id">{{item.name}}</Option>
                      </i-select>
                    </div>
                  </li>
                </ul>
              </div>
            </FormItem>
          </div>
          <div v-else key="pricingMode2">
            <FormItem class="form-item self_form_item" label="车辆类型" :prop="'hierarchicalPrices['+index+']'" v-for="(item,index) in formData.hierarchicalPrices" :key="index">
              <div class="self_formItemBox">
                <ul class="self_formItem">
                  <li>
                    <div>
                      <i-select v-model="item.vehicleType" @on-change="formValidate">
                        <Option v-for="itemc in carType" :key="itemc.value" :value="itemc.value">{{itemc.label}}</Option>
                      </i-select>
                    </div>
                  </li>
                  <li>
                    <span class="label redLabel">项目价格</span>
                    <div>
                      <format-input
                        prelen="2"
                        v-model="item.price"
                        placeholder="请输入项目价格"
                        max="99999.99"
                        reg="PRECISION"
                      >
                        <span slot="append">元</span>
                      </format-input>
                    </div>
                  </li>
                  <li>
                    <span class="label">项目单位</span>
                    <div>
                      <i-select v-model="item.unitId">
                       <Option v-for="item in itemUnit" :key="item._id" :value="item._id">{{item.name}}</Option>
                      </i-select>
                    </div>
                    <span class="delBtn" v-if="index>0" @click="delGrade(index)">删除</span>
                  </li>
                </ul>
              </div>
            </FormItem>
            <FormItem>
              <span class="addCarType" @click="addCarType" v-show="showAddCarBtn">+新增车型价格</span>
            </FormItem>
          </div>
        </div>
      </Form>
    </div>
  </div>
</template>

<script>
import '@/styles/components/form.less';
import '@/styles/views/store/online-index.less'
import { storage } from '@/assets/js/utils';
import UploadImg from '@/components/upload-image';
export default {
  components: { UploadImg },
  props: {
    value: {
      type: Object
    }
  },
  watch: {
    value (val) {
      this.formData = JSON.parse(JSON.stringify(val))
      this.init()
    }
  },
  computed: {
    showAddCarBtn () {
       if (this.formData.hierarchicalPrices.length < this.carType.length) {
         return true
       } else {
         return false
       }
    }
  },
  data () {
    const that = this
    const validator = [
      { 
        required: true, trigger: 'blur', validator (rule, value, callback, source, options) {
          if (value.vehicleType === '' || value.price === '') {
            callback(new Error('请选择车辆类型或填写正确的项目价格'));
          }  else {
            callback()
          }
        }
      },
      { 
        required: true, trigger: 'change', validator (rule, value, callback, source, options) {
          let contain = []
          that.formData.hierarchicalPrices.map(item => {
            if (item.vehicleType && item.vehicleType === value.vehicleType) {
              contain.push(item.vehicleType)
            }
          })
          // console.log(contain.length)
          if (contain.length > 1) {
            callback(new Error('不能含有相同车辆类型'));
          } else {
            if (value.vehicleType === '' || value.price === '') {
              // console.log(value)
              callback(new Error('请选择车辆类型或填写正确的项目价格'));
            }  else {
              callback()
            }
          }
        }
      }
    ]
    return {
      stepList: ['基本信息', '图文详情'],
      headers: {
        Authorization: storage.get('TOKEN')
      },
      validator: validator,
      rules: {
        name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        profile: [{ required: true, message: '请输入项目简介', trigger: 'blur' }],
        type: [{ required: true,  message: '请选择项目类型', trigger: 'blur' }],
        introduceImgIds: [{ type: 'array', required: true, message: '请上传介绍图', trigger: 'change' }],
        price: [{ required: true, message: '请填写项目价格', trigger: 'blur' }],
        priceModel: [{ required: true, message: '请选择定价方式', trigger: 'blur' }],
        'hierarchicalPrices[0]': validator
      },
      itemTypes: [
        { text: '洗车', iconName: 'icon-icon_xiche' },
        { text: '美容', iconName: 'icon-icon_meirong' },
        { text: '保养', iconName: 'icon-icon_baoyang' },
        { text: '维修', iconName: 'icon-icon_weixiu' },
        { text: '其他', iconName: 'icon-icon_qita' }
      ],
      pricingModeList: [
        {
          value: '0',
          label: '统一定价'
        },
        {
          value: '1',
          label: '分级定价'
        },
      ],
      carType: [{label: '经济车型A类', value: '0'}, {label: '中端车型B类', value: '1'}, {label: '高端车型C类', value: '2'}],
      itemUnit: [],
      formData: {}

    }
  },

  mounted () {
    this.formData = JSON.parse(JSON.stringify(this.value))
    this.init()
  },
  
  methods: {
    init () {
      this.hierarchicalRuleInit()
      this.getServiceUnit()
    },
    toggleItemType (index) {
      this.formData.price = 0
      this.formData.unitId = ''
      this.formData.type = String(index)
    },
    addCarType () {
      if (this.formData.hierarchicalPrices.length < 3) {
        this.formData.hierarchicalPrices.push({
          vehicleType: '',
          price: 0,
          unitId: ''
        })
        const key = `hierarchicalPrices[${this.formData.hierarchicalPrices.length - 1}]`
        if (!this.rules[key]) {
          this.rules[key] = this.validator
        }
      }
    },
    hierarchicalRuleInit () {
      this.formData.hierarchicalPrices.map((item, index) => {
        const key = `hierarchicalPrices[${index}]`
        if (!this.rules[key]) {
          this.rules[key] = this.validator
        }
      })
    },
    delGrade (index) {
      this.formData.hierarchicalPrices.splice(index, 1)
    },
    async getServiceUnit () {
      try {
        let res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'getServiceUnit'
        });
        if ( Number(res.code) === 0 ) {
          this.itemUnit = res.data.rows
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },
    submit () {
      let returnResult = false
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          returnResult = this.formData
          this.$emit('input', this.formData)
        }
      })
      return returnResult
    },
    formValidate () {
      setTimeout(() => {
        this.$refs.formValidate.validate()
      }, 100)
    },
    asyncData () {
      this.$emit('input', this.formData)
    }
  }
}
</script>
