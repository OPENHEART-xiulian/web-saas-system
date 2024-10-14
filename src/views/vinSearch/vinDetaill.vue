<template>
    <div class="container">
        <div class="header-info">
            <div>
                <span class="name">{{detail.brand+"-"+detail.car_series}}</span>
                <span class="model">{{detail.vehicle}}</span>
                <span class="title">厂商指导价</span>
                <div class="price">{{detail.base.manufacturerGuidePrice}}元</div>
            </div>
            <img :src="openDataUrlAndLogoUrl+'/v2/api/cyl/vehicle/brand/logo?name='+detail.brand" alt="">
        </div>
        <div class="body-info">
            <div>
                <span>变速箱类型</span>
                <span>{{detail.base.gearboxType}}</span>
            </div>
            <div>
                <span>座位数</span>
                <span>{{detail.base.gearboxType}}</span>
            </div>
            <div>
                <span>排量(升)</span>
                <span>{{detail.base.displacement}}</span>
            </div>
            <div>
                <span>上市时间</span>
                <span>{{detail.base.timeToMarket}}</span>
            </div>
            <div>
                <span>前轮胎规格</span>
                <span>{{detail.base.frontTireSpecifications}}</span>
            </div>
            <div>
                <span>后轮胎规格</span>
                <span>{{detail.base.rearTireSpecifications}}</span>
            </div>
        </div>
        <div class="foot-info">
            <div v-for="ele in detail.detail">
                <div class="title">
                    {{ele.category}}
                </div>
                <div class="item" v-for="ele1 in ele.values"><div>{{ele1.label}}</div><div>{{ele1.value}}</div></div>

            </div>


        </div>
    </div>
</template>
<script>
    import { openDataUrlAndLogoUrl } from '@/https/api';
    export default {
        data() {
            return {
                detail:{},
                openDataUrlAndLogoUrl
            }
        },
        mounted() {
            this.getDetail();
        },
        methods:{
            async getDetail() {
                const data = await this.$store.dispatch('actionGet', {name: 'getVinDetail',params:{id:this.$route.query.id}})
                console.log("9999",data)
                this.detail=data.data;
            },
        }
    }
</script>

<style scoped lang="less">
    .container {
        background: white;
        /*width: 100%;*/
        /*min-height: 80%;*/
        padding: 40px 0;
        max-width: initial;
        display: flex;
        flex-direction: column;
        align-items: center;
        .header-info {
            height: 150px;
            width: 800px;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #E4E4E4;
            > img {
                display: block;
                width: 96px;
                height: 96px;

            }

            > div {
                display: flex;
                flex-direction: column;

                .name {
                    font-size: 18px;
                    font-family: PingFang, PingFang-Bold;
                    font-weight: 700;
                    color: #333333;
                }

                .model {
                    font-size: 14px;
                    font-family: PingFangSC, PingFangSC-Regular;
                    font-weight: 400;
                    text-align: left;
                    color: #333333;
                    line-height: 20px;
                    margin-top: 4px;
                }

                .title {
                    font-size: 12px;
                    font-family: PingFangSC, PingFangSC-Regular;
                    font-weight: 400;
                    text-align: left;
                    color: #999999;
                    margin-top: 20px;
                }

                .price {
                    font-size: 20px;
                    font-family: PingFang, PingFang-Bold;
                    font-weight: 700;
                    text-align: left;
                    color: #e34040;
                }
            }
        }

        .body-info {
            padding: 20px 0;
            display: flex;
            flex-wrap: wrap;
            width: 800px;

            > div {
                display: flex;
                flex-direction: column;
                width: 200px;
                margin: 10px 0;
                > span {
                    font-size: 14px;
                    font-family: PingFang, PingFang-Bold;
                    font-weight: 700;
                    color: #333333;
                }

                > span:first-child {
                    font-size: 12px;
                    font-family: PingFangSC, PingFangSC-Regular;
                    font-weight: 400;
                    color: #999999;
                }

            }
        }

        .foot-info {
            width: 800px;
            .title{
                font-size: 14px;
                font-family: PingFangSC, PingFangSC-Regular;
                font-weight: 400;
                color: #333333;
                height: 40px;
                background: #f5f5f5;
                padding: 0 16px;
                display: flex;
                align-items: center;
            }
            .item{
                font-size: 14px;
                font-family: PingFangSC, PingFangSC-Regular;
                font-weight: 400;
                color: #333333;
                display: flex;
                >div{
                    height: 39px;
                    flex-grow: 1;
                    display: flex;
                    align-items: center;
                    padding-left: 16px;
                    width: 50%;
                }
                >div:first-child{
                    background: #fafafa;
                    border-bottom: 1px solid white;
                }
            }
        }
    }
</style>

