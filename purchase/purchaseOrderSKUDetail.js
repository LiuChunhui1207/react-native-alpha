'use strict';
import React from 'react';
import {
  View,
  Image,
  InteractionManager,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, CommonSelect, Row, Upload, Popover, SInput} from 'components';
import SupplierList from '../supplier/supplierList';
import {str} from 'tools';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {UtilsAction} from 'actions';
import {
  ARROW_DOWN_S,
  UPLOAD_PIC5,
  ICON_NEXT,
  UPLOAD_PIC6,
  ICON_ADD
} from 'config';

let s = SStyle({
  content: {
    // flex: 1, marginBottom: 45,
    height: '@window.height - 45 - 65'
  },
  item: {
    alignItems: 'center',
    height: 45,
    justifyContent: 'space-between',
    borderBottomWidth: 'slimLine',
    borderColor: 'e5'
  },
  sku_info: {
    height: 94,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  skuId: {
    fontSize: 28
  },
  props_wrap: {
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20
  },
  flex1: {
    flex: 1
  },
  input_styl: {
    width: 83,
    textAlign: 'right',
    fontSize: 14
  },
  input_with_select: {
    marginRight: 2,
    color: '#333',
    height: 44,
    width: 70,
    textAlign: 'right',
    fontSize: 14
  },
  btn_styl: {
    flex:1 ,
    height: 45, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  btn_confirm: {
    backgroundColor: '#54bb40'
  },
  select_box: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  icon_next: {
    width: 10, 
    marginTop: -1,
    height: 16
  }
});

/**
 * 采购单商品明细页面
 * @type {[type]}
 */
module.exports = class PurchaseOrderDetail extends SComponent{
  constructor(props){
    super(props);
    this._queryObj = {
      purchaseOrderId: props.route.data.purchaseOrderId
    };
    this._submitObj = {};
    let routeData = props.route.data;
    this.state ={
      pageLoading: props.route.from !== 'detail' ? false : true,
      currentSelected: [],
      paymentDaysSelected: props.route.from !== 'detail' ? routeData.defaultPaymentDays : {},   //默认账期
      priceUnitSelected: props.route.from !== 'detail' ? routeData.defaultPriceUnit : {},       //默认价格单位
      weightUnitSelected: props.route.from !== 'detail' ? routeData.weightUnitSelector[0] : {}, //默认重量单位
      purchaseNum: 0,
      weight: 0,
      price: 0,
      totalPrice: 0,
      fee: 0,
      amount: 0,
      ...props.route.data,
      currentDataSource: [],
      keyName: 'name',
    }

    this._commonSelectCallback = this._commonSelectCallback.bind(this);
  }

  componentDidMount() {
    if(this.props.route.from === 'detail'){
      InteractionManager.runAfterInteractions( () => {
        this._getData();
      })
    }
  }

  _getData(){
    commonRequest({
      apiKey: 'queryPurchaseDetailKey', 
      objectName: 'purchaseOrderQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        pageLoading: false,
        ...data,
        price: str.toYuan(data.price),
        fee: str.toYuan(data.fee),
        amount: str.toYuan(data.totalFee),
        totalPrice: str.toYuan(data.skuTotalFee),
        paymentDaysSelected: data.currentPaymentDays,
        priceUnitSelected: data.currentPriceUnit,
        weightUnitSelected: data.currentWeightUnit
      })
    }).catch( err => {
      console.log(err);
    })
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
      defaultPrice: str.toFen(this.state.price),
      defaultPaymentDays: this.state.paymentDaysSelected,
      defaultWeightUnit: this.state.weightUnitSelected,
      fee: str.toFen(this.state.fee),
      totalPrice: this.state.totalPrice,
      weight: this.state.weight,
      amount: this.state.amount
    }
    if(this.props.route.from === 'detail'){
      commonRequest({
        apiKey: 'editPurchaseDetailKey', 
        withLoading: true,
        objectName: 'purchaseOrderSKUEditDO',
        params: {
          cmPurchaseSKU: {
            fee: str.toFen(this.state.fee),
            paymentdays: this.state.paymentDaysSelected.id,
            price: str.toFen(this.state.price),
            priceUnit: this.state.priceUnitSelected.id,
            purchaseNum: this.state.purchaseNum,
            weight: this.state.weight,
            weightUnit: this.state.weightUnitSelected.id
          },
          purchaseOrderId: this.props.route.data.purchaseOrderId
        }
      }).then( (res) => {
        if(res.data){
          this.navigator().pop();
          this.props.route.callback && this.props.route.callback();
        }
      }).catch( err => {})
    }
    else{
      this.navigator().pop();
      this.props.route.callback && this.props.route.callback(param, this.state.rowID)
    }
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
   * 关闭单个采购单
   * @return {[type]} [description]
   */
  _closePurchaseOrder = () =>{
    commonRequest({
      apiKey: 'closeSinglePurchaseOrderKey', 
      withLoading: true,
      objectName: 'operationDO',
      params: {
        purchaseOrderId: this.props.route.data.purchaseOrderId
      }
    }).then( (res) => {
      if(res.data){
        this.navigator().pop();
        this.props.route.callback && this.props.route.callback();
      }
    }).catch( err => {})
  }

  /**
   * 渲染底部按钮
   * @return {[type]} [description]
   */
  _renderBottomBtn(){
    //从采购订单详情页跳入
    if(this.props.route.from === 'detail'){
      let btnArray = [];
      if(this.state.showCloseBtn){
        btnArray.push((
          <TouchableOpacity key={1} style={s.btn_styl} onPress={()=>{this._popover._toggle()}}>
            <SText fontSize="body" color="orange">删除</SText>
          </TouchableOpacity>
          )
        )
      }
      if(this.state.canEditFlag){
        btnArray.push((
          <TouchableOpacity key={2} style={[s.btn_styl, s.btn_confirm]} onPress={this._submit}>
            <SText fontSize="body" color="white">确认</SText>
          </TouchableOpacity>
          )
        )
      }
      if(btnArray.length > 0){
        return <Row>{btnArray}</Row>
      }
      return null;
    }
    return <Button onPress={this._submit} type='green' size='large'>确认</Button>
  }

  render(){
    return (
      <Page title='采购单详情' pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        <ScrollView style={s.content}>
          <View style={s.sku_info}>
            <SText style={s.skuId} fontSize="num" color="333">{this.state.skuId}</SText>
            <SText fontSize="caption" color="333">{this.state.skuName}</SText>
          </View>
          <View style={s.props_wrap}>
            <Row style={s.item}>
              <SText fontSize="caption" color="333">账期</SText>
              <TouchableOpacity onPress={()=>{this._showCommonSelect('paymentDays', 'value')}}>
                <View pointerEvents={'none'} style={s.select_box}>
                  <SInput 
                    underlineColorAndroid={'transparent'}
                    value={this.state.paymentDaysSelected.value} 
                    style={s.input_with_select} 
                    placeholder="请选择"
                  />
                  <Image source={ICON_NEXT} style={s.icon_next} />
                </View>
              </TouchableOpacity>
            </Row>
            <Row style={s.item}>
              <SText fontSize="caption" color="333">采购数量</SText>
              <Row style={[s.flex1, {height: 45, alignItems: 'center'}]}>
                <SInput 
                  //编辑时 isWaitDeliveryFlag 为false则不允许修改采购数量
                  editable={(this.props.route.from === 'detail' && !this.state.isWaitDeliveryFlag) ? false : true}
                  selectTextOnFocus
                  placeholder="请输入"
                  underlineColorAndroid={'transparent'}
                  keyboardType="numeric"
                  value={this.state.purchaseNum == null ? '0' : this.state.purchaseNum + ''}
                  onChangeText={text => {
                    this._onChangeText(text, 'purchaseNum')
                  }}
                  style={[s.flex1, s.input_with_select]} 
                />
                <SText fontSize="caption" color="333" style={s.input_styl}>件</SText>
              </Row>
            </Row>
            <Row style={s.item}>
              <SText fontSize="caption" color="333">采购重量</SText>
              <Row style={[s.flex1, {height: 45}]}>
                <SInput 
                  selectTextOnFocus
                  placeholder="请输入"
                  underlineColorAndroid={'transparent'}
                  keyboardType="numeric"
                  value={this.state.weight + ''}
                  onChangeText={text => {
                    this._onChangeText(text, 'weight')
                  }}
                  style={[s.flex1, s.input_with_select]} 
                />
                <TouchableOpacity onPress={()=>{this._showCommonSelect('weightUnit', 'value')}}>
                  <View pointerEvents={'none'} style={s.select_box}>
                    <SInput 
                      underlineColorAndroid={'transparent'}
                      value={this.state.weightUnitSelected.value} 
                      style={s.input_with_select} 
                      placeholder="请选择"
                    />
                    <Image source={ICON_NEXT} style={s.icon_next} />
                  </View>
                </TouchableOpacity>
              </Row>
            </Row>
            <Row style={s.item}>
              <SText fontSize="caption" color="333">货品单价</SText>
              <Row style={[s.flex1, {height: 45}]}>
                <SInput 
                  placeholder="请输入"
                  underlineColorAndroid={'transparent'}
                  selectTextOnFocus
                  keyboardType="numeric"
                  value={this.state.price + ''}
                  onChangeText={text => {
                    this._onChangeText(text, 'price')
                  }}
                  style={[s.flex1, s.input_with_select]} 
                />
                <TouchableOpacity onPress={()=>{this._showCommonSelect('priceUnit', 'value')}}>
                  <View pointerEvents={'none'} style={s.select_box}>
                    <SInput 
                      underlineColorAndroid={'transparent'}
                      value={this.state.priceUnitSelected.value} 
                      style={s.input_with_select} 
                      placeholder="请选择"
                    />
                    <Image source={ICON_NEXT} style={s.icon_next} />
                  </View>
                </TouchableOpacity>
              </Row>
            </Row>
            <Row style={s.item}>
              <SText fontSize="caption" color="333">货品总价</SText>
              <Row style={[s.flex1, {height: 45, alignItems: 'center'}]}>
                <SText style={[s.flex1, {textAlign: 'right'}]} fontSize="caption" color="333">{this.state.totalPrice || 0}</SText>
                <SText fontSize="caption" color="333" style={s.input_styl}>元</SText>
              </Row>
            </Row>
            <Row style={s.item}>
              <SText fontSize="caption" color="333">手续费</SText>
              <Row style={[s.flex1, {height: 45, alignItems: 'center'}]}>
                <SInput 
                  placeholder="请输入"
                  underlineColorAndroid={'transparent'}
                  selectTextOnFocus
                  keyboardType="numeric"
                  value={this.state.fee + ''}
                  onChangeText={text => {
                    this._onChangeText(text, 'fee')
                  }}
                  style={[s.flex1, s.input_with_select, {marginRight: 0}]} 
                />
                <SText fontSize="caption" color="333" style={s.input_styl}>元</SText>
              </Row>
            </Row>
            <Row style={s.item}>
              <SText fontSize="caption" color="333">总金额</SText>
              <Row style={[s.flex1, {height: 45, alignItems: 'center'}]}>
                <SText style={[s.flex1, {textAlign: 'right'}]} fontSize="caption" color="orange">{this.state.amount || 0}</SText>
                <SText fontSize="caption" color="333" style={s.input_styl}>元</SText>
              </Row>
            </Row>
          </View>
        </ScrollView>
        <KeyboardSpacer />
        {this._renderBottomBtn()}
        <CommonSelect 
          keyName={this.state.keyName}
          ref={ view => this._commonSelect = view}
          selectCallback={this._commonSelectCallback}
          dataSource={this.state.currentDataSource}
          name={this.state.currentName}
          selected={this.state.currentSelected}
          multiple={false}
        />
        <Popover 
            ref={(view) => this._popover = view}
            leftBtn='取消'
            rightBtn='确认'
            leftEvt={()=>{
              this._popover._toggle();
            }}
            rightEvt={ ()=> {
              this._popover._toggle();
              setTimeout(()=>{
                this._closePurchaseOrder()
              }, 100)
            }}
            title={'提示'} >
            <View style={{paddingTop: 20, paddingBottom: 20, alignItems: 'center',justifyContent: 'center'}}>
                <SText fontSize='body' color='999'>
                    确认删除采购单？
                </SText>
            </View>
        </Popover>
      </Page>
    )
  }
}
