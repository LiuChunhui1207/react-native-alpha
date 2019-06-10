'use strict';
import React from 'react';
import {
  View,
  Image,
  InteractionManager,
  ScrollView,
  ListView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {str} from 'tools';
import {UtilsAction} from 'actions';
import {Page, Button, CommonSelect, Row} from 'components';

//供应商列表
import SupplierList from '../supplier/supplierList';
//采购订单详情
import PurchaseOrderDetail from './purchaseOrderDetail';

let s = SStyle({
  status_box: {
    height: 42,
    alignItems: 'center',
    backgroundColor: '#0884E7'
  },
  status_item: {
    width: 77,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: '#399CEB',
    marginLeft:3,
    marginRight: 2,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flex1: {
    flex: 1
  },
  border_bottom: {
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  row_item: {
    marginTop: 10,
  },
  row_supplier_info: {
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    height: 38,
    backgroundColor: 'fff'
  },
  row_sku_title:{
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    height: 38,
    backgroundColor: '#F8F8F8'
  },
  width80: {
    width: 80,
    textAlign: 'right'
  },
  row_sku_box: {
    backgroundColor: 'fff',
    paddingLeft: 20,
    paddingRight: 20
  },
  row_sku: {
    paddingTop: 5,
    paddingBottom: 9,
    alignItems: 'center'
  },
  bottom_box: {
    alignItems: 'flex-end',
    paddingTop: 11,
    paddingBottom: 10
  },
  purchase_type: {
    marginRight: 7,
    justifyContent: 'center',
    color: '#2296F3',
    paddingLeft: 2,
    paddingRight: 2,
    borderRadius: 2,
    borderWidth: 'slimLine',
    borderColor: '#2296F3'
  },
  purchase_out: {
    color: '#FC880E',
    borderColor: '#FC880E'
  },
  addPurchaseOrder: {
    position: 'absolute',
    bottom: 9,
    right: 19,
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    width: 45,
    borderRadius: 45,
    backgroundColor: '#2296F3'
  }
});

/**
 * 采购单列表
 * @type {[type]}
 */
module.exports = class PurchaseList extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let today = str.date(new Date()).format('y-m-d');
    this.state = {
      refreshing: true,
      pageLoading: true,
      parentPurchaseOrders: [],
      statusTabs: [],
      currentStatusTab: {}
    };
    this._queryObj = {
      currentPage: 1,
    }

    this._renderRow = this._renderRow.bind(this);
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  /**
   * 返回当天的开始时间和结束时间
   */
  _formatDate(date, type){
    if(type === 'start'){
      return date + ' 00:00:00'
    }
    return date + ' 23:59:59'
  }

  _getData = (date)=>{
    this._queryObj.currentPage = 1;
    if(date){
      this._queryObj.startTime = new Date(date.year, date.month, date.day, 0, 0, 0).getTime() ;
      this._queryObj.endTime = new Date(date.year, date.month, date.day, 23, 59, 59).getTime();
    }
    commonRequest({
      apiKey: 'queryParentPurchaseOrderListKey', 
      objectName: 'purchaseOrderQueryDO',
      withLoading: this.state.pageLoading ? false : true,
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      let currentStatusTab = data.firstTabs[0];
      for(let i = 0, len = data.firstTabs.length; i < len; i++){
        if(data.firstTabs[i].selectedFlag){
          currentStatusTab = data.firstTabs[i];
          break;
        }
      }
      this.changeState({
        pageLoading: false,
        refreshing: false,
        parentPurchaseOrders: data.parentPurchaseOrders && data.parentPurchaseOrders.result ? data.parentPurchaseOrders.result : [] ,
        statusTabs: data.firstTabs,
        totalNums: data.parentPurchaseOrders ? data.parentPurchaseOrders.records : [],
        currentStatusTab
      })
    }).catch( err => {
      console.log(err)
    })
  }
  /**
   * 加载更多数据
   * @return {[type]} [description]
   */
  _loadMore = () =>{
    this._queryObj.currentPage++;
    commonRequest({
        apiKey: 'queryParentPurchaseOrderListKey', 
        objectName: 'purchaseOrderQueryDO',
        params: this._queryObj
    }).then( (res) => {
        let data = res.data, oldOrder = this.state.parentPurchaseOrders;
        this.changeState({
            parentPurchaseOrders: oldOrder.concat(data.parentPurchaseOrders.result),
            totalNums: data.parentPurchaseOrders.records,
        });
    }).catch( err => {
        this._queryObj.currentPage--;
    })
  }

  /**
   * 跳转至详情页面
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  _goDetailPage(id){
    this.navigator().push({
      component: PurchaseOrderDetail,
      name: 'PurchaseOrderDetail',
      data:{
        id: id
      }
    })
  }

  _renderRow(rowData, sectionID, rowID){
    return (
      <TouchableOpacity 
        onPress={()=>{
          this._goDetailPage(rowData.parentPurchaseOrderId)
        }}
        style={s.row_item}
      >
        <Row style={s.row_supplier_info}>
          <SText style={rowData.purchaseOrderTypeDesc === '场内' ? s.purchase_type : [s.purchase_type, s.purchase_out]} fontSize="caption" color="blue">{rowData.purchaseOrderTypeDesc}</SText>
          <SText style={s.flex1} fontSize="caption" color="333">{rowData.supplierName}</SText>
          <SText fontSize="caption" color="greenFill">{rowData.parentPurchaseOrderStatusDesc}</SText>
        </Row>
        <Row style={s.row_sku_title}>
          <SText style={s.flex1} fontSize="mini" color="666">商品名称</SText>
          <SText style={s.width80} fontSize="mini" color="666">采购数量</SText>
          <SText style={s.width80} fontSize="mini" color="666">货品单价</SText>
        </Row>
        <View style={s.row_sku_box}>
          {
            rowData.purchaseSKUInfos.map((item, index) =>{
              return (
                <Row style={[s.border_bottom, s.row_sku]} key={index}>
                  <View style={s.flex1}>
                    <SText fontSize="mini" color="999">{item.skuId}</SText>
                    <SText fontSize="mini" color="333">{item.skuName}</SText>
                  </View>
                  <SText style={s.width80} fontSize="mini" color="666">{item.purchaseNum}</SText>
                  <SText style={s.width80} fontSize="mini" color="666">{item.priceDesc}</SText>
                </Row>
              )
            })
          }
          <View style={s.bottom_box}>
            <SText fontSize="mini" color="666">{`收货时间${rowData.timeInfoDesc}`}</SText>
            <SText fontSize="mini" color="666">{`采购总件数：${rowData.totalPurchaseNum} 采购总价：${rowData.totalFee}`}</SText>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  /**
   * 渲染预计请款日 或者实际请款金额
   * status 为 7 8 显示预计请款日
   * 6 显示已结算金额
   * @return {[type]} [description]
   */
  _renderMoreInfo(status, accountMsg){
    if(status == 6){
      return (
        <Row style={{justifyContent: 'space-between'}}>
          <SText fontSize="body" color="999"></SText>
          <SText fontSize="body" color="orange">
            实际结款 <SText fontSize="body" color="greenFont">{str.toYuan(accountMsg)}</SText> 元
          </SText>
        </Row>
      )
    }
    return null;
  }

  /**
   * 渲染顶部订单状态以及时间
   * @return {[type]} [description]
   */
  _renderStatusTabs(){
    return (
      <View>
        <View style={s.status_box}>
          <ScrollView 
            horizontal
            contentContainerStyle={{alignItems: 'flex-end'}}
            showsHorizontalScrollIndicator={false}
          >
            {
              this.state.statusTabs.map((status, index) =>{
                return (
                  <TouchableOpacity 
                    key={index} 
                    onPress={()=>{
                      this._queryObj.purchaseOrderStatus = status.index;
                      this._getData();
                      this.changeState({
                        currentStatusTab: status
                      })
                    }}
                    style={[s.status_item, this.state.currentStatusTab.tabName == status.tabName ? {backgroundColor: '#fff'} : {}]}
                  >
                    <SText fontSize="caption" color={this.state.currentStatusTab.tabName == status.tabName ? 'blue' : 'white'}>{status.tabName}</SText>
                  </TouchableOpacity>
                )
              })
            }
          </ScrollView>
        </View>
        {
          this.state.currentStatusTab.showDateSelectorFlag ? <DatePicker date={this.state.currentStatusTab.defultDate} search={this._getData} /> : null
        }
      </View>
    )
  }

  /**
   * 去采购
   * [addPurchaseOrder description]
   */
  _addPurchaseOrder = () =>{
    this.navigator().push({
      callback: this._getData,
      component: SupplierList,
      name: 'SupplierList'
    })
  }

  render(){
    return (
      <Page title='采购订单列表' pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        {this._renderStatusTabs()}
        <ListView
          refreshControl={
            <RefreshControl
              style={{backgroundColor:'transparent'}}
              refreshing={this.state.refreshing}
              onRefresh={this._getData.bind(this)}
              tintColor="#54bb40"
              title="加载中..."
              titleColor="#999"
              colors={['#2296f3']}
              progressBackgroundColor="#fff"
            />
          }
          onEndReached={this.state.totalNums > this.state.parentPurchaseOrders.length ? this._loadMore : null}
          onEndReachedThreshold={100}
          initialListSize={10}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.parentPurchaseOrders)}
          renderRow={this._renderRow} 
        />
        <TouchableOpacity 
          onPress={this._addPurchaseOrder}
          style={s.addPurchaseOrder}
        >
          <SText fontSize="mini" color="white">去采购</SText>
        </TouchableOpacity>
      </Page>
    )
  }
}

class DatePicker extends React.Component {
  constructor(props){
    super(props);
    let now = props.date ? new Date(props.date) : new Date(),
        year   = now.getFullYear(),
        month  = now.getMonth()+1,
        dayList = [],
        day    = now.getDate();
    this.state = {
      day,
      ...this.getMonths(year, month),
      dayList: this.getDayList(year, month),
      currentDate: {
        year,
        month,
        day,
        value: `${month}-${day}`
      }
    }
  }

  componentDidMount() {
    this._scrollView.scrollTo({x: (this.state.day - 1) * 74, y: 0, animated: true})
  }

  /**
   * 获取当前给定月份的上一个月和下一个月
   * @param  {[type]} year  [当前年份]
   * @param  {[type]} month [当前月份]
   * @return {[type]}       [description]
   */
  getMonths(year, month){
    let lastYear,
      lastMonth,
      nextYear,
      nextMonth;
    lastYear = month === 1 ? year - 1 : year;
    lastMonth = month === 1 ? 12 : month - 1;
    nextYear = month === 12 ? year + 1 : year;
    nextMonth = month === 12 ? 1 : month + 1;
    return {
      monthList: [lastMonth, month, nextMonth],
      yearList: [lastYear, year, nextYear],
    }
  }

  /**
   * 计算当月日期
   * @type {[type]}
   */
  getDayList(year, month){
    // 每月最大天数
    let maxDay = new Date(year, month, 0).getDate();
    let dayList = [];
    for(let i = 0; i < maxDay; i++){
      dayList.push({
        year: year,
        month: month - 1,
        day: i+1,
        value: `${month}-${i+1}`
      })
    }
    return dayList;
  }

  /**
   * 加载更多日期
   * @param  {[type]} key [last/next 向前和向后加载]
   * @return {[type]}     [description]
   */
  loadMore(key){
    let month,
      year, 
      dayList,
      oldDayList = this.state.dayList;
    if(key === 'last'){
      if(!this.state.loadLast){
        month = this.state.monthList[0];
        year  = this.state.yearList[0];
        this.setState({
          loadLast: true,
          dayList: this.getDayList(year, month).concat(oldDayList)
        })
      }
      else{
        __STORE.dispatch(UtilsAction.toast('不能加载更多日期了！', 1000));
      }
    }
    else{
      if(!this.state.loadNext){
        month = this.state.monthList[2];
        year  = this.state.yearList[2];
        this.setState({
          loadNext: true,
          dayList: oldDayList.concat(this.getDayList(year, month))
        })
      }
      else{
        __STORE.dispatch(UtilsAction.toast('不能加载更多日期了！', 1000));
      }
    }
  }

  render(){
    return (
      <View style={{ backgroundColor: '#FFFFFF', alignItems: 'center'}}>
        <ScrollView
          ref={v=> this._scrollView = v}
          horizontal
          contentContainerStyle={{alignItems: 'center'}}
          showsHorizontalScrollIndicator={false}
        >
          <TouchableOpacity 
            onPress={()=>{
              this.loadMore('last')
            }}
            style={[{height: 38, width: 74, justifyContent: 'center', alignItems: 'center'}]}
          >
            <SText fontSize="body" color={'blue'}>更多</SText>
          </TouchableOpacity>
          {
            this.state.dayList.map((item, index) =>{
              return (
                <TouchableOpacity 
                  key={index} 
                  onPress={()=>{
                    this.props.search && this.props.search(item);
                    this.setState({
                      currentDate: item
                    })
                  }}
                  style={[this.state.currentDate.value == item.value ? {borderBottomWidth: 3, borderColor: '#2296F3'} : {}, {height: 38, width: 74, justifyContent: 'center', alignItems: 'center'}]}
                >
                  <SText fontSize="body" color={this.state.currentDate.value == item.value ? 'blue' : '333'}>{item.value}</SText>
                </TouchableOpacity>
              )
            })
          }
          <TouchableOpacity 
            onPress={()=>{
              this.loadMore('next')
            }}
            style={[{height: 38, width: 74, justifyContent: 'center', alignItems: 'center'}]}
          >
            <SText fontSize="body" color={'blue'}>更多</SText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }
}
