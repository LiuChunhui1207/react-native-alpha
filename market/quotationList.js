import React from 'react'
import {
  View,
  TouchableOpacity,
  RefreshControl,
  ListView
} from 'react-native'
import { SStyle, SComponent, SText } from 'sxc-rn'
import { UtilsAction } from 'actions'
import MarketTrend from './marketTrend'

const s = SStyle({
  itemWrapper: {
    backgroundColor: 'fff',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15
  },
  itemHeader_spu: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f7f7fa'
  },
  itemHeader_title: {
    width: '@window.width',
    flexDirection: 'row',
    backgroundColor: 'fff',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 'slimLine',
    borderColor: '#eee'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    height: 50,
    borderBottomWidth: 'slimLine',
    borderColor: '#eee'
  },
  item_long: {
    width: '@(window.width-30)*0.63'
  },
  item_short: {
    width: '@(window.width-30)*0.25'
  },
  item_mini: {
    // flex: 1
    width: '@(window.width-30)*0.12'
  },
  textCenter: {
    textAlign: 'center'
  },
  emptyTip: {
    marginTop: 60,
    alignItems: 'center'
  },
  itemTextWrapper: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 50,
    paddingTop: 5,
    paddingBottom: 5
  },
  tag: {
    paddingTop: 3,
    paddingBottom: 3,
    borderRadius: 3
  },
  status_up: {
    backgroundColor: 'red'
  },
  status_decline: {
    backgroundColor: 'greenFill'
  },
  status_none: {
  }
});

export default class MarketList extends SComponent{
  static propTypes = {
    route: React.PropTypes.object.isRequired,
    navigator: React.PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)
    this._ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    });
    this.state = {
      refreshing: true,
      dataSource: {} // 列表源数据
    }
  }

  // 获取列表信息
  _getData = (id) => {
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'queryQuotationListKey', 
      objectName: 'quotationQueryDO',
      params: {
        catId: id || -1
      }
    }).then(res => {
      let { data } = res
      console.log(data)
      data.lspuQuotations = data.lspuQuotations.reduce((t, e) => {
        let { catId, catName, currentQuotations } = e
        t[catName] = currentQuotations
        return t
      }, {})
      this.changeState({
        refreshing: false,
        dataSource: data.lspuQuotations
      })
    }).catch(err => {
      this.changeState({
        refreshing: false,
      })
    })
  }

  _renderSectionHeader = (data, sectionID) => {
    return (
      <View style={{flex: 1}}>
        <View style={s.itemHeader_spu}>
          <SText fontSize="mini_p" color="999">{sectionID}</SText>
        </View>
        <View style={s.itemHeader_title}>
          <View style={s.item_long}><SText fontSize="mini_p" color="999">原料</SText></View>
          <View style={s.item_short}><SText style={s.textCenter} fontSize="mini_p" color="999">今日均价</SText></View>
          <View style={s.item_mini}><SText style={s.textCenter} fontSize="mini_p" color="999">涨跌</SText></View>
        </View>
      </View>
    )
  }
  _renderRow = (rowData, sectionID, rowID) => {
    let { lspuId, lspuName, currentPrice, originPurchasePlace, trendFlag, trendNum } = rowData
    const statusColor = trendFlag > 0 ? s.status_up : trendFlag === -9999 ? s.status_none : s.status_decline // 趋势状态标签
    trendNum = trendFlag > 0 ? '+' + trendNum : trendFlag === -9999 ? '--' : '-' + trendNum // 趋势值
    const isLast = this.state.dataSource[sectionID].length === Number(rowID) + 1 ? {borderBottomWidth: 0} : {}
    return (
      <View style={s.itemWrapper}>
        <TouchableOpacity 
          onPress={
            () => {
              this.setRouteData({
                id: lspuId,
                name: lspuName
              }).push({
                name: 'MarketTrend',
                component: MarketTrend
              })
            }
          }
          style={[s.item, isLast]}>
          <View style={[s.itemTextWrapper, s.item_long]}>
            <SText fontSize="caption_p" style={{color: '#021D33'}} numberOfLines={1}>{lspuName}</SText>
            <SText fontSize="mini" style={{color: 'rgba(2, 29, 51, .54)'}}>{originPurchasePlace}</SText>
          </View>
          <View style={s.item_short}><SText style={s.textCenter} fontSize="caption_p" color="333" >{currentPrice}</SText></View>
          <View style={[s.tag, s.item_mini, statusColor]}>
            {
              <SText style={s.textCenter} fontSize="mini" color={trendNum === '--' ? '000' : 'fff'} >{trendNum}</SText>
            }
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  _renderFooter = () => {
    if (Object.keys(this.state.dataSource).length === 0) {
      return (
        <View style={s.emptyTip}>
          <SText fontSize="body" color="999">暂时没有对应的数据哦~</SText>
        </View>
      )
    }
    return null
  }

  // toast信息处理
  _showMsg(str){
    __STORE.dispatch(UtilsAction.toast(str, 1000));
  }

  render(){
    return (
      <View style={{flex: 1}}>
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
          style={{backgroundColor: '#f7f7fa'}}
          initialListSize={10}
          enableEmptySections={false}
          renderFooter={this._renderFooter}
          dataSource={this._ds.cloneWithRowsAndSections(this.state.dataSource)}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderSectionHeader}
          stickySectionHeadersEnabled={false} />
      </View>
    )
  }
}
