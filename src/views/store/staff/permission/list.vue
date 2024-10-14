<template>
  <div>
    <sas-bread title="权限管理"/>
    <w-tab :tab-index="tabIndex" @tab-change="tabChange" :tabList="tabList"></w-tab>
    <div class="outputlist-container">
      <div class="search-wrap">
        <i-input class="search-input" v-model="formData.roleName" placeholder="输入角色名称">
          <span class="prepend" slot="prepend">
            <i class="iconfont icon-sousuo"></i>
          </span>
          <span class="append" slot="append" @click="search">搜索</span>
        </i-input>
        <i-button v-if="permissionData.create" type="primary" @click="toAdd('create')">新建角色</i-button>
      </div>

      <w-table
        ref="table"
        request="getRolesList"
        :formData="formData"
        :columns="columns"
        :tableData="tableData">
      </w-table>
    </div>
    
    <remind-dialog 
      ref="remindDialog"
      :title="remindTitle"
      @on-ok="remindConfirm">
    </remind-dialog>
  </div>
</template>

<script>
import "@/styles/views/inventory/output-list.less";
import { mapGetters } from 'vuex';
import { outputStatus, getObj } from '@/store/json/default';
import remindDialog from '@/components/dialog/remind-dialog';
export default {
  components: { remindDialog },
  data () {
    let tabList = this.$permission.getPermissionTab('staffAccountList');
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    let permissionData = this.$permission.data.settingPermission;
    let columns = [
      { title: '序号', type: 'index', width: 80 },
      { title: '角色名称', key: 'roleName' },
      { 
        title: '描述', 
        key: 'description',
        render: (h, { column, row }) => {
          return h("span", row.roleName == "店长" ? "具备门店所有管理权限" : row[column.key] || "--");
        }
      },
      { title: '员工数量', key: 'employeeCount' },
      { 
        title: '操作',
        width: 140,
        render: (h, { row }) => {
          if (row.roleName == "店长") return h("span", "--");
          let elms = [];
          if (permissionData.update) {
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$router.push('/store/staff/permission/add/' + row._id);
                }
              }
            }, '编辑'));
          }

          if (permissionData.delete) {
            elms.push(h('Button', {
              props: {
                type: 'text'
              },
              style: {
                marginLeft: elms.length ? "10px" : 0
              },
              on: {
                click: () => {
                  this.remindType = 0;
                  this.remindTitle = "账号删除后将不可恢复，确认删除？";
                  this.remindRow = row;
                  this.$refs.remindDialog.openModal();
                }
              }
            }, '删除'))
          }
          return elms;
        }
      }
    ];

    if (!permissionData.update && !permissionData.delete) columns.pop();
    return {
      permissionData,
      tabIndex,
      tabList,
      remindType: 0,  // 0：删除员工 1：禁用,
      remindTitle: "",
      remindRow: {},
      formData: {
        roleName: ""
      },
      columns
    };
  },
  
  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  methods: {
    tabChange (index, data) {
      this.$router.push(data.path);
    },
    search () {
      this.$refs.table.init();  
    },

    toAdd (id) {
      this.$router.push("/store/staff/permission/add/" + id || "create");
    },

    remindConfirm () {
      let row = this.remindRow;
      this.$store.dispatch({
        type: 'actionPost',
        name: 'permissionDelete',
        params: {
          id: row._id
        }
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('删除成功');
          this.$refs.remindDialog.onCancel();
          this.$refs.table.init();
        } else {
          this.$Message.warning('删除失败，请稍后再试');
        }
      }).catch((err) => {
        console.log(err);
      })
    },
  }
};
</script>
