<template>
  <Modal
    :title="modalTitle"
    v-model="show"
    :width="700"
    @on-ok="ok"
    @on-cancel="cancel"
    @on-visible-change="change"
    class="brand-dialog">
    <div class="select-item">
      <ul class="select-father" v-if="dataList.length!=0">
        <li :class="{'active':fatherActive==index, 'disabled':item.n && item.n.length==0}" v-for="(item,index) in dataList" :key="index" @click="selectFather(index, item.n)">{{item.c}}</li>
      </ul>
      <div v-if="showOther">
        <i-input v-model="otherData" placeholder="请输入车辆品牌"></i-input>
      </div>
      <ul class="select-child" v-if="childList && childList.length !=0">
        <li v-for="(item,index) in childList" :key="index" @click="selectChild(item.cn)" :class="{'disabled': activeList.indexOf(item.cn) > -1}" >{{item.cn}}</li>
      </ul>
    </div>
    <div class="check-item" v-if="activeList.length!=0 && !justOne">
      <ul>
        <li v-for="(item,index) in activeList" :key="index" @click="remove(index)">{{item}}<Icon class="remove-item" type="ios-close-empty"></Icon></li>
      </ul>
    </div>
  </Modal>
</template>

<script>
import '@/styles/components/dialog.less';
/**
 *   简单说明： 这个是弹出框选择部分数据的页面
 *   如果是多选的话，justOne设置成false或者不添加这个属性就行了，返回的会是一个数组，
 *   如果是单选的话，justOne一定要设置成true,返回的会是一个字符串
 *
 *   父组件的相关示例代码：
 *
 *   <button @click="toggleModal(true)">出来吧，弹出框</button>
 *
 *   <alertModal :justOne="false" :modalTitle="modalTitle" :showModal="isShow" :dataJson="carBusinessJson" :resultArr="resultArr" @toggleModal="toggleModal" @selectResult="getResult"></alertModal>
 *
 *   import {carBusinessJson} from 'commons/js/data/carBusiness.js';
 *   data(){
 *       return{
 *           modalTitle: '选择主修品牌',   //弹框title
 *           isShow: false,  //弹框是否显示
 *           carBusinessJson,    //元数据
 *           resultArr: []   //结果集（多选设置成数组，单选设置成字符串）
 *       }
 *   },
 *   methods: {
 *       toggleModal(v){
 *           this.isShow = v;
 *       },
 *       getResult(val){
 *           this.resultArr = val;
 *       }
 *   }
 */
export default {
  props: {
    justOne: {
      type: Boolean,
      default: false
    },
    modalTitle: {
      type: String,
      default: "请选择"
    },
    dataJson: {
      // 父组件传过来的弹出框数据源
      type: Array,
      default () {
        return []
      }
    },
    resultArr: {
      // 父组件传过来的弹出框数据源
      type: [Array, String]
    },
    hasOther: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      show: false, // 弹窗框显示隐藏状态
      dataList: [], // 父级列表数组
      childList: [], // 自己列表数组
      activeList: [], // 结果列表数组
      fatherActive: 0, // 父级当前选中index
      showOther: false, // 是否显示其他输入框
      otherData: ""
    };
  },
  created () {
    this.init();
  },
  methods: {
    openModal (arr) {
      this.show = true;
      this.activeList = [].concat(arr);
    },
    // 获取文件里的数组，赋值给父子ul列表
    init () {
      // 是否带有其他
      let arr = [].concat(this.dataJson);
      if (this.hasOther) {
        arr.push({
          c: "其他",
          n: null
        });
      }
      this.dataList = arr;
      this.childList = this.dataList[0].n;
      this.activeList = this.resultArr;
    },
    // 选中父级列表时，显示对应的子级列表
    selectFather (i, data) {
      let disabled;
      if (data && data.length === 0) disabled = true;

      if (disabled) return; // 如果父级列表没有数据时，点击失效
      else this.childList = this.dataList[i].n;
      if (!data) this.showOther = true;
      else this.showOther = false;
      this.fatherActive = i;
    },
    // 选中子级列表时，设置选中结果列表
    selectChild (n) {
      if (this.justOne) {
        this.$emit("selectResult", n);
        this.show = false;
      } else {
        if (n === '全部品牌') {
          const arr = [];
          this.dataJson.forEach((item, index) => { // 不包含热门品牌，不然会重复
            if (index) {
              item.n.forEach(citem => {
                if (citem.cn !== '全部品牌') arr.push(citem.cn);
              })
            }
          })
          this.activeList = arr;
        } else {
          if (this.activeList.filter(item => item == n).length != 0) return; // 如果已经选中过，则不再添加进结果数组
          this.activeList.push(n);
        }
      }
    },
    // 删除结果数组里的某一项
    remove (i) {
      this.activeList.splice(i, 1);
    },
    // 当弹框显示隐藏状态变化时，告诉父组件改变对应值
    change (v) {
      this.show = v;
    },
    // 弹框确定按钮回调
    ok () {
      if (this.justOne) {
        // this.dataJson.forEach(item => {
        //     if(item.n){
        //         item.n.forEach(cItem => {
        //             if()
        //         })
        //     }
        // })
        this.$emit("selectResult", this.otherData);
        this.otherData = "";
        return;
      }
      // if(this.showOther) this.activeList.push(this.otherData);
      this.$emit("selectResult", this.activeList);
    },
    // 弹框取消按钮回调
    cancel () {}
  }
};
</script>
