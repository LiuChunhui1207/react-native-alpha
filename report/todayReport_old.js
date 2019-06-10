'use strict';
import React from 'react';
import {
  View,
  Image,
  RefreshControl,
  Platform,
  UIManager,
  InteractionManager,
  LayoutAnimation,
  ListView,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Row} from 'components';
import EditItemInfo from './editItemInfo';
import StoreHouseList from './storeHouseList';
//设置单个商品库存页面
import SKUInfo from '../commodity/skuInfo';
//选择供应商页面-根据spu过滤
import SingleSpuSupplierList from '../supplier/singleSpuSupplierList';
//创建采购订单页面
import AddPurchaseOrder from '../purchase/addPurchaseOrder';

import {
  ICON_NEXT,
  ICON_LOCATION
} from 'config';

let s = SStyle({
  right_box: {
    alignItems: 'center'
  },
  icon_location: {
    marginBottom: 2,
    width: 12,
    height: 16
  },
  service_box: {
    height: 45,
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  icon_next: {
    width: 7,
    height: 12
  },
  head_box: {
    flexDirection: 'row',
    height: 45,
    alignItems: 'center'
  },
  head_item: {
    flex: 1,
    textAlign: 'center'
  },
  row_item: {
    backgroundColor: 'fff',
  },
  row_box: {
    borderBottomWidth: 'slimLine',
    borderColor: 'e5',
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10
  },
  row_title: {
    flex: 1,
    marginLeft: 15,
  },
  btn_box: {
    flexDirection: 'row',
    paddingBottom: 10,
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 15
  },
  btn_item: {
    flex: 1,
    backgroundColor: '#fff',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    marginRight: 3,
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 4
  },
  band_supplier: {
    height: 20,
    borderWidth: 1, 
    borderRadius: 4, 
    borderColor: '#FE7D00', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5, 
    paddingRight: 5, 
    marginRight: 15
  },
  spuName: {
    paddingTop: 10,
    paddingBottom: 6
  }
});

/**
 * 今日订单报表页面
 * @type {[type]}
 */
module.exports = class TodayReport extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      currentRowData: {},
      refreshing: false,
      cityVOs:    [],
      markets:    [],
      dataSource: []
    }
    //选择服务站内容
    this._showName = '选择服务站';
    if(props.route.data.fromTodayMatters){
      this._queryObj = {
        pageJump: props.route.data.pageJump,
        searchStorehouseIds: [],
        todayMatters:true
      }
    }
    else{
      this._queryObj = {
        searchStorehouseIds: [],
        todayMatters: false
      }
    }

    this._selectStorehouse = this._selectStorehouse.bind(this);
    this._selectStorehouseCallback = this._selectStorehouseCallback.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this._getData = this._getData.bind(this);
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  _renderRightBtn(){
    return(
      <TouchableOpacity style={s.right_box}>
        <Image source={ICON_LOCATION} style={s.icon_location}/>
        <SText fontSize='mini' color='fff'>{this.state.cityVOs[0] ? this.state.cityVOs[0].city : ''}</SText>
      </TouchableOpacity>
    )
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  _getData(){
    this.changeState({
      refreshing: true
    }, ()=>{
      commonRequest({
        apiKey: 'getSkuExpandInfoListKey', 
        objectName: 'spuQueryDO',
        params: this._queryObj
      }).then( (res) => {
        let data = res.data;
        this.changeState({  
          currentRowData: {},
          refreshing: false,
          cityVOs:    data.cityVOs,
          markets:    data.markets,
          dataSource: data.records
        });
      }).catch( err => {
        this.changeState({
          refreshing: false
        })
      })
    })
  }

  _runAnimate(rowData){
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if(this.state.currentRowData.spuId === rowData.spuId){
      //隐藏按钮组
      this.setState({
        currentRowData: {}
      })
    }
    else{
      //隐藏原按钮组 并且显示新的
      this.setState({
        currentRowData: rowData
      })
    }
  }

  /**   this.props.route.name /spuid/skuid
   * 编辑商品信息
   * @return {[type]} [description]
   */
  _btnHandler(type){
      let route = {}, currentRowData = this.state.currentRowData;
      //修改库存
      if(type == 'modify'){
        route = {
          component: SKUInfo,
          name: 'SKUInfo',
          data: {
            spuId: currentRowData.spuId,
            skuId: currentRowData.skuId
          }
        }
      } 
      //编辑信息
      else if(type == 'edit'){
        route = {
          component: EditItemInfo,
          name: 'EditItemInfo',
          spuId: currentRowData.spuId
        }
      }
      //去采购
      else if(type == 'purchase'){
        //有绑定供应商 直接跳至创建采购单页面
        if(currentRowData.bandSupplierStatus === 1){
          route = {
            component: AddPurchaseOrder,
            name: 'AddPurchaseOrder',
            data: {
              supplierId: currentRowData.supplierId,
              skuId: currentRowData.skuId
            }
          }
        }
        else{
          route = {
            component: SingleSpuSupplierList,
            name: 'SingleSpuSupplierList',
            data: currentRowData
          }
        }
      }
      this.navigator().push(route)
  }

  _renderBtns(rowId, style){
    if(this.state.currentRowData.spuId == rowId){
      return (
        <View style={{paddingBottom: 5}}>
          <View style={[s.btn_box, style]}>
            <TouchableOpacity 
              onPress={
                ()=>{
                  this._btnHandler('modify')
                }
              }
              style={s.btn_item}
            >
              <SText fontSize="body" color="blue">修改库存</SText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={
                ()=>{
                  this._btnHandler('edit')
                }
              }
              style={s.btn_item}
            >
              <SText fontSize="body" color="blue">编辑信息</SText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                ()=>{
                  this._btnHandler('purchase')
                }
              }
              style={s.btn_item}
            >
              <SText fontSize="body" color="blue">去采购</SText>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    return null;
  }

  /**
   * 选择服务站后的回调
   * @param  {[type]} ids [description]
   * @return {[type]}     [description]
   */
  _selectStorehouseCallback(ids, showName){
    this._queryObj.searchStorehouseIds = ids;
    this._showName = showName;
    this._getData();
  }

  /**
   * 前往选择服务站列表
   * @return {[type]} [description]
   */
  _selectStorehouse(){
    //当存在服务站列表时 才能跳转
    if(this.state.markets.length != 0){
      this.navigator().push({
        callback: this._selectStorehouseCallback,
        component: StoreHouseList,
        name: 'StoreHouseList',
        data: this.state.markets
      })
    }
  }

  /**
   * 渲染是否有绑定供应商
   * @return {[type]} [description]
   */
  _renderTips(status){
    //1:已绑定
    if(status === 1){
      return (
        <View style={s.band_supplier}>
          <SText style={{color: '#FE7D00'}} fontSize="mini" color="deepOrange">绑定供应商</SText>
        </View>
      )
    }
    //2:已绑定,临时解绑
    if(status === 2){
      return (
        <View style={[s.band_supplier, {opacity: 0.4}]}>
          <SText style={{color: '#FE7D00'}} fontSize="mini" color="deepOrange">绑定供应商</SText>
        </View>
        )
    }
    //0:未绑定
    return null
  }

  _renderRow(rowData, sectionID, rowID){
    //剩余应采大于0或者总订单等于预估时 该行高亮
    let style = {}, textColor = {};
    if(rowData.surplusPurchaseNum > 0 || rowData.requireNum == rowData.estimateStockNum){
      textColor = {
        color: '#FF0000'
      }
      style = {
        backgroundColor: 'rgba(255,0,0,0.1)',
      }
    }
    return (
      <View>
        <TouchableOpacity 
          activeOpacity={1}
          onPress={()=>{
            this._runAnimate(rowData);
          }}
          style={[s.row_item, style]}
        >
          <Row style={s.spuName}>
            <SText style={s.row_title} fontSize="body" color="333">{rowData.spuName}</SText>
            {this._renderTips(rowData.bandSupplierStatus)}
          </Row>
          <View style={s.row_box}>
            <SText style={[s.head_item, {flex: 1.5}, textColor]} fontSize="body" color="blue">{rowData.surplusPurchaseNum}</SText>
            <SText style={s.head_item} fontSize="body" color="666">{rowData.surplusStockNum}</SText>
            <SText style={s.head_item} fontSize="body" color="666">{rowData.purchaseNum}</SText>
            <SText style={s.head_item} fontSize="body" color="666">{rowData.requireNum}</SText>
            <SText style={s.head_item} fontSize="body" color="666">{rowData.estimateStockNum}</SText>
          </View>
        </TouchableOpacity>
        {this._renderBtns(rowData.spuId, style)}
      </View>
    )
  }

  render(){
    return (
      <Page title='今日订单报表' pageLoading={false} rightContent={this._renderRightBtn()} back={()=>this.navigator().pop()}>
        <TouchableOpacity 
          onPress={this._selectStorehouse}
          style={s.service_box}
        >
          <SText numberOfLines={1} fontSize="body" color="333">{this._showName}</SText>
          <Image source={ICON_NEXT} style={s.icon_next}/>
        </TouchableOpacity>
        <View style={s.head_box}>
          <SText style={[s.head_item, {flex: 1.5}]} fontSize="body" color="blue">剩余应采</SText>
          <SText style={s.head_item} fontSize="body" color="666">库存</SText>
          <SText style={s.head_item} fontSize="body" color="666">已采</SText>
          <SText style={s.head_item} fontSize="body" color="666">总订单</SText>
          <SText style={s.head_item} fontSize="body" color="666">预估</SText>
        </View>
        <ListView
          style={{flex: 1, backgroundColor: '#fff'}}
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
          initialListSize={10}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow} 
        />
      </Page>
    )
  }
}
