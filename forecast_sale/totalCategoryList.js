import React from 'react';
import { View, ListView , TextInput, ScrollView, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Row, Refresh, RefreshList } from 'components';
import { SStyle, SComponent, SText, SRefreshScroll } from 'sxc-rn';
import { UtilsAction } from 'actions';
import SetNumModal from './SetNumModal';

const WINHEIGHT = Dimensions.get('window').height;
const s = SStyle({
  row:{
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
  list_row:{
    marginBottom: 10,
    paddingHorizontal:15
  }
})
module.exports = class TotalCategoryList extends SComponent{
  constructor(props){
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: [],
      refreshing: false,
      modifiable: false,
      more: false,
      pageSize: 15,
      curpage: 1,
      refreshHeight: WINHEIGHT - 190 ,
      activeValue: '',
      activeRowInfo: {
        forecastSkuId: null,
        catId: null,
        rowId: null,
      }
    };
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
      apiKey: 'salesForecastByCatListKey',
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
        modifiable: res.data.modifiable
      })
      endRefresh ? endRefresh() : null;
    }).catch( (err) => {
      endRefresh ? endRefresh() : null;
    })
  }
  _next = (endRefresh) => {
    let curpage = this.state.curpage + 1;
    commonRequest({
      apiKey: 'salesForecastByCatListKey',
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
  _handleSave = ({catAvailableNum, availableNum}) => {
    let { rowId, forecastSkuId } = this.state.activeRowInfo;
    let dataSource = this.state.dataSource.map((item,index) => {
      if(index == rowId){
        item.availableNum = catAvailableNum;
        item.skus.map((skuInfo) => {
          if(skuInfo.forecastSkuId == forecastSkuId){
            skuInfo.availableNum = availableNum;
          }
        })
        return item;
      }else{
        return item;
      }
    });
    this.changeState({ dataSource });
    this.props.reloadForecastDetail();
    __STORE.dispatch(UtilsAction.toast('修改成功！'))
  }
  _renderHistoryHeader(){
    return (
      <Row style={[s.row,s.border_bottom,{height: 38,paddingTop: 10,paddingHorizontal:15}]}>
        <SText fontSize='mini_p' color='999' style={s.col0}>商品名</SText>
        <SText fontSize='mini_p' color='999' style={s.col1}>可供量(件)</SText>
        <SText fontSize='mini_p' color='999' style={s.col2}>订单量(件)</SText>
      </Row>
    )
  }
  _renderHistoryRow = (rowData,sectionId,rowId) => {
    let { catId, catName, actualSaleNum, availableNum, skus } = rowData;
    return(
      <View key={rowId} style={s.list_row}>
          <Row style={[s.row,s.border_bottom,{height: 44}]}>
            <SText fontSize='body' color='000' style={s.col0}>{catName}</SText>
            <SText fontSize='body' color='ccc' style={s.col1}>{availableNum}</SText>
            <SText fontSize='body' color='ccc' style={s.col2}>{actualSaleNum}</SText>
          </Row>
          {skus.map((skuInfo) => {
            let { skuId, skuName, skuLocalName, forecastSkuId, actualSaleNum, availableNum } = skuInfo;
            return(
              <Row key={skuId} style={[s.row,s.border_bottom,{height: 52}]}>
                <View style={[s.col0]}>
                  <SText fontSize='caption' color='666' numberOfLines={1}>{skuName}</SText>
                  <View style={{flex:0,flexDirection: 'row',marginTop: 5}}>
                    <SText fontSize='mini' color='666' style={{marginRight: 10}}>{skuId}</SText>
                    <SText fontSize='mini' color='ccc' >{skuLocalName}</SText>
                  </View>
                </View>
                <SText fontSize='caption' color='666' style={[s.col1]}>{availableNum}</SText>
                <SText fontSize='caption' color='666' style={[s.col2]}>{actualSaleNum}</SText>
              </Row>
            )
          })}
      </View>
    )
  }
  _renderHeader(){
    return (
      <Row style={[s.row,s.border_bottom,{height: 38,paddingTop: 10,paddingHorizontal:15}]}>
        <SText fontSize='mini_p' color='999' style={s.col0}>商品名</SText>
        <SText fontSize='mini_p' color='999' style={s.col1}>预估销量(件)</SText>
        <SText fontSize='mini_p' color='999' style={s.col2}>可供量(件)</SText>
      </Row>
    )
  }
  _renderRow = (rowData,sectionId,rowId) => {
    let { catId, catName, forecastSaleNum, availableNum, skus } = rowData;
    return(
      <View key={rowId} style={s.list_row}>
          <Row style={[s.row,s.border_bottom,{height: 44}]}>
            <SText fontSize='body' color='000' style={s.col0}>{catName}</SText>
            <SText fontSize='body' color='ccc' style={s.col1}>{forecastSaleNum}</SText>
            <SText fontSize='body' color='ccc' style={s.col2}>{availableNum}</SText>
          </Row>
          {skus.map((skuInfo) => {
            let { skuId, skuName, skuLocalName, forecastSkuId, forecastSaleNum, availableNum } = skuInfo;
            let availableNumColor = forecastSaleNum != availableNum ? '#F5A92A' : '#0C90FF';
            return(
              <Row key={skuId} style={[s.row,s.border_bottom,{height: 52}]}>
                <View style={[s.col0]}>
                  <SText fontSize='caption' color='666' numberOfLines={1}>{skuName}</SText>
                  <View style={{flex:0,flexDirection: 'row',marginTop: 5}}>
                    <SText fontSize='mini' color='666' style={{marginRight: 10}}>{skuId}</SText>
                    <SText fontSize='mini' color='ccc' >{skuLocalName}</SText>
                  </View>
                </View>
                <SText fontSize='caption' color='666' style={[s.col1]}>{forecastSaleNum}</SText>
                {this.state.modifiable ?
                  <TouchableOpacity
                    style={{alignSelf: 'flex-end',justifyContent: 'center',width: 80,height: 52,padding: 0 }}
                    onPress={() => {
                      // this._popover._toggle();
                      this.setRouteData({
                        data: {
                          availableNum: availableNum,
                          activeRowInfo: { rowId, forecastSkuId, catId }
                        },
                        callback: ({catAvailableNum, availableNum}) => {
                          this._handleSave({catAvailableNum, availableNum});
                        }
                      }).push({
                        type: 'modal',
                        name: 'SetNumModal',
                        component: SetNumModal
                      })
                      this.changeState({
                        activeValue: availableNum,
                        activeRowInfo: { rowId, forecastSkuId, catId }
                      })
                    }}
                  >
                    { availableNum == 0 ?
                      <Text style={{ color: '#0C90FF', fontSize: 14, textAlign: 'right'}}>{'-'}</Text>
                      :
                      <Text style={{ color: availableNumColor, fontSize: 14, textAlign: 'right'}}>{availableNum}</Text>
                    }
                  </TouchableOpacity>
                  :
                  <SText fontSize='caption' color='666' style={[s.col2]}>{availableNum}</SText>
                }
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
        <View style={{flex: 1}}>
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
      </View>
    )
  }
}
