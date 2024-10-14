// 会员卡充值弹窗
<template>
  <Modal v-model="modal" 
    title="充值"
    class="w-dialog card-dialog"
    width="600">
    <Form ref="form" 
      :model="formData" 
      :rules="rules"
      :label-width="80">
      <FormItem label="充值时间">
        <span class="init-span">{{ formatTime(new Date(), 'yyyy-MM-dd') }}</span>
      </FormItem>
      <FormItem label="充值金额" prop="amount">
        <format-input reg="PRECISION" v-model="formData.amount">
          <span slot="append">元</span>
        </format-input>
      </FormItem>
      <FormItem label="实收金额" prop="cost">
        <format-input reg="PRECISION" v-model="formData.cost">
          <span slot="append">元</span>
        </format-input>
      </FormItem>
      <FormItem label="销售人员" prop="saleUserId">
        <Select v-model="formData.saleUserId">
          <Option v-for="item in salesman"
            :key="item.userId"
            :value="item.userId">
            {{ item.username }}
          </Option>
        </Select>
      </FormItem>
    </Form>
    <div slot="footer">
      <i-button type="default" @click="onCancel">取消</i-button>
      <i-button type="primary" @click="onOk">确定</i-button>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import formatInput from '@/components/format-input';
import { formatTime } from '@/assets/js/utils';
import '@/styles/components/dialog.less';

export default {
  data () {
    return {
      formatTime,
      id: '',
      modal: false,
      formData: {
        amount: "",
        cost: "",
        saleUserId: ""
      },
      rules: {
        amount: [
          { required: true, message: '请输入充值金额', trigger: 'blur' }
        ],
        cost: [
          { required: true, message: '请输入实收金额', trigger: 'blur' }
        ],
        saleUserId: [
          { required: true, message: '请选择销售人员', trigger: 'change' }
        ]
      }
    }
  },

  computed: {
    ...mapGetters({
      salesman: 'getStaffList'
    })
  },

  methods: {
    openModal (item) {
      this.$refs.form.resetFields();
      this.modal = true;
      this.id = item._id;
      this.$store.dispatch('toGetStaffList');
    },

    onOk () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const time = {
            at: formatTime(new Date(), 'yyyy-MM-dd'),
            _id: this.id
          }
          const params = Object.assign({}, this.formData, time);

          this.$store.dispatch({
            type: 'actionPost',
            params,
            name: 'memberCardOrderRecharge'
          }).then((res) => {
            if (res.code === '0') {
              this.$Message.success('充值成功');
              this.modal = false;
              this.$emit('on-ok');
            }
          }).catch((err) => {
            this.$commit('REQUEST_ERROR', { err });
          })
        } else {
          this.$Message.warning('请填写完整信息再提交');
        }
      })
    },

    onCancel () {
      this.modal = false;
      this.$emit('on-cancel');
    }
  },

  components: { formatInput }
}
</script>
