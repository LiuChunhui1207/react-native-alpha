'use strict';
import React from 'react';
import {
  View,
  Image,
  Text,
  ListView,
  LayoutAnimation,
  TouchableHighlight,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText, } from 'sxc-rn';
import {UtilsAction} from 'actions';
import {Page, Button, CommonSelect, Row, SXCRadio, SInput} from 'components';
import {str} from 'tools';
import KeyboardSpacer from 'react-native-keyboard-spacer';
//选择供应商页面-根据spu过滤
import SingleSpuSupplierList from '../supplier/singleSpuSupplierList';

let s = SStyle({
  head_box: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 13,
    paddingRight: 15,
    paddingLeft: 15
  },
  bd_fff: {
    backgroundColor: 'fff'
  },
  border_bottom: {
    borderBottomWidth: 'slimLine',
    borderColor: 'e5'
  },
  tip_box: {
    backgroundColor: '#FFFBEE',
    paddingLeft: 20,
    paddingTop: 8,
    paddingBottom: 7
  },
  btn_box: {
    position: 'absolute',
    bottom: 0
  },
  btn: {
    height: 45,
    borderRadius: 0,
    borderWidth: 0,
    flex: 1
  },
  btn_disable: {
    backgroundColor: '#CCCCCC'
  }
});

/**
 * 创建采购单
 * @type {[type]}
 */
module.exports = class SwitchSupplier extends SComponent{
  constructor(props){
    super(props);

    this.state = {
      reasonType: 1,
      ...props.route.data
    }

  }

  _submit = ()=>{
    if(!str.isEmpty(this.state.reasonContent)){
      let params = {
        reasonContent: this.state.reasonContent,
        reasonType: this.state.reasonType,
        skuId: this.state.skuId,
        supplierId: this.state.supplierId,
        supplierName: this.state.supplierName,
      };
      commonRequest({
        apiKey: 'temporaryReplaceSuppliedWithSkuKey', 
        objectName: 'changeSupplierRecordDO',
        params: params
      }).then( (res) => {
        let data = res.data;
        console.log(data);
        if(data){
          this.props.route.callback && this.props.route.callback();
          this.navigator().replaceWithAnimation({
            component: SingleSpuSupplierList,
            name: 'SingleSpuSupplierList',
            from: 'SwitchSupplier',
            callback: this.props.route.switchSupplierCallback,
            data: {
              spuName: this.state.spuName,
              spuId: this.state.spuId,
              skuId: this.state.skuId
            }
          })
        }
      }).catch( err => {
        console.log(err)
        this.props.route.callback && this.props.route.callback();
        this.navigator().replaceWithAnimation({
          component: SingleSpuSupplierList,
          name: 'SingleSpuSupplierList',
          from: 'SwitchSupplier',
          callback: this.props.route.switchSupplierCallback,
          data: {
            spuName: this.state.spuName,
            spuId: this.state.spuId,
            skuId: this.state.skuId
          }
        })

      })
    }

  }

  /**
   * 必填显示
   * @return {[type]} [description]
   */
  _renderRedStar(){
    return <SText fontSize="caption" color="red">*</SText>
  }

  _onChangeText(text, name) {
    this.changeState({
      [name]: text
    })
  }

  render(){
    return (
      <Page title='更换当前供应商' pageLoading={false} back={()=>this.navigator().pop()}>
        <ScrollView>
          <View style={s.head_box}>
            <SText fontSize="title" color="greenFill">{this.state.skuName}</SText>
          </View>
          <Row style={[s.head_box, s.bd_fff, s.border_bottom]}>
            <SText fontSize="body" color="999">当前供应商</SText>
            <SText fontSize="body" color="999">{this.state.supplierName}</SText> 
          </Row>
          <Row style={[s.head_box, s.bd_fff, s.border_bottom]}>
            <SText fontSize="body" color="999">选择更换的理由{this._renderRedStar()}</SText>
          </Row>
          <SXCRadio.SXCRadioGroup style={[s.head_box, s.bd_fff, s.border_bottom]} onChange={text =>this._onChangeText(text, 'reasonType')}>
            <SXCRadio.Option checked={this.state.reasonType === 1} value={1} style={{marginRight: 5}}>
              <SText fontSize="body" color="333">缺货</SText>
            </SXCRadio.Option>
            <SXCRadio.Option checked={this.state.reasonType === 2} value={2}>
              <SText fontSize="body" color="333">涨价</SText>
            </SXCRadio.Option>
            <SXCRadio.Option checked={this.state.reasonType === 3} value={3}>
              <SText fontSize="body" color="333">质量问题</SText>
            </SXCRadio.Option>
          </SXCRadio.SXCRadioGroup>
          <Row style={[s.head_box, s.bd_fff, s.border_bottom]}>
            <SText fontSize="body" color="999">详细说明{this._renderRedStar()}</SText>
          </Row>
          <SInput 
            multiline
            value={this.state.reasonContent}
            onChangeText={(text) =>{
              this._onChangeText(text, 'reasonContent')
            }}
            placeholder="详细说明换供应商的原因" 
            style={{fontSize: 16, paddingLeft: 16, paddingTop: 6,height: 120,backgroundColor: '#fff'}} 
          />
          <View style={s.tip_box}>
            <SText fontSize="caption" color="orange">以上信息提交后，将同步通知供应商和采购主管</SText>
          </View>
        </ScrollView>
        <KeyboardSpacer />
        <Row style={s.btn_box}>
          <Button style={s.btn} onPress={this._submit} type='blue' size='small'>取消</Button>
          <Button style={[s.btn, str.isEmpty(this.state.reasonContent) ? s.btn_disable : {}]} onPress={this._submit} type='green' size='small'>更换</Button>
        </Row>
      </Page>
    )
  }
}
