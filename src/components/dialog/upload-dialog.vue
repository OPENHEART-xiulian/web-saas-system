<template>
  <div>
    <Modal 
      title="批量导入" 
      v-model="modal" 
      @on-cancel="onCancel" 
      @on-ok="onOk" 
      class="w-dialog upload-dialog" 
      width="700">
      <div class="body-header">
        <span @click="downloadTemp" style="margin-right: 10px;" v-if="showTemp">
          <i class="iconfont icon-xiazai"></i>
          下载服务项目参考模板
        </span>
        <span @click="download">
          <i class="iconfont icon-xiazai"></i>
          下载批量导入空模板
        </span>
      </div>
      <div class="body-content">
        <Upload
          type="drag"
          :multiple="false"
          :format="['xls', 'xlsx', 'cvs']"
          :show-upload-list="false"
          :headers="headers"
          :action="action"
          :before-upload="beforeUpload"
          :on-success="onSuccess"
          :on-progress="onProgress"
          :on-format-error="formatError">
          <div class="slot">
              <i class="iconfont icon-tuoruwenjian"></i>
              <p>点击或将文件拖拽到这里上传</p>
          </div>
        </Upload>
      </div>
      <div class="upload-footer" slot="footer">
        <div class="file-msg">
          <i class="iconfont icon-biaogewenjian"></i>
          {{upload.name}}
        </div>
        <div class="progress-con">
          <div class="progress-bg">
            <div class="progress" :style="{width: upload.pro + '%'}"></div>
          </div>
        </div>
        <div class="tip" v-if="upload.pro > 0 && upload.pro < 100 ">{{upload.pro + '%'}}</div>
        <div class="tip" v-if="upload.pro == 100"><i class="iconfont icon-wancheng-fill"></i>导入成功</div>
      </div>
    </Modal>
    <error-dialog 
      ref="errorDialog"
      :errors="errors">
    </error-dialog>
  </div>
</template>

<script>
  import '@/styles/components/dialog.less';
  import mixins from './dialog.mixin';
  import errorDialog from './error-dialog';
  import { IMPORT_TEMPLATE } from '@/https/api.js';
  export default {
    mixins: [mixins],
    props: {
      headers: {
        type: Object,
        default () {
          return {
            Authorization: this.$storage.get('TOKEN')
          }
        }
      },
      showTemp: Boolean,
      action: {
        type: String,
        default: ''
      },
      templateName: String
    },
    data () {
      return {
        upload: {
          pro: 0,
          name: '',
        },
        isUpload: false,  // 标记是否已经导入成功过数据
        errors: []
      }
    },
    methods: {
      download () {
        window.location.href = IMPORT_TEMPLATE + '/' + this.templateName + '?token=' + this.$storage.get('TOKEN');
      },
      downloadTemp () {
        window.location.href = IMPORT_TEMPLATE + '/XXX服务项目参考模板.xlsx?token=' + this.$storage.get('TOKEN');
      },
      beforeUpload (file) {
        
      },
      formatError (error) {
        this.$Message.error('文件格式不正确')
      },
      onProgress (event, file, fileList) {
        this.upload.pro = file.percentage;
        this.upload.name = file.name;
      },
      onSuccess (response, file, fileList) {
        if (response.code === '0') {
          this.upload.pro = 100;
          this.isUpload = true;
          this.$emit('on-success', response, file, fileList);
        } else {
          if (response.code === '107076') {
            this.$Message.error('导入失败，表格为空')
          } else {
            this.errors = response.errors;
            this.$refs.errorDialog.openModal();
          }
        }
      },
      onCancel () {
        this.modal = false;
        this.$emit("on-cancel", this.isUpload);
      }
    },

    components: { errorDialog }
  }
</script>
