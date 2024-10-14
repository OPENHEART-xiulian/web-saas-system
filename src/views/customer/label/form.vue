<template>
  <!-- 新增编辑客户标签 -->
  <div class="customer-label-form">
    <saas-bread :title="breadName"></saas-bread>
    <i-form 
      class="w-form-wrap" 
      ref="form" 
      :model="formData" 
      :rules="rules" 
      :label-width="106" 
      label-position="left" 
      @submit.native.prevent
      style="position: relative;">
      <i-form-item label="标签名称" prop="name">
        <i-input class="form-item-input" v-model="formData.name"></i-input>
      </i-form-item>
      <i-form-item label="标签类型" prop="matchType">
        <RadioGroup class="block form-item-group" v-model="formData.type" @on-change="onTypeChange">
          <Radio label="0">条件标签</Radio>
          <Radio label="1">手动标签</Radio>
        </RadioGroup>
        <RadioGroup class="block form-item-group" v-model="formData.matchType" v-if="formData.type === '0'">
          <Radio label="or">满足任意一个被选中的条件即可</Radio>
          <Radio label="and">必须满足所有被选中的条件</Radio>
        </RadioGroup>
      </i-form-item>
      <div class="form-item-bg" v-if="formData.type === '0' && !loading">
        <i-form-item label="基础条件">
          <div class="form-item-row flex">
            <Checkbox v-model="formData.beCustom.enable">成为客户时间</Checkbox>
            <Select class="form-item-select" v-model="formData.beCustom.days" :disabled="!formData.beCustom.enable">
              <Option v-for="(item, index) in timeSelectData" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
          </div>
          <div class="flex">
            <Checkbox  v-model="formData.beMember.enable">成为会员时间</Checkbox>
            <Select class="form-item-select" v-model="formData.beMember.days" :disabled="!formData.beMember.enable">
              <Option v-for="(item, index) in timeSelectData" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
          </div>
        </i-form-item>
        <i-form-item label="交易条件">
          <div class="form-item-row flex">
            <Checkbox  v-model="formData.consume.enable">最近消费时间</Checkbox>
            <Select class="form-item-select" v-model="formData.consume.days" :disabled="!formData.consume.enable">
              <Option v-for="(item, index) in timeSelectData" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
          </div>
          <div class="form-item-row flex">
            <Checkbox  v-model="formData.consumeTimes.enable">消费次数</Checkbox>
            <Select class="form-item-select" v-model="formData.consumeTimes.days" :disabled="!formData.consumeTimes.enable">
              <Option v-for="(item, index) in timeSelectData" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
            <format-input v-model="formData.consumeTimes.numFrom" :disabled="!formData.consumeTimes.enable"><span slot="append">次</span></format-input>
            <span class="h-line"></span>
            <format-input v-model="formData.consumeTimes.numTo" :disabled="!formData.consumeTimes.enable"><span slot="append">次</span></format-input>
          </div>
          <div class="form-item-row flex">
            <Checkbox  v-model="formData.consumePrice.enable">消费金额</Checkbox>
            <Select class="form-item-select" v-model="formData.consumePrice.days" :disabled="!formData.consumePrice.enable">
              <Option v-for="(item, index) in timeSelectData" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
            <format-input v-model="formData.consumePrice.numFrom" :disabled="!formData.consumePrice.enable"><span slot="append">元</span></format-input>
            <span class="h-line"></span>
            <format-input v-model="formData.consumePrice.numTo" :disabled="!formData.consumePrice.enable"><span slot="append">元</span></format-input>
          </div>
          <div class="flex">
            <Checkbox  v-model="formData.orderAvgPrice.enable">工单均价</Checkbox>
            <Select class="form-item-select" v-model="formData.orderAvgPrice.days" :disabled="!formData.orderAvgPrice.enable">
              <Option v-for="(item, index) in timeSelectData" :key="index" :value="item.value">{{item.label}}</Option>
            </Select>
            <format-input v-model="formData.orderAvgPrice.numFrom" :disabled="!formData.orderAvgPrice.enable"><span slot="append">元</span></format-input>
            <span class="h-line"></span>
            <format-input v-model="formData.orderAvgPrice.numTo" :disabled="!formData.orderAvgPrice.enable"><span slot="append">元</span></format-input>
          </div>
        </i-form-item>
      </div>
      <i-form-item class="form-item-submit">
        <i-button type="error" @click="submit" :loading="btnLoading">确定</i-button>
        <i-button type="default" @click="goBack">取消</i-button>
      </i-form-item>
      <Spin v-if="loading" fix></Spin>
    </i-form>
  </div>
</template>

<script>
  import '@/styles/components/form.less';
  import '@/styles/views/customer/label-form.less';
  import { timeSelectData } from '@/store/json/default.js';
  export default {
    data () {
      return {
        isCreate: true,
        breadName: '新增标签',
        timeSelectData,
        loading: false,
        btnLoading: false,
        formData: {},
        rules: {
          name: [{ required: true, message: '标签名称不能为空' }],
          matchType: [{ required: true, message: '标签名称不能为空' }]
        }
      }
    },

    created () {
      this.initFormData();
      const id = this.$route.params.id;
      this.isCreate = id === 'create';
      if (!this.isCreate) {
        this.breadName = '编辑标签';
        this.getData(id);
      }
    },

    methods: {
      initFormData (data) {
        let formData = {
          name: '',             // 标签名称
          type: '0',            // 标签类型
          matchType: 'or',      // 标签条件
          enable: false,        // 是否启用
          beCustom: {           // 成为客户
            enable: false,
            days: '',
          },
          beMember: {           // 成为会员
            enable: false,
            days: '',           // 最近N天，负数为无限制
          },
          consume: {       // 最近消费时间
            enable: false,
            days: '',           // 最近N天，负数为无限制
          },
          consumeTimes: {       // 消费次数
            enable: false,
            days: '',           // 最近N天，负数为无限制
            numFrom: '',        // 根据实际，次数或金额
            numTo: '',
          },
          consumePrice: {       // 消费金额
            enable: false,
            days: '',           // 最近N天，负数为无限制
            numFrom: '',        // 根据实际，次数或金额
            numTo: '',
          },
          orderAvgPrice: {      // 工单均价
            enable: false,
            days: '',           // 最近N天，负数为无限制
            numFrom: '',        // 根据实际，次数或金额
            numTo: '',
          }
        };
        this.formData = Object.assign(formData, data || {});
      },
      getData (id) {
        this.loading = true;
        this.$store.dispatch({
          type: 'toGetCustomerTagDetail',
          params: {
            _id: id
          }
        }).then(res => {
          if (res.code === '0') {
            this.setDefaultData(res.data);
          }
          this.loading = false;
        }).catch(e => {
          this.loading = false;
        })
      },

      goBack () {
        this.$router.go(-1);
      },

      onTypeChange (v) {
        console.log(v)
        this.initFormData(this.formData);
      },

      submit () {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.save();
          }
        });
      },

      save () {
        this.btnLoading = true;
        let params = this.formatFormData();
        this.$store.dispatch({
          type: 'toGetCustomerTagSave',
          params
        }).then(res => {
          if (res.code === '0') {
            this.$Message.success({
              content: '保存成功',
              onClose: () => {
                this.$router.push('/customer/label');
                this.btnLoading = false;
              }
            });
          } else {
            this.btnLoading = false;
          }
        }).catch(error => {
          this.btnLoading = false;
        });
      },

      setDefaultData (data) {
        let formData = data;
        for (let key in formData) {
          let item = formData[key];
          if (item instanceof Object) {
            formData[key] = {};
            formData[key].days = (!item.days && item.days != 0) ? '' : item.days;
            formData[key].enable = item.enable || false;
            formData[key].numFrom = item.numFrom === -1 ? '' : item.numFrom;
            formData[key].numTo = item.numTo === -1 ? '' : item.numTo;
          } else {
            formData[key] = item;
          }
        }
        this.formData = formData;
      },

      formatFormData () {
        let formData = JSON.parse(JSON.stringify(this.formData));
        for (let key in formData) {
          let item = formData[key];
          if (item instanceof Object) {
            formData[key] = {};
            formData[key].days = item.days;
            formData[key].enable = item.enable;
            // if (item.enable) {
              formData[key].numFrom = item.numFrom || -1;
              formData[key].numFrom = Number(formData[key].numFrom);
              formData[key].numTo = item.numTo || -1;
              formData[key].numTo = Number(formData[key].numTo);
            // }
          } else {
            formData[key] = item;
          }
        }
        if (formData.type === '1') {
          let data = {
            name: formData.name,
            type: formData.type,
          }
          if (formData._id) data._id = formData._id;
          return data;
        }
        return formData;
      }
    }
  }
</script>
