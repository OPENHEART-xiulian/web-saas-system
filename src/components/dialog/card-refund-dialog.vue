// 会员卡退卡弹窗
<template>
  <Modal v-model="modal" 
    title="退卡"
    class="w-dialog card-dialog"
    width="600">
    <Form ref="form" 
      :model="formData" 
      :rules="rules"
      :label-width="80">
      <FormItem label="退卡时间">
        <span class="init-span">{{ formatTime(new Date(), 'yyyy-MM-dd') }}</span>
      </FormItem>
      <FormItem label="卡内余额" v-if="tableItem.memberCardType === '1'">
        <span class="init-span">{{ tableItem.amount }}元</span>
      </FormItem>
      <FormItem label="剩余服务" v-else>
        <table>
          <tbody>
            <tr v-for="(item, index) in tableItem.serviceList" 
              :key="index">
              <td>{{ item.name }}</td>
              <td>{{ item.remainCount + '次' }}</td>
            </tr>
          </tbody>
        </table>
      </FormItem>
      <FormItem label="实退金额" prop="refund">
        <format-input reg="PRECISION" v-model="formData.refund">
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
      modal: false,
      tableItem: {},
      formData: {
        refund: "",
        saleUserId: ""
      },
      rules: {
        refund: [
          { required: true, message: '请输入实退金额', trigger: 'blur' }
        ],
        saleUserId: [
          { required: true, message: '请选择销售人员', trigger: 'change' }
        ]
      },
      columns: [
        { title: '服务名称', key: 'name' },
        { title: '剩余次数', key: 'remainCount' }
      ]
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
      this.tableItem = item;
      this.modal = true;
      this.$store.dispatch('toGetStaffList');
    },

    onOk () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const time = {
            at: formatTime(new Date(), 'yyyy-MM-dd'),
            _id: this.tableItem._id
          }
          const params = Object.assign({}, this.formData, time);
          
          this.$store.dispatch({
            type: 'actionPost',
            params,
            name: 'memberCardOrderRefund'
          }).then((res) => {
            if (res.code === '0') {
              this.$Message.success('退卡成功');
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
