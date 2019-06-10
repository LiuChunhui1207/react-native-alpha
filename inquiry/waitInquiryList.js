'use strict';
import React from 'react';
import {
  View,
  InteractionManager,
  TouchableOpacity,
  RefreshControl,
  Image,
  ListView
} from 'react-native';
import {SStyle, SComponent, SText, SRefreshScroll} from 'sxc-rn';
import {Page, Button, TipBox} from 'components';
import {ICON_NEXT} from 'config';
import WeekInquiryList from './weekInquiryList';

let s = SStyle({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'fff',
    height: 45,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  iconNext: {
    width: 8,
    height: 12,
    marginRight: 15
  },
  emptyTip: {
    marginTop: 60,
    alignItems: 'center'
  },
  flex1: {
    flex: 1
  },
  marginL15: {
    marginLeft: 15
  }
});

module.exports = class WaitInquiryList extends SComponent{
  static propTypes = {
      route: React.PropTypes.object.isRequired,
      navigator: React.PropTypes.object.isRequired,
  };

  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      refreshing: true,
      dataSource: []
    }

    this._renderFooter = this._renderFooter.bind(this);
    this._renderRow = this._renderRow.bind(this);
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }
  _getData(){
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'waitInquiryOrderListKey', 
      objectName: 'inquiryOrderQueryDO',
      params: {}
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        refreshing: false,
        dataSource: data.needInquiryOrders,
        tip: data.tip
      });
    }).catch( err => {})
  }
  _renderRow(rowData, sectionID, rowID){
    return (
      <TouchableOpacity 
        onPress={
          ()=>{
            this.setRouteData({
              id: rowData.inquiryItemId,
              name: rowData.itemName
            }).push({
              callback: this.componentDidMount.bind(this),
              name: 'WeekInquiryList',
              component: WeekInquiryList
            })
          }
        }
        style={s.item}>
        <SText style={[s.marginL15, s.flex1]} fontSize="body" color="333">{rowData.itemName}</SText>
        <Image source={ICON_NEXT} style={s.iconNext} />
      </TouchableOpacity>
    )
  }
  _renderFooter(){
    if(this.state.dataSource.length === 0){
      return (
        <View style={s.emptyTip}>
          <SText fontSize="body" color="999">今天询价都完成了哦~</SText>
        </View>
      )
    }
    return null;
  }
  render(){
    return (
      <View style={{flex: 1}}>
        <TipBox warnText={this.state.tip} />
        <ListView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._getData.bind(this)}
              tintColor="#54bb40"
              title="加载中..."
              titleColor="#999"
              colors={['#2296f3']}
              progressBackgroundColor="#fff"
            />
          }
          initialListSize={10}
          enableEmptySections={true}
          renderFooter={this._renderFooter}
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow} />
      </View>
    )
  }
}
