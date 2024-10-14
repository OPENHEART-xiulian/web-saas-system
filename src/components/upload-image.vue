<template>
  <div class="upload-img-list flex">
    <draggable v-model="uploadList" @change="onDraggableChange" class="draggableUpload">
      <!-- <transition-group> -->
        <div class="upload-img-item" v-for="(item, index) in uploadList" :style="imgItemStyle" :key="item.response.info">
          <my-img v-if="item.status !== 'uploading'" :src="getUri('checkImg') + item.response.info"></my-img>
          <div class="progress-container" v-if="item.status === 'uploading'">
            <Progress :percent="item.percentage"></Progress>
          </div>
          <div class="cover-tip" v-if="coverTip && index == 0">
            <span>封面</span>
          </div>
          <div class="action-container">
            <i class="iconfont icon-fullscreen" @click="showBigImg(index)"></i>
            <i v-if="canUpload" class="iconfont icon-delete" @click="deleteImg(index)"></i>
          </div>
        </div>
      <!-- </transition-group> -->
    </draggable>

    <div style="position: relative;"
      v-show="maxCount === 0 || uploadList.length < maxCount">
      <Upload
        ref="upload"
        v-if="canUpload"
        v-show="maxCount === 0 || uploadList.length < maxCount"
        :action="action"
        :default-file-list="defaultFileList"
        :headers="headers"
        :multiple="multiple"
        :data="data"
        :name="name"
        :with-credentials="withCredentials"
        :show-upload-list="showUploadList"
        :type="type"
        :accept="accept"
        :format="format"
        :max-size="maxSize"
        :before-upload="handleBeforeUpload"
        :on-progress="handleProgress"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize">
        <slot v-if="$slots.content" name="content"></slot>
        <div v-else class="upload-img-slot">
          <i class="iconfont icon-jiahao"></i>
        </div>
      </Upload>
      <transition name="fade" v-if="canUpload">
        <div class="vue-cropper-model-bg model-cover" v-if="showCropper">
          <div class="vue-cropper-con">
            <vue-cropper
              ref="cropper"
              :img="example.img"
              :outputSize="example.size"
              :outputType="example.outputType"
              :info="example.info"
              :canScale="example.canScale"
              :autoCrop="example.autoCrop"
              :autoCropWidth="example.autoCropWidth"
              :autoCropHeight="example.autoCropHeight"
              :fixed="example.fixed"
              :fixedNumber="example.fixedNumber"
              @click.stop></vue-cropper>
            <div class="cropper-footer">
              <i-button @click.prevent="cancelCropper">取消</i-button>
              <i-button @click.prevent.stop="startUpload" type="primary">上传</i-button>
            </div>
          </div>
        </div>
      </transition>
      <Spin v-if="loading" fix></Spin>
    </div>
    <img-slider ref="imgSlider"></img-slider>
    <!-- <transition name="fade">
      <div v-if="errorTip" class="error-tip">上传失败！仅支持JPG、JPEG、PNG，大小不超过2M的图片</div>
    </transition> -->
  </div>
</template>

<script>
import '@/styles/components/upload-image.less';
import VueCropper  from 'vue-cropper'
import draggable from 'vuedraggable'
import ImgSlider from "@/components/image-slider";
import { dataURLtoFile } from '@/assets/js/utils.js';
import { getUri } from '@/https/api.js';
export default {
  components: { VueCropper, ImgSlider, draggable },
  props: {
    coverTip: { 
      // 是否有封面提示
      type: Boolean,
      default: false
    },
    maxCount: {
      // 最大上传个数 0表示不限制
      type: Number,
      default: 0
    },
    imgSize: {
      // 图片大小
      type: [Number, String],
      default: 100
    },
    isCut: {  // 是否裁剪图片
      type: Boolean,
      default: false
    },
    cutScale: {
      // 截图比例
      type: Array,
      default () {
        return [240, 180];
      }
    },
    value: {
      // 默认已上传列表 ['imgId']
      type: Array
    },
    action: {
      // 上传的地址
      type: String,
      default: getUri('uploadImg')
    },
    canUpload: {
      // 是否带上传功能， false的时候只做展示
      type: Boolean,
      default: true
    },
    headers: {
      // 设置上传的请求头部
      type: Object,
      default () {
        return {};
      }
    },
    multiple: {
      // 是否支持多选文件
      type: Boolean,
      default: false
    },
    data: {
      // 上传时附带的额外参数
      type: Object
    },
    name: {
      // 上传的文件字段名
      type: String
    },
    withCredentials: {
      // 支持发送 cookie 凭证信息
      type: Boolean,
      default: false
    },
    showUploadList: {
      // 是否显示已上传文件列表
      type: Boolean,
      default: false
    },
    type: {
      // 上传控件的类型，可选值为 select（点击选择），drag（支持拖拽）
      type: String,
      default: "select"
    },
    accept: {
      // String
      type: String
    },
    format: {
      // 支持的文件类型，与 accept 不同的是，format 是识别文件的后缀名，accept 为 input 标签原生的 accept 属性，会在选择文件时过滤，可以两者结合使用
      type: Array,
      default () {
        return ["jpg", "jpeg", "png"];
      }
    },
    maxSize: {
      // 文件大小限制，单位 kb
      type: Number,
      default: 2048
    }
  },
  data () {
    let cutScale = this.cutScale[0] / this.cutScale[1];
    let imgItemStyle = {
      width: 100 * cutScale + "px",
      height: 100 + "px",
    }
    return {
      imgItemStyle,
      getUri,
      showCropper: false, // 是否显示图片裁剪
      defaultFileList: [],
      loading: false,
      example: {
        img: "",
        info: true,
        size: 1,
        outputType: "png",
        canScale: false,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: this.cutScale[0],
        autoCropHeight: this.cutScale[1],
        // 开启宽度和高度比例
        fixed: true,
        fixedNumber: this.cutScale // 宽高比例
      },
      uploadList: [], // 上传列表
      imgList: [], // 上传后的图片列表
      // errorTip: false // 错误提示
    };
  },
  watch: {
    value (to) {
      this.setDefaultList(to);
    }
  },
  mounted () {
    this.setDefaultList(this.value);
  },
  methods: {
    // 设置默认图片
    setDefaultList (array = []) {
      this.imgList = array;
      let list = array.map(item => {
        return { response: { info: item } };
      });
      this.defaultFileList = list;
      this.uploadList = list;
      // this.setImgList();
      // this.errorTip = false;
    },
    onDraggableChange () {
      this.setImgList()
    },
    showBigImg (index) {
      // 显示大图
      this.$refs.imgSlider.showImg(this.imgList, index);
    },
    deleteImg (index) {
      // 删除图片
      this.uploadList.splice(index, 1);
      this.setImgList();
    },
    setImgList () {
      // 设置图片id数组
      const list = this.uploadList.map(item => item.response.info);
      this.$emit("input", list);
      this.$emit("on-change", list);
    },
    handleBeforeUpload (file) {
      this.loading = true;
      // 上传文件之前的钩子，参数为上传的文件，若返回 false 或者 Promise 则停止上传
      // debugger
      // 验证文件格式 和 上传数量验证
      let suffix = file.name.split(".")[file.name.split(".").length - 1];
      if ((!this.format.includes(suffix)) || (this.uploadList.length >= this.maxCount && this.maxCount !== 0)) {
        // this.errorTip = true;
        this.alertError();
        return false;
      }

      // 是否需要裁剪
      if (!this.isCut) return true;
      var reads = new FileReader();
      reads.readAsDataURL(file);
      reads.onload = e => {
        this.example.img = e.target.result;
        this.showCropper = true;
      };
      this.file = file; // 临时文件
      return false;
    },
    startUpload () {
      if (!this.isCut) return;
      // 开始上传
      // this.errorTip = false;
      // 获取上传的文件
      this.$refs.cropper.getCropData(data => {
        this.$refs.upload.post(dataURLtoFile(data, this.file.name));
        this.file = null;
        this.showCropper = false;
      });
    },
    cancelCropper () {
      this.showCropper = false;
      this.loading = false;
    },
    handleProgress (event, file, fileList) {
      // 文件上传时的钩子，返回字段为 event, file, fileList
    },
    handleSuccess (response, file, fileList) {
      // 文件上传成功时的钩子，返回字段为 response, file, fileList
      const list = fileList.map( item => {
        item.response.info = item.response.info || item.response.data.fileInfo.fileId;
        delete item.response.data;
        return item;
      });
      this.uploadList = list;
      this.setImgList();
      this.loading = false;
    },
    handleError (error, file, fileList) {
      this.loading = false;
      // 文件上传失败时的钩子，返回字段为 error, file, fileList
    },
    handlePreview (file) {
      // 点击已上传的文件链接时的钩子，返回字段为 file， 可以通过 file.response 拿到服务端返回数据
    },
    handleRemove (file, fileList) {
      // 文件列表移除文件时的钩子，返回字段为 file, fileList
    },
    handleFormatError (file, fileList) {
      this.loading = false;
      // 文件格式验证失败时的钩子，返回字段为 file, fileList
      // this.errorTip = true;
    },
    handleMaxSize (file, fileList) {
      // 文件超出指定大小限制时的钩子，返回字段为 file, fileList
      // this.errorTip = true;
      this.alertError();
    },
    alertError () {
      this.$Message.error('上传失败！仅支持JPG、JPEG、PNG，大小不超过2M的图片');
      this.loading = false;
    }
  },
  computed: {
    getImgWidth () {
      return parseFloat(this.cutScale[0] * this.imgSize / this.cutScale[1]);
    }
  }
};
</script>
