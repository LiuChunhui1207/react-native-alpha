'use strict';
import React from 'react';
import {
  View,
  InteractionManager,
  RefreshControl,
  Image,
  ListView
} from 'react-native';
import {SStyle, SComponent, SText, SRefreshScroll} from 'sxc-rn';
import {Page, Button, Popover} from 'components';
import {str} from 'tools';
import EditInquiry from './editInquiry';

let s = SStyle({
  name: {
    marginTop: 14, 
    marginLeft: 15, 
    marginBottom: 9
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  textWrap: {
    backgroundColor: 'fff',
    paddingTop: 13,
    paddingBottom: 13
  },
  btnWrap: {
    flexDirection: 'row',
    marginTop: 30
  },
  deleteInfo: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

/**
 * 询价详情页
 */
module.exports = class InquiryInfo extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      pageLoading: true
    }

    this._btnClick      = this._btnClick.bind(this);
    this._deleteInquiry = this._deleteInquiry.bind(this);
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }
  /**
   * 获取询价单信息
   * @return {[type]}   [description]
   */
  _getData(){
    commonRequest({
      apiKey: 'inquiryOrderDetailKey', 
      objectName: 'inquiryOrderQueryDO',
      params: {
        inquiryOrderId: this.getRouteData('id'),
        inquiryType: 2
      }
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        pageLoading: false,
        itemName: data.itemName,
        inquiryOrderId: data.inquiryOrderId,
        marketPrice: data.marketPrice,
        marketPriceUnit: data.marketPriceUnit,
        purchasePriceUnit: data.purchasePriceUnit,
        marketPriceUnitDes: data.marketPriceUnitDes,
        purchasePrice: data.purchasePrice,
        purchasePriceUnitDes: data.purchasePriceUnitDes,
        taxFee: data.taxFee,
        remark: data.remark,
        showDeleteButton: data.showDeleteButton,
        showUpdateButton: data.showUpdateButton
      });
    }).catch( err => {})
  }

  /**
   * [_btnClick description]
   * 底部按钮点击事件
   */
  _btnClick(action){
    if(action == 'delete') {
      this._popover._toggle();
    }
    else {
      let state = this.state;
      this.setRouteData({
        edit: true,
        itemName: state.itemName,
        id: this.getRouteData('id'),
        inquiry: {
          inquiryItemId: this.getRouteData('id'),     //询价商品id
          inquiryOrderId: state.inquiryOrderId,       //询价单id
          marketPrice: state.marketPrice,             //市场价(分) 
          marketPriceUnit: state.marketPriceUnit,     //市场价单位
          purchasePrice: state.purchasePrice,         //采购价(分)
          purchasePriceUnit: state.purchasePriceUnit, //采购价单位
          remark: state.remark,                       //说明
          taxFee: state.taxFee                        //税费
        }
      }).push({
        callback: this.componentDidMount.bind(this),
        name: 'EditInquiry',
        component: EditInquiry
      })
    }
  }
  /**
   * [_deleteInquiry description]
   * 删除询价单
   */
  _deleteInquiry(){
    this._popover._toggle()
    commonRequest({
      apiKey: 'deleteInquiryKey', 
      objectName: 'inquiryOrderQueryDO',
      withLoading: true,
      params: {
        inquiryOrderId: this.getRouteData('id')
      }
    }).then( (res) => {
      if(res.data){
        this.navigator().pop();
        this.props.route.callback();
      }
    }).catch( err => {})
  }
  /**
   * [_renderBtn description]
   * 底部按钮组是否显示
   * @return {[type]}   [description]
   */
  _renderBtn(){
    if(this.state.showDeleteButton || this.state.showUpdateButton){
      return (
        <View style={s.btnWrap}>
          {this.state.showDeleteButton ? <Button onPress={() => this._btnClick('delete')} size="middle" type="blue" style={{flex: 1}}>删除</Button> : null}
          {this.state.showUpdateButton ? <Button onPress={() => this._btnClick('edit')} size="middle" type="green" style={{flex: 1}}>编辑</Button> : null}
        </View>
      )
    }
    return null;
  }

  render(){
    return (
      <Page 
        title='询价信息'
        pageLoading={this.state.pageLoading} 
        back={
          ()=>{
            this.navigator().pop();
            this.props.route.callback();
          }
        }
      >
        <SText fontSize='title' color='greenFont' style={s.name}>{this.state.itemName}</SText>
        <View style={s.row}>
          <SText fontSize="body" color="333">市场价</SText>
          <SText fontSize="body" color="333">{str.toYuan(this.state.marketPrice) + ' ' + this.state.marketPriceUnitDes}</SText>
        </View>
        <View style={s.row}>
          <SText fontSize="body" color="333">采购价</SText>
          <SText fontSize="body" color="333">{str.toYuan(this.state.purchasePrice) + ' ' + this.state.purchasePriceUnitDes}</SText>
        </View>
        <View style={s.row}>
          <SText fontSize="body" color="333">税费</SText>
          <SText fontSize="body" color="333">{this.state.taxFee + ' %'}</SText>
        </View>
        <View style={s.info} >
          <SText style={{marginLeft: 15}} fontSize="body" color="333">说明</SText>
        </View>
        <View style={s.textWrap}>
          <SText style={{marginLeft: 15, flexWrap: 'wrap'}} fontSize="body" color="333">{this.state.remark}</SText>
        </View>
        {this._renderBtn()}
        <Popover 
            ref={(view)=> this._popover = view}
            leftBtn='取消'
            rightBtn='确认'
            leftEvt={()=> this._popover._toggle()}
            rightEvt={()=> this._deleteInquiry()}
            title={'提示'}>
            <View style={s.deleteInfo}>
              <SText fontSize="body" color="333">确认删除？</SText>
            </View>
        </Popover>
      </Page>
    )
  }
}
