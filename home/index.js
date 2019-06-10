'use strict';
import React from 'react';
import {
  View,
  Image,
  Navigator,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions
} from 'react-native';
import {connect} from 'react-redux';
import {SStyle, SComponent, SText, SRefreshScroll, string2jsx} from 'sxc-rn';
import {Page, Row, Col} from 'components';
import Swiper from 'react-native-swiper';
import {UtilsAction} from 'actions';
import {RANK, ICON_NEXT, HEADER_RIGHT_BTN} from 'config';
import CheckForUpdate from '../utils/checkForUpdate';
import PerformanceSkuSales from '../sales/performanceSkuSales';
import  ManceLoss from '../loss/manceLoss';
import  PaymentDay from '../payment/paymentDay';
import  ProfitRate from '../pofit/profitRate';
import  AddPurchaseOrder from '../purchase/addPurchaseOrder';
import  MonitorCategory from '../category/monitorCategory';
import ForecastSale from '../forecast_sale';

let {width, height} = Dimensions.get('window');

let s = SStyle({
  rightBtnWrap: {
    alignItems: 'center'
  },
  rightBtn: {
    width: 20,
    height: 20,
    marginBottom: 2
  },
  slide: {
    height: 120,
    backgroundColor: 'fff'
  },
  tips: {
    marginLeft: 15,
    marginTop: 8
  },
  title: {
    marginLeft: 15,
    marginTop: 8,
    marginBottom: 2
  },
  content: {
    flexWrap: 'wrap',
    marginTop: 19
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  item: {
    flexDirection: 'row',
    height: 45,
    alignItems: 'center',
    backgroundColor: 'fff',
    borderWidth: 'slimLine',
    borderColor: 'f0'
  },
  scheduleTitle: {
    height: 30,
    justifyContent: 'center',
    marginLeft: 15
  },
  iconNext: {
    width: 8,
    height: 12,
    marginRight: 15
  },
  btnStyle: {
    borderRightWidth: 'slimLine',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
    width: '@window.width/3',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: 'fff'
  },
  dot: {
      marginLeft: 2,
      borderRadius: 8,
      borderWidth: 'slimLine',
      width: 24,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'red',
      borderColor: 'red'
  },



});

// int TODO_STOCK = 1;//库存设置

// int TODO_TODAY_ORDER_REPORT = 2;//今日订单报表

// int TODO_LOGISTICS = 3;//物流管理

// int TODO_SPOT_CHECK = 4;//抽检管理

// int TODO_PURCHASE = 5;//采购管理

// int TODO_INQUIRY = 6;//同步商品的价格

// int SETTING_STOCK = 7;//设置库存

// int RESERVE = 9;//库存预定

// int YESTERDAY_RESERVE = 10;//明日库存预定

const pageJumpObj = {
  1: 'TodayReport', //今日订单报表
  2: 'TodayReport', //今日订单报表
  3: 'ChoosePurchaseOrder',    //创建物流单页面
  5: 'PurchaseOrderList', //采购管理
  6: 'Inquiry', //同步商品标准
  7: 'Stock',  //库存设置
  //11:'Category',  //品类监控
  12: 'PatrolLog',  //巡场日志
  13: 'ForecastSale', //预报销量
  14: 'DirectSending' //直发看板
}

const routes = [
  // {
  //   name: '今日订单报表',
  //   routeKey: 'TodayReport_old'
  // },
  {
    id: 2,
    name: '今日订单报表',
    routeKey: 'TodayReport'
  },{
    id: 7,
    name: '库存设置',
    routeKey: 'Stock'
  },{
    id: 6,
    name: '同步商品价格',
    routeKey: 'Inquiry'
  },{
    id: 5,
    name: '采购管理',
    routeKey: 'PurchaseOrderList'
  },{
    id: 3,
    name: '物流管理',
    routeKey: 'Delivery'
  },{
    id: 4,
    name: '抽检管理',
    routeKey: 'CentralList'
  },{
    name: '退赔管理',
    routeKey: false
  },{
    name: '毛利管理',
    routeKey: false
  },{
    name: '供应商管理',
    // routeKey: false
    routeKey: 'SupplierList'
  },{
    name: '预售报表',
    routeKey: 'PresellOrderReport'
  },{
    name: '商品管理',
    routeKey: 'CommodityList'
  },{
    name: '品类监控',
    routeKey: 'MonitorCategory'
  },{
    name: '我的品类',
    routeKey: 'ManceCat'
  },{
    name: '巡场日志',
    routeKey: 'PatrolLog'
  },{
    name: '预报销量',
    routeKey: 'ForecastSale'
  },
  {
    name: '议价列表',
    routeKey: 'Bargainings'
  },
  {
     name: '直发看板',
     routeKey: 'DirectSending'
  },
  {
    name: '上游行情',
    routeKey: 'Market'
  }
]

class Index extends SComponent{
  constructor(props){
    super(props);
    CheckForUpdate();
    this.state = {
      pageLoading: true,
      todayMatters: [],
      yesterday: {
        performanceItems: []
      },
      lastMonth: {
        performanceItems: []
      }
    }
    this._queryObj = {
      cityCode: props.userState.cityCode,
      userId: props.userState.userId
    }
    this._rightEvent = this._rightEvent.bind(this);
    this._getData    = this._getData.bind(this);
    this._getMyData  =this._getMyData.bind(this);
  }
  componentDidMount() {
    this._getData();
    this._getperformanceInfo(0);
    this._getperformanceInfo(1);
  }
  /**
   * 头部右侧按钮
   * @date   2016-10-10
   * @return {[type]}   [description]
   */
  _renderRightBtn(){
    return(
      <View style={s.rightBtnWrap}>
        <Image
          style={s.rightBtn}
          source={HEADER_RIGHT_BTN} />
        <SText fontSize='mini' color='fff'>我的</SText>
      </View>
    )
  }
  /**
   * [头部右侧按钮点击事件]
   * @date   2016-10-10
   * @return {[type]}   [description]
   */
  _rightEvent(){
    this.props.navigator.push(routeMap['Mine'])
  }


  _getMyData(){
      commonRequest({
          apiKey: 'queryMyCatListKey',
          objectName: 'performanceQueryDO',
          params: {}
      }).then( (res) => {

          let data = res.data;
          this.changeState({
              catListSize: data.catListSize,
              catList:     data.catList
          });
      }).catch( err => {})
  }

  _getRedDot=()=>{
    commonRequest({
      apiKey: 'queryReadThePatrolDiaryKey',
      objectName: 'patrolDiaryQueryDO',
      params: {}
    }).then( (res) => {

      let data = res.data
      let directRedDotNum = 0
      data.map((item)=>{
        if (item.tabId === 3){
          directRedDotNum=item.num
        }
      })
      this.changeState({
        directRedDotNum
      });
    }).catch( err => {})

  }

  /**
   * 获取首页数据
   * @date   2016-10-10
   * @return {[type]}   [description]
   */
  _getData(cb){
    this._getMyData();
    // this._getRedDot()
    commonRequest({
      apiKey: 'queryTodayMattersKey',
      objectName: 'userQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      cb && cb();
      this.setState({
        pageLoading: false,
        todayMatters: data.todayMatters,  //今日代办事项列表
        speciesFlag:  data.speciesFlag   //是否显示调度报表
      })
    }).catch( err => {
      console.log('eerrr', err)
      cb && cb();
        this.setState({
            pageLoading: false,
        })
    })
  }
  /**
   * banner数据接口
   * 0表示查昨日，1表示本月平均
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  _getperformanceInfo(type){
    let name = type == 0 ? 'yesterday' : 'lastMonth'
    commonRequest({
      apiKey: 'queryPerformanceInfoKey',
      objectName: 'performanceQueryDO',
      params: {timeType: type}
    }).then( (res) => {
      let data = res.data;
      this.setState({
        [name]: {
          performanceItems: data.performanceItems,
          title: data.title
        }
      })
    }).catch( err => {
      console.log('err:',err)
    })
  }

/**
 *  banner 数据跳转列表（销售额、账期、）
 *@date 17/3/28
 *@return
 */
  _salesFee(key,type){

    if(key == 0){
        this.navigator().push({
            component:PerformanceSkuSales,
            data:{
                timeType:'0'
            }
        })
    }
    if( key == 1){
        this.navigator().push({
            component:PaymentDay,
            name: 'PaymentDay',
            data:{
                timeType:'0'
            }
        })
    }
    if(key == 2){
        this.navigator().push({
            component:ManceLoss,
            name: 'ManceLoss',
            data:{
                timeType:'0'
            }
        })
    }
    if(key == 3){
        this.navigator().push({
            component:ProfitRate,
            name: 'ProfitRate',
            data:{
                timeType:'0'
            }
        })
    }
    if(key == 4){
        this.navigator().push({
            component:PerformanceSkuSales,
            name: 'PerformanceSkuSales',
            data:{
                timeType:'1'
            }
        })
    }
    if(key == 5){
        this.navigator().push({
            component:PaymentDay,
            name: 'PaymentDay',
            data:{
                timeType:'1'
            }
        })
    }
    if(key == 6){
        this.navigator().push({
            component:ManceLoss,
            name: 'ManceLoss',
            data:{
                timeType:'1'
            }
        })
    }
    if(key == 7){
        this.navigator().push({
            component:ProfitRate,
            name: 'ProfitRate',
            data:{
                timeType:'1'
            }
        })
    }
    // if(key == 11){
    //     this.navigator().push({
    //         component: MonitorCategory,
    //         name: 'MonitorCategory',
    //         data:{
    //             timeType:'1'
    //         }
    //     })
    // }
    if(key == 111){
      this.navigator().push({
        component: ForecastSale,
        name: 'ForecastSale'
      })
    }
  }


  /**
   * 点击底部按钮或者今日待办列表跳转
   * @param  {[type]} route [description]
   * @return {[type]}       [description]
   */
  _jump = (route, param = {})=> {
    if(route.routeKey){
      this.navigator().push({
        ...routeMap[route.routeKey],
        data: {
          ...param
        }
      })
    }
    else {
      __STORE.dispatch(UtilsAction.toast('功能开发中', 1000));
    }
  }
  /**
   * 今日待办
   * @date   2016-10-10
   * @return {[type]}   [description]
   */
  _renderTodaySchedule(){
    if(this.state.todayMatters.length > 0){
      return (
        <View>
          <View style={s.scheduleTitle}>
            <SText fontSize="caption" color="999">今日待办</SText>
          </View>
          {
            this.state.todayMatters.map( (item, index) => {
              let jumpRoute = {
                routeKey: pageJumpObj[item.pageJump]
              }
              return (
                <TouchableOpacity onPress={()=> this._jump(jumpRoute,{fromTodayMatters: true, pageJump: item.pageJump})} key={index} style={s.item}>
                  <SText fontSize="body" color="orange" style={{flex: 1, marginLeft: 15}}>
                    {item.num != -1 ? item.num : ''}
                    <SText fontSize="body" color="333"> {item.text}</SText>
                  </SText>
                  <Image source={ICON_NEXT} style={s.iconNext}/>
                </TouchableOpacity>
              )
            })
          }
        </View>
      )
    }
    return null;
  }
  /**
   * 常用操作
   * @date   2016-10-10
   * @return {[type]}   [description]
   */
  _renderBtns(){
    return (
      <View>
        <View style={s.scheduleTitle}>
          <SText fontSize="caption" color="999">常用操作</SText>
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          {
            routes.map( (item, key) => {
              if(item.routeKey){
                return (
                  <TouchableOpacity
                    key={key}
                    style={s.btnStyle}
                    onPress={()=>this._jump(item)}
                  >
                      <View style={{flexDirection: 'row'}}>
                      <SText fontSize="caption" color="666">{item.name}</SText>
                        {this._renderDot(item)}
                      </View>

                  </TouchableOpacity>
                )
              }
              return null
            })
          }
        </View>
      </View>
    )
  }
  _renderDot(item){
    if (item.routeKey == "ManceCat" && this.state.catListSize !=0)
      return (
        <View style={s.dot}>
          <SText fontSize='mini' color='white'>{this.state.catListSize}</SText>
        </View>
      )
    else if (item.routeKey == "DirectSending" && this.state.directRedDotNum > 0){
      return (
        <View style={s.dot}>
          <SText fontSize='mini' color='white'>{this.state.directRedDotNum+''}</SText>
        </View>
      )
    }else {
      return null
    }
  }
  render(){
    return (
      <Page
        title='采秘工作台'
        pageLoading={this.state.pageLoading}
        rightEvent={this._rightEvent}
        rightContent={this._renderRightBtn()}
      >
        <SRefreshScroll
          startRequest={this._getData}
          enableBottomRefresh={false}
        >
          <Swiper
            loop={false}
            height={130}
            paginationStyle={{bottom: 10}}
          >
            <View style={s.slide}>
              <SText style={s.title} fontSize="body" color="333">{this.state.yesterday.title}</SText>
              <View style={[s.content, s.row]}>
                {
                  this.state.yesterday.performanceItems.map((item, index) => {
                    let format = string2jsx(item.value, 'font');
                    return (
                      <View key={index} style={[s.row, {width: width/2, marginTop: 10, paddingLeft: 15}]}>
                            <TouchableOpacity fontSize="caption" color="999"   onPress={()=>this._salesFee(item.key,0)}    >
                              <SText fontSize="caption" color="999">
                                  {format.before}
                                  {format.middle}
                                  {format.after}
                              </SText>
                            </TouchableOpacity>
                      </View>
                    )
                  })
                }
              </View>
            </View>
            <View style={s.slide}>
              <SText style={s.title} fontSize="body" color="333">{this.state.lastMonth.title}</SText>
              <View style={[s.content, s.row]}>
                {
                  this.state.lastMonth.performanceItems.map((item, index) => {
                    let format = string2jsx(item.value, 'font');
                    return (
                      <View key={index} style={[s.row, {width: width/2, marginTop: 10, paddingLeft: 15}]}>
                        <TouchableOpacity fontSize="caption" color="999"   onPress={()=>this._salesFee(item.key,1)}>
                          <SText fontSize="caption" color="999">
                            {format.before}
                            {format.middle}
                            {format.after}
                          </SText>
                        </TouchableOpacity>
                      </View>
                    )
                  })
                }
              </View>
            </View>
          </Swiper>
          {this._renderTodaySchedule()}
          {this._renderBtns()}
        </SRefreshScroll>
      </Page>
    )
  }
}

let setState = (state) => {
  return {
    userState: state.userState
  }
};

module.exports = connect(setState)(Index);
