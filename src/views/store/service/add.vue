<template>
  <div class="service-add add-page">
    <saas-bread :title="breadName"></saas-bread>
    <Form
      ref="form"
      :model="formData"
      :rules="rules"
      label-position="top"
    >
      <div class="item-box search_box">
        <div class="search_contentBox">
          <i
            class="iconfont icon-sousuo"
            @click="onClickIcon"
          ></i>
          <Input
            v-model="serviceName"
            :maxlength="30"
            @on-focus="showSearchList=true"
            placeholder="输入项目名称"
            @on-change="search"
            @on-blur="onSearchBlur"
            ref="searchInput"
          />
          <div
            class="searchResult"
            v-show="showSearchList"
          >
            <ul v-if="searchResult.length>0">
              <li
                v-for="(item,index) in searchResult"
                :key="index"
                @click="selectObject(index)"
              >{{item.serviceName}}</li>
            </ul>
            <div
              v-else
              class="noResult"
            >暂无搜索结果</div>
            <Spin
              fix
              v-if="spinShow"
            ></Spin>
          </div>
        </div>

      </div>
      <div class="item-box">
        <FormItem
          label="项目名称"
          prop="serviceName"
        >
          <Input
            v-model="formData.serviceName"
            :maxlength="30"
            placeholder="输入项目名称"
          />
        </FormItem>
        <FormItem
          label="项目类别"
          prop="code"
        >
          <div
            class="service-type"
            v-if="permiss.create"
          >
            <span>找不到项目类别？</span>
            <span @click="showCateDialog"><i class="iconfont icon-xinzeng"></i>新增项目类别</span>
          </div>
          <Cascader
            :data="codeData"
            v-model="formData.code"
            placeholder="选择项目类别"
          ></Cascader>
        </FormItem>
        <FormItem
          label="定价方式"
          prop="pricingType"
        >
          <Select v-model="formData.pricingType">
            <Option
              v-for="item in pricingMode"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem
          label="项目价格"
          prop="cost"
          v-if="formData.pricingType === 'A'"
        >
          <format-input
            prelen="2"
            v-model="formData.cost"
            placeholder="输入项目价格，输入数字，如：100"
            reg="PRECISION"
          >
            <span slot="append">元</span>
          </format-input>
          <!-- <i-input v-model="formData.cost" 
            placeholder="输入项目价格，输入数字，如：100">
            <span slot="append">元</span>
          </i-input> -->
        </FormItem>
      </div>
      <!-- <div :class="['item-box', {'half': formData.pricingType !== 'A'}]">
        <FormItem label="定价方式" prop="pricingType">
          <Select v-model="formData.pricingType">
            <Option v-for="item in pricingMode" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="项目价格" prop="cost" v-if="formData.pricingType === 'A'">
          <format-input 
            prelen="2"
            v-model="formData.cost"  
            placeholder="输入项目价格，输入数字，如：100"
            reg="PRECISION">
            <span slot="append">元</span>
          </format-input>
          <i-input v-model="formData.cost" 
            placeholder="输入项目价格，输入数字，如：100">
            <span slot="append">元</span>
          </i-input> 
        </FormItem>
      </div> -->
      <div
        class="item-box"
        v-if="formData.pricingType === 'B'"
        style="width:50%;"
      >
        <FormItem
          label="标准工时"
          prop="hours"
        >
          <format-input
            prelen="1"
            v-model="formData.hours"
            placeholder="输入标准工时，输入数字，如：1"
            reg="PRECISION"
          >
            <span slot="append">小时</span>
          </format-input>
          <!-- <i-input v-model="formData.hours" 
            placeholder="输入标准工时，输入数字，如：1">
            <span slot="append">小时</span>
          </i-input> -->
        </FormItem>
        <FormItem
          label="工时单价"
          prop="price"
        >
          <format-input
            prelen="2"
            v-model="formData.price"
            placeholder="输入工时单价，输入数字，如：1"
            reg="PRECISION"
          >
            <span slot="append">元/小时</span>
          </format-input>
          <!-- <i-input v-model="formData.price" 
            placeholder="输入工时单价，输入数字，如：1">
            <span slot="append">元/小时</span>
          </i-input> -->
        </FormItem>
      </div>
      <div
        class="item-box"
        style="width:50%;"
      >
        <FormItem
          label="成本价格"
          prop="tPrice"
        >
          <format-input
            prelen="2"
            v-model="formData.tPrice"
            placeholder="输入成本价格，输入数字，如：100"
            reg="PRECISION"
          >
            <span slot="append">元</span>
          </format-input>
          <!-- <i-input v-model="formData.tPrice" 
            placeholder="输入成本价格，输入数字，如：100">
            <span slot="append">元</span>
          </i-input> -->
        </FormItem>
        <FormItem
          label="备注"
          prop="remark"
        >
          <Input
            v-model="formData.remark"
            placeholder="输入备注"
          />
        </FormItem>
      </div>
    </Form>
    <bottom-submit
      @on-cancel="$router.go(-1)"
      @on-confirm="submit"
      @on-click="onFooterClick"
      :btnList="btnList"
      :loading="btnLoading"
    >
    </bottom-submit>
    <cate-admin-dialog
      type="项目"
      ref="cateDialog"
      request="serviceCate"
      :lists="serviceCategory"
      @on-cancal="getCateList"
      @on-ok="getCateList"
    >
    </cate-admin-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { pricingMode } from '@/store/json/default'
import { formVerify, Debounce } from '@/assets/js/utils.js';
import CateAdminDialog from '@/components/dialog/cate-admin-dialog'
import '@/styles/views/store/service-add.less'

export default {
  components: { CateAdminDialog },
  data () {
    let { settingService } = this.$permission.data
    return {
      permiss: settingService,
      pricingMode,
      id: this.$route.params.id,
      breadName: '新增服务项目',
      btnLoading: false,
      formData: {
        pricingType: 'A'
      },
      rules: {
        serviceName: [
          {
            required: true,
            message: '服务名称不能为空',
            trigger: 'blur',
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              if (this.id !== 'create') {
                return callback()
              }
              this.$store
                .dispatch({
                  type: 'checkServiceName',
                  params: {
                    serviceName: value
                  }
                })
                .then(res => {
                  if (res.code !== '0') {
                    rules.message = '该服务名称已存在'
                    return callback(rules.message)
                  }
                  callback()
                })
                .catch(err => {
                  callback()
                })
            }
          }
        ],
        code: [
          {
            required: true,
            message: '请选择项目类别',
            trigger: 'change',
            type: 'array'
          }
        ],
        cost: [
          { required: true, message: '请输入项目价格', trigger: 'blur' },
          {
            trigger: 'blur',
            reg: 'NUMBER_SECOND',
            formatTip: '请输入正确的数字，至多保留2位小数',
            validator: formVerify.format
          }
        ],
        hours: [
          { required: true, message: '请输入标准工时', trigger: 'blur' },
          {
            trigger: 'blur',
            reg: 'NUMBER_DOT',
            formatTip: '请输入正确的数字，至多保留1位小数',
            validator: formVerify.format
          }
        ],
        price: [
          { required: true, message: '请输入工时单价', trigger: 'blur' },
          {
            trigger: 'blur',
            reg: 'NUMBER_SECOND',
            formatTip: '请输入正确的数字，至多保留2位小数',
            validator: formVerify.format
          }
        ],
        tPrice: [
          {
            trigger: 'blur',
            formatTip: '请输入正确的数字，至多保留2位小数',
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              if (value && !/^\d+\.?\d{0,2}$/.test(value)) {
                callback(rules.formatTip)
              } else {
                callback()
              }
            }
          }
        ]
      },
      codeData: [],
      showSearchList: false,
      spinShow: false,
      btnList: [
        // {
        //   type: 'error',
        //   text: '新建服务项目'
        // }
      ],
      serviceName: '',
      searchResult: [],
      debounce: null
    }
  },

  created () {
    this.getCateList()
    this.debounce = new Debounce(this.searchFn)
  },

  watch: {
    detailData (to) {
      this.formData = to
      this.transformCode()
    },

    serviceCategory (value) {
      if (value) {
        this.codeData = value
        this.codeData.forEach((item, index) => {
          item.value = item.code
          item.label = item.name
          if (item.children) {
            item.children.forEach(citem => {
              citem.value = citem.code
              citem.label = citem.name
              if (citem.children) {
                citem.children.forEach(titem => {
                  titem.value = titem.code
                  titem.label = titem.name
                })
              }
            })
          }
        })
      }
    }
  },
  mounted () {
    if (this.$route.params.id !== 'create') {
      this.breadName = '编辑服务项目'
      this.getDetail()
    }
  },

  methods: {
    getDetail () {
      this.$store.dispatch({
        type: 'toGetServiceDetail',
        params: {
          serviceId: this.id
        }
      })
    },

    showCateDialog () {
      this.$refs.cateDialog.openModel()
    },

    getCateList () {
      this.$store.dispatch({
        type: 'toGetServiceCateList'
      })
    },

    async searchFn () {
      this.spinShow = true
      this.showSearchList = true
      const params = {
        serviceName: this.serviceName,
        getAll: true
      }
      try {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'serviceList',
          params: params
        })
        if (Number(res.code) === 0) {
          this.searchResult = res.data.rows
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.spinShow = false
    },

    search () {
      this.debounce.debounce()
    },

    onSearchBlur () {
      setTimeout( () => { this.showSearchList = false }, 200)
    },

    selectObject (index) {
      let obj = this.searchResult[index]
      this.formData = JSON.parse(JSON.stringify(obj))
      this.transformCode()
    },

    // 转换code
    transformCode () {
      let code = this.formData.code
      if (!code) return
      let arr = []
      if (
        Object.prototype.toString.call(this.formData.code) !== '[object Array]'
      ) {
        if (code.indexOf('#') != -1) {
          // 兼容新旧code，聪哥24个字母的锅
          code = code.split('#')
          arr.push('#' + code[1])
          if (code[2]) {
            arr.push('#' + code[1] + '#' + code[2])
            if (code[3]) {
              arr.push('#' + code[1] + '#' + code[2] + '#' + code[3])
            }
          }
        } else {
          code = code.split('')
          arr.push(code[0])
          if (code[1]) {
            arr.push(code[0] + code[1])
            if (code[2]) {
              arr.push(code[0] + code[1] + code[2])
            }
          }
        }
      } else {
        arr = code
      }
      this.formData.code = arr
    },

    onClickIcon () {
      this.$refs.searchInput.focus()
      this.search()
    },

    onFooterClick (index) {
      const that = this
      if (index === 0) {
        this.submitFn(function () {
          that.$router.go(0)
        })
      }
    },

    submit () {
      const that = this
      this.submitFn(function () {
        that.$router.push('/store/service/list')
      })
    },

    submitFn (fn) {
      this.$refs.form.validate(bol => {
        if (bol) {
          this.btnLoading = true
          let request = 'addService'
          let tip = '添加'
          if (this.$route.params.id !== 'create') {
            request = 'updateService'
            tip = '更新'
          }

          const formData = Object.assign({}, this.formData)
          if (formData.code) formData.code = formData.code.pop()
          if (!formData.tPrice) delete formData.tPrice
          if (formData.pricingType === 'A') {
            delete formData.hours
            delete formData.price
          } else {
            delete formData.cost
          }
          this.$store
            .dispatch({
              type: request,
              params: formData
            })
            .then(res => {
              if (res.code === '0') {
                this.$Message.success({
                  content: tip + '成功',
                  onClose: () => {
                    fn()
                    this.btnLoading = false
                  }
                })
              } else {
                this.$Message.error(tip + '失败')
                this.btnLoading = false
              }
            })
            .catch(err => {
              this.btnLoading = false
            })
        }
      })
    }
  },
  computed: {
    ...mapGetters({
      detailData: 'getServiceDetail',
      serviceCategory: 'getServiceCateList'
    })
  }
}
</script>
