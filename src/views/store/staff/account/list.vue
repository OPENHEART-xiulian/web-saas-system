<template>
  <div>
    <saas-bread title="账号管理"/>
    <w-tab :tab-index="tabIndex" @tab-change="tabChange" :tabList="tabList"></w-tab>
    <div class="outputlist-container">
      <div class="search-wrap">
        <i-input class="search-input" v-model="formData.username" placeholder="输入姓名/手机号">
          <span class="prepend" slot="prepend">
            <i class="iconfont icon-sousuo"></i>
          </span>
          <span class="append" slot="append" @click="search">搜索</span>
        </i-input>
        
        <i-button v-if="permissionData.create" type="primary" @click="toAdd('create')">新建员工账号</i-button>
      </div>

      <w-table
        ref="table"
        request="staffList"
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
import remindDialog from '@/components/dialog/remind-dialog';
// import { outputStatus, getObj } from '@/store/json/default';
export default {
  components: { remindDialog },
  data () {
    let tabList = this.$permission.getPermissionTab('staffAccountList');
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    let permissionData = this.$permission.data.settingStaff;

    let columns = [
      { title: '序号', type: 'index', width: 80 },
      { title: '姓名', key: 'username' },
      { title: '手机号（登录账号）', key: 'mobile', width: 200 },
      { title: '职位权限', key: 'roleName' },
      { title: '添加人', key: 'addedName' },
      { title: '添加时间', key: 'created', width: 110 },
      { 
        title: '操作',
        render: (h, { row }) => {
          if (!row.isRoot) {
            let elms = [];
            let props = { type: "text" };
            let style = { marginLeft: "10px" }
            if (permissionData.update) {
              elms.push(h('Button', {
                props,
                on: {
                  click: () => {
                    this.$router.push('/store/staff/account/add/' + row.userId);
                  }
                }
              }, '编辑'));
            }

            if (permissionData.enable) {
              elms.push(h('Button', {
                props,
                style: elms.length ? style : {},
                on: {
                  click: () => {
                    // this.remindType = 1;
                    // this.remindTitle = "账号禁用后将无法登录，确认禁用？";
                    // this.remindRow = row;
                    this.toggleStaff(row);
                    // this.$refs.remindDialog.openModal();
                  }
                }
              }, row.accountStatus === 'active' ? '禁用' : '启用'));
            }

            if (permissionData.delete) {
              elms.push(h('Button', {
                props,
                style: elms.length ? style : {},
                on: {
                  click: () => {
                    this.remindType = 0;
                    this.remindTitle = "账号删除后将不可恢复，确认删除？";
                    this.remindRow = row;
                    this.$refs.remindDialog.openModal();
                  }
                }
              }, '删除'));
            }
            return elms;
          }
          return h("div", "--");
        }
      }
    ];

    if (!permissionData.update && !permissionData.enable && !permissionData.delete) columns.pop();
    return {
      permissionData,
      tabIndex,
      tabList,
      loading: false,
      remindType: 0,  // 0：删除员工 1：禁用,
      remindTitle: "",
      remindRow: {},

      formData: {
        username: ""
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
      this.$router.push("/store/staff/account/add/" + id);
    },

    remindConfirm () {
      if (this.remindType) this.toggleStaff();
      else this.deleteStaff();
    },

    deleteStaff () {
      let row = this.remindRow;
      this.$store.dispatch({
        type: 'toDelStaff',
        params: {
          userIdList: [row.userId]
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
        this.$store.commit('REQUEST_ERROR', { err });
      })
    },

    toggleStaff (row) {
      if (this.loading) return;
      this.loading = true;
      let request;
      let tip;
      let accountStatus;
      if (row.accountStatus === 'active') {
        accountStatus = 'frozen';
        request = 'toDisableStaff';
        tip = '禁用';
      } else {
        accountStatus = 'active';
        request = 'toEnableStaff';
        tip = '启用';
      }
      this.$store.dispatch({
        type: request,
        params: {
          userId: row.userId
        }
      }).then(res => {
        if (res.code === '0') {
          this.$Message.success({
            content: tip + '成功',
            onClose: () => {
              row.accountStatus = accountStatus;
              this.loading = false;
            }
          })
        } else {
          this.$Message.error({
            content: tip + '失败',
            onClose: () => {
              row.accountStatus = accountStatus;
              this.loading = false;
            }
          })
        }
      }).catch( err => {
          this.$Message.error({
            content: tip + '失败',
            onClose: () => {
              row.accountStatus = accountStatus;
              this.loading = false;
            }
          })
      })
    }
  }
};
</script>
