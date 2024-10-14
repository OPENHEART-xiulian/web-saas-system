<template>
    <page class="login settle">
        <header slot="header">
            <div class="container">
                <div class="logo">
                    <img src="/images/logo.png" alt="logo">
                </div>
                <router-link to="/register">申请入驻</router-link>
            </div>
        </header>
        <div class="container" style="position: relative;">
            <div class="login-bg">
                <img :src="imgsrc" alt="">
                <!-- src="/images/login-bg.png" -->
            </div>
            <div class="form-box">
                <h2>用户登录</h2>
                <i-form ref="form" :model="formData" :rules="rules">
                    <i-form-item prop="mobile">
                        <span class="prepend"><i class="iconfont icon-dianhua"></i></span>
                        <i-input v-model="formData.mobile" :maxlength="11" placeholder="手机号码"
                                 @on-enter="login"></i-input>
                    </i-form-item>
                    <i-form-item prop="password">
                        <span class="prepend"><i class="iconfont icon-mima"></i></span>
                        <i-input v-model="formData.password" type="password" :maxlength="16" placeholder="密码"
                                 @on-enter="login"></i-input>
                    </i-form-item>
                    <!-- <i-form-item class="code" prop="validationCode">
                      <span class="prepend"><i class="iconfont icon-yanzhengma"></i></span>
                      <i-input v-model="formData.validationCode" :maxlength="4" placeholder="验证码" @on-enter="login"></i-input>
                      <div class="captcha" v-html="captcha" @click="getCaptcha"></div>
                      <i class="iconfont icon-shuaxin" @click="getCaptcha"></i>
                    </i-form-item> -->
                    <i-form-item class="submit-btn">
                        <i-button type="primary" long @click="login" :loading="loading">登录</i-button>
                    </i-form-item>
                    <div style="margin-top: 5px">
                        <Checkbox v-model="single"></Checkbox>
                        我已阅读并同意 <a style="color: #FD8105" href="https://www.xlbzone.com/xlbUser.html" target="_blank">用户协议</a>
                        和 <a style="color: #FD8105" href="https://www.xlbzone.com/xlbprivacy.html"
                             target="_blank">隐私政策</a></div>
                    <i-form-item class="forget-pwd">
                        <div class="linkbtn-wrap">
                            <!--<a :href="BUSINESS + '/#/auth'">汽车电子健康档案授权登录</a>-->
                            <a href=""></a>
                            <router-link to="/forget">忘记密码</router-link>
                        </div>
                    </i-form-item>
                </i-form>
            </div>
            <Spin v-if="tokenLoading" fix></Spin>
        </div>
        <footer slot="footer">
            <p>广东修炼科技股份有限公司旗下产品</p>
            <p>Copyright&nbsp;©&nbsp;2017&nbsp;xiulian&nbsp;Technology&nbsp;All&nbsp;rights&nbsp;reserved&nbsp;&nbsp;&nbsp;<a
                    style="color:#737680" href="https://beian.miit.gov.cn/">粤ICP备16096430号-{{window.location.host.indexOf("xiulianzone")!=-1?"3":"4"}}</a>
            </p>
        </footer>
        <Modal
                v-model="popWindow"
                title="您的账号审核不通过，请完善以下信息"
                :mask-closable="maskClosable"
                :closable="maskClosable"
                :loading="loadingNow"
                cancel-text="退出"
                ok-text="确认提交"
                @on-ok="handleSubmit()"
        >
            <div class="pop-window">
                <Form label-position="left" :label-width="180">
                    <div v-for="ele in mockData">
                        <div style="color: red" v-if="ele.reasonText">{{ele.reasonText}}</div>
                        <FormItem :label="ele.desc+'：'" prop="socialCode" v-if="ele.reasonText">
                            <Input v-model="ele.val"></Input>
                        </FormItem>
                        <div style="display: flex" v-else>
                            <span style="display: block; width: 200px">{{ele.desc}}：</span><span
                                style="margin-left: 40px">{{ele.val||"--"}}</span>
                        </div>
                    </div>
                </Form>
            </div>
        </Modal>
    </page>
</template>

<script>
    import '@/styles/views/settle.less';
    import {verify, formVerify, storage} from '@/assets/js/utils.js';
    import page from '@/components/page';
    import {BUSINESS} from '@/https/api';
    import {getUri} from '@/https/api.js';

    export default {
        components: {page},
        data() {
            return {
                single: false,
                mockData: [],
                maskClosable: false,
                popWindow: false,
                loadingNow: true,
                window,
                BUSINESS,
                loading: false,
                tokenLoading: false,
                isRemember: true,
                captcha: '',
                captchaText: '',
                formData: {
                    mobile: '',
                    password: '',
                    validationCode: '',
                    client: 'pc'
                },
                rules: {
                    mobile: [
                        {
                            required: true,
                            trigger: 'blur',
                            reg: 'MOBILE',
                            message: '请输入11位的手机号',
                            formatTip: '请输入正确的手机号',
                            validator: formVerify.format,
                            callback: (rules, value, callback) => {
                                this.$store.dispatch({
                                    type: 'checkMobile',
                                    params: {
                                        mobile: this.formData.mobile
                                    }
                                }).then(res => {
                                    if (res.code === '0') {
                                        rules.message = '手机号码未注册';
                                        return callback(rules.message);
                                    }
                                    callback();
                                }).catch(err => {
                                    callback();
                                })
                            }
                        }
                    ],
                    password: [
                        {
                            required: true,
                            trigger: 'blur',
                            message: '密码不能为空',
                            reg: 'PASSWORD',
                            formatTip: '请输入6-16位的密码，不能包含中文或空格',
                            validator: formVerify.format
                        }
                    ],
                    validationCode: [
                        {
                            required: true,
                            trigger: 'blur',
                            message: '验证码不能为空',
                            validator: formVerify.format,
                            callback: (rules, value, callback) => {
                                if (value === '0000') {
                                    return callback();
                                }
                                if (value.toLowerCase() !== this.captchaText.toLowerCase()) {
                                    rules.message = '验证码不正确';
                                    return callback(rules.message)
                                }
                                callback();
                            }
                        }
                    ],
                },
                imgsrc: '', //  banne src
            }
        },

        created() {
            if (this.$route.query.token) {
                this.tokenLogin();
                return;
            }
            this.formData.mobile = storage.get('USERNAME') || '';
            if (storage.get('TOKEN')) {
                this.$router.push(this.$route.query.redirect || '/index');
            }
        },

        mounted() {
            // this.getCaptcha();
            this.getbanner();
        },

        methods: {
            async handleSubmit() {
                let self = this;
                let submitData = {mobile: this.formData.mobile, password: this.formData.password};
                for (let i in this.mockData) {
                    if ((!this.mockData[i].val && this.mockData[i].reasonText) || this.mockData[i].filed == "socialCode" && !verify('SOCIAL_CODE', this.mockData[i].val)) {
                        self.$Message.error("请输入正确的" + this.mockData[i].desc);
                        self.loadingNow = false;
                        self.$nextTick(function () {
                            self.loadingNow = true;
                        })
                        return
                    } else {
                        submitData[this.mockData[i].filed] = this.mockData[i].val
                    }
                }

                const res = await this.$store.dispatch({
                    type: 'updateInfo',
                    params: submitData
                });
                if (res.code == 0) {
                    self.$Message.success("提交成功！");
                    self.popWindow = false;
                }
            },
            getCaptcha() {
                this.$store.dispatch('captcha').then(res => {
                    if (res.code === '0') {
                        this.captcha = res.data.data;
                        this.captchaText = res.data.text;
                    } else {
                        this.captcha = '重新获取';
                        this.captchaText = undefined;
                    }
                })
            },
            async getbanner() {
                try {
                    let banner = await this.$store.dispatch({
                        type: 'getbanner',
                        params: {'client': 'xlb_pc', 'location': 'login'}
                    })
                    this.imgsrc = getUri("checkImg") + banner.data.rows[0].imgId;
                } catch (e) {

                }
            },
            async tokenLogin() {
                if (this.tokenLoading) return;
                this.tokenLoading = true;
                try {
                    const res = await this.$store.dispatch({
                        type: 'tokenLogin',
                        params: {
                            token: this.$route.query.token,
                            client: 'pc'
                        }
                    });

                    if (res.code === '0') {
                        storage.set('TOKEN', res.data.token);
                        storage.set('USER', res.data.user);
                        storage.set('STORE', res.data.store);
                        storage.set('USERNAME', this.formData.mobile);
                        // const user = storage.get('USER');
                        // // 设置权限数据
                        // this.$permission.setPermiss(user.permissionList);
                        this.$Message.success({
                            content: '登录成功', onClose: () => {
                                let path = (this.$route.query.redirect || '/index') + (this.$route.query.token ? '?token=' + this.$route.query.token : '');
                                if (this.$route.query.redirect) {
                                    this.$router.replace(path);
                                } else {
                                    this.$router.push(path);
                                }
                                this.tokenLoading = false;
                            }
                        });
                    } else {
                        this.tokenLoading = false;
                        this.$Message.error(res.msg);
                    }
                } catch (error) {
                    console.log(error);
                    this.tokenLoading = false;
                    this.$Message.error('授权登录失败，请检查账号');
                }
            },

            login() {
                let self =this;
                if (!this.single) {
                    this.$Modal.confirm({
                        cancelText: "取消",
                        title: "提示",
                        content: "点击确定表示您已阅读并同意 <a style=\"color: #FD8105\" href=\"https://www.xlbzone.com/xlbUser.html\" target=\"_blank\">用户协议</a> 和 <a style=\"color: #FD8105\" href=\"https://www.xlbzone.com/xlbprivacy.html\" target=\"_blank\">隐私政策</a>",
                        onOk:function () {
                            self.single=true;
                        }
                    })
                    return
                }
                if (this.loading) return;
                this.$refs.form.validate(valid => {
                    if (valid) {
                        this.loading = true;
                        this.$store.dispatch({
                            type: 'login',
                            params: this.formData
                        }).then(res => {
                            if (res.code === '0') {
                                storage.set('TOKEN', res.data.token);
                                storage.set('USER', res.data.user);
                                storage.set('STORE', res.data.store);
                                storage.set('USERNAME', this.formData.mobile);
                                const user = storage.get('USER');
                                // 设置权限数据
                                // this.$permission.setPermiss(user.permissionList);
                                this.$Message.success({
                                    content: '登录成功', onClose: () => {
                                        // let path = (this.$route.query.redirect || '/index') + (this.$route.query.token ? '?token=' + this.$route.query.token : '');
                                        let path = this.$route.query.redirect || '/index';
                                        if (this.$route.query.redirect) {
                                            this.$router.replace(path);
                                        } else {
                                            this.$router.push(path);
                                        }
                                        this.loading = false;
                                    }
                                });
                            } else {
                                if (res.code === '107101') {
                                    this.$Message.error(res.msg);
                                } else if (res.code === '107002') {
                                    this.$Message.error('手机号与密码不匹配');
                                } else if (res.code === '107102') {
                                    this.$Message.error('账号异常，请联系客服');
                                } else if (res.code === '107104') {
                                    console.log("datdatdatdtatdatd===", res)
                                    this.mockData = res.data.store;
                                    this.popWindow = true;
                                } else {
                                    this.$Message.error(res.msg);
                                    // this.$Message.error('登录失败,请检查账号或密码');
                                }
                                this.loading = false;
                                // this.getCaptcha();
                            }
                        }).catch(error => {
                            console.log(error);
                            this.$Message.error('登录失败, 请稍后再试');
                            this.loading = false;
                            // this.getCaptcha();
                        })
                    }
                })
            }
        }
    }
</script>
<style lang="less" scoped>
    .pop-window {
        background: white;
    }
</style>
