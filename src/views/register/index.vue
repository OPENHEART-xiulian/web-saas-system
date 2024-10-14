<template>
    <page class="settle register">
        <header slot="header">
            <div class="container">
                <div class="logo">
                    <img src="/images/logo.png" alt=""/>
                </div>
                <router-link to="/login">立即登录</router-link>
            </div>
        </header>
        <div class="container">
            <div class="header" v-if="!token && !loading">
                <Steps :current="step">
                    <Step title="入驻申请" @click.native="toStep(0)"></Step>
                    <Step title="申请账号" @click.native="toStep(1)"></Step>
                    <Step title="等待审核" @click.native="toStep(2)"></Step>
                </Steps>
            </div>
            <div class="content" v-if="!token && !loading">
                <i-form
                        v-show="step === 0"
                        ref="form1"
                        :model="formData"
                        :rules="rules"
                >
                    <i-form-item prop="storeName">
                        <i-input
                                v-model="formData.storeName"
                                placeholder="请按照营业执照填写门店名称"
                        ></i-input>
                    </i-form-item>
                    <i-form-item prop="countyCode">
                        <city-select
                                :city-data="formData"
                                @on-change="cityChange"
                        ></city-select>
                    </i-form-item>
                    <i-form-item prop="address">
                        <i-input
                                v-model="formData.address"
                                placeholder="请按照营业执照填写门店详细地址"
                        ></i-input>
                    </i-form-item>
                    <i-form-item prop="socialCode" :style="showSocialCodeError?'height: 70px':''">
                        <i-input
                                v-model="formData.socialCode"
                                :maxlength="18"
                                placeholder="请按照营业执照填写统一社会信用代码或营业执照号"
                        ></i-input>
                    </i-form-item>
                    <i-form-item prop="licenseNo">
                        <i-input
                                v-model="formData.licenseNo"
                                placeholder="道路运输经营许可证号（选填）"
                        ></i-input>
                    </i-form-item>
                    <i-form-item prop="category">
                        <Select
                                v-model="formData.category"
                                size="large"
                                placeholder="门店经营业务类型"
                                clearable
                        >
                            <Option
                                    v-for="item in manageTypeArr"
                                    :value="item.value"
                                    :key="item.value"
                            >{{ item.label }}
                            </Option
                            >
                        </Select>
                    </i-form-item>
                    <i-form-item class="submit-btn">
                        <i-button type="primary" long @click="toStep(1)"
                        >下一步，申请账号
                        </i-button>
                    </i-form-item>
                </i-form>

                <i-form
                        v-show="step === 1"
                        ref="form2"
                        :model="formData"
                        :rules="rules"
                >
                    <i-form-item prop="contactName">
                        <i-input
                                v-model="formData.contactName"
                                placeholder="输入门店负责人姓名"
                        ></i-input>
                    </i-form-item>
                    <i-form-item prop="mobile">
                        <i-input
                                v-model="formData.mobile"
                                :maxlength="11"
                                placeholder="输入11位手机号作为登录账号"
                                @on-change="changeMobile"
                        >
                        </i-input>
                    </i-form-item>
                    <i-form-item class="veryfi-code imgCode" style="display:flex">
                        <i-input
                                v-model="formData.captchaStr"
                                :maxlength="4"

                                placeholder="输入图形验证码"
                                @on-change="changeMobile"
                        ></i-input>
                        <i-col span="7"
                        >
                            <div class="captcha" ref="captcha" @click="getCaptcha">
                                加载中...
                            </div>
                        </i-col>
                        <i-col span="1" class="change-captcha">
                            <div @click="getCaptcha">
                                <i class="icon iconfont icon-shuaxin"></i>
                            </div>
                        </i-col>
                    </i-form-item>
                    <i-form-item class="veryfi-code" prop="validationCode">
                        <i-input
                                v-model="formData.validationCode"
                                :maxlength="4"
                                placeholder="输入短信验证码"
                        ></i-input>
                        <vaildate :mobile="formData.mobile" :disabled="valiDisabled" :captchaStr="formData.captchaStr"
                        >获取验证码
                        </vaildate
                        >
                    </i-form-item>
                    <i-form-item prop="password">
                        <i-input
                                v-model="formData.password"
                                type="password"
                                :maxlength="16"
                                placeholder="6 - 16位密码，区分大小写"
                        >
                        </i-input>
                    </i-form-item>
                    <i-form-item prop="confirmPwd">
                        <i-input
                                v-model="formData.confirmPwd"
                                type="password"
                                :maxlength="16"
                                placeholder="再次输入密码"
                        >
                        </i-input>
                    </i-form-item>
                    <i-form-item class="submit-btn">
                        <i-button type="primary" long @click="toStep(2)" :loading="loading"
                        >提交申请
                        </i-button>
                    </i-form-item>
                    <div style="margin-top: 5px"><Checkbox v-model="single"></Checkbox>我已阅读并同意 <a style="color: #FD8105" href="https://www.xlbzone.com/xlbUser.html" target="_blank">用户协议</a> 和 <a style="color: #FD8105" href="https://www.xlbzone.com/xlbprivacy.html" target="_blank">隐私政策</a></div>

                    <div class="center"><span @click="toStep(0)">上一步</span></div>
                </i-form>

                <div class="wait" v-show="step === 2">
                    <div class="icon">
                        <Icon type="ios-checkmark" size="100" color="#4DCB73"></Icon>
                    </div>
                    <p class="title">
                        {{ formData.storeName }}账号：{{ formData.contactName }}/{{
                        formData.mobile
                        }}已提交入驻申请
                    </p>
                    <p class="tip">
                        我们将在1-2个工作日内进行审核，审核通过后将以短信形式通知您。
                    </p>
                    <i-button type="default" @click="goLoginPage">返回登录页</i-button>
                </div>
            </div>

            <div v-if="token && !loading" class="content has-token">
                <div class="icon-con">
                    <img src="/images/settle.png" alt=""/>
                </div>
                <h2>{{ formData.storeName }}</h2>
                <p>完善账号信息，立即使用XXX智能门店营销管理服务平台</p>

                <i-form ref="form2" :model="formData" :rules="rules">
                    <i-form-item prop="contactName">
                        <i-input
                                v-model="formData.contactName"
                                placeholder="输入门店负责人姓名"
                        ></i-input>
                    </i-form-item>
                    <i-form-item prop="mobile">
                        <i-input
                                v-model="formData.mobile"
                                :maxlength="11"
                                placeholder="输入11位手机号作为登录账号"
                                @on-change="changeMobile"
                        >
                        </i-input>
                    </i-form-item>
                    <i-form-item class="veryfi-code imgCode" style="display:flex">
                        <i-input
                                v-model="formData.captchaStr"
                                :maxlength="4"
                                placeholder="输入图形验证码" @on-change="changeMobile"></i-input>
                        <i-col span="7"
                        >
                            <div class="captcha" ref="captcha" @click="getCaptcha">
                                加载中...
                            </div>
                        </i-col>
                        <i-col span="1" class="change-captcha">
                            <div @click="getCaptcha">
                                <i class="icon iconfont icon-shuaxin"></i>
                            </div>
                        </i-col>
                    </i-form-item>
                    <i-form-item class="veryfi-code" prop="validationCode">
                        <i-input
                                v-model="formData.validationCode"
                                :maxlength="4"
                                placeholder="输入短信验证码"
                        ></i-input>
                        <vaildate :mobile="formData.mobile" :disabled="valiDisabled" :captchaStr="formData.captchaStr"
                        >获取验证码
                        </vaildate
                        >
                    </i-form-item>


                    <i-form-item prop="password">
                        <i-input
                                v-model="formData.password"
                                type="password"
                                :maxlength="16"
                                placeholder="6 - 16位密码，区分大小写"
                        >
                        </i-input>
                    </i-form-item>
                    <i-form-item prop="confirmPwd">
                        <i-input
                                v-model="formData.confirmPwd"
                                type="password"
                                :maxlength="16"
                                placeholder="再次输入密码"
                        >
                        </i-input>
                    </i-form-item>
                    <i-form-item class="submit-btn">
                        <i-button
                                type="primary"
                                long
                                @click="nextStep(2)"
                                :loading="loading"
                        >创建账号
                        </i-button>
                    </i-form-item>
                </i-form>
            </div>
        </div>
        <footer slot="footer">
            <p>广东修炼科技股份有限公司旗下产品</p>
            <p>
                Copyright&nbsp;©&nbsp;2017&nbsp;xiulian&nbsp;Technology&nbsp;All&nbsp;rights&nbsp;reserved&nbsp;&nbsp;&nbsp;粤ICP备09018140号
            </p>
        </footer>
    </page>
</template>

<script>
    import "@/styles/views/settle.less";
    import page from "@/components/page";
    import CitySelect from "@/components/city-select";
    import {manageTypeArr} from "@/store/json/default.js";
    import vaildate from "@/components/vaildate";
    import {formVerify, verify, storage} from "@/assets/js/utils.js";
    import {regexEnum} from "@/assets/js/regexEnum";

    export default {
        components: {page, CitySelect, vaildate},
        data() {
            const confirmPwdValid = (rule, value, callback) => {
                if (this.formData.password !== value) {
                    return callback(new Error("两次密码不一致"));
                }
                callback();
            };
            return {
                single:false,
                showSocialCodeError: false,
                step: 0,                  // 0: 入驻申请  1: 申请账号  2: 申请成功，等待审核
                // step: 1, // 0: 入驻申请  1: 申请账号  2: 申请成功，等待审核
                token: "", // 企业端传过来的token 用于查询企业信息
                loading: false,
                valiDisabled: true, // 获取验证码是否不可用
                manageTypeArr, // 业务经营类别
                formData: {
                    captchaStr: "",
                    storeName: "", // 门店名称
                    provinceCode: "", // 门店省份代码
                    cityCode: "", // 门店城市代码
                    countyCode: "", // 门店区域代码
                    address: "", // 门店详细地址
                    socialCode: "", // 营业执照（社会统一信用代码）
                    licenseNo: "", // 道路经营许可证号
                    category: "", // 维修企业经营业务类别代码

                    contactName: "", // 负责人姓名
                    mobile: "", // 手机号码
                    password: "", // 密码
                    confirmPwd: "", // 密码
                    validationCode: "", // 验证码
                },
                rules: {
                    storeName: [
                        {required: true, trigger: "blur", message: "请输入门店名称"},
                    ],
                    countyCode: [
                        {required: true, trigger: "change", message: "请选择门店区域"},
                    ],
                    address: [
                        {required: true, trigger: "blur", message: "请输入门店详细地址"},
                    ],
                    socialCode: [
                        {
                            required: true,
                            trigger: "blur",
                            message: "请输入营业执照上的统一社会信用代码或营业执照号",
                            reg: "SOCIAL_CODE",
                            formatTip: "请输入15位的营业执照注册号或18位的统一社会信用代码",
                            validator: formVerify.format,
                            callback: (rules, value, callback) => {
                                this.formData.socialCode = value.toUpperCase();
                                var reg = RegExp(/I|O|Z|V|S/);
                                if(this.formData.socialCode.match(reg)){
                                    rules.message = "不能包含I，O，Z，V，S的大小写字符";
                                    this.showSocialCodeError = true;
                                    return callback(rules.message);
                                }
                                this.$store
                                    .dispatch({
                                        type: "checkSocialCode",
                                        params: {
                                            socialCode: this.formData.socialCode,
                                        },
                                    })
                                    .then((res) => {
                                        if (res.code !== "0") {
                                            rules.message = "该营业执照已被" + res.data.storeName + "注册,请使用手机号" + res.data.mobile + "登录，如有疑问再联系客服。如忘记密码，可在登录界面点击忘记密码，自行重置新密码。";
                                            this.showSocialCodeError = true;
                                            return callback(rules.message);
                                        }
                                        this.showSocialCodeError = false;
                                        callback();
                                    })
                                    .catch((err) => {
                                        callback();
                                    });
                            },
                        },
                    ],
                    licenseNo: [
                        {
                            required: false,
                            trigger: "blur",
                            message: "请输入道路运输许可证号",
                            reg: "NUMBER_LETTER",
                            formatTip: "道路运输许可证号只能为15位以内的数字或字母",
                            validator: formVerify.format,
                            callback: (rules, value, callback) => {
                                this.$store
                                    .dispatch({
                                        type: "checkLicenseNo",
                                        params: {
                                            licenseNo: value,
                                        },
                                    })
                                    .then((res) => {
                                        if (res.code === "107003") {
                                            rules.message =
                                                "道路运输许可证格式有误，如有问题，请联系客服";
                                            return callback(rules.message);
                                        } else if (res.code === "107006") {
                                            rules.message =
                                                "该道路运输经营许可证号已注册，如有问题，请联系客服";
                                            return callback(rules.message);
                                        }
                                        callback();
                                    })
                                    .catch((err) => {
                                        callback();
                                    });
                            },
                        },
                    ],
                    category: [
                        {
                            required: true,
                            trigger: "change",
                            message: "请选择门店经营业务类别",
                        },
                    ],

                    contactName: [
                        {
                            required: true,
                            trigger: "blur",
                            message: "请输入门店店负责人姓名",
                        },
                    ],
                    password: [
                        {
                            required: true,
                            trigger: "blur",
                            message: "请设定6-16位的密码，区分大小写",
                            reg: "PASSWORD",
                            formatTip: "请输入6-16位的密码，不能包含中文或空格",
                            validator: formVerify.format,
                        },
                    ],
                    confirmPwd: [
                        {
                            required: true,
                            trigger: "blur",
                            message: "请设定6-16位的密码，区分大小写",
                            reg: "PASSWORD",
                            formatTip: "请输入6-16位的密码，不能包含中文或空格",
                            validator: formVerify.format,
                        },
                        {
                            trigger: "blur",
                            validator: confirmPwdValid,
                        },
                    ],
                    mobile: [
                        {
                            required: true,
                            trigger: "blur",
                            reg: "MOBILE",
                            message: "请输入手机号",
                            formatTip: "请输入正确的手机号",
                            validator: formVerify.format,
                            callback: (rules, value, callback) => {
                                this.$store
                                    .dispatch({
                                        type: "checkMobile",
                                        params: {
                                            mobile: value,
                                        },
                                    })
                                    .then((res) => {
                                        if (res.code !== "0") {
                                            rules.message = "该手机号已注册，请直接登录";
                                            this.valiDisabled = true;
                                            this.registered = true
                                            return callback(rules.message);
                                        } else {
                                            this.registered = false
                                            // this.valiDisabled = false;
                                        }
                                        callback();
                                    })
                                    .catch((err) => {
                                        callback();
                                    });
                            },
                        },
                    ],
                    validationCode: [
                        {
                            required: true,
                            trigger: "blur",
                            message: "请输入短信验证码",
                            validator: formVerify.format,
                            callback: (rules, value, callback) => {
                                if (!verify("MOBILE", this.formData.mobile)) {
                                    rules.message = "手机号码格式不正确";
                                    return callback(rules.message);
                                }
                                this.$store
                                    .dispatch({
                                        type: "checkCode",
                                        params: {
                                            mobile: this.formData.mobile,
                                            validationCode: value,
                                        },
                                    })
                                    .then((res) => {
                                        if (res.code !== "0") {
                                            rules.message = "短信验证码不正确";
                                            return callback(rules.message);
                                        }
                                        callback();
                                    });
                            },
                        },
                    ],


                },
                registered: false
            };
        },

        mounted() {
            this.getCaptcha();
            this.token = this.$route.query.token || "";
            if (this.token !== "") {
                this.getBusinessData();
            }
        },

        methods: {
            getCaptcha() {
                if (this.captchaLogin) return; //如果正在加载验证码，则不做任何操作

                //设置验证码相关初始状态
                // this.form.captcha = "";
                // this.captchaLogin = true;
                this.$refs.captcha.innerHTML = "加载中...";

                this.$store
                    .dispatch({
                        type: "imageCaptcha",
                        params: {
                            // mobile: this.formData.mobile,
                        },
                    })
                    .then((res) => {
                        // console.log("图形验证码", res);
                        this.$refs.captcha.innerHTML = res;
                        // if (res.code !== "0") {

                        //   // rules.message = '短信验证码不正确';
                        //   // return callback(rules.message);
                        // }
                        //callback();
                    });
                //获取后端验证码
                // this.$ajax(this.$api.login.captcha,'',(RES)=>{
                //     //设置验证码返回值
                //     this.captcha = RES.text;
                //     this.$refs.captcha.innerHTML = RES.data;
                //     this.captchaLogin = false;
                // },(error)=>{
                //     this.captchaLogin = false;
                //     this.$refs.captcha.innerHTML = '加载失败';
                //     this.$Message.error('服务器出错');
                // })
            },
            // 获取企业端信息填充到页面
            async getBusinessData() {
                this.loading = true;
                try {
                    const res = await this.$store.dispatch({
                        type: "toGetBusiness",
                        params: {
                            token: this.token,
                        },
                    });
                    // http://app.xlbzone.com:1080/showdoc/web/#/4?page_id=167
                    if (res.code === 200) {
                        const data = res.data;
                        this.formData.storeName = data.storeName;
                        this.formData.provinceCode = data.provinceCode;
                        this.formData.cityCode = data.cityCode;
                        this.formData.countyCode = data.countyCode;
                        this.formData.address = data.address;
                        this.formData.socialCode = data.socialCode;
                        this.formData.licenseNo = data.licenseNo;
                        this.formData.category = data.category;
                        this.formData.contactName = data.contactName;
                        this.formData.mobile = data.mobile;
                        this.formData.eRecordToken = this.token;
                        this.$nextTick().then(() => {
                            this.$refs.form2.validateField("mobile", (valid) => {
                                if (!valid) {
                                    // 为了将获取验证码变为可用状态
                                    this.changeMobile({
                                        target: {
                                            value: this.formData.mobile,
                                        },
                                    });
                                }
                            });
                        });
                    } else {
                        this.token = ""; // 没有token直接返回入驻操作
                        this.$Message.warning(res.msg);
                    }
                    this.loading = false;
                } catch (error) {
                    this.loading = false;
                }
            },

            cityChange(object) {
                this.formData.provinceCode = object.provinceCode;
                this.formData.cityCode = object.cityCode;
                this.formData.countyCode = object.countyCode;
                this.$refs["form1"].validateField("countyCode");
            },

            toStep(step) {
                if (step - this.step > 1 || this.step === 2) return; // 不能直接点第三步 或者 第三步的时候不能点上一步了，因为数据已经提交
                if (step > this.step) {
                    this.nextStep(step);
                } else {
                    this.step = step;
                }
            },

            goLoginPage() {
                // let path = '/login' + (this.$route.query.token ? '?token=' + this.$route.query.token : '');
                let path = "/login";
                this.$router.push(path);
            },

            nextStep(step) {
                let self=this;
                if (!self.single&&step === 2) {
                    self.$Modal.confirm({
                        cancelText: "取消",
                        title: "提示",
                        content: "点击确定表示您已阅读并同意 <a style=\"color: #FD8105\" href=\"https://www.xlbzone.com/xlbUser.html\" target=\"_blank\">用户协议</a> 和 <a style=\"color: #FD8105\" href=\"https://www.xlbzone.com/xlbprivacy.html\" target=\"_blank\">隐私政策</a>",
                        onOk:function () {
                            self.single=true;
                        }
                    })
                    return
                }
                this.$refs["form" + step].validate((valid) => {
                    if (valid) {
                        if (step === 2) {

                            const formData = Object.assign({}, this.formData);
                            delete formData.confirmPwd;
                            this.$store
                                .dispatch({
                                    type: "register",
                                    params: formData,
                                })
                                .then((res) => {
                                    if (res.code === "0") {
                                        if (this.token) {
                                            this.tokenLogin();
                                        } else {
                                            this.step = step; // 验证通过进入下一步
                                        }
                                    } else {
                                        this.$Message.error("创建失败");
                                    }
                                });
                        } else {
                            this.step = step;
                        }
                    }
                });
            },

            async tokenLogin() {
                try {
                    const res = await this.$store.dispatch({
                        type: "tokenLogin",
                        params: {
                            token: this.token,
                            client: "pc",
                        },
                    });

                    if (res.code === "0") {
                        storage.set("TOKEN", res.data.token);
                        storage.set("USER", res.data.user);
                        storage.set("STORE", res.data.store);
                        storage.set("USERNAME", this.formData.mobile);
                        const user = res.data.user;
                        // 设置权限数据
                        this.$Message.success({
                            content: "登录成功",
                            onClose: () => {
                                let path = this.$route.query.redirect || "/index";
                                this.$router.push(path);
                            },
                        });
                    } else {
                        this.$Message.error(res.msg);
                    }
                } catch (error) {
                    this.$Message.error("授权登录失败，请检查账号");
                }
            },

            changeMobile(e) {
                const reg = regexEnum.MOBILE;
                const imgReg = regexEnum.IMGCODE;
                if (!reg.test(this.formData.mobile)) {
                    this.valiDisabled = true;

                } else {
                    if (!imgReg.test(this.formData.captchaStr)) {
                        console.log("enter")
                        this.valiDisabled = true;
                    } else {
                        console.log("faiul")
                        this.valiDisabled = false;
                    }
                }
                if (this.registered) this.valiDisabled = true
            },
        },
    };
</script>
