<template>
  <!-- 账号设置 -->
  <div class="account-wrap">
    <saas-bread title="账号设置"></saas-bread>
    <ul class="account-content">
      <li>
        <span>
          <img src="/images/icon_user_orange.png" alt="" />
        </span>
        <div class="list-name">
          <p v-if="!isEdit">{{ userData.username }}</p>
          <Input v-else v-model="userData.username" 
            :disabled="loading" />
          <p>{{ userData.roleName }}</p>
        </div>
        <Button v-if="!isEdit" type="text" @click="editName">修改账号名称</Button>
        <div v-else class="name-opt">
          <Button type="text" 
            @click="save" 
            :loading="loading">保存</Button>
          <Button type="text" @click="cancel">取消</Button>
        </div>
      </li>
      <li>
        <span>手机号码</span>
        <span>{{ userData.mobile }}</span>
        <Button type="text" @click="openPhoneModal">修改手机号码</Button>
      </li>
      <li>
        <span>密码</span>
        <span>已设定</span>
        <Button type="text" @click="openPasswordModal">更改密码</Button>
      </li>
    </ul>
    <password-dialog ref="passwordDialog"></password-dialog>
    <phone-dialog ref="phoneDialog"></phone-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import passwordDialog from '@/components/dialog/password-dialog';
import phoneDialog from '@/components/dialog/phone-dialog';
import { storage } from '@/assets/js/utils.js';
import '@/styles/views/account/index.less';

export default {
  components: { passwordDialog, phoneDialog },
  data () {
    return {
      isEdit: false,
      user: storage.get("USER"),
      curName: '',
      loading: false
    }
  },
// 
  created () {
    this.$store.dispatch({
      type: 'toGetUser',
      params: {
        userId: storage.get("USER").userId
      }
    })
  },

  computed: {
    ...mapGetters({
      userData: 'getUser'
    })
  },

  methods: {
    openPhoneModal () {
      this.$refs.phoneDialog.openModel();
    },

    openPasswordModal () {
      this.$refs.passwordDialog.openModel();
    },

    editName () {
      this.isEdit = !this.isEdit;
      this.curName = this.userData.username;
    },

    cancel () {
      this.isEdit = !this.isEdit;
      this.userData.username = this.curName;
    },

    save () {
      this.loading = true;
      this.$store.dispatch({
        type: 'toEditAccountName',
        params: {
          username: this.userData.username
        }
      }).then((res) => {
        if (res.code === '0') {
          this.isEdit = !this.isEdit;
          this.user.username = this.userData.username;
          console.log(this.user)
          storage.set("USER", this.user);
          const data = this.user.username;
          this.$store.commit('TO_SAVE_USERNAME', { data });
          this.$Message.success('修改成功');
        } else {
          this.$Message.warning('修改失败');
        }
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
      })
    }
  },

}
</script>
