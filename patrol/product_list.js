/**
 * @Author: liuchunhui
 * @Date:   2017-09-05 14:48:40
 * @Email:  liuchunhui1207@gmail.com
 * @Filename: product_list.js
 * @Last modified by:   liuchunhui
 * @Last modified time: 2017-09-05 14:31:54
 * @License: GNU General Public License（GPL)
 * @Copyright: ©2015-2017 www.songxiaocai.com 宋小菜 All Rights Reserved.
 */
'use strict';

import React from 'react';
import {
  View,
  InteractionManager,
  TouchableOpacity,
  Image,
  ListView,
  StyleSheet,
  ScrollView,
  RefreshControl
} from 'react-native';
import { SStyle, SComponent, SText } from 'sxc-rn';
import { Page, Row } from 'components';
import Echarts from 'native-echarts';
import DeepCopy from 'lodash';
import { IconForward } from 'config';
let Dimensions = require('Dimensions');
let { width } = Dimensions.get('window');
import Chart from './chart';

const s = SStyle({
  //图标模块
  leftActive: {
    borderWidth: 'slimLine',
    borderColor: '#0C90FF',    
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    backgroundColor: '#0C90FF',
    paddingLeft:13,
    paddingRight: 13,
    paddingTop: 3,
    paddingBottom: 3,
  },
  rightActive: {
    borderWidth: 'slimLine',
    borderColor: '#0C90FF',    
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: '#0C90FF',
    paddingLeft:13,
    paddingRight: 13,
    paddingTop: 3,
    paddingBottom: 3,
  },

  //列表模块
  listHeader: {
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 'slimLine',
    borderBottomColor: '#eee',
  },
  listHeaderLeft: {
    alignItems: 'center',
  },
  headerMark: {
    width: 4,
    height: 15,
    backgroundColor: '#0C90FF',
    borderRadius: 3,
  },
  listHeaderTitle: {
    fontFamily: 'PingFangSC-Medium',
    fontSize: 'caption_plus',
    color: '#021D33',
    marginLeft: 10,
  },
  forward: {
    width: 7,
    height: 12,
    marginLeft: 10
  },
  listHeaderRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  listHeaderUnit: {
    fontSize: 'caption_plus',
    color: '#021D33',
  },
  listHeaderDesc: {
    fontSize: 'mini_plus',
    color: '#021D33',
    opacity: 0.54,
  },
  content: {
    backgroundColor: '#fff', 
    paddingLeft: 28, 
    paddingRight: 15,
    borderBottomWidth: 'slimLine',
    borderBottomColor: '#eee',
  },
  skuView: {
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 'slimLine',
    borderBottomColor: '#eee',
  },
  header: {
    borderBottomWidth: 'slimLine',
    borderBottomColor: '#eee',
  },
  priceHeader: {
    paddingTop: 6,
    paddingBottom: 6,
  },
  priceHeaderText: {
    fontSize: 'mini_plus',
    color: '#061E30',
  },
  row: {
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 'slimLine',
    borderBottomColor: '#eee',
  },
});

module.exports = class ProductList extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.timePeriod = 1;
    this.dateTime = this.getRouteData('dateTime');
    this.saleCityCode = this.getRouteData('saleCityCode'),
    this.state = {
      pageLoading: false,
      loading: false,
      lspuName: '',
      leftActive: true,
      rightActive: false,
      itemInquiry: this._ds.cloneWithRows([]),
      chartData: undefined,
      lspuId: this.getRouteData('lspuId'),
    }
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions( () => {
      this._getChartData();
      this._getListData();
    })
  }

  /**
   * @desc 获取列表数据
   */
  _getChartData = () => {
    commonRequest({
      apiKey: 'getPriceCompareTrendKey',
      objectName: 'priceCompareTrendQueryDO',
      params: {
        lspuId: this.state.lspuId,
        saleCityCode: this.saleCityCode,
        timePeriod: this.timePeriod,
      }
    }).then( (res) => {
      this.changeState({
        chartData: res.data.trendLineChart       
      });
      endRefrsh? endRefrsh() : null;
    }).catch( err => {
      this.changeState({
          pageLoading:false,
      });
      endRefrsh? endRefrsh() : null;
    })
  }

  /**
   * @desc 获取列表数据
   */
    _getListData = () => {
      commonRequest({
        apiKey: 'getItemListDetailKey',
        objectName: 'itemPriceDetailQueryDO',
        params: {
          lspuId: this.state.lspuId,
          saleCityCode: this.saleCityCode,
          dateTime: this.dateTime,
        }
      }).then( (res) => {
        let itemInquiry = res.data.itemInquiry;
        let lspuName = res.data.lspuName;
        this.changeState({
          lspuName: lspuName,
          itemInquiry: this._ds.cloneWithRows(itemInquiry? itemInquiry : []),        
        });
        endRefrsh? endRefrsh() : null;
      }).catch( err => {
        this.changeState({
            pageLoading:false,
        });
        endRefrsh? endRefrsh() : null;
    })
  }
  
  _renderChartHeader = () => {
    return(
      <Row style={s.listHeader}>
        <Row style={s.listHeaderLeft}>
          <View style={s.headerMark} />
          <SText style={s.listHeaderTitle}>价格趋势图</SText>
        </Row>
        <Row style={s.listHeaderRight}>
          <TouchableOpacity style={this.state.leftActive ? s.leftActive : [s.leftActive,{backgroundColor: '#fff'}]}
            onPress={() => {
              this.changeState({
                leftActive: true,
                rightActive: false,
              });
              this.timePeriod = 1;
              this._getChartData();
            }}
          >
            <SText style={this.state.leftActive ? {color: '#fff'} : {color: '#0C90FF'}}>7天</SText>
          </TouchableOpacity>
          <TouchableOpacity style={this.state.rightActive ? s.rightActive : [s.rightActive,{backgroundColor: '#fff'}]}
            onPress={() => {
              this.changeState({
                leftActive: false,
                rightActive: true,
              });
              this.timePeriod = 2;
              this._getChartData();
            }}
          >
            <SText style={this.state.rightActive ? {color: '#fff'} : {color: '#0C90FF'}}>30天</SText>
          </TouchableOpacity>
        </Row>
      </Row>
    )
  }

  /**
   * @desc 渲染图表
   */
  _renderChart = () => {
    const { chartData } = this.state
    if (!chartData) return null
    return <Chart {...chartData}/>
  }

  _renderProductList = () => {
    return(
      <View style={{marginBottom: 44}}>
        <ListView
          dataSource={this.state.itemInquiry} 
          renderHeader={this._renderHeader}
          renderRow={this._renderCat}
          initialListSize={10}
          enableEmptySections={true}
        />
      </View>
    )
  }
  
  /**
   * @desc 渲染列表头部
   */
  _renderHeader = () => {
    return(
      <Row style={[s.listHeader,{marginTop: 10}]}>
        <Row style={s.listHeaderLeft}>
          <View style={s.headerMark} />
          <SText style={s.listHeaderTitle}>商品列表</SText>
        </Row>
        <View style={s.listHeaderRight}>
          <SText style={s.listHeaderUnit}>单位：元/斤</SText>
          <SText style={s.listHeaderDesc}> 以下宋小菜价为 毛重价格</SText>
        </View>
      </Row>
    )
  }

  _renderCat = (rowData, sectionID, rowID) => {
    return(
      <View style={s.content}>
        <View style={s.skuView}>
          <SText style={[s.listHeaderTitle,{marginLeft: 0}]}>{rowData.itemName}</SText>
        </View>
        <Row style={s.header}>
          <View style={[s.priceHeader,{flex: 2}]}>
            <SText style={s.priceHeaderText}>进货渠道</SText>
          </View>
          <View style={[s.priceHeader,{flex: 1, alignItems: 'flex-end'}]}>
            <SText style={s.priceHeaderText}>昨日拿货价</SText>
          </View>
          <View style={[s.priceHeader,{flex: 1, alignItems: 'flex-end'}]}>
            <SText style={s.priceHeaderText}>今日拿货价</SText>
          </View>
        </Row>
        {
          rowData.itemDetails.map((item,index) => (
            <Row key = {index} style={s.row}>
              <View style={[s.priceHeader,{flex: 2}]}>
                <SText style={s.listHeaderUnit}>{item.supplierName}</SText>
              </View>
              <View style={[s.priceHeader,{flex: 1, alignItems: 'flex-end'}]}>
                <SText style={s.listHeaderUnit}>{item.lastPrice}</SText>
              </View>
              <View style={[s.priceHeader,{flex: 1, alignItems: 'flex-end'}]}>
                <SText style={s.listHeaderUnit}>{item.currentPrice}</SText>
              </View>
            </Row>
          ))
        }
      </View>
    )
  }

  render() {
    return(
      <Page
        title={this.state.lspuName}
        pageName='原料价格列表'
        pageLoading={this.state.pageLoading}
        loading={this.state.loading}
        back={() => this.navigator().pop()}
      > 
        <ScrollView>
          {this._renderChartHeader()}
          {this._renderChart()}
          {this._renderProductList()}
        </ScrollView>
      </Page>
    )
  }
  
}
