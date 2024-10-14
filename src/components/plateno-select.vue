<!-- 车牌选择框 -->
<template>
  <div class="plateno-select">
    <Poptip trigger="click" v-model="show" width="370" placement="top-start">
      <!-- 选择状态 -->
      <div class="flex-wrap" v-if="!status">
        <Button type="default">
          {{ plateText }}
          <i :class="['iconfont icon-sanjiaoxing-xia', {'show': show}]"></i>
        </Button>
        <i-input v-model="plateNo" :maxlength="6" @on-blur="onBlur" @click.stop.native></i-input>
      </div>
      <!-- 完整状态 -->
      <div class="position-wrap" v-else>
        <i-input v-model="fullPlateNo" :maxlength="11" @on-blur="fullBlur" @click.stop.native></i-input>
        <i class="iconfont icon-qiehuan open-select" @click.stop="toggleStatus(0)"></i>
      </div>
      <!-- 下拉框 -->
      <div class="content-wrap" slot="content" @click.stop>
        <ul class="list">
          <!-- 车牌前缀列表 -->
          <li class="list-item" v-for="(item, index) in selectList" :key="index">
            <span :class="{active: item.plateNo === plateText}" @click="selectItem(item)">{{item.plateNo}}</span>
          </li>
          <!-- 功能按钮 -->
          <li :class="['list-item icon-wrap', {'edit': isEdit}]">
            <i-input v-model="editPlateText" :maxlength="4" v-if="isEdit"></i-input>
            <!-- 确定按钮 -->
            <span class="confirm" v-if="isEdit" @click="submit" :loading="loading">
              <i class="iconfont icon-dagou edit-icon"></i>
            </span>
            <!-- 取消按钮 -->
            <span class="cancel" v-if="isEdit" @click="cancel" :loading="loading">
              <i class="iconfont icon-guanbi edit-icon"></i>
            </span>
            <!-- 添加按钮 -->
            <span class="confirm" v-if="!isEdit" @click="isEdit = true">
              <i class="iconfont icon-dagou icon-jiahao"></i>
            </span>
          </li>
        </ul>
        <div class="content-footer">
          <i-button type="text" @click="toggleStatus(1)">
            <i class='iconfont icon-qiehuan'></i>
            <span>切换为手动输入</span>
          </i-button>
          <!-- <span @click="toSystemPlateno">管理车牌号前缀</span> -->
        </div>
      </div>
    </Poptip>
  </div>
</template>

<script>
import { storage } from '@/assets/js/utils';
export default {
  props: {
    value: {        // 车牌号码
      type: String,
      default: ''
    }
  },
  data () {
    return {
      isEdit: false,      // content是否处于编辑状态
      show: false,        // 是否打开下拉框
      loading: false,     // 提交数据中
      status: 0,          // 0: 选择输入   1： 完整输入
      editPlateText: '',  // 添加输入框的文字
      defaultText: '粤A',
      plateText: '',      // 车牌前缀
      plateNo: '',        // 车牌号
      fullPlateNo: '',    // 完整车牌号
      selectList: [],     // 车牌前缀列表
      store: null,        // 门店数据 用于添加车牌前缀后更新本地数据       
    }
  },
  watch: {
    value (v) {
      this.init(v);
    }
  },
  created () {
    this.init(this.value);
  },
  methods: {
    init (value) {
      this.store = storage.get('STORE');
      this.selectList = this.store.plateNo || [];
      this.fullPlateNo = value;
      const validData = this.validate(value);
      
      if (!value) {
        this.plateText = this.selectList.length > 0 ? this.selectList[0].plateNo : this.defaultText;
        this.plateNo = '';
        this.status = 0;
      } else if (validData) {
        this.plateText = validData.plateNo;
        this.plateNo = value.substr(validData.plateNo.length);
        this.status = 0;
      } else {
        this.plateText = value.substr(0, 2);
        this.plateNo = value.substr(2);
        this.fullPlateNo = value;
        this.status = 1;
      }
    },

    // 验证值是否在列表中 返回对应的数据
    validate (value) {
      let inSelectList = this.selectList.find(elm => {
        let reg = new RegExp('^' + elm.plateNo);
        return reg.test(value);
      });
      return inSelectList;
    },

    // 车牌前缀选择
    selectItem (data) {
      this.plateText = data.plateNo;
      this.fullPlateNo = this.plateText + this.plateNo;
      this.show = false;
      if (this.status) this.status = 0;
      this.onChange();
    },

    // 选择状态切换
    toggleStatus (status) {
      this.status = status;
      this.show = !status;
    },

    // 添加车牌前缀确定
    async submit () {
      this.editPlateText = this.editPlateText.toUpperCase();
      const eq = this.selectList.find(elm => elm.plateNo === this.editPlateText);
      if (eq) {
        this.$Message.warning('前缀已存在');
        return;
      }
      if (this.editPlateText) {
        this.loading = true;
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'plateNoSave',
          params: {
            plateNo: this.editPlateText
          }
        });

        if (res.code === '0') {
          this.selectList.push(res.data);
          this.store.plateNo = this.selectList;
          storage.set('STORE', this.store);
        }

        this.loading = false;
      }
      
      this.cancel();
    },

    cancel () {
      this.editPlateText = '';
      this.isEdit = false;
    },

    onBlur () {
      this.plateNo = this.plateNo.toUpperCase();
      this.fullPlateNo = this.plateText + this.plateNo;
      this.onChange();
    },

    fullBlur () {
      this.fullPlateNo = this.fullPlateNo.toUpperCase();
      const validData = this.validate(this.fullPlateNo);
      if (validData) {
        this.plateText = validData.plateNo;
        this.plateNo = this.fullPlateNo.substr(validData.plateNo.length);
      } else {
        this.plateText = this.fullPlateNo.substr(0, 2);
        this.plateNo = this.fullPlateNo.substr(2);
      }
      this.onChange();
    },

    onChange () {
      let fullPlateNo = "";
      if (this.plateNo) fullPlateNo = this.plateText + this.plateNo;
      this.$emit('input', fullPlateNo);
      this.$emit('on-change', fullPlateNo);
    },

    toSystemPlateno () {
      this.$router.push('/store/system/plateno');
    }
  }
}
</script>

<style lang="less">
  .plateno-select {
    .ivu-poptip, .ivu-poptip .ivu-poptip-rel {
      display: block;
    }
    .flex-wrap {
      display: flex;
      >.ivu-btn {
        padding: 0;
        min-width: 100px;
        margin-right: 10px;
        color: #332E29;
      }

      .ivu-btn .iconfont {
        font-size: 12px;
        display: inline-block;
        color: #332E29;
        margin-left: 5px;
        position: relative;
        bottom: 1px;
      }
      .ivu-btn .iconfont.show {
        transform: rotate(180deg);
      }
    }

    .position-wrap {
      position: relative;
      width: 100%;
      .open-select {
        // display: none;
        cursor: pointer;
        position: absolute;
        padding: 2px 8px;
        top: 0px;
        right: 0px;
        font-size: 18px;
        color: #ff8000;
      }
      &:hover .open-select{
        // display: block;
      }
    }

    .ivu-poptip-body {
      padding: 0;
    }

    .content-wrap {
      padding: 15px 15px 5px 15px;
      .list {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
      }
      .list-item {
        width: 60px;
        margin-right: 10px;
        margin-bottom: 10px;
        &:nth-child(5n) {
          margin-right: 0;
        }
      }
      .list-item span {
        cursor: pointer;
        display: block;
        color: #332E29;
        background: white;
        border: 1px solid #ddd;
        border-radius: 3px;
        text-align: center;
        padding: 6px 0;
      }
      .list-item span.active {
        color: #ff8800;
        background: white;
        border: 1px solid #ff8800;
      }
      .list-item.icon-wrap {
        display: flex;
        align-items: center;
        margin-right: 0;
        &.edit {
          width: 130px;
        }
        span {
          display: block;
          padding: 0;
          width: 28px;
          min-width: 28px;
          margin-right: 4px;
          line-height: 30px;
          height: 32px;
          &:last-child {
            margin-right: 0;
          }
        }

        .edit-icon {
          display: block;
          color: white;
          font-size: 12px;
          line-height: inherit;
        }

        span.cancel {
          background: #F7F4F2;
          border-color: #F7F4F2;
          .edit-icon {
            color: #BFBDBA;
          }
        }

        span.confirm {
          color: white;
          background: #ff8800;
          border: 1px solid #ff8800;
        }

        .ivu-input-wrapper {
          width: 60px;
          height: 32px;
          margin-right: 10px;
        }

        .ivu-input {
          height: 32px;
        }
      }

      .content-footer {
        margin-top: 10px;
        line-height: 48px;
        border-top: 1px solid #ddd;
        display: flex;
        align-items: center;
        justify-content: space-between;
        >span {
          cursor: pointer;
          color: #807D7C;
          font-size: 12px;
        }
        .ivu-btn>span{
          display: flex;
          align-items: center;
          
          .iconfont {
            color: #ff8000;
            margin-right: 8px;
            font-size: 14px;
          }
          span {
            color: #807D7C;
            font-size: 12px;
          }
        }
      }
    }
  }
</style>
