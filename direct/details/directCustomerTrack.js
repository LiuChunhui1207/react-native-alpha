'use strict';
import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
  ActivityIndicator,
  InteractionManager,
  StyleSheet
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import {UtilsAction} from 'actions';
import GiftedListView from './giftedListView';

const s = SStyle({
  lineItem: {
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#fff',
    borderTopWidth:1,
    borderColor:'#efefef',
    paddingTop:12,
    paddingBottom:12,
  },
});
module.exports = class DirectCustomerTrack extends SComponent{
  constructor(props) {
    super(props);
    this.state = {
      noHeader: false,
    };
  }

  _getData = (page = 1, callback) => {
    const directPlanId = this.getRouteData('data').directPlanId;
    commonRequest({
      apiKey: 'queryCoreCustomerKey', 
      objectName: 'coreCustomerQueryDO',
      params: {
        directPlanId: directPlanId,
        currentPage: page,
      }
    }).then((data) => {
      data = data.data;
      if (data) {
        const rows = data.page.result;
        const allLoaded = data.page.pageNum == data.page.pages;
        callback(rows, { allLoaded: allLoaded });
      } else {
        if (page == 1) {
          callback([], { allLoaded: false });
          this.changeState({ noHeader: true });
        } else {
          callback([], { allLoaded: true });
        }
      }
    }).catch((err)=>{
      callback([], { allLoaded: true });
      __STORE.dispatch(UtilsAction.toast(err.errorMessage, 1000));
    });
  }

  render(){
    return (
      <View style={{flex:1}}>
        <GiftedListView
          headerView={() =>
            !this.state.noHeader?
            <View style={s.lineItem}>
              <SText style={{flex:3,marginLeft:15}} fontSize={13} color='rgba(2,29,51,0.54)'>商品名</SText>
              <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='rgba(2,29,51,0.54)'>日峰值</SText>
              <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='rgba(2,29,51,0.54)'>订单件数</SText>
            </View>
            :
            null
          }
          rowView={
            (rowData, sectionID, rowID) => 
              <OrderItem {...rowData} />
          }
          onFetch={this._getData}
        />
      </View>
    )
  }
}

class OrderItem extends SComponent{
  render(){
    const { buyerName, pickHouseName, totalDailyPeak, totalOrderNum, coreCustomerSkuVOS } = this.props;
    return (
      <View style={{backgroundColor:'red'}}>
        <View style={s.lineItem}>
          <ItemTitle style={{flex:3}} title={buyerName} subTitle={pickHouseName} />
          <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='rgba(2,29,51,0.54)'>{totalDailyPeak || '0'}</SText>
          <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='rgba(2,29,51,0.54)'>{totalOrderNum || '0'}</SText>
        </View>
        {
          coreCustomerSkuVOS && coreCustomerSkuVOS.length?
          coreCustomerSkuVOS.map((item, i) =>
            <View key={i} style={s.lineItem}>
              <View style={{flex:3}}>
                <SText style={{marginLeft:35}} fontSize={15} color='#021D33'>{item.itemName}</SText>
              </View>
              <SText style={{flex:1,textAlign:'center'}} fontSize={15} color='#3C424B'>{item.dailyPeak || '0'}</SText>
              <SText style={{flex:1,textAlign:'center'}} fontSize={15} color='#3C424B'>{item.orderNum || '0'}</SText>
            </View>
          )
          :
          null
        }
      </View>
    )
  }
}

class ItemTitle extends SComponent{
  render(){
    return (
      <View style={[{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'},this.props.style]}>
        <View style={{marginLeft:15, backgroundColor:'#1C86E8', width:8, height:8, borderRadius:4}} />
        <SText style={{fontWeight:'500', marginLeft:12}} fontSize={15}>{this.props.title}</SText>
        <SText style={{marginLeft:12}} fontSize={13} color='rgba(2,29,51,0.54)'>{this.props.subTitle}</SText>
      </View>
    )
  }
}