// 新建配件弹窗
<template>
  <Modal title="新建配件" v-model="modal"
    @on-cancel="cancel" 
    class="w-dialog add-maintain-dialog"
    width="900">
    <Form 
      ref="form"
      label-position="top"
      :model="formData" 
      :rules="rules" >
      <!-- <FormItem label="配件编号" prop="partNo">
        <div class="tip">
          配件编号不显示?  
          <span @click="getCode">刷新一下</span>
        </div>
        <Input v-model="formData.partNo" disabled />
      </FormItem> -->
      <FormItem label="原厂编码" prop="partFactoryNo">
        <Input v-model="formData.partFactoryNo" :maxlength="20" />
      </FormItem>
      <FormItem label="配件名称" prop="partName">
        <Input v-model="formData.partName" />
      </FormItem>
      <FormItem label="配件分类" prop="code">
        <Cascader :data="lists"
        v-model="formData.code"></Cascader>
      </FormItem>
      <FormItem label="配件单位" prop="unit">
        <Select v-model="formData.unit" placeholder="请选择">
          <Option v-for="(item, index) in unit" 
            :value="item.value"
            :key="index">{{ item.label }}</Option>
        </Select>
      </FormItem>
      <FormItem label="零售价" prop="retailPrice">
        <i-input 
          v-model="formData.retailPrice" 
          placeholder="输入数字，如：100">
          <span slot="append">元</span>
        </i-input>
      </FormItem>
      <!-- <FormItem class="line" style="width: 100%"></FormItem> -->
      
      <FormItem label="进货价" prop="purchasePrice">
        <i-input v-model="formData.purchasePrice" placeholder="输入数字，如：100">
          <span slot="append">元</span>
        </i-input>
      </FormItem>
      <FormItem label="配件品牌" prop="brand">
        <i-input v-model="formData.brand"></i-input>
      </FormItem>
      <!-- <FormItem class="wid-50"></FormItem> -->
      <FormItem label="关键字" prop="keywords" class="wid-66">
        <tag-input v-model="formData.keywords" :max="5" placeholder="如：奥迪、雨刷、刹车片（输入后点击回车，最多5个）"></tag-input>
      </FormItem>
      <!-- <FormItem class="wid-50"></FormItem> -->
      <FormItem label="备注" prop="remark" class="wid-50">
        <i-input type="textarea" v-model="formData.remark"></i-input>
      </FormItem>
      <FormItem label="产品照片" style="width: 100%">
        <upload-img 
          :max-count="1"
          v-model="formData.imgIds"
          :headers="headers"
          :cutScale="[1, 1]">
        </upload-img>
      </FormItem>
    </Form>
    <div slot="footer">
      <Checkbox class="add-check" v-model="isCheck">同时添加到已选配件</Checkbox>
      <Button type="text" size="large" @click.native.stop="cancel">取消</Button>
      <Button type="error" size="large" 
        :loading="btnLoading"
        @click.native.stop="submit">确定</Button>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import TagInput from '@/components/tag-input';
import UploadImg from '@/components/upload-image';
import { storage, formVerify } from '@/assets/js/utils.js';
import { unit } from '@/store/json/default';
import '@/styles/components/dialog.less';

export default {
  data () {
    return {
      modal: false,
      isCheck: true, // 是否同时添加到已选项目
      headers: {
        Authorization: storage.get('TOKEN')
      },
      btnLoading: false,    
      formData: {
        partName: '',       // 配件名称
        // partNo: '',         // 配件编号
        code: [],           // 配件分类
        unit: '',           // 配件单位
        retailPrice: '',    // 零售价
        brand: '',          // 配件品牌
        partFactoryNo: '',  // 原厂编码
        purchasePrice: '',  // 进货价
        keywords: [],       // 关键词
        remark: '',         // 备注
        imgIds: []          // 图片列表
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
        // partNo: [
        //   {
        //     required: true,
        //     trigger: 'blur',
        //     message: '配件编码不能为空', 
        //     validator: formVerify.format,
        //     callback: (rules, value, callback) => {
        //       this.$store.dispatch({
        //         type: 'checkRepairpart',
        //         params: {
        //           partNo: value
        //         }
        //       }).then( res => {
        //         if (res.code === '0') {
        //           callback();
        //         } else {
        //           rules.message = '配件编码已被占用';
        //           callback(rules.message);
        //         }
        //       })
        //     }
        //   }
        // ],
        // partNo: [
        //   {
        //     required: true,
        //     trigger: 'blur',
        //     message: '配件编号不能为空',
        //   }
        // ],
        code: [
          { required: true, message: '请选择配件类别', trigger: 'change', type: 'array' }
        ],
      },
      unit: unit
    }
  },

  watch: {
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

  methods: {
    openModal () {
      this.formData = {
        partName: '',       // 配件名称
        // partNo: '',         // 配件编号
        code: [],           // 配件分类
        unit: '',           // 配件单位
        retailPrice: '',    // 零售价
        brand: '',          // 配件品牌
        partFactoryNo: '',  // 原厂编码
        purchasePrice: '',  // 进货价
        keywords: [],       // 关键词
        remark: '',         // 备注
        imgIds: []          // 图片列表
      }
      this.$refs.form.resetFields();
      // this.getCode();
      this.modal = true;
    },

    // getCode () { // 获取配件编号
    //   this.$store.dispatch({
    //     type: 'toGetComponentCode'
    //   })
    // },

    cancel () {
      this.modal = false;
      this.$emit('on-cancel');
    },

    submit () {
      this.$refs.form.validate( bol => {
        if (bol) {
          this.btnLoading = true;
          let formData = Object.assign({}, this.formData);
          formData.code = formData.code.pop();
          if (!formData.purchasePrice) formData.purchasePrice = '0';

          this.$store.dispatch({
            type: 'addRepairpart',
            params: formData
          }).then( res => {
            if (res.code === '0') {
              this.$Message.success({
                content: '添加成功',
                onClose: () => {
                  this.modal = false;
                  this.btnLoading = false;
                  this.$emit('add-success', res.data, this.isCheck);
                }
              })
            } else {
              this.$Message.error({
                content: '添加失败'
              })
              this.btnLoading = false;
            }
          }).catch(err => {
            this.btnLoading = false;
          })
        }
      })
    }
  },
  computed: {
    ...mapGetters({
      lists: 'getMaintainCateList',
      // componentCode: 'getComponentCode'
    }),
  },

  components: { TagInput, UploadImg },
}
</script>
