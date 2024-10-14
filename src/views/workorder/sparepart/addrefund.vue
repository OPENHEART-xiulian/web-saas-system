<template>
  <div class="add-form add-page">
    <saas-bread title="新建退货单">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">取消退货</i-button>
      </template>
    </saas-bread>
    <i-form ref="form" :model="formData" :rules="rules" label-position="top" :show-message="true">
      <div class="search-form header">
        <span>工单号：{{formData.statementNo || '--'}}</span>
        <i class="line"></i>
        <span>开单时间：{{formData.createdAt || '--'}}</span>
        <i class="line"></i>
        <span>客户名称：{{formData.vehicleOwner || '--'}}</span>
        <i class="line"></i>
        <span>联系电话：{{formData.ownerMobile || '--'}}</span>
      </div>
      
      <h2 class="title">配件信息</h2>
      <div class="search-form input-list">
        <Table 
          ref="repairParts" 
          class="refund-table" 
          :columns="repairColumns" 
          :data="formData.repairParts"
          @on-selection-change="onRepairCheckChange">
        </Table>
      </div>
      
      <h2 class="title">其它费用</h2>
      <div class="search-form input-list">
        <Table 
          ref="others" 
          class="refund-table" 
          :columns="otherColumns" 
          :data="formData.others"
          @on-selection-change="onOtherCheckChange">
        </Table>
      </div>
    </i-form>

    <bottom-submit>
      <div class="slot-left">
        <p class="workorder-price">退货金额: <span>￥{{formData.realCost | toFixed}}</span></p>
        <p>
          <span>{{typeCount}} 种共计 {{ allCount }} 件配件</span>
        </p>
      </div>
      <i-button type="error" :loading="loading" @click="submit" :disabled="disabled">确定</i-button>
    </bottom-submit>
  </div>
</template>

<script>
  import '@/styles/components/search-form.less';
  import "@/styles/views/workorder/add.less";

  export default {
    data () {
      return {
        isCreate: true,               // true 新增， false 编辑
        disabled: true,
        loading: false,   
        repairColumns: [
          { type: 'selection', width: 70, align: 'center' },
          { 
            title: '配件名称', 
            key: 'partName', 
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => h('span', row[column.key] || '--') 
          }, 
          { title: '原厂编码', 
            key: 'partFactoryNo', 
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => h('span', row[column.key] || '--') 
          }, 
          { title: '品牌', 
            key: 'brand', 
            minWidth: 100,
            render: (h, { row, column }) => h('span', row[column.key] || '--') 
          }, 
          { title: '仓库', 
            key: 'warehouseName', 
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => h('span', row[column.key] || '--') 
          }, 
          // { title: '货位', 
          //   key: 'shelfName', 
          //   minWidth: 80,
          //   ellipsis: true,
          //   render: (h, { row, column }) => h('span', row[column.key] || '--') 
          // }, 
          { 
            title: '出库方式', 
            key: 'stockOutType',
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => {
              return h('span', this.getStockOutType(row[column.key]));
            }
          }, 
          { 
            title: '可退数量', 
            key: 'quantity', 
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => h('span', row[column.key] || '0') 
          }, 
          { 
            title: '退货数量', 
            key: 'refundQuantity',
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column, index }) => {
              return h('format-input', {
                props: {
                  reg: 'PRECISION',
                  max: Number(row.quantity),
                  min: 0,
                  value: String(row[column.key])
                },
                on: {
                  'on-blur': e => {
                    this.formData.repairParts[index][column.key] = e.target.value;
                    this.getRowCost(index, true);
                  }
                }
              });
            }
          }, 
          { 
            title: '退货单价', 
            key: 'refundPrice',
            minWidth: 100,
            render: (h, { row, column, index }) => {
              return h('format-input', {
                props: {
                  reg: 'PRECISION',
                  min: 0,
                  value: row[column.key] || '0'
                },
                on: {
                  'on-blur': e => {
                    this.formData.repairParts[index][column.key] = e.target.value;
                    this.getRowCost(index, true);
                  }
                }
              });
            }
          }, 
          { 
            title: '退货金额',
            key: 'refundCost', 
            minWidth: 100,
            ellipsis: true,
            render: (h, { row, column }) => h('span', Number(row[column.key] || 0).toFixed(2))
          }, 
        ],

        otherColumns: [
          { type: 'selection', width: 70, align: 'center' },
          { 
            title: '项目', 
            key: 'name', 
            minWidth: 80,
            ellipsis: true,
            render: (h, { row, column }) => h('span', row[column.key] || '0') 
          }, 
          { 
            title: '费用', 
            key: 'refundCost',
            width: 180,
            ellipsis: true,
            render: (h, { row, column, index }) => {
              return h('format-input', {
                props: {
                  reg: 'PRECISION',
                  min: 0,
                  value: row[column.key] || '0'
                },
                on: {
                  'on-blur': e => {
                    this.formData.others[index][column.key] = e.target.value;
                    this.getRowCost(index);
                  }
                }
              });
            }
          }, 
        ],
        
        formData: {
          statementNo: '',                                            // 结算单编号 20位数字
          createdAt: '',                                              // 开单时间 格式： YYYY-MM-DD HH:mm:ss
          vehicleId: '',                                              // 车辆id
          customerId: '',                                             // 客户id
          vehicleOwner: '',                                           // 车辆所有人
          ownerMobile: '',                                            // 车主电话
          repairName: '',                                             // 送修人姓名
          repairMobile: '',                                           // 送修人联系电话
          plateNo: '',                                                // 车牌号码
          vehicleBrand: '',                                           // 车辆品牌
          brandId: '',                                                // 品牌id
          carSeries: '',                                              // 车系
          carStyle: '',                                               // 车型
          subBrand: '',                                               // 子品牌
          repairParts: [],                                            // 维修配件列表 partNo：配件编号 quantity：配件数量
          others: [],                                                 // 其他项目列表 name：其他项目名称 cost：其他项目费用
          realCost: '0',                                              // 实收金额
        },

        allCount: 0,
        typeCount: 0,
        selectionReparis: [],
        selectionOthers: [],

        rules: {
          vehicleOwner: [
            { 
              required: true, 
              message: '车辆所有人姓名不能为空', 
              trigger: 'blur'
            }
          ]
        }
      };
    },

    filters: {
      toFixed (v) {
        return Number(v).toFixed(2);
      }
    },

    mounted () {
      this.init();
    },
    methods: {
      init () {
        this.isCreate = !this.$route.query.refund;
        if (!this.isCreate) {
          this.getRefundDetail();
        } else {
          this.getStatementDetail();
        }
      },

      async getRefundDetail () {
        const res = await this.$store.dispatch({
          name: 'saleRefundDetail',
          type: 'actionGet',
          params: {
            _id: this.$route.params.id
          }
        });

        if (res.code === '0') {
          const data = res.data;

          data.customerId = data.customerId || '';
          data.vehicleId = data.vehicleId;

          data.repairParts.forEach((item, index) => {
            item._selectId = index + 1;
            // quantity： 总数量； 编辑退货单： 总可退数量 = 总数量- 当前维修单已退货总数量
            item.quantity = String(item.quantity - item.refundQuantity);
            item.refundQuantity = item.quantity;
            item.refundPrice = item.retailPrice;
            item.refundCost = (item.refundQuantity * item.refundPrice).toFixed(2);
          });

          data.others.forEach((item, index) => {
            item._selectId = index + 1;
            item.refundCost = item.cost;
          });

          data.refundParts.forEach(item => {
            item.refundCost = String(item.refundCost);
            item.refundPrice = String(item.refundPrice);
            item.retailPrice = String(item.retailPrice);
            item.originQuantity = String(item.originQuantity);
            // 编辑退货单： 可退数量 = 可退总数量 + 当前单已用数量
            item.quantity = String(Number(data.repairParts[item.idx].quantity) + Number(item.refundQuantity));  
            item.refundQuantity = String(item.refundQuantity);
            item.purchasePrice = String(item.purchasePrice);
            item.cost = String(item.cost);
            item._checked = true;
            item._selectId = item.idx + 1;
            data.repairParts[item.idx] = item;
          });

          data.refundOthers.forEach(item => {
            item.refundCost = String(item.refundCost);
            item._checked = true;
            item._selectId = item.idx + 1;
            data.others[item.idx] = item;
          });

          // let repairParts = data.repairParts;
          // let others = data.others;
          // data.repairParts = data.refundParts;
          // data.others = data.refundOthers;

          this.formData = data;
          this.selectionReparis = data.repairParts;
          this.selectionOthers = data.others;
          this.getAllCost();
        }
      },

      // 获取维修单详情
      async getStatementDetail () {
        const res = await this.$store.dispatch({
          type: 'toGetSaleDetail',
          params: {
            statementNo: this.$route.params.id
          }
        });

        if (res.code === '0') {
          const data = res.data;

          data.customerId = data.customerId || '';
          data.vehicleId = data.vehicleId;

          data.repairParts.forEach((item, index) => {
            item._checked = true;
            item._selectId = index + 1;
            // 获得可退数量 refundQuantity: 退货单已退数量
            item.quantity = String(item.quantity - item.refundQuantity);
            // 默认退货数量为可以退货数量
            item.refundQuantity = item.quantity;
            item.refundPrice = item.retailPrice;
            item.refundCost = (item.refundQuantity * item.refundPrice).toFixed(2);
          });

          data.others.forEach((item, index) => {
            item._selectId = index + 1;
            item.refundCost = item.cost;
            item._checked = !item.refund;
            item._disabled = item.refund;
          });

          this.formData = data;
          this.selectionReparis = data.repairParts;
          this.selectionOthers = data.others;
          this.getAllCost();
        }
      },

      async submit () {
        const formData = this.getFormData();

        this.loading = true;
        const res = await this.$store.dispatch({
          name: this.isCreate ? 'saleRefundAdd' : 'saleRefundUpdate',
          type: 'actionPost',
          params: formData
        });
        
        if (res.code === '0') {
          this.$Message.success({
            content: '保存成功',
            onClose: () => {
              this.loading = false;
              this.$router.push({ 
                path: '/workorder/salereturn',
                query: { refresh: true }
              });
            }
          })
        } else {
          this.loading = false;
        }
      },

      getFormData () {
        let formData = {
          refundParts: [],
          refundOthers: []
        }

        if (this.isCreate) {
          formData.statementNo = this.$route.params.id;
        } else {
          formData._id = this.$route.params.id;
        }

        this.formData.repairParts.forEach((item, index) => {
          if (item._checked && Number(item.refundQuantity) > 0) {
            formData.refundParts.push({
              idx: index,
              refundQuantity: item.refundQuantity,
              refundPrice: item.refundPrice,
              refundCost: item.refundCost
            });
          }
        });

        this.formData.others.forEach((item, index) => {
          if (item._checked) {
            formData.refundOthers.push({
              idx: index,
              refundCost: item.refundCost
            });
          }
        });

        return formData;
      },
      
      // 计算单行总价
      getRowCost (index, type) {
        let item = this.formData.repairParts[index];
        if (type) {
          item.refundCost = (item.refundQuantity * item.refundPrice).toFixed(2);
        } 
        this.getAllCost();
      },

      getAllCost () {
        let sum = 0;
        let disabled = true;
        let allCount = 0;
        let typeCount = 0;
        this.formData.repairParts.forEach(item => {
          if (item._checked * Number(item.refundQuantity) > 0) {
            disabled = false;
            allCount += Number(item.refundQuantity);
            typeCount++;
            sum += Number((item.refundQuantity * item.refundPrice).toFixed(2));
          }
        });
        this.formData.others.forEach(item => {
          if (item._checked) {
            disabled = false;
            // allCount++;
            // typeCount++;
            sum += Number(item.refundCost);
          }
        });
        this.formData.realCost = String(sum);
        this.allCount = allCount;
        this.typeCount = typeCount;
        this.disabled = disabled;
      },

      onRepairCheckChange (v) {
        this.setChecked(v, this.formData.repairParts);
      },

      onOtherCheckChange (v) {
        this.setChecked(v, this.formData.others);
      },

      setChecked (v, array) {
        array.forEach(item => {
          let checked = false;
          v.forEach(citem => {
            if (item._selectId === citem._selectId) {
              checked = true;
            }
          });
          item._checked = checked;
        });
        this.getAllCost();
      },

      getStockOutType (v) {
        let text = '--';
        if (v === '1') text = '领料';
        else if (v === '2') text = '即进即出';
        else if (v === '3') text = '自带';
        return text;
      },
    },
  };
</script>
