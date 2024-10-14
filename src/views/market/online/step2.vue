<template>
  <div class="online">
    <div class="online_body">
      <Form ref="formValidate" class="w-form" :model="formData" :label-width="200">
        <div class="form-title">文字描述</div>
        <FormItem class="form-item" label="项目流程" >
          <textarea v-model="formData.process" placeholder="请输入项目的服务流程，建议每个步骤换行。" maxlength="300"/>
        </FormItem>
        <FormItem class="form-item w200" label="适用车型" >
          <Input v-model="formData.carModel" placeholder="请填写适用车型" maxlength="20"/>
          <span  class="tips">适合使用项目车型，如：七座以下车型，SUV，MPV</span>
        </FormItem>
        <FormItem class="form-item w200" label="服务时长" >
          <div class="flex">
            <format-input
              prelen="1"
              v-model="formData.serviceDuration"
              placeholder="请填写项目时长"
              max="999.9"
              reg="PRECISION"
              style="width:200px;"
            >
              <span slot="append">小时</span>
            </format-input>
            <span class="tips">项目整体时长，如2-3小时</span>
          </div>
        </FormItem>
        <FormItem class="form-item w200" label="免费提供" >
          <Input v-model="formData.freeProvide" placeholder="请填写免费服务" maxlength="20"/>
          <span  class="tips">门店额外提供免费服务，如免费WIFI 奶茶 咖啡，停车等</span>
        </FormItem>
        <FormItem class="form-item" label="项目详情" >
          <textarea v-model="formData.description" placeholder="请输入项目详细的文字描述，建议尽量详细。"  maxlength="300"/>
        </FormItem>
        <div class="form-title">图片展示</div>
        <!-- 当项目类型不为保养的时候 -->
        <FormItem class="form-item" label="介绍图" prop="introduceImgId">
          <upload-img 
            class="cover-img"
            v-model="formData.showImgIds"
            :maxCount="10"
            :headers="headers"
            :imgSize="250"
            :cutScale="[200, 200]"
            :isCut="true">
          </upload-img>
          <span class="tip">最多上传10张图，拖拽更改顺序；</span>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script>
import '@/styles/components/form.less';
import '@/styles/views/store/online-index.less'
import { storage } from '@/assets/js/utils';
import UploadImg from '@/components/upload-image';
export default {
  components: { UploadImg },
  props: {
    value: {
      type: Object
    }
  },
  watch: {
    value (val) {
      this.formData = JSON.parse(JSON.stringify(val))
      this.init()
    }
  },
  data () {
    return {
      headers: {
        Authorization: storage.get('TOKEN')
      },
      formData: {}
    }
  },

  mounted () {
    this.formData = JSON.parse(JSON.stringify(this.value))
  },
  
  methods: {
    submit () {
      this.$emit('input', this.formData)
      return this.formData
    },
    asyncData () {
      this.$emit('input', this.formData)
    }
  }
}
</script>
