<template>
  <div class="health-page">
    <saas-bread title="健康档案">
      <template slot="actions" v-if="isSet === false">
        <Button type="default" @click="toBusiness">注册汽车维修电子健康档案</Button>
      </template>
    </saas-bread>
    <div v-if="isSet === false" class="content">
      <Alert type="warning" show-icon>绑定健康档案系统账号，维修记录将在工单结算出厂后自动上传到汽车维修电子健康档案系统。</Alert>
      <!-- <p class="tip">
        <i class="iconfont icon-gantan"></i>
        提示：绑定健康档案系统账号，维修记录将在工单结算后自动上传到汽车维修电子健康档案系统。
      </p> -->
      <Form  ref="form" class="w-form" :model="formData" :rules="rules" :label-width="80">
        <FormItem label="区域">
          <div class="area-container">
            <Select v-model="formData.provinceCode" @on-change="provinceChange">
              <Option v-for="(item) in provinceList" :value="item.value" :key="item.value">{{ item.name }}</Option>
            </Select>
            <Select v-model="formData.cityCode" v-if="cityList.length">
              <Option v-for="(item) in cityList" :value="item.value" :key="item.value">{{ item.name }}</Option>
            </Select>
          </div>
        </FormItem>
        <FormItem label="账号" prop="eRecordAccount">
          <Input type="text" v-model="formData.eRecordAccount" :disabled="isSet"/>
        </FormItem>
        <FormItem label="密码" prop="eRecordPwd">
          <Input :type="type" v-model="formData.eRecordPwd" 
            @on-focus="type='password'" :disabled="isSet"/>
        </FormItem>
        <FormItem>
          <Button v-if="!isSet" type="primary" :loading="loading" @click="submit">确定绑定</Button>
          <!-- <Button v-else type="primary" :loading="loading" @click="unSet">解除绑定</Button> -->
        </FormItem>
      </Form>
    </div>
    <!-- <div  class="content"> -->
      <!-- <p class="tip">
        <i class="iconfont icon-wancheng-fill" style="color: rgb(38, 222, 1);"></i>
        健康档案系统账号已成功绑定，维修记录将在工单结算后自动上传到汽车维修电子健康档案系统。
      </p> -->
      <div v-if="isSet" class="detail">
        <Alert type="success" show-icon>健康档案系统账号已成功绑定，维修记录将在工单结算出厂后自动上传到汽车维修电子健康档案系统。</Alert>
        <div class="item">
          <span>企业:</span>
          <span>{{formData.eRecordCompanyName}}</span>
        </div>
        <div class="item">
          <span>账号:</span>
          <span>{{formData.eRecordAccount}}</span>
        </div>
        <div class="item">
          <span>密码:</span>
          <span>{{formData.eRecordPwd}}</span>
        </div>
        <div class="item" v-if="showUnsetBtn">
          <Button type="default" :loading="loading" @click="showUnsetDialog">解除绑定</Button>
        </div>
        <Spin fix v-if="conLoading"></Spin>
      </div>
      <div v-if="isSet" class="title">健康档案上传记录</div>
      <w-table
        v-if="isSet"
        ref="table"
        request="erecordList"
        :auto-init="false"
        :columns="columns"
        :tableData="tableData">
        <!-- :formData="formData"
        :params="params"> -->
      </w-table>
    <!-- </div> -->
    <remind-dialog 
      ref="remindDialog"
      :title="title"
      :content="content"
      :show-cancel="showCancel"
      @on-ok="remindOk">
    </remind-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { BUSINESS_CITY_DATA } from '@/store/mutation-types';
import { getCountyList } from '@/store/json/city';
import RemindDialog from '@/components/dialog/remind-dialog';
import '@/styles/components/form.less';
import '@/styles/views/store/health.less';
import {formVerify, formatTime, storage} from '@/assets/js/utils.js';
import { BUSINESS } from '@/https/api.js';
export default {
  components: { RemindDialog },
  data () {
    return {
      store: {},
      title: '',
      content: '',
      showCancel: true,
      conLoading: false,
      loading: false,
      showUnsetBtn: true,
      isSet: '',           // 是否已绑定
      type: 'text',
      provinceList: [],
      cityList: [],
      formData: {
        eRecordAccount: '',
        eRecordPwd: '',
        provinceCode: "",
        cityCode: ""
      },
      rules: {
        eRecordAccount: [
          {
            required: true, 
            // message: '请输入道路运输经营许可证号或手机号或登录ID', 
            message: '请输入道路运输经营许可证号或手机号或登录ID或备案号', 
            // reg: 'USERNAME',
            // formatTip: '请输入正确的道路运输经营许可证号或手机号',
            trigger: 'blur', 
            // validator: formVerify.format 
          }
        ],
        eRecordPwd: [
          {
            required: true, 
            message: '请输入密码',
            trigger: 'blur'
          }
        ]
      },
      columns: [
        { title: '序号', type: 'index', width: 65 },
        { title: '结算单号', key: 'statementNo' },
        { title: '车架号 / VIN码', key: 'VINCode' },
        { title: '车牌号', key: 'plateNo' },
        { 
          title: '送修日期', 
          key: 'deliveryDate',
          // render: (h, { row }) => {
          //   return h('span', row.deliveryDate ? formatTime(row.deliveryDate, 'yyyy-MM-dd') : '')
          // }
        },
        { 
          title: '结算日期', 
          key: 'settlementDate',
          // render: (h, { row }) => {
          //   return h('span', row.settlementDate ? formatTime(row.settlementDate, 'yyyy-MM-dd') : '')
          // }
        },
        { 
          title: '上传日期', 
          key: 'created',
          // render: (h, { row }) => {
          //   return h('span', row.created ? formatTime(row.created, 'yyyy-MM-dd') : '')
          // }
        },
        { 
          title: '操作', 
          render: (h, { row }) => {
            if (!this.$permission.data.worker.admin) return h("span", "--");
            return h('i-button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.$router.push('/store/health/detail/' + row.id);
                }
              }
            }, '查看上传详情')
          }
        },
      ]
    }
  },

  mounted () {
    this.init();
  },
  
  methods: {
    async init () {
      this.conLoading = true;
      const res = await this.$store.dispatch('toGetErecord');

      this.store = storage.get('STORE');
      this.formData.provinceCode = this.store.provinceCode;
      this.formData.cityCode = this.store.cityCode;
      // if (this.formData.cityCode == '370200') this.showUnsetBtn = false;
      if (res.code === '0') {
        this.isSet = true;
        this.formData.eRecordAccount = res.data.eRecordAccount;
        this.formData.eRecordCompanyName = res.data.eRecordCompanyName;
        this.formData.eRecordPwd = "******";
        // if (res.data.cityCode == '370200') this.showUnsetBtn = false;
        this.$nextTick(() => {
          this.$refs.table.init();
        })
      } else {
        this.isSet = false;
        this.setCityData(this.busindessCityData);
      }
      
      this.conLoading = false;
    },
    submit () {
      this.$refs.form.validate( async valid => {
        if (valid) {
          this.loading = true;
          const res = await this.$store.dispatch({
            type: 'erecordSet',
            params: this.formData
          })

          if (res.code === '0') {
            this.$Message.success({
              content: '账号绑定成功',
              onClose: () => {
                this.store.eRecordAccount = this.formData.eRecordAccount;
                // this.store.provinceCode = this.formData.provinceCode;
                // this.store.cityCode = this.formData.cityCode;
                // console.log(getCountyList(this.formData.cityCode))
                // this.store.countyCode = getCountyList(this.formData.cityCode)[0];
                storage.set('STORE', this.store);
                this.isSet = true;
                this.loading = false;
                this.formData.eRecordPwd = "******";
                this.init();
                this.$store.commit("setIsBussiness", true);
              }
            })
          } else {
            this.$Message.error({
              content: res.msg,
              onClose: () => {
                this.loading = false;
              }
            })
          }
        }
      })
    },
    showUnsetDialog () {
      this.title = '解除绑定电子健康账号';
      this.content = '解除绑定后，维修记录将不再自动上传到汽车维修电子健康档案系统！';
      this.showCancel = true;
      this.$refs.remindDialog.openModal();
    },
    async unSet () {
      // this.$refs.form.validate( async valid => {
        // if (valid) {
          this.loading = true;
          const res = await this.$store.dispatch({
            type: 'erecordUnset',
            params: this.formData
          })

          if (res.code === '0') {
            this.$Message.success({
              content: '账号解除绑定成功',
              onClose: () => {
                const store = storage.get('STORE');
                store.eRecordAccount = '';
                storage.set('STORE', store);
                this.formData.eRecordAccount = '';
                this.formData.eRecordPwd = '';
                this.isSet = false;
                this.loading = false;
                this.setCityData(this.busindessCityData);
                this.$store.commit("setIsBussiness", false);
              }
            });
          } else {
            this.loading = false;
          }
        // }
      // })
    },
    toBusiness () {
      window.open(BUSINESS);
    },
    remindOk () {
      if (this.showCancel) this.unSet();
      this.$refs.remindDialog.onCancel();
    },

    provinceChange (provinceCode) {
      let province = this.getCityList(this.provinceList, provinceCode);
      this.cityList = province.children;
      this.formData.cityCode = this.cityList[0] ? this.cityList[0].value : "";
    },

    setCityData ({ store, data }) {
      let { provinceCode, cityCode } = store;
      this.provinceList = data;
      let province = this.getCityList(data, provinceCode);
      this.cityList = province.children;
      this.formData.provinceCode = province.value;
      let city = this.getCityList(this.cityList, cityCode);
      this.formData.cityCode = city.value;
    },

    getCityList (list, code) {
      let data = list.find(elm => elm.value == code) || list[0] || {};
      return {
        children: data.children || [],
        name: data.name || "",
        value: data.value || ""
      }
    },
  },
  computed: {
    ...mapGetters({
      tableData: 'getTableData',
      busindessCityData: BUSINESS_CITY_DATA
    })
  }
}
</script>
<style lang="less" scoped>
/deep/ .ivu-form-item-error-tip {
    position: absolute;
    top: 100%;
    left: 0;
    line-height: 1;
    padding-top: 6px;
    color: #F22D00;
    font-size: 12px;
}
</style>

