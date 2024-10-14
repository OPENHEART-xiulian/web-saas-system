//  出厂确认弹窗
<template>
  <Modal v-model="modal" 
    class="w-dialog factory-dialog"
    :closable="false"
    width="500"
    title="出厂确认">
    <div class="dialog-content">
      <p>确定出厂后，工单信息将自动上传到汽车电子健康档案系统</p>
      <p class="form">
        <label>出厂时间</label>
        <DatePicker type="datetime" 
          placeholder="选择时间" 
          style="width: 180px"
          v-model="time"
          :clearable="false"
          :editable="false"
          :options="timeOptions"
          @on-open-change="changeTime"
          @on-clear="clearTime">
        </DatePicker>
      </p>
    </div>
    <div slot="footer">
      <Button type="text" size="large" @click.native.stop="onCancel">取消</Button>
      <Button type="error" size="large" 
        @click.native.stop="onOk"
        :loading="loading">确定
      </Button>
    </div>
  </Modal>
</template>

<script>
import { formatTime } from '@/assets/js/utils.js';

export default {
  data () {
    return {
      modal: false,
      loading: false,
      time: new Date(),
      tableItem: '',
      type: '', // 跳转页面
      timeOptions: {
        disabledDate (date) {
          return date && date.valueOf() > Date.now();
        }
      }
    }
  },

  methods: {
    openModal (tableItem, type) {
      this.time = new Date();
      this.modal = true;
      this.tableItem = tableItem;
      this.type = type;
      const finishDate = new Date(this.tableItem.finishDate).valueOf() - 86399999;
      this.timeOptions = {
        disabledDate (date) {
          return date && ((date.valueOf() > Date.now()) || (date.valueOf() < finishDate));
        }
      }
    },

    onCancel () {
      this.modal = false;
    },

    changeTime (value) {
      if (!value) {
        if (this.time && new Date(this.time) < new Date(this.tableItem.finishDate)) {
          this.$Message.warning('出厂时间不能小于施工完成时间');
          this.time = new Date();
        }
      }
    },

    clearTime () {
      this.time = new Date();
    },

    onOk () {
      this.loading = true;
      const payload = {
        params: {
          statementNo: this.tableItem.statementNo
        },
        request: 'workLeave'
      }

      // if (this.time && new Date(this.time) < new Date(this.tableItem.finishDate)) {
      //   this.loading = false;
      //   this.$Message.warning('出厂时间不能小于施工完成时间');
      //   return;
      // } else 
      if (this.time) {
        payload.params.factoryDate = formatTime(this.time, 'yyyy-MM-dd HH:mm:ss');
      } else {
        payload.params.factoryDate = formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss');
      }

      this.$store.dispatch({
        type: 'toWorkOpt',
        payload
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success({
            content: '操作成功',
            onClose: () => {
              this.loading = false;
              this.modal = false;
              this.$parent.tabChange(this.type);
            }
          });
        } else {
          this.loading = false;
        }
      }).catch((err) => {
        this.loading = false;
        this.$store.commit('REQUEST_ERROR', { err });
      });
    }
  }
}
</script>
