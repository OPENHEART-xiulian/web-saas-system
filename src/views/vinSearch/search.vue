<template>
    <div class="container">
        <img class="pic" src="../../../public/images/vinSearch/query_index@2x.png" alt="">
        <Input maxlength="17" style="margin-top: 40px;width: 550px" @on-search="getData" v-model="vin" search enter-button="搜索" placeholder="请输入17位VIN码搜索"/>
        <div class="list" v-if="list!=0">
            <span v-if="list&&list.length!=0">为您匹配到以下车型：</span>
            <div class="item" v-for="ele in list" @click="goDetail(ele)">
                <img :src="openDataUrlAndLogoUrl+'/v2/api/cyl/vehicle/brand/logo?name='+ele.brand" alt="">
                <div class="one"><span>{{ele.brand+"-"+ele.car_series}}</span><span>{{ele.vehicle}}</span></div>
                <a class="two">完整参数<i class="iconfont icon-right"></i></a>
            </div>
        </div>
        <div class="empty-box" v-if="list==0&&loaded">
            <img src="../../../public/images/vinSearch/default_nocar@2x.png" alt="">
            <span>没有匹配到相关车型呢~</span>
        </div>
    </div>
</template>
<script>
    import { openDataUrlAndLogoUrl } from '@/https/api';
    import { Message } from 'view-design';
    export default {
        data() {
            return {
                vin:"",
                list:[],
                openDataUrlAndLogoUrl,
                loaded:false
            }
        },
        methods:{
            async getData() {
                if(this.vin.length!=17){
                    Message.warning("请输入17位的vin码");
                    return
                }
                const data = await this.$store.dispatch('actionGet', {name: 'getVinList',params:{vin:this.vin.toUpperCase()}});
                if(data.code==10090){
                    Message.warning("请输入正确的vin码");
                    return
                }
                this.loaded=true;
                this.list=data.data;
            },
            goDetail(ele){
                this.$router.push({path:"/vinSearch/detail",query:{id:ele.id}})
            }
        }
    }
</script>

<style scoped lang="less">
    .container {
        position: absolute;
        background: white;
        width: 100%;
        min-height: 80%;
        display: flex;
        align-items: center;
        flex-direction: column;
        max-width: initial;
        .pic {
            display: block;
            width: 240px;
            height: 160px;
            margin-top: 80px;
        }
        .list{
            width: 550px;
            margin-top: 40px;
            >span{
                font-size: 14px;
                font-family: PingFangSC, PingFangSC-Regular;
                font-weight: 400;
                color: #999999;
            }
            .item{
                width: 100%;
                margin-top: 20px;
                height: 80px;
                background: #ffffff;
                border-radius: 4px;
                box-shadow: 0px 4px 32px 0px rgba(0,0,0,0.05);
                display: flex;
                align-items: center;
                position: relative;
                >img{
                    display: block;
                    width: 48px;
                    height: 48px;
                    margin:0 16px;
                }
                .one{
                    display: flex;
                    flex-direction: column;
                    span{
                        font-size: 12px;
                        font-family: PingFangSC, PingFangSC-Regular;
                        font-weight: 400;
                        color: #999999;
                    }
                    span:first-child{
                        font-size: 16px;
                        font-family: PingFang, PingFang-Bold;
                        font-weight: 700;
                        color: #333333;
                    }
                }
                .two{
                    position: absolute;
                    right: 16px;
                    font-size: 12px;
                    font-family: PingFangSC, PingFangSC-Regular;
                    font-weight: 400;
                    color: #999999;
                    i{
                        font-size: 12px;
                    }
                }
            }
        }
        .empty-box{
            margin-top: 120px;
            img{
                display: block;
                width: 128px;
                height: 52px;
                margin-bottom: 20px;
            }
        }
    }
</style>

