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
import {str} from 'tools';
import {Page, Button, TipBox} from 'components';
import {ICON_NEXT, CAI, SHI} from 'config';
//一周询价记录
import WeekInquiryList from './weekInquiryList';

let s = SStyle({
  item: {
    marginTop: 5,
    backgroundColor: 'fff',
    paddingTop: 10,
    paddingBottom: 10
  },
  itemNameWrap: {
    flexDirection: 'row'
  },
  itemName: {
    marginLeft: 15,
    lineHeight: 19,
    paddingBottom: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '@window.width*0.8'
  },
  iconNextWrap: {
    flex: 1,
    alignItems: 'flex-end',
    marginTop: 2
  },
  iconNext: {
    width: 8,
    height: 13,
    marginRight: 15
  },
  emptyTip: {
    marginTop: 60,
    alignItems: 'center'
  },
  flex1: {
    flex: 1
  },
  priceWrap: {
    marginTop:5,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 15
  },
  text: {
    marginRight: 5,
    width: 14,
    height: 14
  }
});

module.exports = class AlreadyInquiryList extends SComponent{
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
    };

    this._renderFooter = this._renderFooter.bind(this);
    this._renderRow = this._renderRow.bind(this);
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }
  /**
   * 获取已询价列表
   * @return {[type]} [description]
   */
  _getData(){
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'alreadyInquiryOrderListKey', 
      objectName: 'inquiryOrderQueryDO',
      params: {
        inquiryType: 2
      }
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        refreshing: false,
        dataSource: data.inquiryOrders
      });
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }
  /**
   * list 列渲染
   * @param  {[type]} rowData   [description]
   * @param  {[type]} sectionID [description]
   * @param  {[type]} rowID     [description]
   * @return {[type]}           [description]
   */
  _renderRow(rowData, sectionID, rowID){
    return (
      <TouchableOpacity 
        onPress={()=>{
          this.setRouteData({
            id: rowData.inquiryItemId,
            name: rowData.itemName
          }).push({
            callback: this.componentDidMount.bind(this),
            name: 'WeekInquiryList',
            component: WeekInquiryList
          })
        }}
        style={s.item}>
        <View style={s.itemNameWrap}>
          <SText style={s.itemName} fontSize="body" color="333">
            {rowData.itemName}
            <SText fontSize="caption" color="ccc">  {rowData.createTimeDes}</SText>
          </SText>
          <View style={s.iconNextWrap}>
            <Image source={ICON_NEXT} style={s.iconNext} />
          </View>
        </View>
        {this._renderRowPrice(rowData.marketPrice, rowData.marketPriceUnitDes, 1)}
        {this._renderRowPrice(rowData.purchasePrice, rowData.purchasePriceUnitDes, 2)}
      </TouchableOpacity>
    )
  }
  //type 1表示市价  2 表示采购价
  _renderRowPrice(price, unit, type){
    let unitArray = unit.split('/'),
        text = SHI;
    if(type == 2){
      text = CAI;
    }
    return (
      <View style={s.priceWrap}>
        <Image source={text} style={s.text} />
        <SText fontSize="caption" color="orange">{str.toYuan(price) + ' ' + unitArray[0]}</SText>
        <SText fontSize="caption" color="999">{'/' + unitArray[1]}</SText>
      </View>
    )
  }
  _renderFooter(){
    if(this.state.dataSource.length === 0){
      return (
        <View style={s.emptyTip}>
          <SText fontSize="body" color="999">今天还没有询价哦~</SText>
        </View>
      )
    }
    return null;
  }
  render(){
    return (
      <ListView
        style={{flex: 1, marginTop: 5}}
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
    )
  }
}
