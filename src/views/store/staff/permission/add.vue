<template>
  <div class="staff-add add-page">
    <saas-bread :title="breadName"/>
    <Form ref="form" 
      class="w-form"
      :model="formData" 
      :rules="ruleValidate" 
      :label-width="125">
      <FormItem label="角色名称" prop="roleName">
        <Input v-model="formData.roleName" placeholder="限制2-10字符内，如：服务顾问" class="input-style"/>
        <!-- <div class="role-tip">限制2-10字符内，如：服务顾问</div> -->
      </FormItem>
      <FormItem label="角色描述" prop="description">
        <Input v-model="formData.description"
          type="textarea"
          class="input-style" 
          placeholder="限制50字内" />
      </FormItem>
      <FormItem label="功能权限" prop="authority">
        <i-button type="default" style="margin-bottom: 10px;" @click="togglePermission">{{ permissionOpen ? '全部折叠' : '展开全部'}}</i-button>
        <permission ref="permission" :permission="permission" @toggle-parent="onPermissionChange"></permission>
      </FormItem>
    </Form>
    <bottom-submit  @on-cancel="$router.go(-1)" @on-confirm="validate" :loading="btnLoading"></bottom-submit>
    <Spin fix v-if="loading"></Spin>
  </div>
</template>

<script>
import '@/styles/views/store/staff-add.less';
import '@/styles/components/form.less';
import { storage } from "@/assets/js/utils";
import permission from "./permission";

export default {
  components: { permission },
  data () {
    let id = this.$route.params.id;
    let isCreate = id === "create";
    return {
      loading: false,
      btnLoading: false,
      permissionOpen: false,
      id,
      isCreate,
      breadName: isCreate ? "新增权限" : "编辑权限",
      formData: {
        roleName: "",
        description: "",
        permissionIds: []
      },
      ruleValidate: {
        roleName: [
          { required: true, message: "角色名称不能为空" }
        ]
      },
      allPermissionList: [],
      userPermissionList: [],
      userPermissionIds: [],
      permission: {}
    }
  },

  created () {
    this.init();
  },

  methods: {
    async init () {
      this.loading = true;
      try {
        await this.getPermissionList();
        if (!this.isCreate) await this.getPermissionDetail();
        this.getUserPermissionIds(this.userPermissionList);
        this.formatPermissionList();
        // setTimeout(() => {
        //   this.$refs.permission.toggleOpenAll();
        //   this.$refs.permission.toggleCheckAll();
        //   // setTimeout(() => {
        //   //   this.$refs.permission.toggleCloseOpenAll();
        //   //   this.$refs.permission.toggleCloseCheckAll();
        //   // }, 3000)
        // }, 3000);
        // setTimeout(() => {
        //   console.log(this.$refs.permission.getPermissionIds());
        // }, 6000);
        this.loading = false;
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
    },

    togglePermission () {
      this.permissionOpen = !this.permissionOpen;
      this.permissionOpen ? this.$refs.permission.toggleOpenAll() : this.$refs.permission.toggleCloseOpenAll();
    },

    // 获取所有权限列表
    async getPermissionList () {
      let res = await this.$store.dispatch({
        type: "actionGet",
        name: "permissionList"
      });
      // res = require("./permission.js").data;
      // console.log(res)
      this.allPermissionList = res.data;
    },

    // 获取角色详情
    async getPermissionDetail () {
      let res = await this.$store.dispatch({
        type: "actionGet",
        name: "permissionDetail",
        params: {
          id: this.id
        }
      });
      let detail = res.data;
      this.userPermissionList = detail.permissions;
      this.formData.id = this.id;
      this.formData.roleName = detail.roleName;
      this.formData.description = detail.description;
    },

    // 获取格式好的权限列表 value为true表示没有子级并且已选中，有子级子级全选中，indeterminate表示子级有一个以上选中
    formatPermissionList () {
      this.permission = this.recursion({
        children: this.allPermissionList
      }, this.userPermissionIds);
      // console.log(this.permission)
    },

    // 递归获取用户权限对应的id列表
    getUserPermissionIds (list) {
      list.forEach(elm => {
        if (this.userPermissionIds.indexOf(elm._id) < 0) this.userPermissionIds.push(elm._id);
        if (elm.children && elm.children.length) {
          this.getUserPermissionIds(elm.children);
        }
      });
    },

    /**
     * 递归设置所有权限对应的value indeterminate
     * @param {Object} parent 父级对应的权限
     * @param {Array} userPermissionIds 用户所有权限的id
     * @returns {Object} 返回父级对象对应数据
     */
    recursion (parent, userPermissionIds) {
      let permissionList = parent.children;
      parent.children = [];
      parent.indeterminate = false; // 父级的子级是否有一个选中
      parent.value = true; // 父级的子级是否全部选中
      parent.hasGrandson = false;  // 父级是否有孙子
      for (let i = 0, len = permissionList.length; i < len; i++) {
        let elm = permissionList[i];
        if (elm.children && elm.children.length) {
          parent.hasGrandson = true;
          elm = this.recursion(elm, userPermissionIds);
          // elm.value = elm.value || false;
          // elm.indeterminate = elm.indeterminate || false;
        } else {
          // 查找是否存在该权限
          let hasPermission = !(this.userPermissionIds.indexOf(elm._id) < 0);
          // 如果存在权限，value,indeterminate设置为true;
          elm.indeterminate = !!hasPermission;
          elm.value = elm.indeterminate;
        }
        // 如果有一个true，则父级的indeterminate也为true
        if (!parent.indeterminate) parent.indeterminate = elm.indeterminate;
        // 有一个没全选，则不全选
        if (parent.value) parent.value = elm.value;
        parent.children.push(elm);
      }
      return {
        _id: parent._id || "",
        permissionType: parent.permissionType || "",
        menuName: parent.menuName || "",
        menuCode: parent.menuCode || "",
        parentMenuCode: parent.parentMenuCode || "",
        hasGrandson: parent.hasGrandson,
        indeterminate: parent.indeterminate,
        value: parent.value,
        children: parent.children
      };
    },

    onPermissionChange (permission) {
      // console.log(permission);
    },

    validate () {
      let permissionIds = this.$refs.permission.getPermissionIds();
      if (permissionIds.length <= 0) {
        this.$Message.warning("请至少选择一个岗位权限");
        return;
      }
      this.formData.permissionIds = permissionIds;
      this.$refs.form.validate(valid => {
        if (valid) this.submit();
      });
    },

    async submit () {
      let params = this.formData;
      let request = "permissionCreate";
      if (!this.isCreate) request = "permissionUpdate";
      let res = await this.$store.dispatch({
        type: "actionPost",
        name: request,
        params
      });
      
      if (res.code === "0") {
        console.log('添加成功');
        this.$Message.success({
          content: "保存成功",
          onClose: () => {
            this.$router.push("/store/staff/permission/list");
          }
        })
      }
    }
  },
}
</script>
