<template>
    <div class="staff-add add-page">
        <saas-bread :title="breadName"/>
        <Form ref="formValidate"
              class="w-form"
              :model="formData"
              :rules="ruleValidate"
              :label-width="125">
            <FormItem label="员工头像">
                <upload-img
                        :max-count="1"
                        v-model="formData.avatar"
                        :headers="headers"
                        :img-size="300"
                        :is-cut="true"
                        :cutScale="[300, 300]">
                </upload-img>
                <p>图片建议：300像素 x 300像素，500K内，支持JPG、PNG格式</p>
            </FormItem>
            <FormItem label="员工姓名" prop="username">
                <Input v-model="formData.username" :maxlength="10" class="input-style" placeholder="输入员工真实姓名"/>
            </FormItem>
            <FormItem label="手机号码" prop="mobile">
                <Input v-model="formData.mobile"
                       :maxlength="11"
                       :disabled="id != 'create'"
                       class="input-style"
                       placeholder="输入员工手机号码（作为系统登录账号）" @on-change="changeMobile"/>
                <div class="role-tip" v-if="id != 'create'" @click="openUpdateMobile">
                    <span>修改手机号</span>
                </div>
            </FormItem>
            <FormItem label="图形验证码" prop="captchaStr" v-show="id == 'create'" style="height:55px">
                <div class="validate-container">
                    <Input v-model="formData.captchaStr" placeholder="输入图形验证码"  @on-change="changeMobile"/>
                    <i-col span="7"
                    >
                        <div class="captcha" style="height:36px" ref="captcha" @click="getCaptcha">
                            加载中...
                        </div>
                    </i-col>
                    <i-col span="1" class="change-captcha">
                        <div @click="getCaptcha">
                            <i class="icon iconfont icon-shuaxin"></i>
                        </div>
                    </i-col>
                </div>
            </FormItem>
            <FormItem label="验证码" prop="validationCode" v-if="id == 'create'">
                <div class="validate-container">
                    <Input v-model="formData.validationCode" placeholder="输入验证码"/>
                    <w-vaildate :mobile="formData.mobile"
                                :disabled="valiDisabled" :captchaStr="formData.captchaStr">
                    </w-vaildate>
                </div>
            </FormItem>
            <FormItem label="登录密码" prop="password">
                <Input v-model="formData.password"
                       :type="type"
                       class="input-style"
                       :maxlength="16"
                       placeholder="6 - 16位密码，区分大小写（默认为123456）"
                       @on-focus="type='password'"/>
                <!-- <Button type="warning"
                  class="reset-btn"
                  v-if="id != 'create'"
                  @click="resetPassword">重置密码为：123456</Button> -->
            </FormItem>
            <FormItem label="职位权限" prop="roleId">
                <Select v-model="formData.roleId" placeholder="请选择" filterable clearable>
                    <Option v-for="item in roleList" :key="item._id" :value="item._id">{{ item.roleName }}</Option>
                </Select>
                <div class="role-tip" v-if="permissionData.tab">
                    <span @click="$router.push('/store/staff/permission/list')">职位权限管理</span>
                </div>
            </FormItem>
            <FormItem label="门店分组" v-if="isMasterStore&&isChainStore">
                <Select v-model="formData.storeSetGroupIds" multiple  placeholder="请选择" filterable clearable>
                    <Option v-for="(item,index) in groupList" :value="item._id" :key="index">{{ item.groupName }}
                    </Option>
                </Select>
                <div class="role-tip" v-if="permissionData.tab">
                    <span @click="$router.push('/store/setting/groupEdit')">门店分组管理</span>
                </div>
            </FormItem>
            <FormItem label="职位名称" prop="jobTitle">
                <select-input
                        class="input-style"
                        v-model="formData.jobTitle"
                        request='jobTitleSearch'
                        item-key='jobTitle'
                        filter='jobTitle'
                        placeholder="如：钣喷组长">
                </select-input>
                <!-- <Input v-model="formData.jobTitle" class="input-style" placeholder="如：钣喷组长"  :maxlength="10"/> -->
            </FormItem>
            <FormItem label="工作年限">
                <i-input v-model="formData.workSeniority"
                         class="input-style"
                         placeholder="如：10">
                    <span slot="append">年</span>
                </i-input>
            </FormItem>
            <FormItem label="车有料显示">
                <RadioGroup v-model="formData.cylDisplay">
                    <Radio :label="1">是</Radio>
                    <Radio :label="0">否</Radio>
                </RadioGroup>
                <p>
                    勾选车有料显示的员工将在车有料APP技师介绍中显示
                    <Poptip trigger="hover">
                        <span class="primary-text">查看示例</span>
                        <div class="primary-content" slot="content">
                            <img src="/images/store-jssl.jpg" alt="预览效果示例图">
                        </div>
                    </Poptip>
                </p>
            </FormItem>
            <!-- <FormItem label="功能权限" prop="authority">
              <staff-authority ref="authority" @get-check="getCheck">
              </staff-authority>
            </FormItem> -->
        </Form>
        <bottom-submit @on-cancel="$router.go(-1)"
                       @on-confirm="submit"
                       :loading="btnLoading"></bottom-submit>
        <Spin fix v-if="loading"></Spin>

        <update-mobile ref="updateMobile" @confirm="updateMobileConfirm"></update-mobile>
    </div>
</template>

<script>
    import {mapGetters, mapState, mapMutations} from 'vuex';
    import WVaildate from '@/components/vaildate';
    import UploadImg from '@/components/upload-image';
    import UpdateMobile from '@/components/dialog/update-mobile';
    import SelectInput from './select-input';
    import {storage, formVerify} from '@/assets/js/utils.js';
    import '@/styles/views/store/staff-add.less';
    import '@/styles/components/form.less';
    import { regexEnum } from "@/assets/js/regexEnum";

    export default {
        components: {WVaildate, UploadImg, UpdateMobile, SelectInput},
        data() {
            let id = this.$route.params.id;
            let permissionData = this.$permission.data.settingPermission;
            return {
                permissionData,
                headers: {
                    Authorization: storage.get('TOKEN')
                },
                id,
                breadName: id == "create" ? "新增员工" : "编辑员工",
                valiDisabled: true,
                loading: false,
                btnLoading: false,
                formData: {
                    captchaStr: '',
                    avatar: [],
                    cylDisplay: 0
                },
                type: 'text',
                ruleValidate: {
                    username: [{required: true, message: '请输入员工姓名', trigger: 'blur'}],
                    password: [{required: id === "create", min: 6, message: '密码长度应在6-16位之间', trigger: 'blur'}],
                    jobTitle: [{required: true, message: '请输入职位名称', trigger: 'blur'}],
                    mobile: [
                        {
                            required: true,
                            trigger: 'blur',
                            reg: 'MOBILE',
                            message: '请输入员工手机号',
                            formatTip: '请输入正确的手机号',
                            validator: formVerify.format,
                            callback: (rules, value, callback) => {
                                if (this.id != "create") return callback();
                                this.$store.dispatch({
                                    type: 'checkMobile',
                                    params: {
                                        mobile: value
                                    }
                                }).then(res => {
                                    if (res.code !== '0') {
                                        rules.message = '该手机号码已存在';
                                          this.valiDisabled = true;
                                        return callback(rules.message);
                                    }
                                    // this.valiDisabled = false;
                                    callback();
                                }).catch(err => {
                                    callback();
                                })
                            }
                        }
                    ],
                    validationCode: [{required: true, message: '请输入短信验证码', trigger: 'blur'}],
                    roleId: [{required: true, message: '请选择员工角色', trigger: 'change'}],
                    captchaStr: [{required: id === "create", message: '请输入图形验证码'}],
                },
                roleList: [],
                groupList: [],
                isMasterStore:this.$storage.get("STORE").isMasterStore,
                isChainStore:this.$storage.get("STORE").isChainStore
            }
        },

        created() {
            this.getRoleList();
            this.getGroupList();
            if (this.id !== 'create') this.getDetail();
        },
        mounted() {
            this.getCaptcha();
        },

        methods: {
            changeMobile(e) {
                const reg = regexEnum.MOBILE;
                const imgReg = regexEnum.IMGCODE;
                if (!reg.test(this.formData.mobile)) {
                    this.valiDisabled = true;

                } else {
                    if (!imgReg.test(this.formData.captchaStr)) {
                        // console.log("enter")
                        this.valiDisabled = true;
                    } else {
                        // console.log("faiul")
                        this.valiDisabled = false;
                    }
                }
            },
            async getGroupList() {
                let res = await this.$store.dispatch({
                    type: 'actionGet',
                    name: 'groupList',
                    params: {}
                });
                console.log(res.data.rows)
                this.groupList = res.data.rows;

            },
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
                        
                    });
           
            },
            async getDetail(value) {
                this.loading = true;
                try {
                    let res = await this.$store.dispatch({
                        type: 'actionGet',
                        name: 'staffDetail',
                        params: {userId: this.id}
                    });
                    let data = res.data;
                    data.avatar = data.avatar ? [data.avatar] : [];
                    data.cylDisplay = data.cylDisplay ? 1 : 0;
                    this.formData = data;
                    this.loading = false;
                } catch (error) {
                    this.loading = false;
                }
            },

            async getRoleList() {
                let res = await this.$store.dispatch({
                    type: "actionGet",
                    name: "roleList"
                });
                this.roleList = res.data;
            },

            openUpdateMobile() {
                this.$refs.updateMobile.openModel();
            },

            updateMobileConfirm(data) {
                this.formData.mobile = data.mobile;
                this.formData.validationCode = data.validationCode;
            },

            submit() {
                this.$refs.formValidate.validate((valid) => {
                    if (valid) {
                        this.btnLoading = true;
                        const params = JSON.parse(JSON.stringify(this.formData));
                        params.avatar = params.avatar[0] || "";
                        params.cylDisplay = !!params.cylDisplay;
                        params.workSeniority = params.workSeniority * 1;
                        let request = "staffAdd";
                        if (this.id !== 'create') {
                            params.userId = this.id;
                            request = "staffUpdate"
                            params.password = params.password || '';
                        } else {
                            params.password = params.password || '123456';
                        }

                        this.$store.dispatch({
                            type: 'actionPost',
                            name: request,
                            params
                        }).then((res) => {
                            if (res.code === '0') {
                                this.$Message.success({
                                    content: '员工账号保存成功！',
                                    onClose: () => {
                                        this.btnLoading = false;
                                        this.$router.push('/store/staff/account/list');
                                    }
                                })
                            } else {
                                if (res.code === '107013') {
                                    this.$Message.warning('验证码错误');
                                }
                                this.btnLoading = false;
                            }
                        }).catch((err) => {
                            this.$store.commit('REQUEST_ERROR', {err});
                        })
                    }
                })
            },
        },
    }
</script>
