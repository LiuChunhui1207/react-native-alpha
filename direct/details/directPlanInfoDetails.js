'use strict';
import React from 'react';
import {
  View,
  InteractionManager,
  Alert,
  StyleSheet
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import {UtilsAction} from 'actions';
import ScrollableTabView from 'react-native-scrollable-tab-view';
//组件
import DirectPlanSummary from './directPlanSummary';
import DirectOrderTrack from './directOrderTrack';
import DirectCustomerTrack from './directCustomerTrack';
import DirectLogisticsTrack from './directLogisticsTrack';

module.exports = class DirectPlanInfoDetails extends SComponent{
  constructor(props) {
    super(props);
    this.state = {
      canCancel: false,
    };
  }
  _cancel = () => {
    const directPlanId = this.getRouteData('data').directPlanId;
    commonRequest({
      apiKey: 'cancelDirectPlanKey', 
      objectName: 'directPlanCancelDO',
      params: {
        directPlanId: directPlanId,
      }
    }).then((data) => {
      data = data.data;
      __STORE.dispatch(UtilsAction.toast('线路取消成功', 1000));
      this.getRouteData('refresh') ? this.getRouteData('refresh')() : null;
      setTimeout(() => {
        this.navigator().pop();
      }, 200);
    }).catch((err)=>{
      setTimeout(() => {
        this.navigator().pop();
      }, 200);
      __STORE.dispatch(UtilsAction.toast(err.errorMessage, 1000));
    });
  }
  _cancelDirectPlan = () => {
    Alert.alert(
      '确认要取消此直发计划吗？',
      undefined,
      [
        {text: '确认', onPress: this._cancel },
        {text: '取消', style: 'cancel'},
      ]
    )
  }
  _showCancel = () => {
    this.setState({ canCancel: true });
  }
  render(){
    return (
      <Page title='线路详情' loading={false} pageLoading={false} back={()=>this.navigator().pop()}
        rightContent={this.state.canCancel?<SText fontSize={16} color='#FFF'>取消线路</SText>:undefined}
        rightEvent={this._cancelDirectPlan}
      >
        <ScrollableTabView
          locked={true}
          initialPage={0}
          scrollWithoutAnimation={true}
          tabBarUnderlineColor={'#0B90FF'}
          tabBarBackgroundColor={'#fff'}
          tabBarTextStyle={{fontSize: 15, lineHeight: 21}}
          tabBarActiveTextColor={'#0B90FF'}
          tabBarInactiveTextColor={'#333'}
          tabBarUnderlineStyle={{height: 2, backgroundColor: '#0B90FF'}}
          ref='ScrollableTabView' >
          <DirectPlanSummary tabLabel='摘要' route={this.props.route} navigator={this.props.navigator} showCancel={this._showCancel} />
          <DirectOrderTrack tabLabel='订单跟踪' route={this.props.route} navigator={this.props.navigator} />
          <DirectCustomerTrack tabLabel='大户跟踪' route={this.props.route} navigator={this.props.navigator} />
          <DirectLogisticsTrack tabLabel='物流跟踪' route={this.props.route} navigator={this.props.navigator} />
        </ScrollableTabView>
      </Page>
    )
  }
}
