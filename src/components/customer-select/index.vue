<template>
  <div class="customer-select">
    <div class="input" v-if="!disabled">
      <client-input 
        ref="clientInput"
        :is-cry="isCry"
        :required="required"
        @cry-change="cryChange"
        @on-change="searchOnChange"
        placeholder="输入客户名称/联系方式">
      </client-input>
    </div>
    <div class="slot" v-if="formData.customerId">
      <slot :open-dialog="openDialog" :filter-list="filterList" :select-list="formData.vehicleIdList" :filter-method="filterMethod" :filter-select="filterSelect"></slot>
    </div>
    <ul v-if="formData.customerId" class="form-item vehicle-list" style="width: 100%">
      <li class="vehicle-item" v-for="(item, index) in vehicleList" :key="index">
        <div :class="{'active': formData.vehicleIdList.indexOf(item.vehicleId) > -1 }" @click="vehicleSelect(item)">
          <div class="icon">
            <my-img :src="GET_BRAND_LOGO + item.brandId"></my-img>
          </div>
          <div class="content">
            <p class="plate-no">{{item.plateNo}}</p>
            <p class="brand">{{item. vehicleBrand + ' ' + item.carSeries + ' ' + item.carStyle}}</p>
          </div>
          <div>
            <!-- 没有车牌号，VIN，车辆品牌 就显示按钮 -->
            <i-button v-if="permissionData.create && canEdit && (!item.plateNo || !item.VINCode || !item.vehicleBrand)" class="edit-btn" type="text" @click="editCustomer(index)">完善车辆信息</i-button>
          </div>
          <i v-if="formData.vehicleIdList.indexOf(item.vehicleId) > -1" class="ivu-icon ivu-icon-ios-checkmark-empty check-icon"></i>
        </div>
      </li>
    </ul>
    <div class="more-btn-wrap">
      <template v-if="allVehicleList.length > 2">
        <p v-if="showMore">该客户还有 <span type="text">{{allVehicleList.length - 2}}</span> 辆车，输入车牌号可快速匹配车辆</p>
        <i-button v-if="showMore" type="text" @click="toggleVehicleList">查看所有车辆 <i class="iconfont icon-sanjiaoxing-xia"></i></i-button>
        <i-button v-else type="text" @click="toggleVehicleList">收起车辆 <i :class="['iconfont icon-sanjiaoxing-xia', {'down': !showMore}]"></i></i-button>
      </template>
      <template v-if="formData.customerId && canEdit && permissionData.create">
        <span style="margin: 0 10px" v-if="allVehicleList.length > 2">|</span>
        <i-button type="text" @click="openDialog">新增车辆</i-button>
      </template>
    </div>
    <Spin v-if="loading" fix></Spin>
    <add-brand ref="dialog" @on-confirm="addSuccess" :required="required" :auto-close="false"></add-brand>
  </div>
</template>

<script>
  import { GET_BRAND_LOGO } from '@/https/api.js';
  import ClientInput from './client-input';  // 查询input组件
  import AddBrand from '@/components/dialog/add-brand';

  export default {
    components: { ClientInput, AddBrand },
    props: {
      required: Boolean,
      canEdit: {
        type: Boolean,
        default: false,
      },
      isCry: {
        type: Boolean,
        default: false
      },

      disabled: {
        type: Boolean,
        default: false
      },
      multiple: {
        type: Boolean,
        default: false
      },
    },
    data () {
      let permissionData = this.$permission.data.customer;
      return {
        permissionData,
        GET_BRAND_LOGO,                                                 // 车标logo
        vehicleList: [],                                                // 当前展示的车辆列表
        filterList: [],                                                 // 所有车辆信息 
        allVehicleList: [],                                             // 所有车辆信息 
        selectVehicleList: [],                                          // 当前选中的车辆列表
        showMore: false,                                                // 是否显示查看更多
        formData: {
          name: '',
          mobile: '',
          customerId: '',
          vehicleIdList: []
        },
        loading: false,
        tempData: {}
      }
    },
    methods: {
      // 设置默认数据
      setData (data) {
        let formData = {};
        formData.name = data.name;
        formData.mobile = data.mobile;
        formData.customerId = data.customerId;
        formData.vehicleIdList = data.vehicleIdList;
        this.formData = formData;
        this.getClientList(formData.customerId);
      },
      // 获取客户信息 车辆列表
      async getClientList (customerId) {
        this.loading = true;
        if (customerId) {
          const res = await this.$store.dispatch({
            type: 'workerGetClientList',
            params: { customerId }
          });

          if (res.code === '0') {
            let data = res.data.rows[0];
            if (data) {
              this.tempData = Object.assign({}, data);
              let list = data.vehicles || [];
              let newList = [];
              let selectList = [];
              list.forEach(item => {
                if (this.formData.vehicleIdList.indexOf(item.vehicleId) > -1) {
                  newList.unshift(item);
                  selectList.push(item);
                } else {
                  newList.push(item);
                }
              });
              this.setVehicleList(newList);
              this.selectVehicleChange(selectList);
              this.onChange(true, true);
            } else {
              // 客户被删掉的时候情况当前工单客户信息
              this.formData.customerId = "";
              this.formData.name = "";
              this.formData.mobile = "";
              this.formData.vehicleIdList = [];
              this.onChange(true);
            }
          }
          if (!this.disabled) this.$refs.clientInput.cryptonym = false;
        }

        this.loading = false;
      },
      // 设置客户信息
      searchOnChange (data) {
        if (data) this.tempData = Object.assign({}, data);
        else data = {};

        this.setVehicleList(data.vehicles);

        this.formData.name = data.name;
        this.formData.mobile = data.mobile;
        this.formData.customerId = data.customerId;

        const vehicle = this.vehicleList[0];
        this.selectVehicleChange([vehicle]);
        this.onChange(true);
      },

      // 选择一辆车，
      vehicleSelect (data) {
        let list;
        if (this.multiple) {
          let index = this.formData.vehicleIdList.indexOf(data.vehicleId);
          if (index > -1) {
            list = this.selectVehicleList;
            list.splice(index, 1);
          } else {
            list = this.selectVehicleList;
            list.push(data);
          }
        } else {
          list = [data];
        }
        this.selectVehicleChange(list);
        this.onChange(false);
      },

      // 根据下拉选择的车辆，将选中的车辆排到前面
      vehicleSort (data) {
        const list = this.allVehicleList.slice(0);
        const index = list.findIndex(elm => elm.vehicleId === data.vehicleId);
        const spliceData = list.splice(index, 1)[0];
        list.unshift(spliceData);
        if (!this.showMore) {
          this.vehicleList = list.slice(0);
        } else {
          this.vehicleList = list.slice(0, 2);
        }
        this.allVehicleList = list;
        this.vehicleSelect(data);
      },

      // 设置选中的车辆列表
      selectVehicleChange (array) {
        this.selectVehicleList = array[0] ? array : [];
        this.formData.vehicleIdList = this.selectVehicleList.map(elm => elm.vehicleId);
      },

      // 获取选取车辆的VINcode
      getSelectedVIN () {
        if (this.selectVehicleList.length > 0) {
          return this.selectVehicleList[0].VINCode
        } else {
          return ''
        }
      },

      setVehicleList (list) {
        this.allVehicleList = list || [];
        this.showMore = this.allVehicleList.length > 2;
        if (this.showMore) {
          this.vehicleList = this.allVehicleList.slice(0, 2);
        } else {
          this.vehicleList = this.allVehicleList.slice(0);
        }
        this.filterList = this.allVehicleList.slice(0);
      },

      filterMethod (value, option) {
        return option.toUpperCase().indexOf(value.toUpperCase()) > -1;
      },

      filterSelect (data) {
        // if (!plateNo) return;
        // let data = this.allVehicleList.find(elm => elm.plateNo === plateNo);
        this.vehicleSort(data);
      },

      // 隐藏与显示更多车辆
      toggleVehicleList () {
        this.showMore = !this.showMore;
        if (this.showMore) {
          this.vehicleList = this.allVehicleList.slice(0, 2);
        } else {
          this.vehicleList = this.allVehicleList.slice(0);
        }
      },
      
      // 回调 是否更新客户信息
      onChange (isUpdateCustomer, isDefault) {
        this.$emit('on-change', {
          isUpdateCustomer,
          isDefault,
          customerId: this.formData.customerId,
          name: this.formData.name,
          mobile: this.formData.mobile,
          vehicleIdList: this.formData.vehicleIdList,
          // 兼容删除客户后的报错
          vehicleList: this.selectVehicleList.length ? this.selectVehicleList : [{}]
        });
      },

      // 匿名按钮回调
      cryChange (v) {
        if (v) {
          this.searchOnChange();
        } else {
          this.searchOnChange(this.tempData);
        }
      },

      openDialog () {
        this.$refs.dialog.openModal();
      },

      editVehicle () {
        this.$refs.dialog.openModal({
          vehicle: this.selectVehicleList[0]
        });
      },

      editCustomer (index) {
        this.$refs.dialog.openModal({
          vehicle: this.vehicleList[index]
        });
      },

      async addSuccess (data) {
        let params = data.vehicle;
        params.customerId = this.formData.customerId;
        try {
          const res = await this.$store.dispatch({
            type: 'actionPost',
            name: 'vehicleSave',
            params: data.vehicle
          });
          if (res.code === '0') {
            let resData = res.data;
            for (const key in resData) {
              if (resData[key] === null) resData[key] = "";
            }
            this.$Message.success({
              content: '保存成功',
              onClose: () => {
                data.callback();
                let index = this.allVehicleList.findIndex(elm => elm.vehicleId === res.data.vehicleId);
                if (index > -1) {
                  this.allVehicleList.splice(index, 1, res.data);
                } else {
                  this.allVehicleList.push(res.data);
                }
                this.setVehicleList(this.allVehicleList);
                // if (!this.selectVehicleList.length) {
                  this.vehicleSelect(res.data);
                // }
              }
            });
          } else {
            data.callback();
          }
        } catch (error) {
          console.log(error)
          data.callback();
        }
      },
    }
  }
</script>

<style  lang="less">
  .customer-select {
    background: white;
    padding: 0 20px 20px;
    .input {
      box-shadow: inset 0px -1px 0px 0px rgba(247, 244, 242, 1);
      padding: 20px 0;
      /deep/ .client-input {
     text-align: left; 
     .input-con {
    display: flex;
    align-items: center;
 .m-input {
   
    width: 441px;
    height: 40px;
}
 .add-btn {
     position: static;
     right: 0;
    top: 0; 
     transform: translateY(0); 
    width: 120px;
    height: 40px;
    background: #ff800000;
     color:#FF8000;
     border: 1px solid #FF8000;
    border-radius: 2px;
    margin-left: 20px;
}
}
}
    }

    .slot {
      padding-top: 20px;
    }
    .form-item.vehicle-list{
      padding: 0!important;
      display: flex;
      flex-wrap: wrap;
      .vehicle-item{
        margin-bottom: 10px;
        width: 50%;
        >div{
          position: relative;
          overflow: hidden;
          display: flex;
          cursor: pointer;
          align-items: center;
          padding: 10px 10px;
          height: 60px;
          border-radius: 5px;
          background-color: rgba(255, 255, 255, 1);
          border: 1px solid rgba(229, 226, 223, 1);
          
          &:hover{
            border-color: fade(#FF8000, 90%);
          }

          &.active{
            border-color: fade(#FF8000, 105%);
            &::after {
              content: '';
              position: absolute;
              width: 18px;
              height: 18px;
              right: 0;
              bottom: 0;
              background:url("../../assets/images/icon/icon_select.png")no-repeat center center;
              background-size: 100% 100%;

              z-index: 9;
            }
          }

          .content {
            flex-grow: 1;
          }

          .edit-btn {
            position: absolute;
            right: 20px;
            bottom: 6px;
          }

          .check-icon {
            position: absolute;
            display: block;
            right: 3px;
            top: -3px;
            font-size: 30px;
            color: white;
            z-index: 10;
          }

          .icon{
            height: 36px;
            min-width: 36px;
            margin-right: 15px;
            img{
              height: 100%;
            }
          }
          .plate-no{
            line-height: 20px;
            min-height: 20px;
            text-align: left;
            margin-bottom: 2px;
            font-size: 14px;
            color: rgba(51, 46, 41, 1);
          }
          .brand{
            line-height: 17px;
            text-align: left;
            font-size: 12px;
            color: rgba(128, 125, 124, 1);
          }
        }

        &:nth-child(odd){
          padding-right: 20px;
        }
        &:nth-child(event){
          padding-left: 20px;
        }
      }
    }
  }
</style>
