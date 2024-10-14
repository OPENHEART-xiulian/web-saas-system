<template>
    <div class="layout">
        <template v-if="show">
            <!-- 遮罩层 -->
            <!-- <div class="mask"></div>  -->
            <aside :class="{'icon-menu': iconMenu}">
                <div class="logo" @click="$router.push('/index')">
                    <my-img src="/images/logo_s.png"/>
                </div>
                <side-nav :icon-menu="iconMenu" :nav-list="navList"></side-nav>
            </aside>
            <!-- <div class="page-con"> -->
            <page :menu-list="menuList" @toggle-menu="toggleMenu" ref="page">
                <!-- <Alert type="warning" show-icon style="margin-top: 20px;"
                  v-if="$route.path !== '/store/health/list' && !$store.getters.getIsBussiness && hasBusiness"
                >
                  汽车维修电子健康档案账号未绑定
                  <template slot="desc">
                    系统检测到汽车电子健康档案账号未绑定，维修记录无法自动上传，请重新绑定账号
                    <i-button type="primary" @click="$router.push('/store/health/list')" style="margin-left: 10px;">立即绑定</i-button>
                  </template>
                </Alert> -->
                <Alert type="warning" show-icon style="margin-top: 20px;" v-if="canAlert" class="healthAlertBox">
                    汽车维修电子健康档案账号未绑定
                    <template slot="desc">
                        系统检测到汽车电子健康档案账号未绑定，维修记录无法自动上传，请重新绑定账号
                        <div style="margin-top:12px;">
                            <i-button type="primary" @click="$router.push('/store/health/list')"
                                      style="margin-right: 20px;height:32px;font-size:12px;">立即绑定
                            </i-button>
                            <span class="ivu-btn-text" @click="noTips()" style="cursor:pointer">不再提示</span>
                        </div>
                    </template>
                </Alert>
                <!-- <router-view></router-view> -->
                <my-keep-alive></my-keep-alive>
            </page>
            <!-- </div> -->
            <!-- 操作指引 弹窗顺序1 -->
            <course-dialog ref="courseDialog" @open-carousel="openCarousel" @on-cancel="openUsreDialog"></course-dialog>
            <!-- 图片轮播 假视频 -->
            <carousel-dialog ref="carouselDialog" @cancel-modal="openCarousel"></carousel-dialog>
            <!-- 健康档案 弹窗顺序2 -->
            <user-dialog ref="userDialog" @on-cancel="openVersionDialog"></user-dialog>
            <!-- 版本提示弹窗 弹窗顺序3 -->
            <versions-dialog ref="versionsDialog" title="版本消息" @on-cancel="openNoticeDialog"></versions-dialog>
            <!-- 公告提示弹窗 弹窗顺序4 -->
            <versions-dialog ref="noticeDialog" title="公告消息"></versions-dialog>
            <!-- 广告 -->
            <div class="advertising" v-if='imgsrc'>
                <img :src="imgsrc" alt="">
                <div class='dele' @click="delebanner">X</div>
            </div>
        </template>
        <Spin v-else fix></Spin>
    </div>
</template>

<script>
    import '@/styles/views/main.less';
    import {storage} from '@/assets/js/utils';
    import page from '@/components/page';
    import SideNav from './SideNav';
    import UserDialog from '@/components/dialog/user-dialog';
    import VersionsDialog from '@/components/dialog/versions-dialog';
    import courseDialog from '@/components/dialog/course-dialog';
    import carouselDialog from '@/components/dialog/carousel-dialog';
    import routes from '@/router/routes';
    import {getUri} from '@/https/api.js';
    import MyKeepAlive from "@/views/keep-alive";

    export default {
        components: {page, SideNav, UserDialog, VersionsDialog, courseDialog, carouselDialog, MyKeepAlive},
        data() {
            return {
                hasBusiness: false, // 是否有健康档案权限
                show: false,
                loading: true,
                iconMenu: false,
                menuList: [],
                navList: [],
                hasCreatedOrder: storage.get('STORE').hasCreatedOrder,
                imgsrc: '',
                statisId: '',
                parentCode: '',
                behaviorConditions: [],
                parentLoading: false,
                childLoading: false,
                promptStatus: "1", // 0提示  1不提示
                isOpenJkda: false,  // 是否打开过健康档案弹窗了
            }
        },
        computed: {
            canAlert() {
                if (this.$route.path !== '/store/health/list' && !this.$store.getters.getIsBussiness && this.hasBusiness && this.promptStatus === '0') {
                    return true
                } else {
                    return false
                }
            }
        },

        watch: {
            $route(to) {
                if (!this.behaviorConditions.length) return;
                this.initStatis();
            }
        },

        async created() {
            this.$store.dispatch('getUnitList');
            this.loading = true;
            await this.getBehaviorConditions();
            this.init();
            // this.validToken();
            // this.initStore();
            // this.getbanner();
        },
        // mounted () {
        //   this.$nextTick(this.getVersions);
        // },

        methods: {
            async noTips() {
                try {
                    let res = await this.$store.dispatch({
                        type: "actionPost",
                        name: "setPrompt",
                        params: {promptStatus: "1"}
                    });
                } catch (error) {
                    console.log(error)
                }
                this.promptStatus = "1"
            },
            initStatis() {
                // 拿到当前route对应的code
                let codeData = this.getRoute();
                // 如果创建过id，请求更新接口
                if ((!codeData || this.parentCode !== codeData.parentCode) && this.statisId) {
                    this.statisUpdate(this.statisId);
                } else if ((!codeData || this.parentCode !== codeData.staticCode) && this.statisId && codeData.isParent) {
                    this.statisUpdate(this.statisId);
                }
                // 如果没有对应的id，则清空数据
                if (!codeData) {
                    this.statisId = "";
                    this.parentCode = "";
                    return;
                }
                // 在所有数据中找到对应的数据
                if (codeData.parentCode && this.parentCode !== codeData.parentCode) {
                    let parentData = this.behaviorConditions.find(elm => elm.code === codeData.parentCode);
                    this.statisCreate(parentData.id, codeData.parentCode);
                } else if (codeData.isParent && this.parentCode !== codeData.staticCode) {
                    // 在所有数据中找到对应的数据
                    let parentData = this.behaviorConditions.find(elm => elm.code === codeData.staticCode);
                    this.statisCreate(parentData.id, codeData.staticCode);
                }

                if (!codeData.isParent) {
                    let childData = this.behaviorConditions.find(elm => elm.code === codeData.staticCode);
                    this.statisCreate(childData.id);
                }
            },
            formatBehaviorConditoins(list = []) {
                let newList = [];
                for (let i = 0; i < list.length; i++) {
                    let item = list[i];
                    let newItem = {
                        id: item._id,
                        code: item.code,
                        name: item.name,
                        parentCode: item.parentCode
                    }
                    newList.push(newItem);
                    if (item.children && item.children.length) {
                        newList = newList.concat(this.formatBehaviorConditoins(item.children));
                    }
                }
                return newList;
            },

            // 获取埋点信息
            async getBehaviorConditions() {
                try {
                    let res = await this.$store.dispatch({
                        type: "actionGet",
                        name: "getBehaviorConditions",
                    });
                    let behaviorConditions = this.formatBehaviorConditoins(res.data);
                    this.behaviorConditions = behaviorConditions;
                    this.initStatis();
                } catch (error) {
                    console.log(error)
                }
            },

            getRoute() {
                let matched = this.$route.matched;
                for (let i = matched.length - 1; i >= 0; i--) {
                    let item = matched[i];
                    if (item.meta.staticCode || item.meta.isParent) {
                        return item.meta;
                    }
                }
            },

            async statisCreate(id, code) {
                if (code) {
                    if (this.parentLoading) return;
                    this.parentCode = code;
                    this.parentLoading = true;
                } else {
                    if (this.childLoading) return;
                    this.childLoading = true;
                }
                this.$store.dispatch({
                    type: "actionPost",
                    name: "analysisLogCreate",
                    params: {
                        id: id
                    }
                }).then(res => {
                    if (code) {
                        this.statisId = res.data.id;
                        this.parentLoading = false;
                    } else {
                        this.childLoading = false;
                    }
                }).catch(err => {
                    if (code) {
                        this.parentLoading = false;
                    } else {
                        this.childLoading = false;
                    }
                });
            },

            async statisUpdate(id) {
                this.statisId = "";
                this.$store.dispatch({
                    type: "actionPost",
                    name: "analysisLogUpdate",
                    params: {
                        id: id
                    }
                })
            },
            async init() {
                try {
                    this.initStore();
                    await this.validToken();
                    await this.getbanner();
                    this.iconMenu = this.$storage.get('ICON_MENU');
                    let user = this.$storage.get('USER');
                    if (!this.$storage.get("STORE").isChainStore) {
                        if (user.permissionList.findIndex(ele => ele.menuName == "调拨报表") != -1) {
                            user.permissionList.splice(user.permissionList.findIndex(ele => ele.menuName == "调拨报表"), 1)
                        }
                        if (user.permissionList.findIndex(ele => ele.menuName == "调拨申请")!= -1) {
                            user.permissionList.splice(user.permissionList.findIndex(ele => ele.menuName == "调拨申请"), 1)
                        }
                    }
                    this.$permission.setPermission(user.permissionList);
                    this.menuList = this.$permission.getPermissionTab('headerNav');
                    this.navList = this.$permission.setNavPermission(routes[0].children.slice(0));

                    // 获取到权限之后，验证当前路由是否有权限
                    if (!this.$permission.routeValidate(this.$route)) this.$router.replace("/");

                    let settingBusiness = this.$permission.data.settingBusiness;
                    this.hasBusiness = settingBusiness.check;
                    this.show = true;

                    let store = this.$storage.get('STORE');
                    this.promptStatus = store.promptStatus;
                    this.$nextTick(() => {
                        if (!this.hasCreatedOrder) this.openCourse(); // 1 打开操作指引
                        else this.openUsreDialog(); // 如果不打开操作指引，打开健康档案绑定弹窗
                        this.loading = false;
                    });
                } catch (error) {
                    console.log(error);
                    this.show = true;
                    this.loading = false;
                }
                // 设置权限数据
                // this.$permission.setPermiss(user.permissionList);
                // 设置导航数据
                // this.navList = ;
                // 设置导航权限
                // let allPermissionList = [];
                // this.navList = this.$permission.setNavPermission(routes[0].children.slice(0));
            },

            initStore() {
                this.$store.dispatch("getBusinessCityList");
            },

            // 获取所有权限列表
            getPermissionList() {
                return this.$store.dispatch({
                    type: "actionGet",
                    name: "permissionList"
                });
            },

            async validToken() {
                let res = await this.$store.dispatch({
                    type: "actionGet",
                    name: "userInfo",
                    host: 'jjb_host'
                });
                if (res.code !== "401") {
                    storage.set('TOKEN', res.data.token);
                    storage.set('USER', res.data.user);
                    storage.set('STORE', res.data.store);
                }
            },

            delebanner() {
                this.imgsrc = '';
            },

            async getbanner() {
                let res = await this.$store.dispatch({
                    type: 'getbanner',
                    params: {'client': 'xlb_pc', 'location': 'float'}
                });
                let banner = res.data.rows[0];
                if (banner) {
                    this.imgsrc = getUri("checkImg") + banner.imgId;
                }
            },

            toggleMenu() {
                this.iconMenu = !this.iconMenu;
                storage.set('ICON_MENU', this.iconMenu);
                const data = this.iconMenu;
                this.$store.commit('ICON_MENU', {data});
            },

            // 操作指引弹窗
            openCourse() {
                this.$refs.courseDialog.openModal();
            },

            // 打开操作轮播图
            openCarousel(key) {
                this.$refs.carouselDialog.openModal(key);
                this.openUsreDialog();
            },

            // 健康档案提示弹窗
            openUsreDialog() {
                if (this.isOpenJkda) return;
                this.isOpenJkda = true;
                let store = this.$storage.get('STORE');
                let user = this.$storage.get('USER');
                this.$store.commit("setIsBussiness", !!store.eRecordAccount);
                let isOpen = !store.eRecordAccount && user.loginCount === 1 && this.hasBusiness;
                // 未绑定健康档案并且第一次登陆并且有健康档案权限，才弹出来
                if (isOpen) {
                    this.$refs.userDialog.openModal();
                } else {
                    this.openVersionDialog();
                }
            },

            // 版本提示弹窗
            async openVersionDialog() {
                try {
                    let data = await this.$ajax.checkVersionnews();
                    // data = {
                    //   createdAt: "2020-01-06 15:19:15",
                    //   description: "<p>祭天</p>",
                    //   isPop: true,
                    //   platform: "PC",
                    //   publishAt: "2020-01-08 16:58:55",
                    //   publishType: "0",
                    //   title: "把马总拿去祭天",
                    //   updatedAt: "2020-01-08 16:58:55",
                    //   version: "1.3.3",
                    //   _id: "5e12df737fb5fa6b59a57521",
                    // }
                    if (data && data.isPop) this.$refs.versionsDialog.openModal(data);
                    else this.openNoticeDialog();
                } catch (error) {
                    console.log(error);
                    // 版本检测接口错误的时候检测公告消息
                    this.openNoticeDialog();
                }
            },

            // 公告消息弹窗
            async openNoticeDialog() {
                try {
                    let data = await this.$ajax.checkBulletinnews();
                    // data = {
                    //   createdAt: "2020-01-06 15:19:15",
                    //   description: "<p>祭天</p>",
                    //   isPop: true,
                    //   platform: "PC",
                    //   publishAt: "2020-01-08 16:58:55",
                    //   publishType: "0",
                    //   title: "把马总拿去祭天",
                    //   updatedAt: "2020-01-08 16:58:55",
                    //   version: "1.3.3",
                    //   _id: "5e12df737fb5fa6b59a57521",
                    // }
                    if (data && data.isPop) this.$refs.noticeDialog.openModal(data);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
</script>

<style>
    .spin-icon-load {
        animation: ani-demo-spin 1s linear infinite;
    }

    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50% { transform: rotate(180deg);}
        to { transform: rotate(360deg);}
    }
</style>
