<template>
  <div class="store-claim">
    <saas-bread title="认领分店">
      <i-button slot="actions" type="default" @click="$router.go(-1)">暂不设置</i-button>
    </saas-bread>

    <div class="claim-container">
      <div class="search-wrap">
        <i-input v-model.trim="formData.storeName" @on-enter="onSearchClick"  placeholder="请输入门店名称">
          <span class="search-btn" slot="append" @click="onSearchClick">搜索</span>
        </i-input>
      </div>
      <div class="claim-list" v-if="list.length">
        <div class="claim-list__item" v-for="(item, index) in list" :key="index">
          <div class="claim-item-bg">
            <p class="title">{{item.storeName}}</p>
            <p class="info">{{item.contactName}} | {{item.contactMobile}} | {{item.address}}</p>
            <i-button class="btn" type="primary" @click="onClaimClick(item)">认领门店</i-button>
          </div>
        </div>
      </div>
      <div v-else class="no-data">暂无数据</div>
      
      <div style="display: flex; flex-grow: 1; justify-content: flex-end; padding-top: 20px;">
        <saas-page
          ref="page"
          v-show="total > params.rows"
          :sizer="true"
          :page="params.page"
          :rows="params.rows"
          :total="total"
          @on-change="pageChange">
        </saas-page>
      </div>
      <claim-dialog ref="claimDialog"></claim-dialog>
      <Spin fix v-if="loading"></Spin>
    </div>
  </div>
</template>

<script>
import ClaimDialog from "@/components/dialog/claim-dialog";
export default {
  components: { ClaimDialog },
  data () {
    return {
      loading: false,
      formData: {
        storeName: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      list: []
    }
  },

  methods: {
    onClaimClick (data) {
      this.$refs.claimDialog.openModal(data, this.claimStore);
    },
    claimStore () {

    },
    onSearchClick () {
      this.params.page = 1;
      this.params.rows = 10;
      this.search();
    },
    async search () {
      if (!this.formData.storeName) return;
      this.loading = true;
      try {
        let res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'storeChainSearch',
          params: Object.assign({}, this.params, this.formData)
        });
        if (res.code == 0) {
          this.list = res.data.rows;
          this.total = res.data.total;
        }
        this.loading = false;
      } catch (error) {
        console.log(error)
        this.loading = false;
      }
    },
    pageChange (data) {
      this.params.page = data.page;
      this.params.rows = data.rows;
      this.search();
    }
  }
}
</script>

<style lang="less">
  .store-claim {
    .claim-container {
      position: relative;
      background: white;
      padding: 20px;
    }
    
    .search-wrap {
      padding: 20px 0 20px;
      border-bottom: 1px solid #f0f0f0;
      .ivu-input-wrapper {
        width:500px;
        margin: auto;
      }
      .ivu-input-group-append {
        cursor: pointer;
        border-radius: 3px;
        padding: 0;
        background: #ff8000;
        border-color: #ff8000;
      }
      .search-btn {
        height: 100%;
        width: 80px;
        color: white;
        display: inline-block;
      }
    }

    .claim-list {
      display: flex;
      flex-wrap: wrap;
      padding: 20px 0 0;
      &__item {
        width: 50%;
        flex-grow: 1;
        padding-right: 10px;
        margin-bottom: 20px;
        &:nth-child(2n) {
          padding-right: 0;
          padding-left: 10px;
          margin-right: 0;
        }
        .claim-item-bg {
          padding: 20px;
          border: 1px solid #f0f0f0;
        }
        .title {
          font-size: 16px;
          color: #332e29;
          margin-bottom: 10px;
        }
        .info {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .pagination {
      padding-top: 0;
    }
    .no-data {
      text-align: center; 
      line-height: 200px; 
      font-size: 14px; 
      color: #666;
    }
  }
</style>
