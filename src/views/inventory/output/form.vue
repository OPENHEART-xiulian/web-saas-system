<template>
  <!-- 耗材出库 -->
  <div class="output-form">
    <saas-bread title="耗材出库">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
      </template>
    </saas-bread>
    <i-form :model="formData" :rules="rules">
      <div class="output-form-head">
        <!-- <span class="output-form-head__label">出库单号：</span>
        <span class="output-form-head__value">CK201906140764 </span> -->
        <!-- <span class="output-form-head__line"></span> -->
        <!-- <span class="output-form-head__label">开单时间：</span>
        <span class="output-form-head__value">2019-06-17 14:55:04</span> -->
        <!-- <span class="flex-grow"></span> -->
        <span class="output-form-head__label">领料人：</span>
        <i-select 
          class="output-form-head__value output-form-head__select"
          v-model="formData.billUserId">
          <i-option v-for="(item, index) in userList" :key="index" :value="item._id">{{item.username}}</i-option>
        </i-select>
      </div>

      <div class="output-form-content">
        <div class="output-form-content__head">
          <span>耗材信息</span>
        </div>
        <div class="output-form-content__table">
          <workorder-part ref="parts" :hideSinceBeld="true"></workorder-part>
        </div>
      </div>
    </i-form>

    <bottom-submit>
      <i-button :loading="btnLoading" @click="$router.go(-1)">取消</i-button>
      <i-button type="error" :loading="btnLoading" @click="submit">保存</i-button>
    </bottom-submit>
  </div>
</template>

<script>
import WorkorderPart from "@/views/workorder/components/workorder-parts";
export default {
  components: { WorkorderPart },
  data () {
    return {
      btnLoading: false,
      userList: [],
      formData: {
        billUserId: "",
        consumables: []
      },
      rules: {}
    }
  },

  created () {
    this.getData();
  },

  methods: {
    async getData () {
      let data = await this.$store.dispatch({
        type: "getBillUsersList"
      });
      this.userList = data;
      if (this.userList.length) {
        this.formData.billUserId = this.userList[0]._id;
      }
    },
    
    submit () {
      this.formData.consumables = this.$refs.parts.getFormRows();
      if (!this.formData.consumables.length) {
        this.$Message.error("请选择配件");
        return
      }
      this.createConsumable();
    },

    createConsumable () {
      this.btnLoading = true;
      this.$store.dispatch({
        type: "actionPost",
        name: "createConsumable",
        params: this.formData
      }).then(res => {
        if (res.code == 0) {
          this.$Message.success({
            content: "保存成功",
            onClose: () => {
              this.$router.go(-1);
              this.btnLoading = false;
            }
          });
        } else {
          this.$Message.error("添加失败");
          this.btnLoading = false;
        }
      }).catch(err => {
        this.$Message.error("添加失败");
        this.btnLoading = false;
        console.log(err);
      })
    }
  }
}
</script>

<style lang="less">
  .output-form {
    padding-bottom: 80px;
    &-head {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      background: white;
      .flex-grow {
        flex-grow: 1;
      }
      span {
        display: inline-block;
        color: #332E29;
        font-size: 14px;
      }
      &__label {
        width: 80px;
      }
      &__value {
        width: 160px;
      }
      &__select {
        width: 200px;
      }
    }
    &-content {
      margin-top: 20px;
      background: white;
      &__head {
        background: #fafafa;
        color: #332E29;
        font-size: 14px;
        padding: 10px 20px;
      }
      &__table {
        padding: 20px;
      }
    }
  }
</style>
