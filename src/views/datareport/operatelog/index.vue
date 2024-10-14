<template>
  <div class="operatelog">
    <saas-bread title="操作记录"> </saas-bread>
    <i-form
      class="search-form"
      :mode="formData"
      label-position="left"
      :label-width="0"
      :rules="rules"
    >
      <i-form-item label="" style="width: 100%">
        <div class="time-group">
          <RadioGroup
            class="radio-group"
            v-model="formData.p"
            type="button"
            @on-change="radioChange"
          >
            <template v-for="(item, index) in timeGroupData">
              <Radio :key="index" :label="item.value">{{ item.label }}</Radio>
            </template>
          </RadioGroup>
          <DatePicker
            class="start-date"
            v-model="formData.dateFrom"
            type="date"
            placeholder="开始日期"
            @on-change="dateChange"
          ></DatePicker>
          -
          <DatePicker
            class="end-date"
            v-model="formData.dateTo"
            type="date"
            placeholder="结束日期"
            @on-change="dateChange"
          ></DatePicker>
          <div class="screen" @click="tabScreen">
            {{ screenShowText }}
            <div class="icon" :style="{transform: 'rotate('+rotate+')'}"></div>
          </div>
        </div>
      </i-form-item>
      <div class="flex" style="margin-bottom:20px;" v-show="screenShow">
        <div style="width:200px;margin-right:20px;">
          <p style="margin:10px 0;">操作模板</p>
          <Select v-model="formData.module" placeholder="全部模板">
            <template v-for="(item, index) in optModule">
              <Option :key="index" :value="item.value">{{ item.label }}</Option>
            </template>
          </Select>
        </div>
        <div style="width:200px;">
          <p style="margin:10px 0;">账号名称</p>
          <i-input v-model="formData.username"></i-input>
        </div>
      </div>
      <div v-show="screenShow">
        <i-form-item style="text-align:right;width:100%;">
          <i-button
            type="default"
            style="margin-right: 10px"
            @click="reset"
            :loading="loading"
            >重置</i-button>
          <i-button type="primary" @click="search" :loading="loading"
            >筛选</i-button>
        </i-form-item>
      </div>
    </i-form>

    <w-table
      ref="table"
      request="storeOperateLog"
      :columns="columns"
      :formData="formData"
      :tableData="tableData"
      @format-form="searchFormat"
    >
    </w-table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { formatTime } from "@/assets/js/utils";
import {
  searchTimeList,
  optModule,
  userLogType,
  getLabel,
} from "@/store/json/default";
import { setTimeout } from "timers";
export default {
  data() {
    return {
      rotate:"0deg",
      screenShowText: "收起筛选",
      screenShow:true,
      loading: false,
      timeGroupData: searchTimeList,
      optModule: optModule,
      formData: {
        p: "yesterday",
        module: "",
        username: "",
      },
      rules: {},
      columns: [
        { title: "序号", type: "index", width: 80 },
        { title: "账号名称", key: "username" },
        {
          title: "操作模块",
          key: "module",
          render: (h, { row }) => {
            return [getLabel(row.module, optModule)];
          },
        },
        {
          title: "操作",
          key: "type",
          render: (h, { row }) => {
            return [getLabel(row.type, userLogType)];
          },
        },
        {
          title: "操作时间",
          width: 180,
          key: "created",
          render: (h, { row }) => {
            return h("div", formatTime(row.created, "yyyy-MM-dd HH:mm:ss"));
          },
        },
        { title: "操作内容", key: "remark", minWidth: 200 },
      ],
    };
  },

  watch: {
    tableData(to) {
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
  },

  computed: {
    ...mapGetters({
      tableData: "getTableData",
    }),
  },

  methods: {
    tabScreen(){
      if(this.screenShow){
        this.screenShow  = false
        this.screenShowText = "展开筛选"
        this.rotate = "180deg"
      }else{
        this.screenShow  = true
        this.screenShowText = "收起筛选"
        this.rotate = "0deg"
      }
    },
    searchFormat(formData) {
      this.loading = true;
      // formData.p = this.formData.p;
      formData.dateFrom = formatTime(formData.dateFrom, "yyyy-MM-dd");
      formData.dateTo = formatTime(formData.dateTo, "yyyy-MM-dd");
      // formData.module = this.formData.module;
      // formData.username = this.formData.username;
    },

    radioChange() {
      this.formData.dateFrom = "";
      this.formData.dateTo = "";
    },

    dateChange(v) {
      this.formData.p = "";
      if (!this.formData.dateFrom && !this.formData.dateTo) {
        this.formData.p = this.timeGroupData[0].value;
      }
    },

    reset() {
      this.formData.p = this.timeGroupData[0].value;
      this.formData.dateFrom = "";
      this.formData.dateTo = "";
      this.formData.module = "";
      this.formData.username = "";
      this.search();
    },

    search() {
      this.$refs.table.init();
    },
  },
};
</script>

<style lang="less">
.operatelog {
  .search-form {
    .ivu-form-item {
      width: 437px;
      margin-bottom: 10px;
    }

    .time-group {
      position: relative;
      .screen {
        position: absolute;
        top: 0px;
        right: 0px;
        display:flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 40px;
        background: #ffffff;
        border: 1px solid #e5e0da;
        border-radius: 2px;
        font-size: 14px;
        color: #332e29;
        .icon{
          margin-left: 29px;
          // margin-bottom: 6px;
          width: 10px;
          height: 10px;
          background: url(../../../assets/images/icon/icon_shouqi@2x.png)no-repeat center center;
          background-size: 100% 100%;
          transition:all .6s ;
        }
      }
      .radio-group {
        margin-right: 10px;
      }
    }
  }
}
</style>
