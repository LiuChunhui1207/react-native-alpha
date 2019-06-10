'use strict';
import React from 'react';
import {
  View,
  Image,
  TextInput,
  ListView,
  RefreshControl,
  InteractionManager,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {str} from 'tools';
import {UtilsAction} from 'actions';

import {Page, Button, Row} from 'components';
import {
  ICON_NEXT,
  ICON_CHOSE_GREY,
  ICON_CHOSE_ACTIVE
} from 'config';
import AddSKUInfo from './addSKUInfo';

let s = SStyle({
  searchWrap: {
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 10,
    height: 45,
    flexDirection: 'row',
    backgroundColor: 'fff',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  searchInput: {
    flex: 1,
    fontSize: 16
  },
  border_bottom: {
    borderBottomWidth: 1,
    borderColor: 'f0'
  },
  row: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  icon_choose: {
    marginLeft: 11,
    marginRight: 16,
    width: 20,
    height: 20
  },
  flex1: {
    flex: 1
  },
  row_header: {
    alignItems: 'center',
    height: 72
  },
  marginT8: {
    marginTop: 8
  },
  purchaser: {
    height: 72,
    paddingTop: 15
  },
  icon_next: {
    width: 10,
    height: 17,
    marginLeft: 10,
    marginRight: 12
  },
  sku_box: {
    paddingLeft: 12,
    paddingRight: 12
  },
  sku_info: {
    height: 47,
    alignItems: 'center'
  }
});
//外部引用ChoosePurchaseOrder的state.purchaseOrders
let purchaseOrders = null;

/**
 * 创建物流单时 选择采购订单
 * @type {[type]}
 */
module.exports = class ChoosePurchaseOrder extends SComponent{
  constructor(props){
    super(props);
    let purchaseOrders = [];
    this._queryObj = {
      currentPage: 1
    }
    //从创建物流单-输入sku实发数量 页面跳转来 则有默认选中的采购单
    if(props.route.from === 'AddSKUInfo'){
      purchaseOrders = props.route.data.purchaseOrders
    }
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      refreshing: false,
      totalNums: 0,
      purchaseOrders,
    };
  }
  componentDidMount() {
    if(this.props.route.from !== 'AddSKUInfo'){
      InteractionManager.runAfterInteractions( () => {
        this._getData();
      })
    }
  }
  _getData(){
    this._queryObj.currentPage = 1;
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'queryDeliveryOrderCreateInfoKey', 
      objectName: 'deliveryOrderQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      data.purchaseOrders.result.map(item=>{
        item.selectedNum = 0;
      })
      //外部引用ChoosePurchaseOrder的state.purchaseOrders
      purchaseOrders = data.purchaseOrders.result;
      this.changeState({
        refreshing: false,
        totalNums: data.purchaseOrders.records,          //总数据条数
        currentFeeUnit: data.currentFeeUnit,             //默认运费单位
        currentDeliveryTime: data.currentDeliveryTime,   //默认发货时间
        currentExportTime: data.currentExportTime,       //默认预计到达时间
        drivers: data.drivers,                           //司机列表
        feeUnitsSelector: data.feeUnitsSelector,         //运费单位列表
        purchaseOrders: data.purchaseOrders.result       //可选择的采购订单列表
      });
    }).catch( err => {})
  }

  /**
   * 渲染list列
   * @return {[type]}           [description]
   */
  _renderRow = (rowData, sectionID, rowID) =>{
    return (
      <ListRow id={rowID} data={rowData} />
    )
  }

  /**
   * 加载更多数据
   * @return {[type]} [description]
   */
  _loadMore = () =>{
    this._queryObj.currentPage++;
    commonRequest({
      apiKey: 'queryDeliveryOrderCreateInfoKey', 
      objectName: 'deliveryOrderQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      data.purchaseOrders.result.map(item=>{
        item.selectedNum = 0;
      })
      purchaseOrders = this.state.purchaseOrders.concat(data.purchaseOrders.result);//data.purchaseOrders.result;
      this.changeState({
        totalNums: data.purchaseOrders.records,             //总数据条数
        purchaseOrders: purchaseOrders                      //可选择的采购订单列表
      });
    }).catch( err => {
      this._queryObj.currentPage--;
    })
  }
  /**
   * 底部确认按钮
   * 创建物流单
   * @return {[type]} [description]
   */
  _createLogisticsOrder = () =>{
    //从添加物流单进入
    if(this.props.route.from === 'AddSKUInfo'){
      this.navigator().pop();
      this.props.route.callback(purchaseOrders);
    }
    else{
      if(purchaseOrders.length === 0){
        __STORE.dispatch(UtilsAction.toast('请选择采购单', 1000));
      }
      else{
        this.navigator().push({
          data: {
            purchaseOrders,
            feeUnit:             this.state.currentFeeUnit,
            currentDeliveryTime: this.state.currentDeliveryTime,
            currentExportTime:   this.state.currentExportTime,  
            drivers:             this.state.drivers,      
            feeUnitsSelector:    this.state.feeUnitsSelector,         
          },
          callback: this.props.route.callback,
          component: AddSKUInfo,
          name: 'AddSKUInfo'
        })
      }
    }
  }
  render(){
    return (
      <Page
          pageName='创建物流单-选择采购订单'
          title='创建物流单' pageLoading={false} back={()=>this.navigator().pop()}>
        <View style={s.searchWrap}>
          <TextInput 
            underlineColorAndroid={'transparent'}
            placeholderTextColor="#ccc"
            placeholder="搜索"
            style={s.searchInput} />
        </View>
        <ListView
          style={s.flex1}
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
          onEndReached={this.state.totalNums > this.state.purchaseOrders.length ? this._loadMore : null}
          onEndReachedThreshold={2}
          initialListSize={3}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.purchaseOrders)}
          renderRow={this._renderRow} 
        />
        <Button type='green' size='large' onPress={this._createLogisticsOrder}>确认</Button>
      </Page>
    )
  }
}

class ListRow extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      id: props.id,
      data: props.data,
    }
  }

  /**
   * checkbox事件
   * type all表示点击的是全部按钮
   * key 定位sku
   * @param  {[type]} type [description]
   * @param  {[type]} key  [description]
   * @return {[type]}      [description]
   */
  _onPress = (type, key)=> {
    let data = this.state.data;
    // 全选/取消全选
    if(type === 'all'){
      //勾上全选
      if(data.selectedNum !== data.deliverySKUInfos.length){
        let currentStorehouse = null;
        purchaseOrders.map(item =>{
          if(item.selectedNum != 0 ){
            currentStorehouse = item.storehouseId;
          }
        })
        if(currentStorehouse === null || data.storehouseId === currentStorehouse){
          data.selectedNum = data.deliverySKUInfos.length;
          data.deliverySKUInfos = data.deliverySKUInfos.map(item=>{
            item.checked = true;
            return item;
          }) 
          this.setState({
            data
          })
        }
      }
      //取消全选
      else{
        data.selectedNum = 0;
        data.deliverySKUInfos = data.deliverySKUInfos.map(item=>{
          item.checked = false;
          return item;
        })
        this.setState({
          data
        })
      }
    }
    //单个SKU操作
    else{
      //取消选择
      if(data.deliverySKUInfos[key].checked){
        data.deliverySKUInfos[key].checked = false;
        data.selectedNum--;
        this.setState({
          data
        })
      }
      //选择单个SKU
      else{
        let currentStorehouse = null;
        purchaseOrders.map(item =>{
          if(item.selectedNum != 0 ){
            currentStorehouse = item.storehouseId;
          }
        })
        if(currentStorehouse === null || data.storehouseId === currentStorehouse){
          data.selectedNum++;
          data.deliverySKUInfos[key].checked = true;
          this.setState({
            data
          })
        }
      }
    }
  }

  render() {
    let data = this.state.data;
    return (
      <View style={s.row}>
        <Row style={[s.row_header, s.border_bottom]}>
          <TouchableOpacity
            onPress={()=>{
              this._onPress('all')
            }}
          >
            <Image style={s.icon_choose} source={data.selectedNum == data.deliverySKUInfos.length ? ICON_CHOSE_ACTIVE : ICON_CHOSE_GREY}/>
          </TouchableOpacity>
          <View style={s.flex1}>
            <SText fontSize="body" color="333">
              {data.supplierName}<SText fontSize="body" color="999">  供应</SText>
            </SText>
            <SText style={s.marginT8} fontSize="caption" color="333">
              {data.exportTime}<SText fontSize="caption" color="999">  送达</SText><SText fontSize="caption" color="333">  {data.storehouseName}</SText>
            </SText>
          </View>
          <Row style={s.purchaser}>
            <SText fontSize="caption" color="333">{data.purchaserName}</SText>
            <SText fontSize="caption" color="999">  采购</SText>
            <Image style={s.icon_next} source={ICON_NEXT}/>
          </Row>
        </Row>
        <View style={s.sku_box}>
          {
            data.deliverySKUInfos.map((item, key) =>{
              return (
                <Row key={key} style={[s.sku_info, s.border_bottom]}>
                  <TouchableOpacity
                    onPress={()=>{
                      this._onPress('noAll', key)
                    }}
                  >
                    <Image style={[s.icon_choose, {marginLeft: 0}]} source={item.checked ? ICON_CHOSE_ACTIVE : ICON_CHOSE_GREY}/>
                  </TouchableOpacity>
                  <View style={s.flex1}>
                    <SText fontSize="mini" color="333">{item.skuId}</SText>
                    <SText fontSize="caption" color="666">{item.skuName}</SText>
                  </View>
                  <SText fontSize="caption" color="333">{item.deliveryNum}件</SText>
                </Row>
              )
            })
          }
        </View>
      </View>
    )
  }
}
