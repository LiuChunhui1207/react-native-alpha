'use strict';
import React from 'react';
import {
  View,
  Image,
  TouchableWithoutFeedback,
  Linking,
  TextInput,
  InteractionManager,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText, string2jsx} from 'sxc-rn';
import {Page, Button, Row, Popover} from 'components';
import SupplierList from '../supplier/supplierList';
import {str} from 'tools';
import {UtilsAction} from 'actions';
import {
  ICON_NOTICE,
  ICON_BLACK_PHONE,
} from 'config';
//商品详情页
import PurchaseOrderSKUDetail from './purchaseOrderSKUDetail';

let s = SStyle({
  border_bottom: {
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  width80: {
    width: 80,
    textAlign: 'right'
  },
  flex1: {
    flex: 1
  },
  row_sku: {
    paddingTop: 5,
    paddingBottom: 9,
    alignItems: 'center'
  },
  row_sku_title:{
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    height: 38,
    backgroundColor: '#F8F8F8'
  },
  row_sku_box: {
    backgroundColor: 'fff',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 16,
  },
  bottom_box: {
    paddingTop: 11,
    paddingBottom: 10
  },
  status_box: {
    height: 75,
    justifyContent: 'center',
    paddingLeft: 21
  },
  purchase_info: {
    paddingLeft: 20,
    paddingBottom: 20,
    backgroundColor: '#fff'
  },
  purchase_prop: {
    marginTop: 8
  },
  fee: {
    justifyContent: 'space-between', 
    marginTop: 6
  },
  record: {
    marginTop: 8
  },
  icon_phone: {
    width: 10,
    height: 14
  },
  icon_notice: {
    width: 14,
    height: 14
  },
  btn_box: {
    marginRight: 8, 
    borderColor: '#999',
    borderWidth: 'slimLine',
    borderRadius: 2,
    padding: 2
  }
});

/**
 * 采购单明细页面
 * @type {[type]}
 */
module.exports = class PurchaseOrderDetail extends SComponent{
  constructor(props){
    super(props);
    this._queryObj = {
      purchaseOrderId: props.route.id
    };
    this._submitObj = {};
    this.state ={
      pageLoading: true,
      purchaseSKUInfoVOs:[],
      deliveryCostList: [],
      recordVOs: []
    }

  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  _getData = () =>{
    commonRequest({
      apiKey: 'queryParentPurchaseOrderDetailKey', 
      objectName: 'purchaseOrderQueryDO',
      params: {
        parentPurchaseOrderId: this.props.route.data.id
      }
    }).then( (res) => {
      let data = res.data;
      console.log('dodoododo in    detail');
      console.log(data);
      this.changeState({
        pageLoading: false,
        ...data
      })
    }).catch( err => {})
  }

  /**
   * 显示modal框
   * @return {[type]} [description]
   */
  _showCommonSelect(type, keyName){
    let currentObj = {
      keyName: keyName,
      currentName: type,
      currentSelected: this.state[type + 'Selected'] || [],
      currentDataSource: this.state[type + 'Selector'] || []
    }
    console.log('do in _showCommonSelect');
    console.log(currentObj);
    this.changeState(currentObj, ()=>{
      this._commonSelect._toggle()
    })
  }

  /**
   *弹出层 选中项后的回调
   * @param  {[type]} data [description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  _commonSelectCallback(data, name){
    let oldState = this.state;
    //modal框选择的是重量单位
    if(name === 'weightUnit'){
      //按重量采买
      if(oldState.priceUnitSelected.purchaseByJinFlag){
        this.changeState({
          weight: 0,
          totalPrice: 0,
          amount: oldState.fee,
          weightUnitSelected: data[0]
        })
      }
      //按数量采买
      else{
        this.changeState({
          weight: 0,
          weightUnitSelected: data[0]
        })
      }
    }
    //modal框选择的是价格单位
    if(name === 'priceUnit'){
      this.changeState({
        price: 0,
        totalPrice: 0,
        amount: oldState.fee,
        priceUnitSelected: data[0]
      })
    }
    if(name === 'paymentDays'){
      this.changeState({
        paymentDaysSelected: data[0]
      })
    }
  }

  /**
   * 提交采购单信息
   * @return {[type]} [description]
   */
  _submit = () =>{
    let param = {
      skuName: this.state.skuName,         //商品名称
      skuId: this.state.skuId,             //商品id
      purchaseNum: this.state.purchaseNum, //采购数量
      productWeight: this.state.productWeight,   //每件商品重量
      priceDesc: this.state.price + this.state.priceUnitSelected.value,   //商品价格描述
      defaultPriceUnit: this.state.priceUnitSelected,     
      defaultPrice: this.state.price * 100,
      defaultPaymentDays: this.state.paymentDaysSelected,
      fee: this.state.fee,
      weight: this.state.weight,
      amount: this.state.amount
    }
    this.navigator().pop();
    // this.props.route.callback && this.props.route.callback(param, this.state.rowID)
  }

  /**
   * 输入内容变化后 计算总价等
   * @param  {[type]} text [description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  _onChangeText(text, name){
    let oldState = this.state,
      weight,   //重量
      totalPrice, //货品总价
      amount;     //总金额
    switch(name){
      //采购数量
      case 'purchaseNum':
        console.log('do in purchaseNum');
        console.log(this.state.weightUnitSelected)
        weight = text * this.state.productWeight / this.state.weightUnitSelected.rate;
        //按重量采买
        if(this.state.priceUnitSelected.purchaseByJinFlag){
          totalPrice = (weight * this.state.weightUnitSelected.rate * this.state.priceUnitSelected.rate * this.state.price).toFixed(2) * 1;
        }
        //按数量采买
        else{
          totalPrice = (text * this.state.price).toFixed(2) * 1;
        }
        amount = totalPrice + Number(this.state.fee);
        this.changeState({
          [name]: text,
          weight,
          totalPrice,
          amount,
        })
        break;
      //采购重量
      case 'weight':
        weight = text;
        if(this.state.priceUnitSelected.purchaseByJinFlag){
          totalPrice = (weight * this.state.weightUnitSelected.rate * this.state.priceUnitSelected.rate * this.state.price).toFixed(2) * 1;
        }
        else{
          totalPrice = (this.state.price * this.state.purchaseNum).toFixed(2) * 1;
        }
        amount = totalPrice + Number(this.state.fee);
        this.changeState({
          [name]: text,
          totalPrice,
          amount,
        })
        break;
      //货品单价
      case 'price':
        if(this.state.priceUnitSelected.purchaseByJinFlag){
          totalPrice = (this.state.weight * this.state.weightUnitSelected.rate * this.state.priceUnitSelected.rate * text).toFixed(2) * 1;
        }
        else{
          totalPrice = (text * this.state.purchaseNum).toFixed(2) * 1;
        }
        amount = totalPrice + Number(this.state.fee);
        this.changeState({
          [name]: text,
          totalPrice,
          amount,
        })
        break;
      //手续费
      case 'fee':
        amount = this.state.totalPrice + Number(text);
        this.changeState({
          [name]: text,
          amount,
        })
        break;
      default:
        break;
    }
  }

  /**
   * 渲染联系供应商和催促接单/发货/确认按钮
   * @return {[type]} [description]
   */
  _renderConnectSupplierAndNoticeBtn(){
    let btnArr = [];
    if(this.state.showConnectSupplierBtn){
      btnArr.push(
        (
          <Row key={0} style={s.btn_box}>
            <Image source={ICON_BLACK_PHONE} style={s.icon_phone} />
            <SText fontSize="caption" color="666">联系供应商</SText>
          </Row>
        )
      )
    }
    if(this.state.showNoticeAcceptOrderBtn){
      btnArr.push(
        (
          <Row 
            key={1} 
            onPress={()=>{
              this._notice('noticeAcceptOrderKey')
            }}
            style={s.btn_box}
          >
            <Image source={ICON_NOTICE} style={s.icon_notice} />
            <SText fontSize="caption" color="666">催促接单</SText>
          </Row>
        )
      )
    }
    if(this.state.showNoticeDeliveryBtn){
      btnArr.push(
        (
          <Row 
            key={3} 
            onPress={()=>{
              this._notice('noticeDeliveryKey')
            }}
            style={s.btn_box}
          >
            <Image source={ICON_NOTICE} style={s.icon_notice} />
            <SText fontSize="caption" color="666">催促发货</SText>
          </Row>
        )
      )
    }
    if(btnArr.length > 0){
      return (
        <Row style={{marginTop: 14}}>
          {btnArr}
        </Row>
      )
    }
    return null;
  }

  /**
   * 催促发货/接单 等
   * @return {[type]} [description]
   */
  _notice(apiKey){
    commonRequest({
      apiKey: apiKey, 
      objectName: 'operationDO',
      withLoading: true,
      params: {
        parentPurchaseOrderId: this.props.route.data.id
      }
    }).then( err => {})
  }

  /**
   * 关闭采购单
   * @return {[type]} [description]
   */
  _closePurchaseOrder = () =>{
    commonRequest({
      apiKey: 'closeParentPurchaseOrderKey', 
      objectName: 'operationDO',
      withLoading: true,
      params: {
        parentPurchaseOrderId: this.props.route.data.id
      }
    }).then( res => {
      if(res.data){
        this._popover._toggle();
        this._getData();
      }
    }).catch(err =>{})
  }

  /**
   * 渲染底部按钮
   * @return {[type]} [description]
   */
  _renderBottomBtn(){
    if(this.state.showNoticeCloseOrderBtn){
      return <Button 
        onPress={()=>{
          this._popover._toggle();
        }} 
        type='orangeFont' 
        size='large'>
          关闭订单
        </Button>
    }
    return null
  }

  /**
   * 渲染物流信息
   * @return {[type]} [description]
   */
  _renderDeliveryCostList(){
    if(this.state.deliveryCostList.length > 0){
      return this.state.deliveryCostList.map((item, index) => {
        return (
          <View key={index} style={s.purchase_info}>
            <Row style={s.purchase_prop}>
              <SText fontSize="mini" color="666">司机：</SText>
              <Row>
                <SText fontSize="mini" color="333">{item.driverName}</SText>
                <TouchableWithoutFeedback 
                  onPress={()=>{
                    Linking.openURL('tel://'+ item.driverPhone)
                  }}
                >
                  <SText fontSize="mini" color="blue">{item.driverPhone}</SText>
                </TouchableWithoutFeedback>
              </Row>
            </Row>
            <Row style={s.purchase_prop}>
              <SText fontSize="mini" color="666">车牌号：</SText>
              <SText fontSize="mini" color="333">{item.carId}</SText>
            </Row>
            <Row style={s.purchase_prop}>
              <SText fontSize="mini" color="666">运费：</SText>
              <SText fontSize="mini" color="333">{item.fee}</SText>
            </Row>
          </View>
        )
      })
    }
    return null;
  }

  /**
   * 渲染发货件数
   * @return {[type]} [description]
   */
  _renderDeliveryNum(){
    if(this.state.showDeliveryNum){
      return (
        <View style={[s.purchase_info, {paddingTop: 8}]}>
          <SText>{`发货：${this.state.deliveryNum}`}</SText>
          <SText>{`实收：${this.state.actSignNum}`}</SText>
          {
            this.state.showNoticeConfirmBtn ?
              <Row>
                <Row 
                  onPress={()=>{
                    this._notice('noticeConfirmKey')
                  }}
                  style={s.btn_box}
                >
                  <Image source={ICON_NOTICE} style={s.icon_notice} />
                  <SText fontSize="caption" color="666">催促确认</SText>
                </Row>
              </Row>
              : null
          }
        </View>
      )
    }
    return null
  }

  render(){
    let statusbdColor = {};
    if(this.state.bgColor){
      statusbdColor= {
        backgroundColor: this.state.bgColor.split('-')[0]
      }
    }
    return (
      <Page title='采购订单详情' pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        <ScrollView style={{marginBottom: 45}}>
          <View style={[s.status_box, statusbdColor]}>
            {string2jsx(this.state.statusDesc, 'font').middle}
            {string2jsx(this.state.timeDesc, 'font').middle}
          </View>
          {this._renderDeliveryNum()}
          {this._renderDeliveryCostList()}
          <View style={s.purchase_info}>
            <Row style={s.purchase_prop}>
              <SText fontSize="mini" color="666">采购类型：</SText>
              <SText fontSize="mini" color="333">{this.state.purchaseOrderType}</SText>
            </Row>
            <Row style={s.purchase_prop}>
              <SText fontSize="mini" color="666">供应商：</SText>
              <SText fontSize="mini" color="333">{this.state.supplierName}</SText>
            </Row>
            <Row style={s.purchase_prop}>
              <SText fontSize="mini" color="666">交货时间：</SText>
              <SText fontSize="mini" color="333">{this.state.deliveryTime}</SText>
            </Row>
            <Row style={s.purchase_prop}>
              <SText fontSize="mini" color="666">交货地点：</SText>
              <SText fontSize="mini" color="333">{this.state.deliveryAddr}</SText>
            </Row>
            <Row style={s.purchase_prop}>
              <SText fontSize="mini" color="666">接货人：</SText>
              <SText fontSize="mini" color="333">{this.state.storehouseManagerName}</SText>
              <TouchableWithoutFeedback 
                onPress={()=>{
                  Linking.openURL('tel://'+ this.state.storehouseManagerPhone)
                }}
              >
                <SText fontSize="mini" color="blue">{this.state.storehouseManagerPhone}</SText>
              </TouchableWithoutFeedback>
            </Row>
            {this._renderConnectSupplierAndNoticeBtn()}
          </View>
          <Row style={s.row_sku_title}>
            <SText style={s.flex1} fontSize="mini" color="666">商品名称</SText>
            <SText style={s.width80} fontSize="mini" color="666">采购数量</SText>
            <SText style={s.width80} fontSize="mini" color="666">货品单价</SText>
          </Row>
          <View style={s.row_sku_box}>
            {
              this.state.purchaseSKUInfoVOs.map((sku, index) =>{
                return (
                  <Row 
                    onPress={()=>{
                      this.navigator().push({
                        from: 'detail',
                        data: {
                          purchaseOrderId: sku.purchaseOrderId
                        },
                        component: PurchaseOrderSKUDetail,
                        callback: this._getData,
                        name: 'PurchaseOrderSKUDetail'
                      })
                    }}
                    style={[s.border_bottom, s.row_sku]} 
                    key={index}
                  >
                    <View style={s.flex1}>
                      <SText fontSize="mini" color="999">{sku.skuId}</SText>
                      <SText fontSize="mini" color="333">{sku.skuName}</SText>
                    </View>
                    <SText style={s.width80} fontSize="mini" color="666">{sku.purchaseNum}</SText>
                    <SText style={s.width80} fontSize="mini" color="666">{sku.priceDesc}</SText>
                  </Row>
                )
              })
            }
            <View style={s.bottom_box}>
              <Row style={s.fee}>
                <SText fontSize="mini" color="666">采购总数量：</SText>
                <SText fontSize="mini" color="666">{this.state.totalPurchaseNum}</SText>
              </Row>
              <Row style={s.fee}>
                <SText fontSize="mini" color="666">手续费：</SText>
                <SText fontSize="mini" color="666">{this.state.fee}</SText>
              </Row>
              <Row style={s.fee}>
                <SText fontSize="mini" color="666">采购总价：</SText>
                <SText fontSize="mini" color="blue">{this.state.totalFee}</SText>
              </Row>
            </View>
            {
              this.state.recordVOs.map((record, index) =>{
                return (
                  <Row key={index} style={s.record}>
                    <SText fontSize="mini" color="999">{`${record.recordDesc}${record.recordDate}`}</SText>
                  </Row>
                )
              })
            }
          </View>
        </ScrollView>
        {this._renderBottomBtn()}
        <Popover 
            ref={(view) => this._popover = view}
            leftBtn='取消'
            rightBtn='确认'
            leftEvt={()=>{
              this._popover._toggle();
            }}
            rightEvt={ ()=> {
              this._closePurchaseOrder();
            }}
            title={'提示'} >
            <View style={{paddingTop: 20, paddingBottom: 20, alignItems: 'center',justifyContent: 'center'}}>
                <SText fontSize='body' color='999'>
                    确认删除采购订单？
                </SText>
            </View>
        </Popover>
      </Page>
    )
  }
}
