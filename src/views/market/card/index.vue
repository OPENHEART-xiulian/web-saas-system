<template>
  <!-- 影响 - 会员卡 -->
  <div>
       <Modal
        v-model="modal1"
    
        @on-ok="ok"
        @on-cancel="cancel">
           <p slot="header" style="text-align:left">
            <Icon type="ios-information-circle" color="#f29100"></Icon>
            <span>提示</span>
        </p>
        <p>会员卡核销方式已变更为密码核销，会员卡默认密码均为手机号码后六位，为了会员卡的资金安全，请尽快联系客户变更会员卡核销密码</p>

    </Modal>
    <saas-bread title="会员卡管理">
      <template slot="actions" v-if="permissionData.create">
        <Button type="default" v-if="tabIndex === 0" @click="exportCard">导出会员卡</Button>
        <Button type="error" @click="toSale">出售会员卡</Button>
      </template>
    </saas-bread>
    <!-- tab列表 -->
    <saas-tab v-model="tabIndex" :data="tabs" max-badge="99" @on-change="onTabChange"></saas-tab>
    <!-- 数据列表 -->
    <keep-alive>
      <component :is="tabItem.componentName" ref="component"></component>
    </keep-alive>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
  import ServerCardList from "./server-list";              // 服务卡列表
  import RechargeCardList from "./recharge-list";   // 充值卡列表
  import { storage } from '@/assets/js/utils.js';
  export default {
    components: { ServerCardList, RechargeCardList },
    data () {
      let tabs = this.$permission.getPermissionTab('marketVipList');
      let name = this.$route.query.name;
      let tabIndex = name ? tabs.findIndex(elm => elm.componentName == name) : 0;

      let permissionData = this.$permission.data.marketCardService;
      return {
         modal1: false,
          user: storage.get("USER"),
        tabs,
        tabIndex,
        tabItem: tabs[tabIndex],
        permissionData,
      }
    },
        computed: {
            ...mapGetters({
      userData: 'getUser'
    })
  },
 created(){
       this.$store.dispatch({
      type: 'toGetUser',
      params: {
        userId: storage.get("USER").userId
      }
    });
  },
    watch: {
    userData(newName, oldName) {
     console.log(newName, oldName)
     if(newName.remind=="0"){
       this.modal1 = true
     }
    }
  },
   mounted(){
   
    
    // if(this.$store.state.account.user.remind=="0"){
    //   this.modal1 = true
    // }
    },
 
    methods: {
         ok () {
               
        this.$store.dispatch({
        type: 'toEditAccountName',
        params: {
          username: this.userData.username,
          remind:"1" 
        }
      }).then((res) => {
        if (res.code === '0') {
          this.isEdit = !this.isEdit;
          this.user.username = this.userData.username;
          this.user.remind = '1';
          storage.set("USER", this.user);
          const data = this.user.username;
          this.$store.commit('TO_SAVE_USERNAME', { data });
          console.log('修改成功')
        } else {
          console.log('修改失败');
        }
      
      }).catch((err) => {
     
      })
            },
            cancel () {
                this.$Message.info('Clicked cancel');
            },
      // 切换tab
      onTabChange (index) {
        this.tabItem = this.tabs[index];  // 设置选中的tab
        // 替换路由是为了刷新的时候选中对应的tab
        this.$router.replace({
          path: this.$route.path,
          query: {
            name: this.tabItem.componentName
          }
        });
      },

      exportCard(){
        this.$refs.component.exportCard()
      },

      toSale () {
        this.$router.push('/market/card/form/create');
      },
    }
  }
</script>
