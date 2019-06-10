import React from 'react'
import{
  View,
  Image,
  ListView,
  InteractionManager,
  RefreshControl,
  TouchableHighlight
} from 'react-native'
import { SComponent, SStyle, SText, SXCEnum } from 'sxc-rn'
import { Page } from 'components'

const s = SStyle({
  spuName: {
    backgroundColor: '#fff',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderColor: '#eee',
    borderBottomWidth: 1,
  },
  rowWrapper: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 10,
  },
  rowHeader: {
    backgroundColor: '#fbfbfd',
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3
  },
  rowFooter: {
    backgroundColor: 'fff',
    borderTopWidth: 0,
    padding: 10,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3
  },
  rowCommon: {
    padding: 10,
    borderColor: '#eee',
    borderWidth: 1
  },
  emptyTip: {
    marginTop: 60,
    alignItems: 'center'
  },
  flex_row_center: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  flex_m: {
    flex:2
  },
  flex_l: {
    flex: 1
  },
  textMargin: {
    marginRight: 8
  }
});

/**
 * 询价记录页面
 */
export default class InquiryRecordList extends SComponent {
  constructor (props) {
    super(props)
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = {
      refreshing: true,
      dataSource: [],
      name: this.getRouteData('name')
    }
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions(() => {
      this._getData()
    })
  }

  /**
   * [_getData description]
   * 获取一周询价记录
   * @return {[type]}   [description]
   */
  _getData () {
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'queryInquiryRecordListKey', 
      objectName: 'inquiryPriceQueryDO',
      params: {
        inquiryItemId: this.getRouteData('id'),
        inquiryType: this.getRouteData('inquiryType')
      }
    }).then(res => {
      const { inquiryPriceRecords } = res.data
      this.changeState({
        dataSource: inquiryPriceRecords,
        refreshing: false
      });
    }).catch(err => {
      this.changeState({
        refreshing: false
      })
    })
  }

  _renderRow = (rowData, sectionID, rowID) => {
    let { inquiryTime, purchaserName, supplierName, inquiryPrices, inquiryRemarks } = rowData
    return (
      <View style={s.rowWrapper}>
        <View style={[s.rowCommon, s.rowHeader, s.flex_row_center]}>
          <View style={s.flex_m}>
            <SText fontSize="mini_p" color="lightGray" >{inquiryTime + '  ' + supplierName}</SText>
            {
              inquiryRemarks
              ? <SText style={{marginTop: 5}} fontSize="mini_p" color="lightGray" >{inquiryRemarks}</SText>
              : null
            }
          </View>
          <View style={s.flex_l}>
            <SText style={{textAlign: 'right'}} fontSize="mini_p" color="lightGray">{purchaserName}</SText>
          </View>
        </View>
        <View style={[s.rowCommon, s.rowFooter, s.flex_row_center]}>
          <View style={[s.flex_m, s.flex_row_center]}>
            <SText style={s.textMargin} fontSize="caption_p" color="deepGray" >{inquiryPrices[0].key}</SText>
            <SText fontSize="caption_p" color="000" >{inquiryPrices[0].value}</SText>
          </View>
          {
            inquiryPrices.length > 1
            ? <View style={[s.flex_m, s.flex_row_center]}>
                <SText style={s.textMargin} fontSize="caption_p" color="deepGray">{inquiryPrices[1].key}</SText>
                <SText fontSize="caption_p" color="000">{inquiryPrices[1].value}</SText>
              </View>
            : null
          }
        </View>
      </View>
    )
  }

  // 渲染 列表 底部
  _renderFooter = () => {
    if(this.state.dataSource.length === 0){
      return (
        <View style={s.emptyTip}>
          <SText fontSize="body" color="999">暂无询价记录哦~</SText>
        </View>
      )
    }
    return null;
  }

  render() {
    return (
      <Page
        pageLoading={false}
        title={this.props.route.title || '询价记录'}
        pageName={this.props.route.title === '询价记录' ? '原料询价' : 'SKU询价'}
        back={
          ()=>{
            this.navigator().pop()
          }
        }
      >
        <View style={s.spuName}>
          <SText fontSize='body' style={{color: '#021D33'}}>{this.state.name.split('  ')[0]}</SText>
          {
            this.state.name.indexOf('  ') > -1
            ? <SText style={{marginTop: 5, color: 'rgba(2, 29, 51, .54)'}} fontSize="caption">{this.state.name.split('  ')[1]}</SText>
            : null
          }
        </View>
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
          renderFooter={this._renderFooter}
          initialListSize={10}
          enableEmptySections
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow} />
      </Page>
    )
  }
}
