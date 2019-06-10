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
import {Page, Button} from 'components';
import GiftedListView from './giftedListView';
import BargainingDetail from '../bargainings/bargainingDetails';

const IconBargainingWaiting = require('../../image/icon_bargaining_waiting.png');
const IconBargainingResolved = require('../../image/icon_bargaining_resolved.png');
const IconBargainingRejected = require('../../image/icon_bargaining_rejected.png');

let s = SStyle({
  item: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderRadius: 3,
    borderColor: '#EEEEEE',
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 10,
  },
  inlineitems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 12,
  },
  underline: {
    height: 1,
    backgroundColor: '#F2F2F6',
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 11,
  }
});

module.exports = class BargainingList extends SComponent{
  static propTypes = {
      catId: React.PropTypes.number.isRequired,
      route: React.PropTypes.object.isRequired,
      navigator: React.PropTypes.object.isRequired,
  };

  /**
   * @param {number} page Requested page to fetch
   * @param {function} callback Should pass the rows
   */
  _getData = (page = 1, callback) => {
    commonRequest({
      apiKey: 'queryBargainingOrderList', 
      objectName: 'bargainingPageQueryDO',
      params: {
        catId: this.props.catId || -1,
        currentPage: page,
      }
    }).then( (res) => {
      let data = res.data;
      const rows = data.bargainingOrderDTOs.result;
      const allLoaded = data.bargainingOrderDTOs.pageNum == data.bargainingOrderDTOs.pages;
      callback(rows, { allLoaded: allLoaded });
    }).catch( err => {
      console.log(err);
      Toast.show(err.errorMessage);
      setTimeout(() => {
        this.navigator().pop();
      }, 200);
    })
  }

  _goBargainingDetail = (bargainingId) => {

    this.setRouteData({bargainingId: bargainingId}).push({
      name: 'BargainingDetail',
      component: BargainingDetail,
      refresh: this.refs.listview._refresh,
    });
  }

  render(){
    return (
      <View style={{flex: 1}}>
        <GiftedListView
          ref='listview'
          rowView={
            (rowData, sectionID, rowID) => 
              <BargainingListItem {...rowData} goBargainingDetail={this._goBargainingDetail} />
          }
          onFetch={this._getData}
        />
      </View>
    )
  }
}

class BargainingListItem extends SComponent {
  render() {
    const {
      bargainingId,
      buyerName,
      applyBargainingDate,
      auditStatus,
      auditStatusDes,
      bargainingDesc,
      bargainingItemDTOs,

      goBargainingDetail,
    } = this.props;
    const iconSource = (
      auditStatus==0?
      IconBargainingWaiting:
      (
        auditStatus==1?
        IconBargainingResolved:
        IconBargainingRejected
      )
    );
    const handleDetailDesColor = (
      auditStatus==0?
      '#0C90FF':
      (
        auditStatus==1?
        '#1EC27A':
        '#FF7043'
      )
    );
    return (
      <TouchableOpacity style={s.item} onPress={() => { goBargainingDetail(bargainingId) }}>
        <View style={s.inlineitems}>
          <SText fontSize={13} color='rgba(6,30,48,0.54)'>客户：{buyerName}</SText>
          <SText fontSize={13} color='rgba(2,29,51,0.3)'>{applyBargainingDate}</SText>
        </View>
        <View style={s.underline} />
        {
          bargainingItemDTOs && bargainingItemDTOs instanceof Array && bargainingItemDTOs.map(VO => 
            <View key={VO.itemId}>
              <View style={s.inlineitems}>
                <View>
                  <SText style={{width:181}} fontSize={15} color='#021D33'>{VO.spuName}</SText>
                  <SText fontSize={13} color='rgba(2,29,51,0.54)'>{VO.itemSpecies}</SText>
                </View>
                <View style={{justifyContent:'space-between', alignItems:'flex-end'}}>
                  <SText fontSize={13} color='rgba(2,29,51,0.54)'>拿货 {VO.itemNum} 件</SText>
                  <View style={{flexDirection: 'row'}}>
                    <SText fontSize={13} color='rgba(2,29,51,0.54)'>申请价格： </SText>
                    <SText fontSize={13} color='#021D33'>{VO.applyPrice} 元/件</SText>
                  </View>
                </View>
              </View>
              <View style={s.underline} />
            </View>
          )
        }
        <View style={[s.inlineitems, {justifyContent: 'flex-start'}]}>
          <Image source={iconSource} style={s.icon} />
          <SText fontSize={13} color={handleDetailDesColor}>{auditStatusDes}  {bargainingDesc}</SText>
        </View>
      </TouchableOpacity>
    );
  }
}