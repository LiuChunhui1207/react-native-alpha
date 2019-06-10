'use strict'
import React from 'react';
import{
  View,
  Image,
  ListView,
  InteractionManager,
  RefreshControl,
  TouchableHighlight
} from 'react-native';
import {SComponent, SStyle, SText, SXCEnum} from 'sxc-rn';
import {Page, Button} from 'components';
import {str} from 'tools';
import {ICON_NEXT} from 'config';
import InquiryInfo from './inquiryInfo';
import EditInquiry from './editInquiry';

let s = SStyle({
  bspuName: {
    marginTop: 14, 
    marginLeft: 15, 
    marginBottom: 9
  },
  listHeader: {
    flexDirection:'row',
    justifyContent: 'flex-end',
    backgroundColor: '#E5E5E5',
    height: 30, 
    alignItems: 'center'
  },
  rowStyle: {
    flexDirection:'row',
    backgroundColor: '#FFF',
    height: 45, 
    flex: 1,
    alignItems: 'center'   
  },
  border: {
    borderColor: 'f0',
    borderTopWidth: 'slimLine'
  },
  iconArrow: {
    position: 'absolute',
    right: 10,
    width: 9,
    height: 15,
    marginTop: 2
  },
  bottomBtn: {
    position: 'absolute', 
    bottom: 0,
    width: '@window.width'
  },
  listDate: {
    marginLeft: 10,
    justifyContent: 'center',
    marginRight: 15
  },
  inquirierName: {
    width: 65
  },
  priceWrap: {
    flex: 1, 
    flexDirection: 'row'
  },
  marketPrice: {
    textAlign: 'right',
    marginRight: 15,
    width: 60
  },
  purchasePrice: {
    textAlign: 'right',
    marginRight: 10
  }
});

/**
 * 一周询价记录页面
 */
module.exports = class WeekInquiryList extends SComponent {
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      refreshing: true,
      dataSource: [],
      name: this.getRouteData('name')
    };
    let callback = this.componentDidMount.bind(this);
    //新建询价单页面路由
    this._editInquiryRoute = {
      callback: props.route.callback,
      name: 'EditInquiry',
      component: EditInquiry
    };
    //编辑询价单页面路由
    this._inquiryInfoRoute = {
      callback,
      name:      'InquiryInfo',
      component: InquiryInfo
    };

    this._renderRow = this._renderRow.bind(this);
    this._jump      = this._jump.bind(this)
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  /**
   * [_getData description]
   * 获取一周询价记录
   * @return {[type]}   [description]
   */
  _getData(){
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'weekInquiryOrderListKey', 
      objectName: 'inquiryOrderQueryDO',
      params: {
        inquiryItemId: this.getRouteData('id'),
        inquiryType: 2  
      }
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        inquiryItemId: data.inquiryItemId,
        dataSource: data.inquiryOrders,
        refreshing: false
      });
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }

  //跳转至新建或者编辑页面
  _jump(id, route){
    this.setRouteData({
      id: id,
      itemName: this.state.name
    }).push(route);
  }

  _renderRow(rowData, sectionID, rowID) {
    let styles = rowID > 0? [s.rowStyle, s.border ] : s.rowStyle;
    let date = new Date(rowData.createTime);
    return (
      <TouchableHighlight 
        // underlayColor={SXCEnum.color['f0']} 
        onPress={()=> this._jump(rowData.inquiryOrderId, this._inquiryInfoRoute)} >
        <View style={styles}>
          <View style={{flexDirection: 'row'}}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <SText fontSize='body' color='333' style={[s.listDate, {width: 80}]}>{(date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + '点'}</SText>
            </View>
            <SText fontSize='body' color='333' style={s.inquirierName}>{rowData.inquirierName}</SText>
          </View>
          <View style={s.priceWrap}>
            <SText fontSize='caption' color='333' style={s.marketPrice}>{str.toYuan(rowData.marketPrice)}</SText>
            <SText fontSize='caption' color='333' style={s.purchasePrice}>{str.toYuan(rowData.purchasePrice)}</SText>
            <SText fontSize='caption' color='333' >{rowData.purchasePriceUnitDes}</SText>
            <Image source={ICON_NEXT} style={s.iconArrow} />
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  _renderHeader() {
    return (
      <View style={s.listHeader}>
        <View style={{flexDirection: 'row'}}>
          <SText fontSize='caption' color='999' style={[s.listDate, {width: 80}]}>日期</SText>
          <SText fontSize='caption' color='999' style={s.inquirierName}>询价员</SText>
        </View>
        <View style={s.priceWrap}>
          <SText fontSize='caption' color='999' style={s.marketPrice}>市场价</SText>
          <SText fontSize='caption' color='999' style={s.purchasePrice}>采购价</SText>
        </View>
      </View>
    )
  }
  render(){
    return (
      <Page
        pageLoading={false}
        title="一周询价记录"
        back={
          ()=>{
            this.navigator().pop();
            this.props.route.callback();
          }
        }
      >
        <SText fontSize='title' color='greenFont' style={s.bspuName}>{this.state.name}</SText>
        {this._renderHeader()}
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
          enableEmptySections
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow} />
        <Button onPress={()=>this._jump(this.state.inquiryItemId, this._editInquiryRoute)} size="large" type="green" style={s.bottomBtn}>去询价</Button>
      </Page>
    )
  }
}