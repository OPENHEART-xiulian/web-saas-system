<template>
  <div class="client-input">
    <div class="input-con">
      <format-input ref="input" 
        v-model.trim="inputText" 
        :placeholder="placeholder"
        @on-change="onChange" 
        @on-focus="focus" 
        @on-blur="blur" 
       >
      </format-input>
      <i-button v-if="permissionData.create" class="add-btn"  @click="openDialog" icon="md-add">新建客户</i-button>
      <ul 
        v-show="showSelect" 
        class="client-list" 
        @mouseenter="enter" 
        @mouseleave="leave">
        <li class="client-item title" v-if="vehicleList.length > 0">车辆信息</li>
        <li class="client-item" v-for="(item, index) in vehicleList" :key="index" @click="optionClick(item, 'plateNo')">
          <span v-html="item.highPlateNo+' | '+item. vehicleBrand + ' / ' + item.carSeries + ' / ' + item.carStyle"></span>
        </li>

        <li class="client-item title" v-if="list.length > 0">客户信息</li>
        <li class="client-item" v-for="item in list" :key="item.customerId" @click="optionClick(item, 'customer')" >
          <span v-if="item.customerCode" v-html="item.highCustomerCode">}</span> 
          <span v-if="item.name" class="line">|</span>
          <span v-if="item.name" v-html="item.highName"></span> 
          <span v-if="item.mobile" class="line">|</span>
          <span v-if="item.mobile" v-html="item.highMobile"></span>
        </li>
        <li v-if="permissionData.create" v-show="list.length === 0 && vehicleList.length === 0 && inputText && !loading" class="client-item no-data" @click="openDialog">
          无匹配的客户信息，点击新增客户
          <Icon type="chevron-right"></Icon>
        </li>
        <li v-else v-show="list.length === 0 && vehicleList.length === 0 && inputText && !loading" class="client-item no-data">无匹配的客户信息</li>
        <Spin fix v-if="loading"></Spin>
      </ul>
    </div>
    <i-checkbox v-if="isCry" v-model="cryptonym" @on-change="cryChange">匿名购买</i-checkbox>
    <add-brand ref="dialog" @on-confirm="addSuccess" :required="required" :client="true" :auto-close="false"></add-brand>
  </div>
</template>

<script>
  import AddBrand from '@/components/dialog/add-brand';
  export default {
    components: { AddBrand },
    props: {
      value: String,
      placeholder: String,
      required: Boolean,
      isCry: {
        type: Boolean,
        default: false
      }
    },
    data () {
      let permissionData = this.$permission.data.customer;
      return {
        permissionData,
        timer: null,
        cryptonym: true,
        inputText: '',
        loadingText: '',    // 当前请求的文字
        loading: false,
        hoverList: false,   // 用于判断鼠标是否进入select范围，input失焦不关闭select 
        showSelect: false,  // 是否显示select框
        list: [],
        vehicleList: []
      }
    },
    watch: {
      value (to) {
        this.inputText = to;
      }
    },
    mounted () {
      this.inputText = this.value;
    },
    methods: {
      enter () {
        this.hoverList = true;
      },
      leave () {
        this.hoverList = false;
        if (this.showSelect) this.setFocus(); // 如果select未关闭情况鼠标移出，重新获取焦点
      },
      blur () {
        this.$emit('input', this.inputText);
        if (this.hoverList) return;
        this.showSelect = false;
      },
      focus () {
        this.showSelect = true;
        this.$emit('on-focus');
      },
      setFocus () {
        this.$refs.input.focus();
      },
      onChange () {
        this.$emit('input', this.inputText);
        this.search();
      },
      search () {
        if (!this.loading && this.inputText && this.loadingText !== this.inputText) {
          clearTimeout(this.timer);
          this.loadingText = this.inputText;
          this.loading = true;
          this.$store.dispatch({
            type: 'workerGetClientList',
            params: {
              filter: this.inputText,
              forOrder: true
            }
          }).then( res => {
            if (res.code === '0') {
              let list = [];
              let vehicleList = [];
              let reg = new RegExp(this.loadingText, 'i');
              res.data.rows.forEach(item => {
                // 当客户code 名字 号码中有一个包含输入的内容，添加到列表
                if (reg.test(item.name) || reg.test(item.customerCode) || reg.test(item.mobile)) {
                  item.highName = item.name.replace(reg, '<i>' + this.loadingText + '</i>');
                  item.highCustomerCode = item.customerCode.replace(reg, '<i>' + this.loadingText + '</i>');
                  if (item.mobile) {
                    item.highMobile = item.mobile.replace(reg, '<i>' + this.loadingText + '</i>');
                  }
                  list.push(item);
                }
                
                if (item.vehicles) {
                  item.vehicles.forEach(citem => {
                    if (reg.test(citem.plateNo)||reg.test(citem.vehicleBrand)||reg.test(citem.carSeries)||reg.test(citem.carStyle)) {
                      citem.parent = item;
                      let str=citem.plateNo+' | '+citem. vehicleBrand + ' / ' + citem.carSeries + ' / ' + citem.carStyle
                      citem.highPlateNo = str.replace(reg, '<i>' + this.loadingText + '</i>');
                      vehicleList.push(citem);
                    }
                  });
                }
              });
              
              this.list = list;
              this.vehicleList = vehicleList;
            }
            this.loading = false;
            this.timer = setTimeout(() => {
              if (this.inputText !== this.loadingText) {
                this.search();
              }
            }, 1000 / 60);
          })
        }
      },
      optionClick (value, type) {
        this.showSelect = false;
        this.cryptonym = false;
        let obj = value;

        if (type === 'plateNo') {
          obj = Object.assign({}, value.parent);
          let newVehicles = [];
          obj.vehicles.forEach(item => {
            if (item.vehicleId === value.vehicleId) {
              newVehicles.unshift(item);
            } else {
              newVehicles.push(item);
            }
          });
          obj.vehicles = newVehicles;
        }

        this.$emit('input', obj.name);
        this.$emit('on-change', obj)
      },
      openDialog () {
        this.$refs.dialog.openModal();
      },
      addSuccess (data) {
        data.client.vehicles = [data.vehicle];
        this.save(data);
      },
      
      async save (data) {
        let request = 'clientAdd';
        let formData = data.client;
        formData.client = 'pc';
        try {
          const res = await this.$store.dispatch({
            type: request,
            params: formData
          });
          if (res.code === '0') {
            this.$Message.success({
              content: '保存成功',
              onClose: () => {
                data.callback();
                this.optionClick(res.data);
              }
            });
          }else if(res.code === 403){
            this.$Modal.confirm({
              title: '提示',
              content: res.msg+"已存在，是否确认重复创建客户？",
              okText: "确认创建",
              onOk: () => {
                data.client.status=1;
                this.save(data);
              },
              onCancel: () => {
                data.callback(true);
              }
            });
          } else {
            data.callback(true);
          }
        } catch (error) {
          data.callback(true);
          this.$Message.error("添加失败，请稍后再试");
        }
      },
      cryChange (v) {
        this.$emit('cry-change', v);
      }
    }
  }
</script>

<style lang="less">
.client-input {
  text-align: center;
  .input-con {
    display: inline-block;
    width: 550px;
    height: 48px;
    position: relative;
    .m-input {
      height: 100%;
    }
  }
  
  .add-btn {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    /deep/ .ivu-icon-md-add:before {
    content: "\f330";
    font-size: 17px;
    margin-right: -4px;
}
  }
  
  .ivu-checkbox {
    margin-left: 15px;
    .ivu-checkbox-inner {
      margin-right: 5px;
    }
  }

  .client-list{
    text-align: left;
    position: relative;
    width: 100%;
    z-index: 100;
    max-height: 300px;
    overflow: auto;
    background: white;
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
    position: absolute;
    left: 0;
    top: 102%;
  }

  .client-item {
    padding-left: 20px;
    line-height: 40px;
    font-size: 14px;
    cursor: pointer;

    &.title {
      cursor: default;
      background: #f3f3f3!important;
      height: 40px;
      line-height: 40px;
    }

    span {
      display: inline-block;
      width: auto;
    }

    span.line {
      margin: 0 5px;
      position: relative;
      bottom: 1px;
      padding: 0;
    }

    span i {
      font-style: normal;
      color: #FF8000;
    }
    
    &:hover{
      background: #fafafa;
    }
  }
  .no-data {
    padding: 0 0 0 20px;
    i {
      display: inline-block;
      width: 30px;
      text-align: center;
      height: 100%;
      line-height: 40px;
      float: right;
    }
  }
}
</style>
