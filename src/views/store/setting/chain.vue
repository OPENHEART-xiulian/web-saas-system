<template>
  <div class="store-chain">
    <saas-bread title="门店设置">
      <i-button slot="actions" type="default" @click="$router.go(-1)">暂不设置</i-button>
    </saas-bread>
    <div class="chain-container">
      <div class="chain-item left">
        <div class="chain-item__head">
          <img src="/images/store_avatar_zong.png" alt="总店">
        </div>
        <p class="chain-item__title">本门店是总店</p>
        <p class="chain-item__sub">设置为总店后可获得创建分店、管理分店等功能</p>
        <i-button class="chain-item__btn" type="primary" @click="onModalShow">立即设置</i-button>
      </div>
      <div class="chain-item right">
        <div class="chain-item__head">
          <img src="/images/store_avatar_fen.png" alt="分店">
        </div>
        <p class="chain-item__title">本门店是分店</p>
        <p class="chain-item__sub">联系总店关联为分店，即可使用连锁门店管理功能</p>
      </div>
    </div>
    <remind-dialog 
      ref="remindDialog"
      title="设置为总店"
      content="设置后不可修改，确定设置为总店吗？"
      @on-ok="remindConfirm">
    </remind-dialog>
  </div>
</template>

<script>
import remindDialog from '@/components/dialog/remind-dialog';
export default {
  components: { remindDialog },
  data () {
    return {

    }
  },
  methods: {
    onModalShow () {
      this.$refs.remindDialog.openModal();
    },

    async remindConfirm () {
      try {
        let res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'storeSetMaster',
          params: { type: 'self' }, // self为总店
        });

        if (res.code == 0) {
          this.$Message.success('总店设置成功');
          this.$router.push('/store/setting/admin/list')
        }
      } catch (error) {
          this.$Message.error('总店设置失败，请重试');
      }
    }
  }
}
</script>

<style lang="less">
  .store-chain {
    .chain-container {
      display: flex;
      >:first-child {
        margin-right: 20px;
      }
    }

    .chain-item {
      padding: 40px 0;
      flex-grow: 1;
      background: white;
      text-align: center;
      &__head {
        margin: 0px auto 10px;
        width: 88px;
        height: 88px;
        border-radius: 50%;
        overflow: hidden;
        background: #ddd;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      &__title {
        font-size: 14px;
        line-height: 1;
        color: #332e29;
        margin-bottom: 10px;
      }
      &__sub {
        font-size: 12px;
        color: #807D7C;
        line-height: 1;
        margin-bottom: 20px;
      }
      .chain-item__btn {
        width: 150px;
        height: 34px;
      }
    }
  }
</style>
