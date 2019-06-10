'use strict';
import React from 'react';
import {
  View,
  Image,
  TextInput,
  ListView,
  InteractionManager,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import {connect} from 'react-redux';
import {str} from 'tools';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, Popover} from 'components';
import SelectDate from './selectDate';
import DeliverOrderDetail from './deliverOrderDetail';

import {
  ICON_ARROW_BLUE_LEFT,
  ICON_ARROW_BLUE_RIGHT,
  ICON_SEARCH,
  ICON_NEXT,
  ICON_PHONE
} from 'config';
//编辑物流单
import AddSKUInfo from './addSKUInfo';

let s = SStyle({
  dateWrap: {
    height: 45,
    backgroundColor: 'fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconSearch: {
    width: 24,
    height: 24
  },
  iconArrow: {
    marginLeft: 10,
    marginRight: 10,
    width: 15,
    height: 15
  },
  leftBtn: {
    height: 45,
    justifyContent: 'center',
    paddingLeft: 15
  },
  rightBtn: {
    height: 45,
    justifyContent: 'center',
    paddingRight: 15
  },
  searchWrap: {
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 10,
    height: 45,
    flexDirection: 'row',
    backgroundColor: 'fff'
  },
  searchInput: {
    flex: 1,
    fontSize: 16
  },
  bottomBtn: {
    position: 'absolute',
    bottom: 0,
    width: '@window.width'
  },
  rowWrap: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: 'fff'
  },
  driverInfo: {
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 10,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  deliverTime: {
    height: 30,
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    borderTopWidth: 'slimLine',
    borderColor: 'f0'
  },
  phone: {
    marginTop: 2,
    marginLeft: 2,
    width: 15,
    height: 15
  },
  next: {
    marginTop: 3,
    marginLeft: 5,
    width: 8,
    height: 12
  },
  itemWrap: {
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 15
  },
  item: {
    paddingBottom: 5,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  flex1: {
    flex: 1
  },
  delete_btn: {
    width: 44,
    borderRadius: 4,
    borderColor: 'red',
    borderWidth: 'slimLine',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popover_styl: {
    paddingTop: 20, 
    paddingBottom: 20, 
    alignItems: 'center',
    justifyContent: 'center'
  }
});

/**
 * 物流单列表
 */
class Index extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let today = str.date(new Date()).format('y-m-d');
    this.state = {
      refreshing: false,
      date: today,
      dataSource: [],

    };
    this._deleteObj ={};
    this._queryObj = {
      cityCode: props.userState.cityCode,
      userId: props.userState.userId,
      currentPage: 1,
      endTime: 1,
      startTime: 2
    }
    this._renderRow = this._renderRow.bind(this);
    this._selectDateCallback = this._selectDateCallback.bind(this);
    this._createPurchaseOrder = this._createPurchaseOrder.bind(this);

    this.startDate = new Date()
    this.endDate = new Date()
    this.startDate.setMonth(this.startDate.getMonth() - 1)
    this.startDate.setDate(1)
    this.endDate.setMonth(this.endDate.getMonth() + 1)
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  _createPurchaseOrder() {
    this.navigator().push({
      ...routeMap['ChoosePurchaseOrder'],
      callback: this._getData
    })
  }

  /**
   * 选择日期后的回调方法
   * @param  {[type]} date [description]
   * @return {[type]}      [description]
   */
  _selectDateCallback(date){
    this.changeState({
      date: date
    }, ()=>this._getData());
  }

  /**
   * 返回当天的开始时间和结束时间
   */
  _formatDate(date, type){
    if(type === 'start'){
      return date + ' 00:00:00'
    }
    return date + ' 23:59:59'
  }

  /**
   * 前一天或者后一天
   * 前一天时num为-1  后天num为1
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  // _getNextOrLastDay(num){
  //   let date = new Date(this.state.pickTime), selectDate;
  //   date.setDate(date.getDate() + num);
  //   selectDate = date.getMonth() + 1 > 9 ? `${date.getFullYear()}${date.getMonth() + 1}${date.Date()}` : `${date.getFullYear()}0${date.getMonth() + 1}${date.getDate()}`;
  //   this.changeState({
  //     selectDate,
  //     pickTimeDes: `${date.getMonth() + 1}月${date.getDate()}日`,
  //     pickTime: date.getTime()
  //   }, ()=> {
  //     this._getData();
  //   })
  // }

  _getData = () =>{
    this._queryObj['startTime'] = this._formatDate(this.state.date, 'start');
    this._queryObj['endTime'] = this._formatDate(this.state.date, 'end');
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'deliveryOrderListKey',
      objectName: 'deliveryQueryForPage',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        refreshing: false,
        dataSource: data.result
      });
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }

  /**
   * 跳转至详情或者编辑页
   * @return {[type]} [description]
   */
  _toDetalPage(rowData){
    this.navigator().push({
      component: DeliverOrderDetail,
      name: 'DeliverOrderDetail',
      id: rowData.id
    })
  }

  _popoverRightBtn(){
    this._popover._toggle();
    commonRequest({
      apiKey: 'deleteFirstSchedulingKey',
      objectName: 'schedulingDeleteDO',
      params: this._deleteObj
    }).then( (res) => {
      if(res.data){
        this._getData()
      }
    }).catch( err => {})
  }

  _renderRow(rowData, sectionID, rowID){
    return (
      <TouchableOpacity onPress={()=> this._toDetalPage(rowData)} style={s.rowWrap}>
        <View style={s.driverInfo}>
          <View style={s.row}>
            <SText fontSize="body" color="333">{`${rowData.carId}  ${rowData.driverName}`}</SText>
            <SText fontSize="caption" color="orange">{rowData.statusName}</SText>
          </View>
          <View style={s.row}>
            <View style={s.row}>
              <SText fontSize="body" color="999">{rowData.driverPhone}</SText>
              <Image source={ICON_PHONE} style={s.phone} />
            </View>
            {
              rowData.showDeleteButton ? 
                (
                  <TouchableOpacity 
                    onPress={()=>{
                      this._deleteObj.schedulingId = rowData.schedulingId;
                      this._popover._toggle();
                    }}
                    style={[s.row, s.delete_btn]}
                  >
                    <SText fontSize="mini" color="red" style={{alignItems: 'center'}}>删除</SText>
                  </TouchableOpacity>
                )
              : null
            }
          </View>
        </View>
        {
          rowData.list.map( (item, index) => {
            return (
              <View style={s.itemWrap} key={index}>
                <View style={s.row}>
                  <SText style={s.flex1} fontSize="body" color="666">{item.spuName}</SText>
                  <SText fontSize="body" color="666">{`${item.weight * item.num} ${item.weightUnitName}  ${item.num}件`}</SText>
                </View>
                <View style={[s.row, index+1 == rowData.list.length ? {} : s.item]}>
                  <SText style={s.flex1} fontSize="body" color="999">{item.spuPackage}</SText>
                  {
                    rowData.status == 6 ?
                      (
                        <SText fontSize="body" color="666">
                          实收：
                          <SText fontSize="body" color="greenFont">{`${item.weight * item.actualNum} ${item.weightUnitName}  ${item.actualNum}件`}</SText>
                        </SText>
                      )
                    : null
                  }
                </View>
              </View>
            )
          })
        }
        <View style={[s.row, s.deliverTime]}>
          <SText fontSize="caption" color="999">发货：{rowData.deliveryTime.substr(5,11)}</SText>
          <SText fontSize="caption" color="999">预计到达：{rowData.exportTime.substr(5,11)}</SText>
        </View>
      </TouchableOpacity>
    )
  }
  render(){
    return (
      <Page title='物流单列表' pageLoading={false} back={()=>this.navigator().pop()}>
        <TouchableOpacity
          onPress={()=>{
            let d =new Date()
            this.navigator().push({
              callback: this._selectDateCallback,
              component: SelectDate,
              name: 'SelectDate',
              startDate: this.startDate,
              endDate: this.endDate
            })
          }}
          style={s.dateWrap}>
          <Image style={s.iconArrow} source={ICON_ARROW_BLUE_LEFT} />
          <SText fontSize="body" color="blue">{this.state.date}</SText>
          <Image style={s.iconArrow} source={ICON_ARROW_BLUE_RIGHT} />
        </TouchableOpacity>
        <View style={s.searchWrap}>
          <TextInput
            placeholderTextColor="#ccc"
            placeholder="可输入商品关键字搜索"
            style={s.searchInput} />
          <Image style={s.iconSearch} source={ICON_SEARCH} />
        </View>
        <ListView
          style={{flex: 1}}
          refreshControl={
            <RefreshControl
              style={{backgroundColor:'transparent'}}
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
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow}
        />
        <Button type='green' size='large' onPress={this._createPurchaseOrder} >创建物流单</Button>
        <Popover 
            ref={(view) => this._popover = view}
            leftBtn='取消'
            rightBtn='确认'
            leftEvt={()=>{
              this._popover._toggle();
            }}
            rightEvt={ ()=> {
              this._popoverRightBtn();
            }}
            title={'提示'} >
            <View style={s.popover_styl}>
                <SText fontSize='body' color='999'>
                  确认删除物流单？
                </SText>
            </View>
        </Popover>

      </Page>
    )
  }
}

let setState = (state) => {
  return {
    userState: state.userState
  }
};

module.exports = connect(setState)(Index);

