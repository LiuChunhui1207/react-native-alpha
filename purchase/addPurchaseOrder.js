'use strict';
import React from 'react';
import {
  View,
  Image,
  TextInput,
  PanResponder,
  StyleSheet,
  Text,
  ListView,
  LayoutAnimation,
  TouchableHighlight,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {UtilsAction} from 'actions';
import {Page, Button, CommonSelect, Row, SXCDateTimePicker} from 'components';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import {str} from 'tools';
import {
  ARROW_DOWN_S,
  ICON_ADD
} from 'config';

import PurchaseOrderInfo from './purchaseOrderInfo';
import SupplierList from '../supplier/supplierList'; 
//供应商供应商品列表
import SupplySKUList from '../supplier/supplySKUList';
//商品详情页
import PurchaseOrderSKUDetail from './purchaseOrderSKUDetail';
//更换供应商页面
import SwitchSupplier from './switchSupplier';

let s = SStyle({
  content:{
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: 'fff',
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 45,
    justifyContent: 'space-between'
  },
  border_bottom: {
    borderBottomWidth: 'slimLine',
    borderColor: 'e5'
  },
  type_wrap: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#2296F3'
  },
  type_btn: {
    height: 30,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    alignItems: 'center'
  },
  add_spu_btn: {
    flex: 1, 
    alignItems: 'flex-end'
  },
  list_header: {
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    flexDirection: 'row',
    height: 38,
  },
  spu_item: {
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 9,
    // height: 45,
    backgroundColor: 'fff',
    width: '@window.width'
  },
  width50: {
    textAlign: 'right',
    width: 50
  },
  width70: {
    textAlign: 'right',
    width: 70
  },
  flex1: {
    flex: 1
  },
  del_btn: {
    width: 50,
    height: 45,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0
  },
  storehouse: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14
  },
  submit_btn: {
    width: 110,
    height: 50,
    backgroundColor: '#2296F3'
  },
  purchase_info: {
    flex: 1,
    backgroundColor: 'e5',
    justifyContent: 'center',
    paddingLeft: 15
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    backgroundColor: 'red',
    right: 0
  },
});

/**
 * 创建采购单
 * @type {[type]}
 */
module.exports = class AddPurchaseOrder extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this._queryObj = {
      ...props.route.data
    }

    this.state = {
      pageLoading: true,
      totalNum: 0,
      totalAmount: 0,
      exportDeliveryTime: Date.now(),
      storehouseSelected: {},
      purchaseOrderTypeList: [],
      purchaseSKUInfos: [],
      currentDataSource: [],
      currentSelected: [],
      supplierId:  this.props.route.data.supplierId
    }

    this._commonSelectCallback = this._commonSelectCallback.bind(this);
  }

  componentDidMount() {
    this._getData()
    //添加业务参数的方法必须写在render之后，不然 buryVO为null
    if (_Bury){
      let buryVO= this.getRef('page')('_getBuryVO')();
      if(buryVO==null){
        return
      }
      buryVO.feature=JSON.stringify({
        directPlanId:this._queryObj['directPlanId'] ? this._queryObj['directPlanId'] : undefined,
      })
    }
  }

  _switchSupplierCallback = (supplier)=>{
    this._queryObj['supplierId'] = supplier.supplierId;
      this.changeState({
          supplierId: supplier.supplierId
      });
    this._getData();
  }

  _getData = () =>{
    commonRequest({
      apiKey: 'queryParentPurchaseOrderCreateInfoKey', 
      objectName: 'purchaseOrderQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      let purchaseOrderType, exportDeliveryTime, showExportDeliveryTime;
      data.purchaseOrderTypeList.map(item => {
        if(item.selectedFlag){
          purchaseOrderType = item.id;
          exportDeliveryTime = item.exportDeliveryTime;
          showExportDeliveryTime = item.showExportDeliveryTime
        }
      })
      let  totalNum=0,totalAmount=0
      if (data.purchaseSKUInfos){
        data.purchaseSKUInfos.map(item => {
          if(item.purchaseNum != null){
            totalNum += Number(item.purchaseNum)
            item.amount= Number(item.purchaseNum) * Number(item.defaultPrice)/100.00
            totalAmount +=item.amount
          }
        })
      }
      data.notRelatedDirectSkuMessages ? __STORE.dispatch(UtilsAction.toast(data.notRelatedDirectSkuMessages, 1500)) : null
      this.changeState({
        pageLoading: false,
        purchaseOrderType:     purchaseOrderType,          //采购类型
        purchaseOrderTypeList: data.purchaseOrderTypeList, //采购类型
        purchaseSKUInfos:      data.purchaseSKUInfos ? data.purchaseSKUInfos : [],      //采购商品列表
        supplierName:          data.supplierName,          //供应商名称
        storehouseSelected:    data.defaultStorehouse,     //默认目的地
        storehouseList:        data.storehouseSelector,    //目的地列表
        paymentDaysSelector:   data.paymentDaysSelector,   //账期列表
        priceUnitSelector:     data.priceUnitSelector,     //价格单位（采购方式)列表
        weightUnitSelector:    data.weightUnitSelector,    //重量单位列表
        exportDeliveryTime,                                //默认交货时间
        showExportDeliveryTime,
        totalNum,
        totalAmount
      })
    }).catch( err => {
      console.log(err)
    })
  }

  /**
   * 显示modal框
   * @return {[type]} [description]
   */
  _showCommonSelect(name, keyName){
    let currentObj = {
      keyName: keyName,
      currentName: name,
      currentSelected: this.state[name + 'Selected'] || [],
      currentDataSource: this.state[name + 'List'] || []
    }
    this.changeState(currentObj, ()=>{
      this._commonSelect._toggle()
    })
  }

  /**
   * modal框回调方法
   * @return {[type]} [description]
   */
  _commonSelectCallback(data, name){
    if(data[0].id !== this.state.storehouseSelected.id){
      this.changeState({
        purchaseSKUInfos: [],
        [name + 'Selected']: data[0]
      })
    }
  }

  /**
   * 删除SKU
   * @return {[type]} [description]
   */
  _deleteSKU = (rowID) =>{
    let purchaseSKUInfos = this.state.purchaseSKUInfos,
      totalNum = 0,
      totalAmount = 0;
    purchaseSKUInfos.splice(rowID, 1);
    //计算总件数和总金额
    purchaseSKUInfos.map(item => {
      if(item.purchaseNum != null){
        totalNum += Number(item.purchaseNum);
        totalAmount += Number(item.amount);
      }
    })
    this.changeState({
      totalNum,
      totalAmount,
      purchaseSKUInfos,
    })
  }

  /**
   * 渲染交货时间
   * 基地采购才有 交货时间
   * @return {[type]} [description]
   */
  _renderDeliveryTime(){
    if(this.state.showExportDeliveryTime){
      return (
        <Row style={[s.item, s.border_bottom]}>
          <SText fontSize="caption" color="333">交货时间</SText>
          <SXCDateTimePicker ref={view => this._dateTimePicker = view} />
          <TouchableOpacity
            style={[s.flex1,{alignItems: 'flex-end'}]}
            onPress={()=>{
              this._dateTimePicker._toggle(this._timePickerCallback);
            }}
          >
            <SText fontSize="caption" color="blue">{str.date(this.state.exportDeliveryTime).format('y-m-d h:i')}</SText>
          </TouchableOpacity>
        </Row>
      )
    }
    return null;
  }

  /**
   * 选择时间后的回调
   * @return {[type]} [description]
   */
  _timePickerCallback = (time)=>{
    this.changeState({
      exportDeliveryTime: time
    })
  }

  /**
   * 跳至供应商供应的商品列表
   * 选择商品后的回调方法
   * @return {[type]} [description]
   */
  _selectSKUCallback = (data) =>{
    console.log('_selectSKUCallback',data)
    this.changeState({
      purchaseSKUInfos: data
    })
  }

  /**
   * 点击商品后 跳转至详情页面
   * @return {[type]} [description]
   */
  _onRowPress = (rowData, rowID) =>{
    let state = this.state;
    this.navigator().push({
      data: {
        ...rowData,
        rowID,
        price: rowData.defaultPrice / 100,
        fee: rowData.fee ? rowData.fee / 100 : 0,
        paymentDaysSelector: state.paymentDaysSelector,
        priceUnitSelector: state.priceUnitSelector,
        weightUnitSelector: state.weightUnitSelector 
      },
      callback: this._changeSKUInfos,
      component: PurchaseOrderSKUDetail,
      name: 'PurchaseOrderSKUDetail'
    })
  }

  /**
   * 修改商品信息-回调方法
   * @return {[type]} [description]
   */
  _changeSKUInfos = (data, rowID)=>{
    console.log('_changeSKUInfos',data,rowID)
    console.log('_changeSKUInfos',this.state.purchaseSKUInfos)
    let purchaseSKUInfos = this.state.purchaseSKUInfos,
      totalNum = 0,
      totalAmount = 0;
    Object.assign(purchaseSKUInfos[rowID], data);
    //计算总件数和总金额
    purchaseSKUInfos.map(item => {
      if(item.purchaseNum != null){
        totalNum += Number(item.purchaseNum);
        totalAmount += Number(item.amount);
      }
    })
    this.changeState({
      totalNum,
      totalAmount,
      purchaseSKUInfos
    })
  }

  /**
   * 渲染采购类型
   * @return {[type]} [description]
   */
  _renderPurchaseOrderType(){
    return (
        <Row style={s.type_wrap}>
          {
            this.state.purchaseOrderTypeList.map(item => {
              return (
                <TouchableOpacity 
                  key={item.id}
                  activeOpacity={1}
                  onPress={()=>{
                    if(item.validateFlag){
                      this.changeState({
                        showExportDeliveryTime: item.showExportDeliveryTime,
                        exportDeliveryTime: item.exportDeliveryTime,
                        purchaseOrderType:  item.id
                      })
                    }
                  }}
                  style={[s.type_btn, item.validateFlag ? this.state.purchaseOrderType === item.id ? {backgroundColor: '#2296F3'} : {} : {backgroundColor: '#FFF'}]}
                >
                  <SText fontSize="caption" color={item.validateFlag ? this.state.purchaseOrderType === item.id ? "white" : "blue" : "ccc"}>{item.value}</SText>
                </TouchableOpacity>
              )
            })
          }
        </Row>
    )
  }

  /**
   * 提交数据
   * @return {[type]} [description]
   */
  _submit = () =>{
    let purchaseSKUs = [], 
      errMsg = false, 
      tmpSKU,
      len = this.state.purchaseSKUInfos.length;
    for(let i = 0; i < len; i++){
      tmpSKU = this.state.purchaseSKUInfos[i];
      //数量必填且不能为0
      if(tmpSKU.purchaseNum && Number(tmpSKU.purchaseNum) != 0){
        purchaseSKUs.push({
          weightUnit:  tmpSKU.defaultWeightUnit ? tmpSKU.defaultWeightUnit.id:undefined,
          fee:         tmpSKU.fee,
          paymentdays: tmpSKU.defaultPaymentDays.id,
          price:       tmpSKU.defaultPrice,
          priceUnit:   tmpSKU.defaultPriceUnit.id,
          purchaseNum: tmpSKU.purchaseNum,
          skuId:       tmpSKU.skuId,
          weight:      tmpSKU.weight
        })
      }
      else {
        errMsg = `${tmpSKU.skuName}录入信息不完整！`;
      }
      if(errMsg){
        return __STORE.dispatch(UtilsAction.toast(errMsg, 1500));
      }
    }

    let param = {
      purchaseOrderType:  this.state.purchaseOrderType,     //采购类型
      storehouseId:       this.state.storehouseSelected.id, //目的地
      supplierId:         this.state.supplierId, //供应商
      purchaseSKUs:       purchaseSKUs
    };
    if(this.state.showExportDeliveryTime){
      param['exportDeliveryTime'] = this.state.exportDeliveryTime; //基地采购有交货时间
    }
    commonRequest({
      apiKey: 'createParentPurchaseOrderKey',
      withLoading: true,
      objectName: 'purchaseOrderCreateDO',
      params: param
    }).then( (res) => {
      this._uploadActionBury()
      let data = res.data;
      //判断是跳回今日订单报表还是采购单列表
      let route = this.navigator().getRoute('name', 'TodayReport');
      if(!route){
        route = this.navigator().getRoute('name', 'TodayReport_old');
      }
      if(!route){
        route = this.navigator().getRoute('name', 'PurchaseOrderList');
      }
      if(!route){
        route = this.navigator().getRoute('name', 'DirectSending');
      }
      if(!route){
        route = this.navigator().getRoute('name', 'DirectPlanInfoDetails');
      }

      console.log('dododod in submit:', route)
      this.navigator().popToRoute(route);
      this.props.route.callback && this.props.route.callback();


    }).catch( err => {
      console.log(err)
    })
  }
  /**
   * @Description: 直发进入创建采购单 上传动作埋点
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/9/7 12:07
   */
  _uploadActionBury=()=>{
    let buryVO= {}
    if(this._queryObj['directPlanId'] && _Bury){
      buryVO = {
        viewShowName:'action-直发创建采购订单',
        entryTime:new Date().getTime()
      }
      buryVO.feature=JSON.stringify({
        directPlanId:this._queryObj['directPlanId'] ? this._queryObj['directPlanId'] : undefined
      })
      _Bury.stop(buryVO)
    }
  }
  /**
   * 更换供应商
   * 0-未绑定
   * 1-绑定
   * 2-临时解绑
   * 当前商品列表只有一个商品且当前商品处于绑定状态时 可以更换供应商
   * @return {[type]} [description]
   */
  _switchSupplier = ()=>{
    if(this.state.purchaseSKUInfos && this.state.purchaseSKUInfos.length === 1 && this.state.purchaseSKUInfos[0].bandSupplierStatus === 1){
      this.navigator().push({
        component: SwitchSupplier,
        name: 'SwitchSupplier',
        data: {
          supplierId: this.props.route.data.supplierId,
          supplierName: this.state.supplierName,
          skuName: this.state.purchaseSKUInfos[0].skuName,
          spuId: this.state.purchaseSKUInfos[0].spuId,
          skuId: this.state.purchaseSKUInfos[0].skuId
        },
        switchSupplierCallback: this._switchSupplierCallback,
        callback: this._getData
      })
    }
  }

  /**
   * 绑定供应商标示
   * @return {[type]} [description]
   */
  _renderBandTips(rowData){
    if(rowData.bandSupplierStatus === 1){
      return <SText fontSize="mini" color="orange">  {rowData.bandSupplierTip}</SText>
    }
    else if(rowData.bandSupplierStatus === 2){
      return <SText style={{color: '#FFD3A6'}} fontSize="mini" color="orange">  {rowData.bandSupplierTip}</SText>
    }
    else{
      return null
    }
  }

  render(){
    return (
      <Page
        ref="page"
        title='创建采购订单' pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        <View style={s.content}>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="caption" color="333">采购类型</SText>
            {this._renderPurchaseOrderType()}
          </Row>
          <Row 
            onPress={this._switchSupplier}
            style={[s.item, s.border_bottom]}
          >
            <SText fontSize="caption" color="333">供应商</SText>
            {
              this.state.purchaseSKUInfos.length === 1 && this.state.purchaseSKUInfos[0].bandSupplierStatus === 1 ?
                <SText fontSize="mini" color="orange">可换供应商</SText> : null
            }
            <SText fontSize="caption" color="333">{this.state.supplierName}</SText>
          </Row>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="caption" color="333">目的地</SText>
            <TouchableOpacity style={s.flex1} onPress={()=>{this._showCommonSelect('storehouse', 'value')}}>
              <View pointerEvents={'none'} style={s.flex1}>
                <TextInput
                  underlineColorAndroid={'transparent'}
                  placeholder="请选择"
                  placeholderTextColor="#999"
                  value={this.state.storehouseSelected.value}
                  style={s.storehouse}
                />
              </View>
            </TouchableOpacity>
          </Row>
          {this._renderDeliveryTime()}
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="caption" color="333">商品列表</SText>
            <TouchableOpacity 
              onPress={()=>{
                this.navigator().push({
                  selected: this.state.purchaseSKUInfos,
                  data:{
                    storehouseId: this.state.storehouseSelected.id,  //中心仓id(目的地)
                    supplierId: this.props.route.data.supplierId    //供应商id
                  },
                  component: SupplySKUList,
                  name: 'SupplySKUList',
                  callback: this._selectSKUCallback
                })
              }}
              style={s.add_spu_btn}>
              <SText fontSize="caption" color="blue">添加商品</SText>
            </TouchableOpacity>
          </Row>
        </View>
        <View style={s.list_header}>
          <SText style={s.flex1} fontSize="mini" color="333">商品名称</SText>
          <SText style={s.width50} fontSize="mini" color="333">采购数量</SText>
          <SText style={s.width70} fontSize="mini" color="333">采购单价</SText>
        </View>
        <SwipeListView
          style={s.flex1}
          enableEmptySections
          dataSource={this._ds.cloneWithRows(this.state.purchaseSKUInfos)}
          renderRow={ (rowData, secId, rowId, rowMap) => (
            <SwipeRow
              key={rowData.skuId}
              disableRightSwipe
              swipeToOpenPercent={30}
              rightOpenValue={-75}
            >
              <View style={s.rowBack}>
                <TouchableOpacity 
                  style={s.backRightBtn} 
                  onPress={ _ => this._deleteSKU(rowId)}>
                  <SText fontSize="caption" color="white">删除</SText>
                </TouchableOpacity>
              </View>
              <TouchableHighlight
                onPress={ _ => this._onRowPress(rowData, rowId)}
                style={s.border_bottom}
                underlayColor={'#AAA'}
              >
                <View style={[s.spu_item, {flexDirection: 'row'}]} >
                  <View style={s.flex1}>
                    <SText fontSize="mini" color="999">
                      {rowData.skuId}
                      {this._renderBandTips(rowData)}
                    </SText>
                    <SText fontSize="caption" color="333">{rowData.skuName}</SText>
                  </View>
                  <SText style={s.width50} fontSize="caption" color="333">{rowData.purchaseNum === null ? '-' : rowData.purchaseNum}</SText>
                  <SText style={s.width70} fontSize="caption" color="333">{rowData.priceDesc}</SText>
                </View>
              </TouchableHighlight>
            </SwipeRow>
            )}
          />
        <Row style={{height: 50}}>
          <View style={s.purchase_info}>
            <SText fontSize="caption" color="666">
              采购总件数：
              <SText fontSize="caption" color="blue">{this.state.totalNum}</SText>
            </SText>
            <SText fontSize="caption" color="666">
              采购总价：
              <SText fontSize="caption" color="blue">￥{this.state.totalAmount}</SText>
            </SText>
          </View>
          <Button onPress={this._submit} style={s.submit_btn} type="green" size="large">
            提交订单
          </Button>
        </Row>
        <CommonSelect 
          keyName={this.state.keyName}
          ref={ view => this._commonSelect = view}
          selectCallback={this._commonSelectCallback}
          dataSource={this.state.currentDataSource}
          name={this.state.currentName}
          selected={this.state.currentSelected}
          multiple={false}
        />
      </Page>
    )
  }
}
