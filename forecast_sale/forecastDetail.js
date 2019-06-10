import React from 'react';
import { View, ListView, RefreshControl, Dimensions, ScrollView } from 'react-native';
import { Row, Refresh, RefreshList } from 'components';
import { SStyle, SComponent, SText } from 'sxc-rn';

const WINHEIGHT = Dimensions.get('window').height;
const s = SStyle({
  row:{
    flex: 0,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  col0:{
    flex: 1,
  },
  col1:{
    width: 80,
    textAlign: 'right'
  },
  col2:{
    width: 80,
    textAlign: 'right'
  },
  border_bottom:{
    borderColor: '#eee',
    borderBottomWidth: 'slimLine'
  },
  list_row: {
    marginBottom: 10,
    paddingHorizontal:15
  }
})

module.exports = class ForecastDetail extends SComponent{
  constructor(props){
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: [],
      refreshing: false,
      more: false,
      pageSize: 10,
      curpage: 1
    }
  }
  _refresh(){
    this.refreshRef._startRefresh();
    this.refreshRef._scrollTo({ y: 0 });
  }
  _getData = (endRefresh) => {
    this.changeState({
      dataSource: [],
    })
    commonRequest({
      apiKey: 'salesForecastByStorehouseListKey',
      objectName: 'salesForecastQueryDO',
      params: {
        catId: this.props.catId,
        curpage: 1,
        pageSize: this.state.pageSize,
        queryDt: this.props.queryDate
      }
    }).then( (res) => {
      this.changeState({
        dataSource: res.data.result,
        more: res.data.nextPage,
        curpage: 1,
      })
      endRefresh ? endRefresh() : null;
    }).catch( (err) => {
      endRefresh ? endRefresh() : null;
    })
  }
  _next = (endRefresh) => {
    let curpage = this.state.curpage + 1;
    commonRequest({
      apiKey: 'salesForecastByStorehouseListKey',
      objectName: 'salesForecastQueryDO',
      params: {
        catId: this.props.catId,
        curpage,
        pageSize: this.state.pageSize,
        queryDt: this.props.queryDate
      }
    }).then( (res) => {
      let _new = res.data.result;
      this.changeState({
        dataSource: [...this.state.dataSource,..._new],
        more: res.data.nextPage,
        curpage
      });
      endRefresh ? endRefresh() : null;
    }).catch( (err) => {
      endRefresh ? endRefresh() : null;
    })
  }
  _renderHistoryHeader(){
    return (
      <Row style={[s.row,s.border_bottom,{height: 38,paddingTop: 10,marginBottom: 10,paddingHorizontal:15}]}>
        <SText fontSize='mini_p' color='999' style={s.col0}>商品名</SText>
        <SText fontSize='mini_p' color='999' style={s.col1}>可供量</SText>
        <SText fontSize='mini_p' color='999' style={s.col2}>订单量(件)</SText>
      </Row>
    )
  }
  _renderHistoryRow(rowData,a,rowNum){
    let { catName, skus, storehouseName } = rowData;
    return(
      <View key={rowNum} style={s.list_row}>
        <Row style={[s.row,s.border_bottom,{height: 44}]}>
          <SText fontSize='body' color='000' style={s.col0}>{catName}<SText fontSize='mini' color='666'> ({storehouseName})</SText></SText>
        </Row>
        {skus.map((skuInfo) => {
          let { availableRatio, availableNum, actualSaleNum, skuId, skuLocalName, skuName } = skuInfo;
          return(
            <Row key={skuId} style={[s.row,s.border_bottom,{height: 52}]}>
              <View style={[s.col0]}>
                <SText fontSize='caption' color='666' numberOfLines={1}>{skuName}</SText>
                <View style={{flex:0,flexDirection: 'row',marginTop: 5}}>
                  <SText fontSize='mini' color='666' style={{marginRight: 10}}>{skuId}</SText>
                  <SText fontSize='mini' color='ccc' style={{marginRight: 10}}>{skuLocalName}</SText>
                  <SText fontSize='mini' color='orange' >{availableRatio < 100 ? `供货比例${availableRatio}%` : ''}</SText>
                </View>
              </View>
              <SText fontSize='caption' color='666' style={[s.col2,]}>{availableNum}</SText>
              <SText fontSize='caption' color='666' style={[s.col2,]}>{actualSaleNum}</SText>
            </Row>
          )
        })}
      </View>
    )
  }
  _renderHeader(){
    return (
      <Row style={[s.row,s.border_bottom,{height: 38,paddingTop: 10,marginBottom: 10,paddingHorizontal:15}]}>
        <SText fontSize='mini_p' color='999' style={s.col0}>商品名</SText>
        <SText fontSize='mini_p' color='999' style={s.col2}>预估销量(件)</SText>
      </Row>
    )
  }
  _renderRow(rowData,a,rowNum){
    let { catName, skus, storehouseName } = rowData;
    return(
      <View key={rowNum} style={s.list_row}>
        <Row style={[s.row,s.border_bottom,{height: 44}]}>
          <SText fontSize='body' color='000' style={s.col0}>{catName}<SText fontSize='mini' color='666'> ({storehouseName})</SText></SText>
        </Row>
        {skus.map((skuInfo) => {
          let { availableRatio, forecastSaleNum, skuId, skuLocalName, skuName } = skuInfo;
          return(
            <Row key={skuId} style={[s.row,s.border_bottom,{height: 52}]}>
              <View style={[s.col0]}>
                <SText fontSize='caption' color='666' numberOfLines={1}>{skuName}</SText>
                <View style={{flex:0,flexDirection: 'row',marginTop: 5}}>
                  <SText fontSize='mini' color='666' style={{marginRight: 10}}>{skuId}</SText>
                  <SText fontSize='mini' color='ccc' style={{marginRight: 10}}>{skuLocalName}</SText>
                  <SText fontSize='mini' color='orange' >{availableRatio < 100 ? `供货比例${availableRatio}%` : ''}</SText>
                </View>
              </View>
              <SText fontSize='caption' color='666' style={[s.col2,]}>{forecastSaleNum}</SText>
            </Row>
          )
        })}
      </View>
    )
  }
  render(){
    return(
      <View style={{flex: 1,paddingTop: 10 }} >
        { !this.props.isHistory ? this._renderHeader() : this._renderHistoryHeader() }
        <RefreshList
          ref={(ref) => { this.refreshRef = ref; }}
          startRequest={this._getData}
          style={{ flex: 1 }}
          containerStyle={{flex: 1,zIndex: 999}}
          more={this.state.more}
          onEndReached={this._next}
          pageSize={15}
          initialListSize={10}
          onEndReachedThreshold={60}
          renderRow={ !this.props.isHistory ? this._renderRow : this._renderHistoryRow }
          dataSource={this.ds.cloneWithRows(this.state.dataSource)}
          enableEmptySections
        >
        </RefreshList>
      </View>
    )
  }
}
