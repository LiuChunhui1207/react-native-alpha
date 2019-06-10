'use strict';
import React from 'react';
import {
  View,
  InteractionManager,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Image,
  ListView
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, CommonSelect, Popover} from 'components';
import {str} from 'tools';
import {UtilsAction} from 'actions';
import {ARROW_DOWN_S} from 'config';

let s = SStyle({
  name: {
    marginTop: 14,
    marginLeft: 15,
    marginBottom: 9
  },
  row: {
    flexDirection: 'row',
    backgroundColor: 'fff',
    height: 45,
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  info: {
    height: 45,
    marginTop: 10,
    justifyContent: 'center',
    backgroundColor: 'fa',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  remark: {
    paddingLeft: 15,
    paddingRight: 25,
    backgroundColor: 'fff',
    paddingTop: 13,
    paddingBottom: 13
  },
  btnWrap: {
    flexDirection: 'row',
    marginTop: 30
  },
  wranInfo: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 30,
    paddingRight: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowDown: {
    width: 14,
    height: 8,
    marginLeft: 5,
    marginTop: 3
  },
  textInput: {
    flex: 1,
    textAlign: 'right',
    height: 35,
    marginTop: 5
  },
  borderRight: {
    height: 25,
    marginRight: 5,
    marginLeft: 5,
    backgroundColor: 'f0',
    width: 1
  },
  unitWrap: {
    flexDirection: 'row'
  },
  submitBtn: {
    flex: 1,
    marginTop: 30
  },
  common_item: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 45
  }
});

/**
 * 新增或编辑询价
 */
module.exports = class EditInquiry extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      pageLoading: true,
      itemName: this.getRouteData('itemName'),
      popoverMsg: '',
      selectedPriceUnit: {}
    };
    //新建时回传数据结构
    this._submitObj = {
      inquiryItemId: this.getRouteData('id'),  //询价商品id
      marketPrice: '',                         //市场价(分)
      marketPriceUnit: '',                     //市场价单位
      purchasePrice: '',                       //采购价(分)
      purchasePriceUnit: '',                   //采购价单位
      remark: '',                              //说明
      taxFee: ''                               //税费
    };
    if(this.getRouteData('edit')){
      let passData = this.getRouteData('inquiry');
      this.state['marketPrice'] = passData.marketPrice;
      this.state['purchasePrice'] = passData.purchasePrice;
      this.state['selectedPriceUnit'] = passData.marketPriceUnit;
      this.state['taxFee'] = passData.taxFee;
      this.state['remark'] = passData.remark;
      this.state['selectedPriceUnit'] = passData.purchasePriceUnit;
      this._submitObj = passData
    }
    this._listSelectCallback = this._listSelectCallback.bind(this);
    this._renderRow = this._renderRow.bind(this);
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }
  _getData(){
    commonRequest({
      apiKey: 'initInquiryInfoKey',
      objectName: 'inquiryOrderQueryDO',
      params: {
        inquiryItemId: this.getRouteData('id'),
        inquiryType: 2
      }
    }).then( (res) => {
      let data = res.data;
      let initUnit = {},
        selectedUnit = this.getRouteData('edit') ? this._submitObj.marketPriceUnit : data.defaultPriceUnit;
      this._priceUnitEnums = data.priceUnitEnums;
      this._priceUnitEnums.map( item => {
        if(item.status == selectedUnit){
          initUnit = item;
        }
      });
      if(this.getRouteData('edit')){
        this.changeState({
          pageLoading: false,
          selectedPriceUnit: initUnit,
          itemWeight: data.itemWeight,   //商品重量
          itemBasePrice: data.itemBasePrice, //商品基准定价
          defaultMarketPriceRate: data.defaultMarketPriceRate, //市场询价和基准定价的比率
          defaultPurchasePriceRate: data.defaultPurchasePriceRate //采购询价和基准定价的比率
        })
      }
      else{
        this._submitObj['marketPriceUnit'] = data.defaultPriceUnit;
        this._submitObj['purchasePriceUnit'] = data.defaultPriceUnit;
        this._submitObj['taxFee'] = data.defaultTaxFee;
        this.changeState({
          pageLoading: false,
          itemWeight: data.itemWeight,   //商品重量
          itemBasePrice: data.itemBasePrice, //商品基准定价
          defaultMarketPriceRate: data.defaultMarketPriceRate, //市场询价和基准定价的比率
          defaultPurchasePriceRate: data.defaultPurchasePriceRate, //采购询价和基准定价的比率
          selectedPriceUnit: initUnit,
          taxFee: data.defaultTaxFee
        })
      }
    }).catch( err => {})
  }
  /**
   * commonSelect 选择后的回调函数
   * @return {[type]}   [description]
   */
  _listSelectCallback(data, name){
    this._submitObj['marketPriceUnit'] = data[0].status;
    this._submitObj['purchasePriceUnit'] = data[0].status;
    this.changeState({
      selectedPriceUnit: data[0]
    });
  }
  /**
   * [_submit description]
   * 校验必填数据以及市场价是否在允许范围内
   * @return {[type]}   [description]
   */
  _validate(){
    if(str.isEmpty(this._submitObj.marketPrice)){
      return __STORE.dispatch(UtilsAction.toast('请输入市场价格！', 1000));
    }
    if(str.isEmpty(this._submitObj.purchasePrice)){
      return __STORE.dispatch(UtilsAction.toast('请输入采购价格！', 1000));
    }
    if(str.isEmpty(this._submitObj.taxFee)){
      return __STORE.dispatch(UtilsAction.toast('请输入税率！', 1000));
    }
    this._checkMarketPrice();
  }
  _submit(){
    commonRequest({
      apiKey: 'editPurchaseInquiryKey',
      objectName: 'purchaseInquiryOrderEditDO',
      params: this._submitObj
    }).then( (res) => {
      if(res.data){
        //编辑时直接返回上级页面 新建时 需要返回列表页
        if(this.getRouteData('edit')){
          this.navigator().pop();
        }
        else{
          //别的页面用到此页面需要pop操作，那么直接pop，例如测算定价页面。无需寻找Inquiry，直接返回上一层
          if(!!this.getRouteData('shouldPopback')){
            this.navigator().pop();
          }else{
            let route = this.navigator().getRoute('name', 'Inquiry');
            this.navigator().popToRoute(route);
          }
        }
        if(typeof this.props.route.callback == 'function'){
          this.props.route.callback();
        }
      }
    }).catch( err => {})
  }
  /**
   * 计算输入的市场价 是否在允许范围内浮动
   * @return {[type]}   [description]
   */
  _checkMarketPrice(){
    //默认单位 元/件
    let marketBasePrice = this._submitObj.marketPrice,
      purchaseBasePrice = this._submitObj.purchasePrice;
    switch(this._submitObj.marketPriceUnit){
      //元/斤
      case 15:
        marketBasePrice = this._submitObj.marketPrice * this.state.itemWeight;
        purchaseBasePrice = this._submitObj.purchasePrice * this.state.itemWeight;
        break;
      //元/百公斤
      case 4:
        marketBasePrice = this._submitObj.marketPrice * this.state.itemWeight / 200;
        purchaseBasePrice = this._submitObj.purchasePrice * this.state.itemWeight / 200;
        break;
      default:
        break;
    }
    if(Math.abs(this.state.itemBasePrice - marketBasePrice) > this.state.itemBasePrice * this.state.defaultMarketPriceRate){
      this.changeState({
        popoverMsg: `当前市场询价价格浮动超过定价${this.state.defaultMarketPriceRate * 100}%,请仔细确认后提交`
      }, ()=>this._popover._toggle());
    }
    else if(Math.abs(this.state.itemBasePrice - purchaseBasePrice) > this.state.itemBasePrice * this.state.defaultPurchasePriceRate){
      this.changeState({
        popoverMsg: `当前采购询价价格浮动超过定价${this.state.defaultMarketPriceRate * 100}%,请仔细确认后提交`
      }, ()=>this._popover._toggle());
    }
    else{
      this._submit();
    }
  }
  /**
   * commonSelect 行的渲染方法
   * @return {[type]}     [description]
   */
  _renderRow(rowData, sectionID, rowID){
    if(rowData.status == this.state.selectedPriceUnit.status){
      return (
        <View style={s.common_item}>
            <SText fontSize='body' color='blue' >{rowData.statusDes}</SText>
        </View>
      )
    }
    return (
      <View style={s.common_item}>
          <SText fontSize='body' color='333'>{rowData.statusDes}</SText>
      </View>
    )
  }
  render(){
    return (
      <Page
        pageName='编辑询价信息'
        title='询价信息'
        pageLoading={this.state.pageLoading}
        back={()=>this.navigator().pop()}
      >
        <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={false}>
          <SText fontSize='title' color='greenFont' style={s.name}>{this.state.itemName}</SText>
          <View style={s.row}>
            <SText fontSize="body" color="333">市场价</SText>
            <TextInput
              style={s.textInput}
              underlineColorAndroid={'transparent'}
              onChangeText={(text)=>this._submitObj['marketPrice'] = Number(text) * 100}
              defaultValue={this.state.marketPrice  ? str.toYuan(this.state.marketPrice) + '' : this.state.marketPrice}
              placeholder="请输入市场价"
              keyboardType="default"
            />
            <View style={s.borderRight} />
            <TouchableOpacity
              style={s.unitWrap}
              onPress={()=>this._commonSelect._toggle()}
            >
              <SText fontSize="body" color="333">{this.state.selectedPriceUnit.statusDes}</SText>
              <Image source={ARROW_DOWN_S} style={s.arrowDown} />
            </TouchableOpacity>
          </View>
          <View style={s.row}>
            <SText fontSize="body" color="333">采购价</SText>
            <TextInput
              style={s.textInput}
              underlineColorAndroid={'transparent'}
              onChangeText={(text)=>this._submitObj['purchasePrice'] = Number(text) * 100}
              defaultValue={this.state.purchasePrice ? str.toYuan(this.state.purchasePrice) + '' : this.state.purchasePrice}
              placeholder="请输入采购价"
              keyboardType="default"
            />
            <View style={s.borderRight} />
            <TouchableOpacity
              style={s.unitWrap}
              onPress={()=>this._commonSelect._toggle()}
            >
              <SText fontSize="body" color="333">{this.state.selectedPriceUnit.statusDes}</SText>
              <Image source={ARROW_DOWN_S} style={s.arrowDown} />
            </TouchableOpacity>
          </View>
          <View style={s.row}>
            <SText fontSize="body" color="333">税费</SText>
            <TextInput
              style={s.textInput}
              underlineColorAndroid={'transparent'}
              onChangeText={(text)=>this._submitObj['taxFee'] = text}
              defaultValue={this.state.taxFee + ''}
              placeholder="请输入税费比例"
              keyboardType="default"
            />
            <SText fontSize="body" color="333">  %</SText>
          </View>
          <View style={s.info} >
            <SText style={{marginLeft: 15}} fontSize="body" color="333">说明</SText>
          </View>
          <View style={s.remark}>
            <TextInput
              style={{flex: 1, flexWrap: 'wrap',height: 60, fontSize: 16}}
              multiline
              underlineColorAndroid={'transparent'}
              defaultValue={this.state.remark}
              onChangeText={(text)=>this._submitObj['remark'] = text}
              placeholder="如有特殊信息，请具体填写通知到采购经理与定价员"
            />
          </View>
          <CommonSelect
            renderRow={this._renderRow}
            ref={(view) => this._commonSelect = view}
            dataSource={this._priceUnitEnums}
            selectCallback={this._listSelectCallback}
            selected={this.state.selectedPriceUnit}
          />
          <Button onPress={() => this._validate()} size="middle" type="green" style={s.submitBtn}>提交</Button>
        </ScrollView>
        <Popover
            ref={(view)=> this._popover = view}
            leftBtn='取消'
            rightBtn='确认'
            leftEvt={()=> this._popover._toggle()}
            rightEvt={
              ()=> {
                this._popover._toggle();
                this._submit();
              }
            }
            title={'提示'}>
            <View style={s.wranInfo}>
              <SText fontSize="body" color="333">{this.state.popoverMsg}</SText>
            </View>
        </Popover>
      </Page>
    )
  }
}
