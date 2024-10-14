// 车辆外观检查问题弹窗
<template>
  <Modal title="车辆外观检查问题" v-model="modal"
    @on-cancel="cancel" 
    class="w-dialog appearance-dialog"
    width="600">
    <Form :model="formData">
      <div class="title">位置</div>
      <FormItem class="pos">
        <CheckboxGroup v-model="formData.position">
          <Checkbox v-for="item in position"
            :label="item.value"
            :key="item.value">{{ item.label }}
          </Checkbox>
        </CheckboxGroup>
      </FormItem>
      <div class="title">问题</div>
      <div class="no-qustion" v-if="formData.position.length === 0">暂无问题</div>
      <FormItem label="正前位置问题：" v-if="formData.position.includes('front')">
        <CheckboxGroup v-model="formData.frontPos">
          <div class="box" v-for="item in questionFront" :key="item.value">
            <Checkbox 
              :label="item.value">{{ item.label }}
            </Checkbox>
            <upload-img 
              v-if="formData.frontPos.includes(item.value)"
              v-model="item.imgs"
              :headers="headers"
              :imgSize="50"
              :cutScale="[1, 1]"
              :isCut="true"
              :maxCount="1">
            </upload-img>
          </div>
        </CheckboxGroup>
        
      </FormItem>
      <FormItem label="左侧位置问题：" v-if="formData.position.includes('left')">
        <CheckboxGroup v-model="formData.leftPos">
          <div class="box" v-for="item in questionLeft" :key="item.value">
            <Checkbox 
              :label="item.value">{{ item.label }}
            </Checkbox>
            <upload-img 
              v-if="formData.leftPos.includes(item.value)"
              v-model="item.imgs"
              :headers="headers"
              :imgSize="50"
              :cutScale="[1, 1]"
              :isCut="true"
              :maxCount="1">
            </upload-img>
          </div>
        </CheckboxGroup>
      </FormItem>

      <FormItem label="右侧位置问题：" v-if="formData.position.includes('right')">
        <CheckboxGroup v-model="formData.rightPos">
          <div class="box" v-for="item in questionRight" :key="item.value">
            <Checkbox 
              :label="item.value">{{ item.label }}
            </Checkbox>
            <upload-img 
              v-if="formData.rightPos.includes(item.value)"
              v-model="item.imgs"
              :headers="headers"
              :imgSize="50"
              :cutScale="[1, 1]"
              :isCut="true"
              :maxCount="1">
            </upload-img>
          </div>
        </CheckboxGroup>
      </FormItem>

      <FormItem label="正后位置问题：" v-if="formData.position.includes('back')">
        <CheckboxGroup v-model="formData.afterPos">
          <div class="box" v-for="item in questionBack" :key="item.value">
            <Checkbox
              :label="item.value">{{ item.label }}
            </Checkbox>
            <upload-img 
              v-if="formData.afterPos.includes(item.value)"
              v-model="item.imgs"
              :headers="headers"
              :imgSize="50"
              :cutScale="[1, 1]"
              :isCut="true"
              :maxCount="1">
            </upload-img>
          </div>
        </CheckboxGroup>
      </FormItem>

      <FormItem label="车顶位置问题：" v-if="formData.position.includes('top')">
        <CheckboxGroup v-model="formData.topPos">
          <div class="box" v-for="item in questionTop" :key="item.value">
            <Checkbox
              :label="item.value">{{ item.label }}
            </Checkbox>
            <upload-img 
              v-if="formData.topPos.includes(item.value)"
              v-model="item.imgs"
              :headers="headers"
              :imgSize="50"
              :cutScale="[1, 1]"
              :isCut="true"
              :maxCount="1">
            </upload-img>
          </div>
        </CheckboxGroup>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" size="large" @click.native.stop="cancel">取消</Button>
      <Button type="error" size="large" @click.native.stop="confirm">确定</Button>
    </div>
  </Modal>
</template>

<script>
import UploadImg from '@/components/upload-image';
import { getObj } from '@/store/json/default';
import { storage } from '@/assets/js/utils';
import { questionFront, questionLeft, questionRight, questionBack, questionTop } from './appearance-data.js';
import '@/styles/components/dialog.less';

export default {
  data () {
    return {
      getObj,
      modal: false,
      headers: {
        Authorization: storage.get('TOKEN')
      },
      formData: {
        position: [],
        frontPos: [],
        leftPos: [],
        rightPos: [],
        afterPos: [],
        topPos: [],
      },
      position: [
        { value: 'front', label: '正前' },
        { value: 'left', label: '左侧' },
        { value: 'right', label: '右侧' },
        { value: 'back', label: '正后' },
        { value: 'top', label: '车顶' }
      ],
      // qustion: [
      //   { value: 'A1', label: '凹陷', imgs: [] },
      //   { value: 'A2', label: '刮痕', imgs: [] },
      //   { value: 'A3', label: '裂纹', imgs: [] },
      //   { value: 'A4', label: '锈蚀', imgs: [] },
      //   { value: 'A5', label: '掉漆', imgs: [] }
      // ],
      questionFront,
      questionLeft,
      questionRight,
      questionBack,
      questionTop,
      texts: {
        front: '正前',
        left: '左侧',
        right: '右侧',
        back: '正后',
        top: '车顶',
        A1: '凹陷',
        A2: '刮痕',
        A3: '裂纹',
        A4: '锈蚀',
        A5: '掉漆'
      },
      callback: null,
      item: null
    }
  },

  methods: {
    openModal (callback, item, data) {
      this.initQuestion(data);
      this.item = item;
      this.callback = callback;
      this.modal = true;
    },

    initQuestion (data) { // 重新初始化问题列表
      this.questionFront.forEach((item, index) => {
        item.imgs = [];
      });
      this.questionLeft.forEach((item, index) => {
        item.imgs = [];
      });
      this.questionRight.forEach((item, index) => {
        item.imgs = [];
      });
      this.questionBack.forEach((item, index) => {
        item.imgs = [];
      });
      this.questionTop.forEach((item, index) => {
        item.imgs = [];
      });

      this.setFormData(data);
    },

    setFormData (data = {}) {
      let init = false;
      if (Object.keys(data).length === 0) {
        this.formData.position = [];
        init = true;
      } 
      
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const element = data[key];
          if (element && element.length > 0) {
            this.formData.position.push(key);
          }
        } 
      }
      
      const front = [];
      const left = [];
      const right = [];
      const top = [];
      const back = [];
      if (!init) { // 需要重新初始化的话就把列表全部清空
        data.front.forEach(item => {
          front.push(item.desc);
          this.questionFront.forEach(citem => {
            if (citem.value === item.desc) {
              citem.imgs = item.imgs;
            }
          })
        });
        data.left.forEach(item => {
          left.push(item.desc);
          this.questionLeft.forEach(citem => {
            if (citem.value === item.desc) {
              citem.imgs = item.imgs;
            }
          })
        });
        data.right.forEach(item => {
          right.push(item.desc);
          this.questionRight.forEach(citem => {
            if (citem.value === item.desc) {
              citem.imgs = item.imgs;
            }
          })
        });
        data.top.forEach(item => {
          top.push(item.desc);
          this.questionTop.forEach(citem => {
            if (citem.value === item.desc) {
              citem.imgs = item.imgs;
            }
          })
        });
        data.back.forEach(item => {
          back.push(item.desc);
          this.questionBack.forEach(citem => {
            if (citem.value === item.desc) {
              citem.imgs = item.imgs;
            }
          })
        });
      }
      
      this.formData.frontPos = front;
      this.formData.leftPos = left;
      this.formData.rightPos = right;
      this.formData.afterPos = back;
      this.formData.topPos = top;
    },

    cancel () {
      this.modal = false;
      this.$emit('on-cancel');
    },

    confirm () {
      const data = this.getParams();
      // const params = {
      //   front: this.formData.frontPos,
      //   right: this.formData.rightPos,
      //   left: this.formData.leftPos,
      //   back: this.formData.afterPos,
      //   top: this.formData.topPos,
      // }
      let str = this.getKeyStr(data);
      this.callback(str, this.item.value);
      this.$emit('select-success', data);
      this.modal = false;
    },
    
    getParams () {
      let frontArr = [];
      let leftArr = [];
      let rightArr = [];
      let afterArr = [];
      let topArr = [];
      this.questionFront.forEach((item, index) => {
        if (this.formData.frontPos.includes(item.value)) {
          frontArr.push({
            desc: item.value,
            imgs: item.imgs
          })
        }
      });
      this.questionLeft.forEach((item, index) => {
        if (this.formData.leftPos.includes(item.value)) {
          leftArr.push({
            desc: item.value,
            imgs: item.imgs
          })
        }
      });
      this.questionRight.forEach((item, index) => {
        if (this.formData.rightPos.includes(item.value)) {
          rightArr.push({
            desc: item.value,
            imgs: item.imgs
          })
        }
      });
      this.questionBack.forEach((item, index) => {
        if (this.formData.afterPos.includes(item.value)) {
          afterArr.push({
            desc: item.value,
            imgs: item.imgs
          })
        }
      });
      this.questionTop.forEach((item, index) => {
        if (this.formData.topPos.includes(item.value)) {
          topArr.push({
            desc: item.value,
            imgs: item.imgs
          })
        }
      });
      const params = {
        front: frontArr,
        right: rightArr,
        left: leftArr,
        back: afterArr,
        top: topArr,
      }
      return params;
    },

    getKeyStr (data) {
      let str = '';
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const element = data[key];
          if (element && element.length > 0) {
            str += this.texts[key] + ':' + this.getStr(data[key]) + ';   ';
          }
        }
      }
      return str;
    },
    getStr (array) {
      let arr = [];
      array.forEach(item => {
        if (item.desc !== '') arr.push(this.texts[item.desc]);
      });
      return arr.join('、');
    }
  },

  components: { UploadImg }
}
</script>
