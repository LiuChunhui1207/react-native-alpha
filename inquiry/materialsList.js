import React from 'react'
import {
  View,
  TouchableOpacity,
  RefreshControl,
  Image,
  ListView
} from 'react-native'
import { SStyle, SComponent, SText, SRefreshScroll } from 'sxc-rn'
import { Page, Button, TipBox } from 'components'
import { IconForward } from 'config'
import MaterialsInquiryEdit from './materialsInquiryEdit'

const s = SStyle({
  itemWrapper: {
    backgroundColor: 'fff',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15
  },
  itemHeader: {
    flex: 1,
    backgroundColor: '#f7f7fa',
    padding: 15
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 50,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  flex: {
    flex: 1
  },
  iconNext: {
    width: 8,
    height: 12,
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
    flex: 0.5,
    marginRight: 10
    // backgroundColor: 'greenFill',
    // paddingTop: 3,
    // paddingBottom: 3,
    // paddingLeft: 5,
    // paddingRight: 5,
    // marginLeft: 15,
    // borderRadius: 3
  }
});

export default class MaterialsList extends SComponent{
  static propTypes = {
    route: React.PropTypes.object.isRequired,
    navigator: React.PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)
    this._ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    })
  }

  _renderSectionHeader = (data, sectionID) => {
    return (
      <View style={s.itemHeader}>
        <SText fontSize="mini_p" color="999">{sectionID}</SText>
      </View>
    )
  }
  _renderRow = (rowData, sectionID, rowID) =>{
    const { estimatePurchasePrice, inquiryItemId, itemName, itemSpecies, priceDesc } = rowData
    const isLast = this.props.dataSource[sectionID].length === Number(rowID) + 1 ? {borderBottomWidth: 0} : {}
    return (
      <View style={s.itemWrapper}>
        <TouchableOpacity 
          onPress={
            () => {
              this.setRouteData({
                id: inquiryItemId,
                inquiryType: 2,
                name: itemSpecies ? itemName + '  ' + itemSpecies : itemName
              }).push({
                callback: this.props._getData,
                name: 'MaterialsInquiryEdit',
                component: MaterialsInquiryEdit,
                title: '询价记录'
              })
            }
          }
          style={[s.item, isLast]}>
          <View style={[s.itemTextWrapper, s.flex]}>
            <SText fontSize="body" color="000" numberOfLines={1}>{itemName}</SText>
          </View>
          {
            estimatePurchasePrice ? 
            <View style={[s.itemTextWrapper, s.tag]}>
              <SText style={{textAlign: 'right', color: '#021D33'}} fontSize="caption_p">{estimatePurchasePrice}</SText>
              <SText style={{textAlign: 'right', color: 'rgba(2, 29, 51, .54)'}} fontSize="mini">{priceDesc}</SText>
            </View>
            : null
          }
          <Image source={IconForward} style={s.iconNext} />
        </TouchableOpacity>
      </View>
    )
  }
  _renderFooter = () => {
    if(this.props.dataSource.length === 0){
      return (
        <View style={s.emptyTip}>
          <SText fontSize="body" color="999">今天询价都完成了哦~</SText>
        </View>
      )
    }
    return null;
  }
  render () {
    return (
      <View style={s.flex}>
        <TipBox timeFlag warnText={this.props.tip} />
        <ListView
          refreshControl={
            <RefreshControl
              refreshing={this.props.refreshing}
              onRefresh={this.props._getData}
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
          dataSource={this._ds.cloneWithRowsAndSections(this.props.dataSource)}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderSectionHeader}
          stickySectionHeadersEnabled={false} />
      </View>
    )
  }
}
