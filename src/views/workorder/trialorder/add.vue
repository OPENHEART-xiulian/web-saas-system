<template>
  <div class="add-form add-page">
    <saas-bread :title="breadName">
      <template slot="actions">
        <i-button type="default" @click="back">返回</i-button>
      </template>
    </saas-bread>
    <i-form ref="form" :model="formData" :rules="rules" label-position="top" :show-message="true">
      <div class="search-form header">
        <span>试算单号：{{formData.statementNo}}</span>
        <i class="line"></i>
        <span>开单时间：{{formData.createdAt}}</span>
        <span style="float:right">
          开单人：
          <Select v-model="formData.billUser.userId" size="small" style="width:200px">
            <Option v-for="item in billUsers" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </span>
      </div>
      <!-- 客户信息 -->
      <h2 class="title">客户信息</h2>
      <customer-select
        class="search-form"
        ref="customerSelect"
        :required="true"
        :can-edit="true"
        @on-change="customerSelectChange"
      >
        <div class="form-box">
          <i-form-item class="form-item" prop="vehicleOwner" label="车辆所有人">
            <i-input v-model="formData.vehicleOwner" placeholder="输入车辆所有人" disabled></i-input>
          </i-form-item>
          <i-form-item class="form-item" label="联系电话">
            <i-input v-model="formData.ownerMobile" :maxlength="11" placeholder="输入联系电话"></i-input>
          </i-form-item>
          <i-form-item class="form-item" label="送修人姓名">
            <i-input v-model="formData.repairName" placeholder="输入送修人姓名"></i-input>
          </i-form-item>
          <i-form-item class="form-item" label="送修人联系电话">
            <i-input v-model="formData.repairMobile" :maxlength="11" placeholder="输入送修人联系电话"></i-input>
          </i-form-item>
        </div>
      </customer-select>
      <!-- 接车信息 -->
      <h2 class="title">接车信息</h2>
      <div class="search-form vehicle">
        <div class="form-box width-20">
          <i-form-item class="form-item" prop="deliveryDate" label="送修日期">
            <DatePicker
              type="datetime"
              v-model="formData.deliveryDate"
              :options="timeOptions"
              placeholder="选择送修日期"
            ></DatePicker>
          </i-form-item>
          <i-form-item class="form-item" prop="deliveryMileage" label="送修里程">
            <format-input v-model="formData.deliveryMileage" reg="NUMBER" placeholder="输入送修里程">
              <span slot="append">公里</span>
            </format-input>
          </i-form-item>
          <i-form-item class="form-item" label="维修类型">
            <Icon type="help-circled" class="tip-icon" @click.native.stop="openInfoDialog"></Icon>
            <Select v-model="formData.repairType" placeholder="选择维修类型">
              <Option
                v-for="item in repairTypeArr"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </i-form-item>
          <i-form-item class="form-item" prop="serviceAdvisor" label="服务顾问">
            <Select v-model="formData.serviceAdvisor" multiple>
              <Option
                v-for="item in billUsers"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </i-form-item>
          <i-form-item class="form-item" label="送修油量">
            <Select v-model="formData.repairFuel" placeholder="请选择送修油量">
              <Option
                v-for="item in repairOil"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </i-form-item>
          <i-form-item class="form-item" label="故障信息" style="width: 40%">
            <i-input v-model="formData.description" :rows="3" type="textarea" placeholder="输入故障信息描述"></i-input>
          </i-form-item>
        </div>
        <div class="form-box hide" v-show="showVehicle">
          <i-form-item class="form-item" label="车辆外观检查">
            <select-input
              ref="appearanceInput"
              @open-modal="openAppearanceDialog"
              @on-change="appearanceChange"
              placeholder="是否存在外观问题"
              :data="[
                { value: '1', label: '存在问题', open: true },
                { value: '0', label: '无问题' },
              ]"
            ></select-input>
          </i-form-item>
          <i-form-item class="form-item" label="随车装备">
            <Select v-model="formData.stuff" multiple placeholder="是否有随车装备">
              <Option
                v-for="item in vehicleEquipment"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </i-form-item>
          <i-form-item class="form-item" label="功能检查">
            <select-input
              ref="functionInput"
              @open-modal="openFunctionDialog"
              @on-change="functionChange"
              placeholder="是否存在功能异常"
              :data="[
                { value: '1', label: '功能异常', open: true },
                { value: '0', label: '功能正常' }
              ]"
            ></select-input>
          </i-form-item>
        </div>
        <div class="form-box drop-btn-wrap">
          <i-button
            :class="['drop-btn', {'open': showVehicle}]"
            type="text"
            @click="showVehicle = !showVehicle">
            {{showVehicle ? '收起' : '打开'}}接车检查信息
            <i :class="['iconfont icon-sanjiaoxing-xia', {'drop': showVehicle}]"></i>
          </i-button>
        </div>
      </div>

      <h2 class="title">项目信息</h2>
      <div class="search-form input-list">
        <w-projects ref="projects" :default-list="formData.repairItems" @on-change="projectChange" />
      </div>

      <h2 class="title">配件信息</h2>
      <div class="search-form input-list">
        <w-parts ref="parts" :default-list="formData.repairParts" @on-change="partChange" />
      </div>

      <h2 class="title">其它费用</h2>
      <div class="search-form input-list">
        <w-others ref="others" :default-list="formData.others" @on-change="otherChange" />
      </div>
    </i-form>
    <bottom-submit>
      <div class="slot-left">
        <p class="workorder-price">
          工单金额：
          <span>￥{{formData.realCost | toFixed}}</span>
        </p>
        <p>
          <span>工时费￥{{formData.totalItemCost | toFixed}}</span>
          <span>材料费￥{{formData.totalPartCost | toFixed}}</span>
          <span>其他费用￥{{formData.totalOtherCost | toFixed}}</span>
        </p>
      </div>
      <i-button type="error" :loading="btnLoading" @click="submit">{{btnName}}</i-button>
    </bottom-submit>
    <appearance-dialog
      ref="appearanceDialog"
      @select-success="appearanceSelect"
      @on-cancel="closeAppInput"
    />
    <function-dialog
      ref="functionDialog"
      @select-success="functionSelect"
      @on-cancel="closeFunInput"
    />
    <info-dialog ref="infoDialog" />
  </div>
</template>

<script>
import "@/styles/components/search-form.less";
import "@/styles/views/workorder/add.less";
import mixins from "../components/mixins.js";
import { storage } from "@/assets/js/utils.js";
import { mapGetters } from "vuex";
import { formatTime, randomStr, verify } from "@/assets/js/utils";
import {
  vehicleEquipment,
  vehicleType,
  repairTypeArr,
  repairOil
} from "@/store/json/default";

import SelectInput from "./../components/select-input";
import WProjects from "./../components/workorder-projects"; // 项目信息
import WParts from "./../components/workorder-parts"; // 配件信息
import WOthers from "./../components/workorder-others"; // 其他信息

import AppearanceDialog from "@/components/dialog/appearance-dialog";
import FunctionDialog from "@/components/dialog/function-dialog";
import InfoDialog from "@/components/dialog/info-dialog";
import CustomerSelect from "@/components/customer-select";

export default {
  components: {
    WProjects,
    WParts,
    WOthers,
    CustomerSelect,
    SelectInput,
    AppearanceDialog,
    FunctionDialog,
    InfoDialog
  },
  mixins: [mixins],
  data () {
    // const state = this.$route.params.id;
    const state = this.$route.params.id === "create";
    const validate = (rules, value, callback) => {
      if (rules.required && value === "") {
        return callback(rules.message);
      }
      // 格式错误的时候 提示错误
      if (value !== "" && rules.reg && !verify(rules.reg, value)) {
        rules.message = rules.formatTip;
        return callback(rules.message);
      }
      callback();
    };
    return {
      storage,
      breadName: "试算单开单", // 面包屑文字
      btnName: state ? "生成试算单" : "更新试算单", // 提交按钮文字
      btnLoading: false,
      state: state, // 状态 true 新增  false 更新
      showVehicle: false, // 是否显示车检信息
      vehicleEquipment, // 随车装备数组
      repairTypeArr, // 维修类型数组
      vehicleType, // 车辆类型数组
      repairOil, // 送修油量

      formData: {
        billUser: {
          userId: storage.get("USER").userId,
          userName: storage.get("USER").userName
        }, // '开单人'
        serviceAdvisor: null, // '服务顾问'
        isCompleted: "0", // 是否验证通过
        statementNo: "", // 结算单编号 20位数字
        createdAt: "", // 开单时间 格式： YYYY-MM-DD HH:mm:ss
        vehicleId: "", // 车辆id
        customerId: "", // 客户id
        vehicleOwner: "", // 车辆所有人
        ownerMobile: "", // 车主电话
        repairName: "", // 送修人姓名

        repairFuel: "", // 送修油量
        repairMobile: "", // 送修人联系电话
        plateNo: "", // 车牌号码
        vehicleBrand: "", // 车辆品牌
        brandId: "", // 品牌id
        carSeries: "", // 车系
        carStyle: "", // 车型
        subBrand: "", // 子品牌
        VINCode: "", // 车架号 VINcode
        engineNo: "", // 发动机号
        vehicleType: "", // 车辆类型
        appearance: {
          // 车辆外观检查
          front: [], // 前方
          right: [], // 右方
          left: [], // 左方
          back: [], // 后方
          top: [] // 顶部
        },
        stuff: [], // 随车装备
        malfunction: [], // 功能检查
        deliveryDate: new Date(), // 送修日期
        deliveryMileage: "", // 送修里程
        repairType: "", // 维修类型
        description: "", // 故障信息
        repairItems: [], // 维修项目列表 name：维修项目名称 hours：工时数 price：工时单价
        repairParts: [], // 维修配件列表 partNo：配件编号 quantity：配件数量
        others: [], // 其他项目列表 name：其他项目名称 cost：其他项目费用
        totalItemCost: "0", // 项目总费用
        totalPartCost: "0", // 配件总费用
        totalOtherCost: "0", // 其他总费用
        realCost: "0", // 实收总费用
        receivable: "0" // 应收总费用
      },
      timeOptions: {
        // 时间限制
        disabledDate (date) {
          return date && date.valueOf() > Date.now();
        }
      },
      rules: {
        vehicleOwner: [
          {
            required: true,
            message: "车辆所有人姓名不能为空",
            trigger: "blur",
            validator: validate
          }
        ],
        deliveryDate: [
          {
            required: true,
            message: "请选择送修日期",
            type: "date",
            trigger: "change",
            validator: validate
          }
        ],
        deliveryMileage: [
          {
            required: true,
            message: "送修里程不能为空",
            reg: "NUMBER",
            formatTip: "送修里程只能为数字",
            trigger: "blur",
            validator: validate
          }
        ],
        repairFuel: [
          {
            required: true,
            message: "请选择送修油量",
            trigger: "blur"
          }
        ],
        'serviceAdvisor': [
          {required: true, type: 'array', min: 1, message: '请选择服务顾问', trigger: 'change'},
        ]
      }
    };
  },
  created () {
    this.$store.dispatch("toGetBillUsers");
  },
  mounted () {
    this.init();
  },
  methods: {
    // 返回上一页
    back () {
      this.$router.go(-1);
    },

    init () {
      this.$store.dispatch("toGetBillUsers");
      // 新建工单生成statementNo
      if (this.state) {
        this.formData.statementNo =
          randomStr(4) + formatTime(new Date(), "yyMMddHHmmss") + randomStr(4);
        this.formData.createdAt = formatTime(new Date(), "yyyy-MM-dd HH:mm:ss");
      } else {
        this.getStatementDetail();
      }
    },
    // 获取维修单详情
    async getStatementDetail () {
      const res = await this.$store.dispatch({
        type: "actionGet",
        name: "trialOrderDetail",
        params: {
          statementNo: this.$route.params.id
        }
      });

      if (res.code === "0") {
        this.setDetailData(res.data);
      }
    },

    async setDetailData (to) {
      for (const key in this.formData) {
        if (this.formData.hasOwnProperty(key)) {
          this.formData[key] = to[key];
        }
      }
      if (this.formData.deliveryDate.length === 10) {
        this.formData.deliveryDate = this.formData.deliveryDate + "00:00:00";
      }
      this.formData.serviceAdvisor=to.serviceAdvisorList;
      this.formData.customerId = to.customerId;
      this.formData.vehicleId = to.vehicleId;
      if (!this.formData.billUser.userId) {
        this.formData.billUser.userId = this.storage.get("USER").userId;
        this.formData.billUser.userName = this.storage.get("USER").username;
      }
      if (!this.formData.serviceAdvisor) {
        this.formData.serviceAdvisor = {};
        this.formData.serviceAdvisor.userId = this.storage.get("USER").userId;
        this.formData.serviceAdvisor.userName = this.storage.get(
          "USER"
        ).username;
      }

      this.showVehicle = true;

      let hasAppearance = "0";
      for (const key in this.formData.appearance) {
        if (this.formData.appearance.hasOwnProperty(key)) {
          const element = this.formData.appearance[key];
          if (element.length > 0) {
            hasAppearance = "1";
            continue;
          }
        }
      }

      let str = this.$refs.appearanceDialog.getKeyStr(this.formData.appearance);
      this.$refs.appearanceInput.setText(
        hasAppearance,
        hasAppearance === "1" ? str : "无问题"
      );

      let functionValue = this.formData.malfunction.length > 0 ? "1" : "0";
      let funcStr = this.$refs.functionDialog.getStr(this.formData.malfunction);
      this.$refs.functionInput.setText(
        functionValue,
        hasAppearance === "1" ? funcStr : "功能正常"
      );

      this.$refs.form.$nextTick().then(() => {
        this.$refs.form.validate();
      });

      let customer = JSON.parse(JSON.stringify(to));
      customer.name = customer.vehicleOwner;
      customer.mobile = customer.ownerMobile;
      customer.vehicleIdList = customer.vehicleId ? [customer.vehicleId] : [];
      this.$refs.customerSelect.setData(customer);
    },

    // 设置客户信息
    customerSelectChange (data) {
      if (data.isDefault) return;
      if (data.isUpdateCustomer) {
        this.formData.vehicleOwner = data.name || "";
        this.formData.ownerMobile = data.mobile || "";
        this.formData.repairName = data.name || "";
        this.formData.repairMobile = data.mobile || "";
        this.formData.customerId = data.customerId || "";
      }

      const vehicle = data.vehicleList[0];
      this.setVehicleData(vehicle);
    },

    setVehicleData (data) {
      // 单位用户的车辆用车辆的号码
      if (data.contactName) this.formData.repairName = data.contactName;
      if (data.contactMobile) this.formData.repairMobile = data.contactMobile;
      this.formData.VINCode = data.VINCode;
      this.formData.engineNo = data.engineNo;
      this.formData.plateNo = data.plateNo;
      this.formData.vehicleBrand = data.vehicleBrand;
      this.formData.subBrand = data.subBrand;
      this.formData.carStyle = data.carStyle;
      this.formData.brandId = data.brandId;
      this.formData.vehicleId = data.vehicleId;
      this.formData.vehicleType = data.vehicleType;
    },

    submit () {
      let self = this;
      if (!this.formData.vehicleOwner) {
        this.$Message.warning("请检查客户信息");
        return;
      }

      if (!this.formData.plateNo || !this.formData.VINCode) {
        this.$refs.customerSelect.editVehicle();
        return;
      }

      // 先验证必填项，必填项空的时候不验证 或 填写了的格式是否正确
      let isValid = false;
      this.$refs.form.validate(valid => {
        isValid = valid;
      });
      if (!isValid) {
        this.$Message.warning("请检查是否填写正确");
        return;
      } // 如果格式不正确，需要修改不正确的项

      // 验证必填空字符串
      for (const key in this.rules) {
        if (this.rules.hasOwnProperty(key)) {
          if (this.rules[key][0].required && this.formData[key] === "") {
            isValid = false;
          }
        }
      }
      this.formData.isCompleted = isValid ? "1" : "0";

      const formData = this.formatFormData();
      if (!formData.repairItems && !formData.repairParts) {
        this.$Message.warning("请选择项目信息或配件信息");
        return;
      }

      let request = "trialOrderAdd";
      if (!this.state) {
        request = "trialOrderUpdate";
      }
      let billUserName = this.billUsers.find(
        item => item._id === this.formData.billUser.userId
      );
      this.formData.billUser.userName = billUserName ? billUserName.label : "";
      //拼装服务顾问字段
      let newArray = [];
      for (let i in this.billUsers) {
        if (self.formData.serviceAdvisor.indexOf(self.billUsers[i].value) != -1) {
          newArray.push({userName:self.billUsers[i].username,userId: self.billUsers[i].value})
        }
      }
      delete formData.serviceAdvisor;
      formData.serviceAdvisorList = newArray;
      this.btnLoading = true;
      this.$store
        .dispatch({
          type: "actionPost",
          name: request,
          params: formData
        })
        .then(res => {
          if (res.code === "0") {
            this.$Message.success({
              content: "保存成功",
              onClose: () => {
                this.btnLoading = false;
                this.$router.push({
                  path: "/workorder/trialorder/list"
                });
              }
            });
          } else {
            this.btnLoading = false;
            if (res.code === "107032") {
              this.$Message.warning("维修配件不存在");
            } else if (res.code === "107099") {
              this.$Message.warning(res.msg);
            }
          }
        })
        .catch(err => {
          this.btnLoading = true;
        });
    },

    formatFormData () {
      let formData = Object.assign({}, this.formData);
      // 设置默认值
      if (formData.deliveryDate === "") {
        formData.deliveryDate = formData.createdAt;
      }
      if (formData.deliveryMileage === "") formData.deliveryMileage = "0";
      // 清除空字符串
      for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
          const element = formData[key];
          if (element === "") delete formData[key];
        }
      }

      if (!formData.repairName) formData.repairName = "";
      if (!formData.repairMobile) formData.repairMobile = "";

      formData.deliveryDate = formatTime(
        formData.deliveryDate,
        "yyyy-MM-dd HH:mm:ss"
      );

      formData.repairItems = this.$refs.projects.getFormRows();
      formData.repairParts = this.$refs.parts.getFormRows();
      formData.others = this.$refs.others.getFormRows();

      formData.repairParts.forEach(item => {
        if (Number(item.originQuantity) > 0) {
          if (Number(item.originQuantity) === Number(item.quantity)) {
            item.receivedStatus = "2";
          } else {
            item.receivedStatus = "1";
          }
        } else {
          item.receivedStatus = "0";
        }
      });

      if (formData.repairItems.length === 0) delete formData.repairItems;
      if (formData.repairParts.length === 0) delete formData.repairParts;
      if (formData.others.length === 0) delete formData.others;

      return formData;
    },

    projectChange (sum) {
      this.formData.totalItemCost = String(sum);
      this.getAllCost();
    },
    partChange (sum) {
      this.formData.totalPartCost = String(sum);
      this.getAllCost();
    },
    otherChange (sum) {
      this.formData.totalOtherCost = String(sum);
      this.getAllCost();
    },
    getAllCost () {
      let sum =
        Number(this.formData.totalItemCost) +
        Number(this.formData.totalPartCost) +
        Number(this.formData.totalOtherCost);
      this.formData.realCost = String(sum);
      this.formData.receivable = String(sum);
    },
    /* =========== 弹窗操作 ============= */
    appearanceChange (data) {
      if (data.value === "0") {
        this.formData.appearance = {};
      }
    },
    appearanceSelect (data) {
      this.formData.appearance = data;
    },
    openAppearanceDialog (item, callback, index) {
      this.$refs.appearanceDialog.openModal(
        callback,
        item,
        this.formData.appearance
      );
    },
    closeAppInput () {
      this.$refs.appearanceInput.closeSelect();
    },

    functionChange (data) {
      if (data.value === "0") {
        this.formData.malfunction = [];
      }
    },
    functionSelect (data) {
      this.formData.malfunction = data.term;
    },
    openFunctionDialog (item, callback, index) {
      this.$refs.functionDialog.openModal(
        callback,
        item,
        this.formData.malfunction
      );
    },
    closeFunInput () {
      this.$refs.functionInput.closeSelect();
    },
    openInfoDialog () {
      this.$refs.infoDialog.openModal();
    }
  },
  filters: {
    toFixed (v) {
      return Number(v).toFixed(2);
    }
  }
};
</script>
