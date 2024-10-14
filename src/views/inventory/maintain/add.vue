<template>
  <!-- 添加编辑配件 -->
  <div class="maintain-add add-page">
    <saas-bread :title="breadName"></saas-bread>
    <Form ref="form" class="w-form" label-position="top" :model="formData" :rules="rules" >
      <FormItem label="原厂编码" prop="partFactoryNo">
        <Input v-model="formData.partFactoryNo" :maxlength="20" />
      </FormItem>
      <FormItem label="配件名称" prop="partName">
        <Input v-model="formData.partName" />
      </FormItem>
      <FormItem label="配件分类" prop="code">
        <div class="cate-tip" v-if="inventoryMaintain.category">
          找不到类别？
          <i class="iconfont icon-xinzeng"></i>
          <span @click="showCateDialog">新增类别</span>
        </div>
        <Cascader :data="lists" size="large" v-model="formData.code"></Cascader>
      </FormItem>
      <FormItem label="配件单位" prop="unit">
        <Select v-model="formData.unit" placeholder="请选择">
          <Option v-for="(item, index) in unit" 
            :value="item.unit"
            :key="index">{{ item.name }}</Option>
        </Select>
      </FormItem>
      <FormItem label="零售价" prop="retailPrice">
        <format-input 
          v-model="formData.retailPrice"  
          reg="PRECISION" 
          placeholder="输入数字，如：100">
          <span slot="append">元</span>
        </format-input>
      </FormItem>
      <!-- <FormItem class="line" style="width: 100%"></FormItem> -->
      
      <FormItem label="进货价" prop="purchasePrice">
        <format-input v-model="formData.purchasePrice"  reg="PRECISION" placeholder="输入数字，如：100">
          <span slot="append">元</span>
        </format-input>
      </FormItem>
      <FormItem label="配件品牌" prop="brand">
        <i-input v-model="formData.brand"></i-input>
      </FormItem>

      <!-- 预警提示 -->
      <div style="width: 100%; margin-bottom: 20px">
        <Poptip trigger="hover" placement="bottom-start" width="438" :offset="-18" word-wrap class="saas-poptip">
          <i class="iconfont icon-bg-wenhao"></i>
          <div slot="title">
            <i class="iconfont icon-bg-wenhao"></i>
            库存预警
          </div>
          <div slot="content">设置库存上限和库存下限后，当前配件库存低于下限，或者高于上限时，会在「配件库存」中提示。</div>
        </Poptip>
        <span class="title">预警提示</span>
        <Switch size="default" v-model="formData.isWarning" true-value="0" false-value="1" style=" position: relative; top: -1px; margin-left: 10px">
          <!-- <span slot="open">开启</span>
          <span slot="close">关闭</span> -->
        </Switch>
        <span v-if="formData.isWarning == 0" style="font-size: 14px; color: #ff8800;">开启</span>
        <span v-else style="font-size: 14px; color: #8D847A;">关闭</span>
      </div>

      <template v-if="formData.isWarning == 0">
        <!-- 库存下限 -->
        <FormItem label="库存下限" prop="startCountWarning">
          <format-input v-model="formData.startCountWarning" :min="0" :max="999" reg="PRECISION" placeholder="请输入库存下限" @on-blur="countWatning('endCountWarning')">
            <span slot="append">个</span>
          </format-input>
        </FormItem>
        
        <!-- 库存上限 -->
        <FormItem label="库存上限" prop="endCountWarning">
          <format-input v-model="formData.endCountWarning" :min="0" :max="999" reg="PRECISION" placeholder="请输入库存上限" @on-blur="countWatning('startCountWarning')">
            <span slot="append">个</span>
          </format-input>
        </FormItem>
        <FormItem  class="wid-50"></FormItem>
      </template>

      <FormItem label="关键字" prop="keywords" class="wid-50">
        <tag-input v-model="formData.keywords" :max="5" placeholder="如：奥迪、雨刷、刹车片（输入后点击回车，最多5个）"></tag-input>
      </FormItem>
      <FormItem  class="width-50"></FormItem>
      <FormItem label="备注" prop="remark" class="wid-50">
        <i-input type="textarea" v-model="formData.remark"></i-input>
      </FormItem>
      <FormItem label="配件照片" style="width: 100%">
        <upload-img 
          v-model="formData.imgIds"
          :max-count="1"
          :headers="headers"
          :cutScale="[1, 1]">
        </upload-img>
      </FormItem>
    </Form>
    <bottom-submit 
      @on-cancel="$router.go(-1)" 
      @on-confirm="submit"
      :loading="btnLoading">
    </bottom-submit>
    <cate-admin-dialog
      type="配件"
      ref="cateDialog"
      request="repairCate"
      :lists="lists"
      @on-cancal="getCateList"
      @on-ok="getCateList">
    </cate-admin-dialog>
  </div>
</template> 

<script>
import TagInput from '@/components/tag-input';
import { mapGetters } from 'vuex';
import UploadImg from '@/components/upload-image';
import CateAdminDialog from '@/components/dialog/cate-admin-dialog';
import { storage, formVerify } from '@/assets/js/utils.js';
import { mainClass } from '@/store/json/default';
import '@/styles/views/store/maintain-add.less';
import '@/styles/components/form.less';

export default {
  components: { TagInput, UploadImg, CateAdminDialog },
  data () {
    let { inventoryMaintain } = this.$permission.data;
    let countWarningValid = (rules, value, callback) => {
      let formData = this.formData;
      if (Number(formData.startCountWarning >= Number(formData.endCountWarning))) {
        return callback(rules.message);
      }
      callback();
    }
    return {
      inventoryMaintain,
      id: this.$route.query.partNo,
      headers: {
        Authorization: storage.get('TOKEN')
      },
      btnLoading: false,    
      breadName: '新建维修配件',
      formData: {
        partName: '',           // 配件名称
        code: [],               // 配件分类
        unit: '',               // 配件单位
        quantity: '0',          // 库存的剩余数量 默认0
        retailPrice: '',        // 零售价
        brand: '',              // 配件品牌
        purchasePrice: '',      // 进货价
        keywords: [],           // 关键词
        remark: '',             // 备注
        imgIds: [],             // 图片列表
        isWarning: "1",         // 是否预警 0->预警  1->非预警
        startCountWarning: "1", // 库存下限
        endCountWarning: "99",  // 库存上限
      },
      rules: {
        partName: [{ required: true, message: '请输入配件名称', trigger: 'blur' }],
        unit: [{ required: true, message: '请选择配件单位', trigger: 'change' }],
        retailPrice: [
          { required: true, message: '请输入零售价', trigger: 'blur' },
          { 
            trigger: 'blur',
            reg: 'NUMBER_SECOND',
            formatTip: '请输入正确的数字，至多保留2位小数',
            validator: formVerify.format
          }
        ],
        startCountWarning: [
          { required: true, message: '请输入库存下限', trigger: 'blur' },
          { 
            trigger: 'blur',
            message: "“库存上限”不能低于“库存下限”",
            validator: countWarningValid
          }
        ],
        endCountWarning: [
          { required: true, message: '请输入库存上限', trigger: 'blur' }
        ],
        purchasePrice: [
          { 
            trigger: 'blur',
            formatTip: '请输入正确的数字，至多保留2位小数',
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              if (value && !/(^[1-9]\d*\.?\d{0,2}$)|(^0(\.\d{1,2})?$)/.test(value)) {
                callback(rules.formatTip);
              } else {
                callback();
              }
            }
          }
        ],
        code: [
          { required: true, message: '请选择配件类别', trigger: 'change', type: 'array' }
        ],
      },
      subClass: [],
      mainClass: mainClass,
      unit: []
    }
  },
  watch: {
    detailData (to) {
      this.formatDetail(to);
    },

    // 配件编号
    // componentCode (value) {
    //   if (value) {
    //     this.formData.partNo = value.componentCode;
    //   } 
    // },

    lists (to) {
      to.forEach((item, index) => {
        item.value = item.code;
        item.label = item.name;
        if (item.children) {
          item.children.forEach(citem => {
            citem.value = citem.code;
            citem.label = citem.name;
            if (citem.children) {
              citem.children.forEach(titem => {
                titem.value = titem.code;
                titem.label = titem.name;
              })
            }
          })
        }
      })
    }
  },

  mounted () {
    if (this.id !== 'create') {
      this.breadName = '编辑维修配件';
      this.getDetail();
    } 
    // else {
    //   this.getCode();
    // }
    this.getCateList();
    this.getPartsUnits()
  },

  methods: {
    // getCode () { // 获取配件编号
    //   this.$store.dispatch({
    //     type: 'toGetComponentCode'
    //   })
    // },
    countWatning (prop) {
      this.$refs.form.validateField("startCountWarning");
    },
    async getPartsUnits () {
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'getPartsUnits'
        })
        if (Number(res.code) === 0) {
          this.unit = res.data
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(`--------获取所有配件单位报错--------`)
      }
    },
    getDetail () { 
      this.$store.dispatch({
        type: 'toGetMaintainDetail',
        params: {
          partNo: this.id
        }
      })
    },

    formatDetail (to) {
      if (to.code.indexOf('#') != -1) {
        const code = to.code.split('#');
        const arr = [];
        arr.push('#' + code[1]);
        if (code[2]) {
          arr.push('#' + code[1] + '#' +  code[2]);
          if (code[3]) {
            arr.push('#' + code[1] + '#' + code[2] + '#' + code[3]);
          }
        }
        to.code = arr;
      } else {
        const code = to.code.split('');
        const arr = [];
        arr.push(code[0]);
        if (code[1]) {
          arr.push(code[0] + code[1]);
          if (code[2]) {
            arr.push(code[0] + code[1] + code[2]);
          }
        }
        to.code = arr;
      }
      
      // 开启后为必填项，“库存下限”最小值为0，默认为1，“库存上限”默认为99，最大值为999
      // if (to.isWarning == 0) {
        to.startCountWarning = String(to.startCountWarning || 1);
        to.endCountWarning = String(to.endCountWarning || 99);
      // } else {
      //   to.startCountWarning = "1";
      //   to.endCountWarning = "99";
      // }
      this.formData = Object.assign(this.formData, to);
    },

    selectMian (value) {
      this.mainClass.forEach((item, index) => {
        if (item.value === value) {
          this.subClass = item.children;
        }
      })
    },

    submit () {
      this.$refs.form.validate( bol => {
        if (bol) {
          this.btnLoading = true;
          let formData = Object.assign({}, this.formData);
          if (formData.isWarning == "0") {
            formData.startCountWarning = Number(formData.startCountWarning || 0);
            formData.endCountWarning = Number(formData.endCountWarning || 0);
          } else {
            delete formData.startCountWarning;
            delete formData.endCountWarning;
          }
          formData.code = formData.code.pop();
          if (!formData.purchasePrice) formData.purchasePrice = '0';

          let request = 'addRepairpart';
          let tip = '添加';
          if (this.id !== 'create') {
            request = 'updateRepairpart';
            tip = '更新';
          }

          this.$store.dispatch({
            type: request,
            params: formData
          }).then( res => {
            if (res.code === '0') {
              this.$Message.success({
                content: tip + '成功',
                onClose: () => {
                  // this.$router.push('/inventory/maintain/list');
                  this.$router.go(-1);
                  this.btnLoading = false;
                }
              })
              this.$store.commit("setKeepAliveData", { name: "InventoryStock", value: false });
            } else {
              this.$Message.error({
                content: tip + '失败'
              })
              this.btnLoading = false;
            }
          }).catch(err => {
            this.btnLoading = false;
          })
        }
      })
    },
    showCateDialog () {
      this.$refs.cateDialog.openModel()
    },
    getCateList () {
      this.$store.dispatch({
        type: 'repairCateList'
      })
    },
  },
  computed: {
    ...mapGetters({
      detailData: 'getMaintainDetail',
      // componentCode: 'getComponentCode'
    }),

    lists () {
      return this.$store.getters.getMaintainCateList;
    }
  }
}
</script>
