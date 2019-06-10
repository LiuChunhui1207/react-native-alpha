'use strict';
import React from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  LayoutAnimation,
  InteractionManager,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, SXCRadio, Row} from 'components';
import {UtilsAction} from 'actions';
import ScrollableTabView from 'react-native-scrollable-tab-view';
//基础信息
import BaseInfo from './baseInfo';
import PaymentInfo from './paymentInfo'
import SupplyInfo from './supplyInfo'

let s = SStyle({
  scrolltabview: {
    backgroundColor: 'fff'
  }
});

/**
 * 供应商详情页
 * @type {[type]}
 */
module.exports = class Index extends SComponent{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <Page title="供应商信息" pageLoading={false} back={()=>this.navigator().pop()}>
        <ScrollableTabView 
          locked
          tabBarTextStyle={{
            fontSize: 18,
          }}
          tabBarActiveTextColor={'#2296F3'}
          tabBarInactiveTextColor={'#999'}
          tabBarUnderlineColor={'#2296F3'}
          style={s.scrolltabview} 
        >
          <BaseInfo {...this.props} tabLabel="基础信息" />
          <PaymentInfo {...this.props} tabLabel="结款信息"/>
          <SupplyInfo {...this.props} tabLabel="供应信息"/>
        </ScrollableTabView>
      </Page>
    )
  }
}
