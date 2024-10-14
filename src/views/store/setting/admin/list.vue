<template>
  <div class="store-admin-list">
    <div class="store-admin-head" v-if="isAllStore">
      <i-button v-if="permiss.search" type="default" @click="$router.push('/store/setting/claim')">认领分店</i-button>
      <i-button v-if="permiss.create" type="primary" @click="$router.push('/store/setting/form/create')">新建分店</i-button>
    </div>
    <w-table
      ref="table"
      request="storeChainList"
      :formData="formData"
      :columns="columns"
      :tableData="tableData">
    </w-table>
    <remind-dialog
      ref="remindDialog"
      :title="remindTitle"
      :content="remindContent"
      @on-ok="remindConfirm">
    </remind-dialog>
    <transition name="fade">
      <div class="first-modal-bg" v-if="firstModalShow">
        <div class="first-modal">
          <div class="first-modal-head">
            <img src="/images/store_new_feature.png" alt="门店背景">
          </div>
          <p class="first-modal-title">门店连锁管理功能上线啦</p>
          <div>
            <i-button class="first-modal-confirm" type="primary" @click="onModalConfirm">立即设置</i-button>
          </div>
          <i-button class="first-modal-cancel" type="text" @click="firstModalShow = false">本店不是连锁店</i-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import "@/styles/views/inventory/output-list.less";
import { mapGetters } from 'vuex';
import {storage} from '@/assets/js/utils';
import { getCityText } from '@/store/json/city';
import { outputStatus, getObj } from '@/store/json/default';
import remindDialog from '@/components/dialog/remind-dialog';
export default {
  components: { remindDialog },
  data () {
    let permiss = this.$permission.data.settingStore;
    let selfStoreId = storage.get('STORE').storeId
    let isMasterStore = storage.get('STORE').isMasterStore || ''
    let isChainStore = storage.get('STORE').isChainStore || ''
    let columns = [
      { title: '序号', type: 'index', width: 80 },
      {
        title: '门店名称',
        key: 'storeName',
        width: 240,
        render: (h, { row, column }) => {
          let elms = [h('span', row[column.key])];
          if (row.masterStoreId === row._id) {
            elms.push(h('span', {
              class: 'item-tag'
            }, '总店'));
          }
          return h('div', {
            class: 'item-warpper'
          }, elms)
        }
      },
      { title: '门店负责人', key: 'contactName' },
      { title: '负责人手机', key: 'contactMobile' },
      {
        title: '门店区域',
        key: 'address',
        render: (h, { row, column }) => {
          return [getCityText(row.provinceCode) + getCityText(row.cityCode) + getCityText(row.countyCode)];
        }
      },
      { title: '共享门店', key: 'shareStoreNameStr' },
      {
        title: '状态',
        key: 'storeDisable',
        render: (h, { row, column }) => {
          return h('span', row[column.key] ? '已停用' : '正常');
        }
      },
      {
        title: '操作',
        width: 140,
        render: (h, { row }) => {
          let elms = [];
          //添加共享按钮
          if(this.isChain&&row.masterStoreId != row._id&&storage.get('STORE').isMasterStore){
            elms.push(h('Button', {
              props: { type: 'text' },
              style: {
                marginRight: "10px"
              },
              on: {
                click: () => {
                  this.$router.push({ path: "/store/setting/admin/shareSetting",query:{storeId:row._id} });
                }
              }
            }, '共享'));
          }
          // 如果是总店，就可以编辑所有门店
          if (selfStoreId === row.masterStoreId) {
            // 编辑权限
            if (permiss.update) {
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    this.$router.push('/store/setting/form/' + row._id);
                  }
                }
              }, '编辑'));
            }
            // 总店不能被停用
            if (row.masterStoreId === row._id)  return elms;
            // 启用停用权限
            if (permiss.toggle) {
              elms.push(h('Button', {
                props: {
                  type: 'text'
                },
                style: {
                  marginLeft: elms.length ? "10px" : 0
                },
                on: {
                  click: () => {
                    this.remindTitle = "停用分店：" + row.storeName;
                    this.remindContent = "停用后，分店账号将暂时无法登录（可重新启用），确定停用吗？";
                    this.remindRow = row;
                    if (row.storeDisable) {
                      this.remindConfirm();
                    } else {
                      this.$refs.remindDialog.openModal();
                    }
                  }
                }
              }, row.storeDisable ? '启用' : '停用'));
            }
            return elms;
          } else {
            // 如果自己是分店 只能编辑自己的门店
            if (selfStoreId === row._id && permiss.update) {
              elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$router.push('/store/setting/form/' + row._id);
                }
              }
              }, '编辑'));
            }
            return elms;
          }
        }
      }
    ];
    if(!isMasterStore || !isChainStore){
      columns.slice(5,1)
    }

    if (!permiss.update && !permiss.toggle) columns.pop();
    return {
      firstModalShow: false,
      permiss,
      remindTitle: "",
      remindContent: "",
      remindRow: {},
      formData: {},
      columns,
      selfStoreId,
      isChain: false, // 是否为连锁店
      isAllStore: false,
      tableData: []
    };
  },

  watch: {
    allTableData (to) {
      this.isChain = to.inChain;
      this.$emit('getMessage',this.isChain);
      this.tableData = to.rows;
      let selfStoreId = storage.get('STORE').storeId;
      // 当前账号是否为总店
      let isAllStore = this.tableData.find(elm => elm.masterStoreId === selfStoreId);
      // 如果是总店显示认领分店
      this.isAllStore = !!isAllStore;
    },
  },

  computed: {
    ...mapGetters({
      allTableData: 'getAllTableData'
    })
  },

  mounted () {
    this.checkFeature();
  },

  methods: {
    // 检测是否是第一次进入页面
    checkFeature () {
      this.$store.dispatch({
        type: 'actionGet',
        name: 'pcFeatureCheck'
      }).then(res => {
        if (res.code == 0) {
          let item = res.data.list.find(elm => elm.key === 'chainStore');
          if (item) {
            this.firstModalShow = true;
            this.readFeature(item._id);
          }
        }
      })
    },
    // 设置功能已读
    readFeature (featureId) {
      this.$store.dispatch({
        type: 'actionPost',
        name: 'pcFeatureRead',
        params: { featureId }
      })
    },

    onModalConfirm () {
      this.firstModalShow = false;
      this.$router.push('/store/setting/chain')
    },

    remindConfirm () {
      let row = this.remindRow;
      row.storeDisable = !row.storeDisable;
      row.storeId = row._id;
      this.$store.dispatch({
        type: 'actionPost',
        name: 'storeChainUpdate',
        params: row
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success(row.storeDisable ? '门店已成功停用' : "门店已成功启用");
          this.$refs.remindDialog.onCancel();
          this.$refs.table.init();
        } else {
          this.$Message.warning('操作失败，请稍后再试');
        }
      }).catch((err) => {
        console.log(err);
      })
    },
  }
};
</script>

<style lang="less">
  .store-admin-head {
    background: white;
    padding: 20px;
    text-align: right;
    button {
      margin-left: 10px;
    }
  }
  .first-modal-bg {
    position: fixed;
    z-index: 10000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  .first-modal {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    text-align: center;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    width: 240px;
    height: 286px;
    line-height: 1;
    &-head {
      width: 240px;
      height: 121px;
      margin-bottom: 40px;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    &-title {
      font-size: 14px;
      color: #332e29;
      margin-bottom: 32px;
    }
    &-confirm {
      font-size: 14px;
      margin-bottom: 10px;
      width: 150px;
      height: 34px;
    }
    &-cancel {
      font-size: 14px;
      color: #BFBDBA;
    }
  }
  .item-warpper {
    display: flex;
    align-items: center;
  }
  .item-tag {
    border-radius: 2px;
    background: rgb(252, 240, 228);
    color: #ff8000;
    min-width: 32px;
    margin-left: 8px;
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    text-align: center;
  }
</style>
