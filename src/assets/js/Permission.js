import { storage } from "./utils.js";
/**
 * 权限管理文件
 * 后端返回格式
 * permissionList: [
 *  {
 *    permissionId: "",     // 权限id
 *    indeterminate: false, // 是否全选，没啥作用
 *    menuCode: "",         // 权限code
 *    menuName: "",         // 权限名称
 *    permissionType: "",   // 权限类型
 *    value: false,         // 是否选中，没啥作用
 *  }
 * ];
 *
 * 每个页面对应每个权限code，如一些字段是固定的，方便页面设置，
 * create 新建
 * update 编辑或更新
 * delete 删除
 * print 打印
 * check 查看
 * import 导入
 * 等等，如果功能相似，用想似的字段名称，如果在下面没找到对应的，则添加新名字，
 * 对于功能按照permissionCode添加权限code
 * 对于tablist按照permissionTabs添加权限code
 */
export class Permission {
  isInit = false;
  // 用户所拥有的的权限列表
  userPermissionList = [];

  permissionCode = {
    // 首页
    home: {
      route: "08",
      business: "0801",         // 营业信息（快报和趋势）
    },
    // 工单 - 工单管理
    worker: {
      admin: "01"
    },

    // 工单 - 维修工单
    workerList: {
      create: "010101",         // 新建工单
      finish: "010102",         // 施工完成
      advance: "010103",        // 预收
      update: "010104",         // 编辑
      settle: "010105",         // 结算
      credit: "010106",         // 挂账
      factory: "010107",        // 出厂
      delete: "010108",         // 作废
      cancelAdvance: "010109",  // 取消预收
      newWork: "010110",        // 重新施工
      newSettle: "010111",      // 重新结算
      check: "010112",          // 查看
      print: "010113",          // 打印
      picking: "010114",        // 领料
    },

    // 工单 - 洗美工单
    workerCleanout: {
      create: "010301",         // 新建工单
      finish: "010302",         // 施工完成
      advance: "010303",        // 预收
      update: "010304",         // 编辑
      settle: "010305",         // 结算
      credit: "010306",         // 挂账
      delete: "010307",         // 作废
      check: "010308",          // 查看
      print: "010309",          // 打印
      picking: "010310",        // 领料
    },

    // 工单 - 销售工单
    workerSparepart: {
      create: "010201",         // 新建工单
      output: "010202",         // 出库
      advance: "010203",        // 预收
      update: "010204",         // 编辑
      settle: "010205",         // 结算
      credit: "010206",         // 挂账
      refund: "010207",         // 退货
      delete: "010208",         // 作废
      check: "010209",          // 查看
      print: "010210",          // 打印
      picking: "010211",        // 领料
    },

    // 工单 - 退货工单
    workerSalereturn: {
      input: "010401",          // 入库
      update: "010402",         // 编辑
      settle: "010403",         // 结算
      delete: "010404",         // 作废
      check: "010405",          // 查看
      print: "010406",          // 打印
    },

    // 工单 - 试算单
    workerTrialorder: {
      create: "010501",         // 新建试算单
      update: "010502",         // 编辑
      generate: "010503",       // 生成工单
      delete: "010504",         // 删除
      print: "010505",          // 打印

      check: "010506",          // 查看工单
    },

    // 收银 - 收银台
    cashCashier: {
      check: "050101",    // 查看
      advance: "050102",  // 预收
      receipt: "050103",  // 收款
      credit: "050104",   // 挂账
      print: "050105",    // 打印
    },

    // 收银 - 挂账应收
    cashReceivable: {
      list: "0502",       // 挂账应收列表
      check: "050201",    // 查看
      receipt: "050202",  // 收款
      print: "050203",    // 打印
    },

    // 收银 - 应付账款
    cashPayment: {
      check: "050301",    // 查看
      receipt: "050302",  // 收款
    },
    // 客户 - 客户管理
    customer: {
      check: "070103",    // 查看
      create: "070101",   // 新建
      delete: "070104",   // 删除
      import: "070102",   // 批量导入
    },
    // 客户 - 关怀提醒
    customerRemind: {
      setting: "070401",    // 提醒设置
      operation: "070402",  // 提醒处理,
      create: "07040301",   // 回访登记
      check: "07040302",    // 回访记录
      delete: "07040303",   // 回访删除
    },
    // 客户 - 车辆管理
    customerVehicle: {
      check: "070201",    // 查看
    },

    // 客户 - 标签管理
    customerLabel: {
      create: "070301",   // 新建标签
    },

    // 营销 - 会员卡管理 - 服务卡
    marketCardService: {
      create: "060101",       // 出售会员卡
      update: "06010201",     // 修改
      refund: "06010202",     // 退卡
      // delete: "06010202",  // 退卡
    },

    // 营销 - 会员卡管理 - 充值卡
    marketCardRecharge: {
      update: "06010301",     // 修改
      refund: "06010302",     // 退卡
      // delete: "06010302",     // 退卡
      recharge: "06010303",   // 充值
    },

    // 营销 - 会员卡模板
    marketCardTemplate: {
      create: "060201", // 新建会员卡模板
      check: "060202",  // 查看
      delete: "060203", // 作废
      update: "060204", // 修改
    },

    // 营销 - 平台项目 - 项目列表
    marketPlatformProject: {
      change: "06040101", // 上下架
      preview: "06040102",  // 预览
    },

    // 营销 - 平台项目 - 订单列表
    marketPlatformOrder: {
      check: "06040201",  // 查看详情
      reply: "06040202", // 回复评价
    },

    // 配件 - 即进即出 - 采购任务
    inventoryForwardTask: {
      resolve: "03050101", // 分解任务
    },

    // 配件 - 即进即出 - 付款管理
    inventoryForwardManage: {
      check: "03050201",    // 查看
      payment: "03050202",  // 付款
      print: "03050203",    // 打印
    },

    // 配件 - 采购入库 - 采购单管理
    inventoryPurchasePut: {
      create: "03010101",   // 采购开单
      update: "03010102",   // 编辑
      input: "03010103",    // 入库
      payment: "03010104",  // 付款
      check: "03010105",    // 查看
      delete: "03010106",   // 作废
      print: "03010107",    // 打印
    },


    // 配件 - 采购入库 - 退货单管理
    inventoryPurchaseRefund: {
      create: "03010201",   // 退货开单
      update: "03010202",   // 编辑
      output: "03010203",   // 出库
      refund: "03010204",   // 退款
      check: "03010205",    // 查看
      delete: "03010206",   // 作废
      print: "03010107",    // 打印
    },

    // 配件 - 出库单列表
    inventoryOutput: {
      list: "030201",       // 出库单列表
      create: "03020201",   // 新建出库单
      confirm: "03020202",  // 确认退料
      check: "03020203",    // 查看
      print: "03020204",    // 打印
    },

    // 配件 - 出库单明细列表
    inventoryOutputInfo: {
      list: "030203",       // 出库单明细列表
      check: "03020301",    // 查看
    },

    // 配件 - 配件盘点
    inventoryTakestock: {
      create: "030301",     // 新建盘点单
      update: "030302",     // 编辑
      confirm: "030303",    // 盘点确认
      delete: "030304",     // 作废
      check: "030305",      // 查看
      print: "030306",      // 打印
    },

    // 配件 - 配件调拨
    inventoryAllocation: {
      create: "030901",     // 新建调拨单
      confirm: "030902",    // 确认
      update: "030903",     // 编辑
      delete: "030904",     // 作废
      check: "030905",      // 查看
      print: "030906",      // 打印
    },

    // 配件 - 供应商
    inventorySupplier: {
      create: "030601",     // 新建供应商
      check: "030602",      // 查看
    },

    // 配件 - 仓库管理
    inventoryWarehouse: {
      create: "030701",     // 新建仓库
      update: "030702",     // 编辑仓库
      delete: "030703",     // 删除仓库
      createZhy: "030704",  // 新建货位
      updateZhy: "030705",  // 编辑货位
      deleteZhy: "030706",  // 删除货位
    },

    // 配件 - 配件管理
    inventoryMaintain: {
      category: "030801",   // 类别管理
      create: "030802",     // 新建维修配件
      import: "030803",     // 批量导入
      update: "030804",     // 编辑
      delete: "030805",     // 删除
    },

    // 设置 - 服务项目
    settingService: {
      create: "040101",     // 新建服务项目
      category: "040102",   // 项目类别管理
      import: "040103",     // 导入服务项目
      update: "040104",     // 编辑项目
      delete: "040105",     // 删除项目
    },

    // 设置 - 员工管理
    settingStaff: {
      tab: "040501",        // 员工管理
      create: "04050101",   // 新建员工
      update: "04050102",   // 编辑
      enable: "04050103",   // 禁用
      delete: "04050104",   // 删除
    },

    // 设置 - 权限管理
    settingPermission: {
      tab: "040502",        // 权限管理
      create: "04050201",   // 新建岗位权限
      update: "04050202",   // 编辑
      delete: "04050203",   // 删除
    },

    // 门店 - 支付设置
    settingPayment: {
      create: "04090101",     // 新建支付方式
      operation: "04090102",  // 操作
    },

    // 设置 - 门店信息
    settingStore: {
      route: "0407",
      search: "04070201",   // 认领分店
      create: "04070202",   // 新建分店
      update: "04070203",   // 编辑门店
      toggle: "04070204",   // 停用/启用
      editInfo: "04070301", // 更新营业信息
    },

    // 设置 - 健康档案
    settingBusiness: {
      check: "0408",
    },

    // 设置 - 线上项目
    settingOnline: {
      create: "060301",           // 创建
      update: "060302",           // 编辑
      delete: "060303",           // 删除
      top: "060304",              // 置顶
      status: "060305",           // 修改状态
    },

    // 报表 - 员工产值
    dataPerformance: {
      route: "0206",
      check: "020601",
    }
  }

  data = {};  // 所有权限对应的boolean值

  permissionTabs = {
    // =============================== 顶部导航 =================================
    headerNav: [
      { name: "维修开单", menuCode: "010101", url: "/workorder/worker/add/create",  icon: "icon-weixiugongdan" },
      { name: "洗美开单", menuCode: "010301", url: "/workorder/cleanout/add/create", icon: "icon-ximeigongdan" },
      { name: "配件销售", menuCode: "010201", url: "/workorder/sparepart/add/create", icon: "icon-peijianxiaoshou" },
      { name: "采购开单", menuCode: "03010101", url: "/inventory/purchase/put/add/create", icon: "icon-peijiancaigou" }
    ],

    // ========================== 工单管理 - 工单列表 ============================
    workerList: [
      { name: "待施工", menuCode: "010102", value: 0, status: ["1", ""], key: "todo", type: "0" },
      { name: "待结算", menuCode: "010103", value: 0, status: ["2", "1"], key: "topay", type: "1" },
      { name: "待出厂", menuCode: "010104", value: 0, status: ["2", "2,3"], key: "toleave", type: "2" },
      { name: "已挂账", menuCode: "010105", value: 0, status: ["2,3", "3"], key: "oncredit", type: "3" },
      { name: "已完成", menuCode: "010106", value: 0, status: ["3", "2"], key: "finished", type: "4" },
      { name: "已作废", menuCode: "010107", value: 0, status: ["0", ""], key: "cancel", type: "5" },
      { name: "全部", value: 0, status: ["", ""], key: "all", type: "6" }
    ],

    // ========================== 工单管理 - 洗美工单 ============================
    cleanoutList: [
      { name: "待施工", menuCode: "010302", value: 0, status: ["1", ""], key: "todo" },
      { name: "待结算", menuCode: "010303", value: 0, status: ["2", "1"], key: "topay" },
      { name: "已挂账", menuCode: "010304", value: 0, status: ["2", "3"], key: "oncredit" },
      { name: "已完成", menuCode: "010305", value: 0, status: ["2", "2"], key: "finished" },
      { name: "已作废", menuCode: "010306", value: 0, status: ["0", ""], key: "cancel" },
      { name: "全部", value: 0, status: ["", ""], key: "all" }
    ],

    // ========================== 工单管理 - 销售工单 ============================
    sparepartList: [
      { name: "待出库", menuCode: "010202", value: 0, status: ["1", ""], key: "todo" },
      { name: "待结算", menuCode: "010203", value: 0, status: ["2", "1"], key: "topay" },
      { name: "已挂账", menuCode: "010204", value: 0, status: ["2", "3"], key: "oncredit" },
      { name: "已完成", menuCode: "010205", value: 0, status: ["2", "2"], key: "finished" },
      { name: "已作废", menuCode: "010206", value: 0, status: ["0", ""], key: "cancel" },
      { name: "全部", value: 0, status: ["", ""], key: "all" }
    ],

    // ========================== 工单管理 - 销售退货 ============================
    salereturnList: [
      { name: "待入库", menuCode: "010401", value: 0, status: ["1", ""], key: "todo" },
      { name: "待结算", menuCode: "010402", value: 0, status: ["2", "1"], key: "topay" },
      { name: "已完成", menuCode: "010403", value: 0, status: ["2", "2"], key: "finished" },
      { name: "已作废", menuCode: "010404", value: 0, status: ["0", ""], key: "cancel" },
      { name: "全部", value: 0, status: ["", ""], key: "all" }
    ],

    // ========================== 门店设置 - 员工管理 ============================
    staffAccountList: [
      { name: "账号管理", menuCode: "040501", path: "/store/staff/account/list" },
      { name: "权限管理", menuCode: "040502", path: "/store/staff/permission/list" }
    ],

    // ========================== 数据报表 - 门店分析 ============================
    dataAnalyseList: [
      { name: "营业收入统计", menuCode: "020301", request: "turnoverTrend" },
      { name: "维修台次统计", menuCode: "020302", request: "trendMaintenance" },
      { name: "配件利润统计", menuCode: "020303", request: "trendProfit" },
      { name: "收入类型统计", menuCode: "020304", request: "trendIncomeType" }
    ],

    // ========================== 数据报表 - 财务报表 ============================
    dataFinanceList: [
      { name: "工单报表", menuCode: "020101", icon: "finance_icon_gongdan.png", color: "#53A6FA", key: "work" },
      { name: "收入报表", menuCode: "020102", icon: "finance_icon_income.png", color: "#4DCB73", key: "income" },
      { name: "抹零报表", menuCode: "020103", icon: "finance_icon_moling.png", color: "#FDAB29", key: "notCount" },
      { name: "挂账汇总", menuCode: "020104", icon: "finance_icon_accounts.png", color: "#FF6C5F", key: "hangup" },
      { name: "会员卡报表", menuCode: "020105", icon: "finance_icon_vip.png", color: "#bc62f5", key: "card" }
    ],

    // ========================== 数据报表 - 仓库报表 ============================
    dataWarehousList: [
      { name: "入库明细", menuCode: "020701", icon: "warehouse_icon_ruku.png", color: "#53A6FA", key: "warehousing" },
      { name: "出库明细", menuCode: "020702", icon: "warehouse_icon_chuku.png", color: "#4DCB73", key: "exwarehouse" },
      { name: "库存盘点明细", menuCode: "020703", icon: "warehouse_icon_check.png", color: "#4DCB73", key: "inventory" }
    ],

    // ========================== 数据报表 - 采购报表 ============================
    dataPurchaseList: [
      { name: "配件采购统计表", menuCode: "020501", icon: "purchase_icon_parts.png", color: "#53A6FA", key: "part" },
      { name: "供应商采购排行榜", menuCode: "020502", icon: "purchase_icon_ranking.png", color: "#4DCB73", key: "supplier" }
    ],
    // ========================== 数据报表 - 调拨表 ============================
    dataAllotList: [
      { name: "调出明细", menuCode: "020501", icon: "warehouse_icon_ruku@2x.png", color: "#53A6FA", key: "up" },
      { name: "调入明细", menuCode: "020502", icon: "warehouse_icon_chuku@2x.png", color: "#4DCB73", key: "down" }
    ],

    // ========================== 数据报表 - 数据备份 ============================
    dataBackupList: [
      { name: "客户档案备份", menuCode: "020401", icon: "backup_icon_customer.png", color: "#53A6FA", key: "customerBackupDate", date: "" },
      { name: "维修配件备份", menuCode: "020402", icon: "backup_icon_parts.png", color: "#4DCB73", key: "componentBackupDate", date: "" },
      { name: "维修档案备份", menuCode: "020403", icon: "backup_icon_repair.png", color: "#FDAB29", key: "maintenanceBackupDate", date: "" },
      { name: "服务项目备份", menuCode: "020404", icon: "backup_icon_project.png", color: "#FDAB29", key: "serviceBackupDate", date: "" }
    ],

    // ========================== 配件管理 - 配件库存 ============================
    inventoryStockTab: [
      { name: "配件库存", menuCode: "030401", queryShow: false, badge: 0, componentName: "StockList",   headName: "stockCount" },
      { name: "库存预警", menuCode: "030402", queryShow: false, badge: 0, componentName: "WarningList", headName: "warningCount" },
    ],

    // ========================== 配件管理 - 即进即出 ============================
    inventoryForwardTab: [
      // { name: "采购任务", menuCode: "030501", path: "/inventory/forward/task" },
      // { name: "付款管理", menuCode: "030502", path: "/inventory/forward/manage" },
      { name: "采购任务", menuCode: "030501", queryShow: false, badge: 0, componentName: "TaskList",    headName: "annualCheck" },
      { name: "付款管理", menuCode: "030502", queryShow: false, badge: 0, componentName: "PaymentList", headName: "maintain" },
    ],

    // ========================== 配件管理 - 采购入库 ============================
    inventoryPurchaseList: [
      { name: "采购单管理", menuCode: "030101", queryShow: false, badge: 0, componentName: "PutList" },
      { name: "入库管理", menuCode: "030103", queryShow: false, badge: 0, componentName: "InList" },
      { name: "退货单管理", menuCode: "030102", queryShow: false, badge: 0, componentName: "RefundList" },
    ],

    
    // ========================== 配件管理 - 调拨申请 ============================
    allotApplyList: [
      { name: "调入申请", menuCode: "030101", queryShow: false, badge: 0, componentName: "PutList" },
      { name: "待处理调拨", menuCode: "030102", queryShow: false, badge: 0, componentName: "RefundList" },
    ],

    // ========================== 配件管理 - 配件出库 ============================
    inventoryOutputList: [
      { name: "出库单", menuCode: "030202", path: "/inventory/output/stockout", componentName: "stockout" },
      { name: "配件出库明细", menuCode: "030203", path: "/inventory/output/particulars", componentName: "particulars" },
      // { name: "出库单", menuCode: "030101", path: "/inventory/output/stockout" },
      // { name: "配件出库明细", menuCode: "030101", path: "/inventory/output/particulars" },
    ],

    // ========================== 客户管理 - 标签管理 ============================
    customerLabelList: [
      { name: "条件标签", menuCode: "070302", path: "/customer/label/condition/list" },
      { name: "手动标签", menuCode: "070304", path: "/customer/label/manual/list" },
    ],

    // ========================== 客户管理 - 关怀提醒 ============================
    remindLabelList: [
      { name: "回访提醒", menuCode: "070403", queryShow: false,                   badge: 0, componentName: "ReturnVisitList", headName: "returnVisit" },
      { name: "生日提醒", menuCode: this.permissionCode.customerRemind.operation, badge: 0, componentName: "BirthdayList",    headName: "birthday" },
      { name: "保险提醒", menuCode: this.permissionCode.customerRemind.operation, badge: 0, componentName: "InsuranceList",   headName: "insurance" },
      { name: "年检提醒", menuCode: this.permissionCode.customerRemind.operation, badge: 0, componentName: "AnnualList",      headName: "annualCheck" },
      { name: "保养提醒", menuCode: this.permissionCode.customerRemind.operation, badge: 0, componentName: "MaintainList",    headName: "maintain" },
      { name: "提醒设置", menuCode: this.permissionCode.customerRemind.setting,   badge: 0, componentName: "RemindSetting",   headName: "" },
    ],
    
    // ==================== 客户管理 - 客户分析 - 成交客户详情 ====================
    customerAnalyzeMakeDetail: [
      { name: "客户信息", path: "/customer/analyze/make/detail/customer" },
      { name: "工单信息", path: "/customer/analyze/make/detail/worker" },
    ],
    
    // ==================== 客户管理 - 客户分析 - 成交客户详情 ====================
    customerAnalyzeConsumeDetail: [
      { name: "客户信息", path: "/customer/analyze/consume/detail/customer" },
      { name: "工单信息", path: "/customer/analyze/consume/detail/worker" },
    ],

    // ========================== 客户管理 - 客户分析 ============================
    customerAnalyzeList: [
      { name: "成交客户概述", menuCode: "060102", path: "/customer/analyze/make/list" },
      { name: "消费能力分析", menuCode: "060102", path: "/customer/analyze/consume/list" },
    ],

    // ========================== 营销中心 - 会员管理 ============================
    marketVipList: [
      { name: "服务卡", menuCode: "060102", componentName: "ServerCardList", path: "/market/card/member/list" },
      { name: "充值卡", menuCode: "060103", componentName: "RechargeCardList", path: "/market/card/recharge/list" },
    ],

    // ========================== 营销中心 - 平台管理 ============================
    marketPlatformList: [
      { name: "项目列表", menuCode: "060401", componentName: "ProjectList" },
      { name: "订单列表", menuCode: "060402", componentName: "OrderList" },
    ],

    // ========================== 设    置 - 门店设置 ============================
    storeSettingList: [
      { name: "门店管理", menuCode: "040702", path: "/store/setting/admin/list" },
      { name: "营业信息", menuCode: "040703", path: "/store/setting/info/detail" },
      { name: "主修项目", menuCode: "040704", path: "/store/setting/project/list" },
      { name: "门店分组", menuCode: "040704", path: "/store/setting/group/list" },
    ],

    // ========================== 设    置 - 系统设置 ============================
    storeSystemList: [
      { name: "支付设置", menuCode: "060102", path: "/store/system/payment" },
      { name: "车牌号前缀设置", menuCode: "060102", path: "/store/system/plateno" },
    ]
  }

  constructor () {
    // this.userPermissionList = storage.get("USER").permissionList || [];
    this.userPermissionList = [];
    this.actionPermissList = [];
    this.data = this.setPermissionData(this.permissionCode);
  }

  // 设置用户权限列表
  setPermission (userPermissionList) {
    this.userPermissionList = userPermissionList;
    this.data = this.setPermissionData(this.permissionCode);
    this.isInit = true;
  }

  // 递归获取所有权限列表
  // setAllPermission (list) {
  //   let newList = [];
  //   list.forEach(elm => {
  //     let children = elm.children;
  //     if (elm.children) delete elm.children;
  //     newList.push(elm);
  //     if (children && children.length) {
  //       newList = newList.concat(this.setAllPermission(children));
  //     }
  //   });
  //   return newList;
  // }

  /**
   * 获取未处理过的tabList
   * @param {string} name permissionTabs对应的key
   * @returns {array} 返回tab列表
   */
  getTabList (name) {
    return JSON.parse(JSON.stringify(this.permissionTabs[name]));
  }

  /**
   * 获取已根据权限处理过的tabList
   * @param {string} name permissionTabs对应的key
   * @returns {array} 返回tab列表
   */
  getPermissionTab (name) {
    let list = JSON.parse(JSON.stringify(this.permissionTabs[name]));
    let all = list.find(elm => elm.key === "all"); // 全部
    if (all) list.pop();
    let tabList = [];
    let hasAll = true; // 是否有全部
    list.forEach(elm => {
      if (this.hasPermission(elm.menuCode) || !elm.menuCode) {
        tabList.push(elm);
      } else {
        hasAll = false;
      }
    });
    if (hasAll && all) tabList.push(all); // 有全部的话，加进list
    return tabList;
  }

  /**
   * 获取tab字符串数组
   * @param {string} name permissionTabs对应的key
   * @returns {array} 返回tab列表
   */
  getStringTabs (name) {
    let list = JSON.parse(JSON.stringify(this.permissionTabs[name]));
    let tabList = [];
    list.forEach(elm => {
      if (this.hasPermission(elm.menuCode) || !elm.menuCode) {
        tabList.push(elm.name);
      }
    });
    return tabList;
  }

  /**
   * 判断是否有权限
   * @param {string} code 权限code
   */
  hasPermission (code) {
    return !!this.userPermissionList.find(elm => elm.menuCode === code);
  }

  /**
   * 初始化权限列表
   * @param {*} permissionCode
   */
  setPermissionData (permissionCode) {
    let data = {};
    for (let key in permissionCode) {
      let elm = permissionCode[key];
      if (elm instanceof Object) {
        data[key] = this.setPermissionData(elm);
      } else if (elm) {
        data[key] = this.hasPermission(elm);
      }
    }
    return data;
  }

  /**
   * 设置导航权限
   * @param {*} list 导航列表
   */
  setNavPermission (list) {
    let newList = [];
    let store = storage.get("STORE");
    // store.allowPlatformProjects = [1];
    list.forEach( route => {
      if (route.meta && route.meta.isPermiss) {
        route.showNav = this.hasPermission(route.meta.menuCode); // 根据权限判断是否显示导航
        if (route.meta.menuCode == "0604" && !(store.allowPlatformProjects && store.allowPlatformProjects.length)) {
          route.showNav = false;
        }
        if (route.children && route.children.length > 0) {
          route.children = this.setNavPermission(route.children);
        }
      } else {
        route.showNav = true; // 默认显示导航
      }
      newList.push(route);
    });
    return newList;
  }

  // 路由权限验证
  routeValidate (route) {
    // 暂时去掉
    // // 刷新页面的时候，路由验证执行在获取到权限列表之前，在获取到列表之前都可以访问，但是获取到之后， main页面重新执行验证
    // if (!this.userPermissionList.length && !this.isInit) {
    //   return true;
    // }
    // const matched = route.matched;
    // for (let i = 0, len = matched.length; i < len; i++) {
    //   const meta = matched[i].meta;
    //   // 需要权限验证的 且验证失败的 返回false
    //   if (meta && meta.isPermiss && !this.hasPermission(meta.menuCode)) {
    //     return false;
    //   }
    // }
    return true;
  }
}
