'use strict';
import React from 'react';
import {
  View,
  StyleSheet,
  InteractionManager,
  Dimensions
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import ScrollableTabView from 'react-native-scrollable-tab-view';
// sku列表
import SkuList from './skuList'
// 原料列表
import MaterialsList from './materialsList'
const WINDOW_WIDTH = Dimensions.get('window').width
//待询价列表
// import WaitInquiryList from './waitInquiryList';
//已询价列表
// import AlreadyInquiryList from './alreadyInquiryList';

var s = SStyle({
  scrolltabview: {
    flex: 1
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'fff',
    height: 45,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  flex1: {
    flex: 1
  },
  exitBtn: {
    marginTop: 20
  },
  underline: {
    height: 1, 
    flex: .5, 
    backgroundColor: '#eee', 
    color: '#eee', 
    borderColor: '#eee'
  }
});

module.exports = class Index extends SComponent{
  constructor (props) {
    super(props)
    this.state = {
      tabActive: 0,
      refreshing: false,
      skuInquiryPrices: [],
      lspuInquiryPrices: [],
      tip: null
    }
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  _onChangeTab = (obj) => {
    this.changeState({
      tabActive: obj.i
    })
  }

  // 获取sku和原料列表数据
  _getData = () => {
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'queryInquiryListKey', 
      objectName: 'inquiryPriceQueryDO',
      params: {}
    }).then(res => {
      let { skuInquiryPrices, lspuInquiryPrices, remindTips } = res.data
      skuInquiryPrices = this._formatArray(skuInquiryPrices)
      lspuInquiryPrices = this._formatArray(lspuInquiryPrices)
      this.changeState({
        refreshing: false,
        skuInquiryPrices: skuInquiryPrices,
        lspuInquiryPrices: lspuInquiryPrices,
        tip: remindTips
      })
    }).catch(err => {
      this.changeState({
        refreshing: false
      })
    })
  }

  _formatArray = (arr) => arr.reduce((t, e) => {
    let { catId, catName, inquiryPriceItems } = e
    t[catName] = inquiryPriceItems
    return t
  }, {})

  render(){
    return (
      <Page title='询价列表' pageName='SKU询价' pageLoading={false} back={()=>this.navigator().pop()}>
        <ScrollableTabView
          initialPage={0}
          scrollWithoutAnimation={true}
          onChangeTab={this._onChangeTab}
          tabBarBackgroundColor={'#fff'}
          tabBarTextStyle={{fontSize: 16, fontWeight: 'normal'}}
          tabBarActiveTextColor={'#4E92DF'}
          tabBarInactiveTextColor={'#333'}
          tabBarUnderlineColor={'#4E92DF'}
          ref='ScrollableTabView'
          underlineStyle={{width: (WINDOW_WIDTH-60)/2, marginLeft: 15, marginRight: 15}}
          style={s.scrolltabview} >
          <SkuList ref="skuList" _getData={this._getData} refreshing={this.state.refreshing} tip={this.state.tip} dataSource={this.state.skuInquiryPrices} tabLabel="SKU" route={this.props.route} navigator={this.props.navigator} />
          <MaterialsList ref="materials" _getData={this._getData} refreshing={this.state.refreshing} tip={this.state.tip} dataSource={this.state.lspuInquiryPrices} tabLabel="原料" route={this.props.route} navigator={this.props.navigator} />
          {/*<WaitInquiryList ref="wait" tabLabel="待询价" route={this.props.route} navigator={this.props.navigator} />*/}
          {/*<AlreadyInquiryList ref="already" tabLabel="已询价" route={this.props.route} navigator={this.props.navigator} />*/}
        </ScrollableTabView>
      </Page>
    )
  }
}
