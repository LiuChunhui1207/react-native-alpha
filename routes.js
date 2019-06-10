'use strict';

global['routeMap'] = {
    //我的信息
    Mine: {
        name: 'Mine',
        component: require('./mine')
    },
    //询价页面
    Inquiry: {
        name: 'Inquiry',
        component: require('./inquiry')
    },
    //库存管理
    Stock: {
        name: 'Stock',
        component: require('./stock')
    },
    //物流管理
    Delivery: {
        name: 'Delivery',
        component: require('./delivery')
    },
    //选择采购单
    ChoosePurchaseOrder: {
        name: 'ChoosePurchaseOrder',
        component: require('./delivery/choosePurchaseOrder')
    },
    //新今日订单报表
    TodayReport: {
        name: 'TodayReport',
        component: require('./report/todayReport')
    },
    //老今日订单报表
    TodayReport_old: {
        name: 'TodayReport_old',
        component: require('./report/todayReport_old')
    },
    //供应商管理
    SupplierList: {
        from: 'Home',
        name: 'SupplierList',
        component: require('./supplier/supplierList')
    },
    //采购管理
    PurchaseOrderList: {
        name: 'PurchaseOrderList',
        component: require('./purchase/purchaseOrderList')
    },
    //预售报表
    PresellOrderReport: {
        name: 'PresellOrderReport',
        component: require('./report/presellOrderReport')
    },
    //商品管理
    CommodityList: {
        name: 'CommodityList',
        component: require('./commodity/index')
    },
    //抽检管理
    CentralList:{
        name:'CentralList',
        component: require('./sampling/centralList')
    },
    //品类监控
    MonitorCategory:{
        name: 'MonitorCategory',
        component: require('./category/monitorCategory')
    },
    //我的品类
    ManceCat:{
        name: 'ManceCat',
        component: require('./mine/catList')
    },
    //巡场日志
    PatrolLog:{
        name: 'PatrolLog',
        component: require('./patrol/patrolLogList')

    },
    //预报销量
    ForecastSale:{
      name: 'ForecastSale',
      component: require('./forecast_sale')
    },
    //定价
    ItemFixPrice:{
      name: 'ItemFixPrice',
      component: require('./commodity/itemFixPrice')
    },
    //定价
    Bargainings:{
        name: 'Bargainings',
        component: require('./bargainings/bargainings')
    },
    //直发看板
    DirectSending:{
        name: 'DirectSending',
        component: require('./direct/direct_info_list_v2')
    },
    // 上游行情
    Market: {
        name: 'Market',
        component: require('./market')
    }
};
