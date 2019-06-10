'use strict';
import React from 'react';
import ReactNative, {
  InteractionManager,
  Image,
  ListView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  View
} from 'react-native';
import {connect} from 'react-redux';
import {SStyle, SComponent, SText, SRefreshScroll} from 'sxc-rn';
import {Page, Row} from 'components';
import {UtilsAction} from 'actions';
//选择服务站页面
import StoreHouseList from './storeHouseList';
//选择日期页面
import SelectDate from '../delivery/selectDate';
import {
  ICON_RIGHT,
  ICON_LEFT,
  ICON_CAL
} from 'config';

let s = SStyle({
  flex1: {
    flex: 1
  },
  width70: {
    width: 70,
    textAlign: 'right'
  },
  list_header: {
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12,
    height: 30,
  },
  header: {
    height: 42,
    // justifyContent: 'center',
    backgroundColor: '#0884E7'
  },
  left_btn: {
    flex: 1,
    width: 70,
    alignItems: 'center'
  },
  right_btn: {
    flex: 1,
    width: 70,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  mid_btn: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 148,
    backgroundColor: '#fff',
    height: 30,
    borderRadius: 2
  },
  icon_left: {
    marginLeft: 13,
    marginRight: 6,
    width: 7,
    height: 12
  },
  icon_right: {
    marginRight: 13,
    marginLeft: 6,
    width: 7,
    height: 12
  },
  icon_cal: {
    marginLeft: 6,
    width: 16,
    height: 16
  },
  item: {
    paddingTop: 5,
    paddingBottom: 9,
    paddingLeft: 12,
    paddingRight: 12,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
  },
  num_box: {
    marginLeft: 2, 
    marginTop: -1, 
    paddingLeft: 4, 
    paddingRight: 4,
    borderWidth: 'slimLine', 
    borderColor: '#fff', 
    borderRadius: 8
  }
});

/**
 * 预售报表
 */
module.exports = class Index extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    //计算当前月份前后一个月
    let startDate = new Date(),
      endDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 2);
    endDate.setDate(0);
    this.state = {
      // storeHouseName: '全部服务站',
      pageLoading: true,
      refreshing: true,
      startDate,
      endDate,
      storeHouseIds: [],   //已选择服务站ids
      marketDtoList: [],   //服务站列表
      presellOrderList: [] //预售商品列表
    }
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }
  /**
   * 前一天或者后一天
   * 前一天时num为-1  后天num为1
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  _getNextOrLastDay(num){
    let date = new Date(this.state.pickTime), selectDate;
    date.setDate(date.getDate() + num);
    selectDate = date.getMonth() + 1 > 9 ? `${date.getFullYear()}${date.getMonth() + 1}${date.Date()}` : `${date.getFullYear()}0${date.getMonth() + 1}${date.getDate()}`;
    this.changeState({
      selectDate,
      pickTimeDes: `${date.getMonth() + 1}月${date.getDate()}日`,
      pickTime: date.getTime()
    }, ()=> {
      this._getData();
    })
  }
  /**
   * 获取库存列表
   * @return {[type]} [description]
   */
  _getData = () =>{
    if(!this.state.pageLoading){
      this.changeState({
        refreshing: true
      })
    }
    let params = {
      queryAllPickhosue: true
    };
    if(this.state.storeHouseIds.length > 0){
      params['pickhouseIds'] = this.state.storeHouseIds;
      params['queryAllPickhosue'] = false;
    }
    if(this.state.pickTime){
      params['pickTime'] = this.state.pickTime
    }
    commonRequest({
      apiKey: 'queryPresellOrderReportKey', 
      objectName: 'presellOrderQueryDO',
      params: params
    }).then( (res) => {
      let data = res.data;
      console.log('dododdodood', data);
      let date = new Date(data.pickTime);
      this.changeState({
        pageLoading: false,
        refreshing: false,
        presellOrderList: data.presellOrderList,
        marketDtoList: data.marketDtoList,
        // selectDate: date.replace('-', '').replace('-', ''),
        pickTimeDes: `${date.getMonth() + 1}月${date.getDate()}日`,
        pickTime: data.pickTime
      });
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }
  /**
   * 头部右侧按钮
   * @date   2016-10-10
   * @return {[type]}   [description]
   */
  _renderRightBtn(){
    return(
      <Row style={[s.rightBtnWrap,{justifyContent: 'center'}]}>
        {
          this.state.storeHouseIds.length > 0 ?
            <Row>
              <SText numberOfLines={1} fontSize='mini' color='white'>
                服务站
              </SText>
              <View style={s.num_box}>
                <SText style={{fontSize: 10}} fontSize="mini" color="white" >{this.state.storeHouseIds.length}</SText>
              </View>
            </Row>
            :
            <SText numberOfLines={1} fontSize='mini' color='white'>全部服务站</SText>
        }
        <Image 
          style={[s.icon_right, {marginLeft: 1}]}
          source={ICON_RIGHT} />
      </Row>
    )
  }
  _selectDate = ()=> {
    this.navigator().push({
      callback: this._selectDateCallback,
      component: SelectDate,
      name: 'SelectDate',
      selectDate: this.state.selectDate,
      startDate: this.state.startDate,
      endDate: this.state.endDate
    })
  }

  /**
   * 选择时间-回调方法
   * @param  {[type]} date [description]
   * @return {[type]}      [description]
   */
  _selectDateCallback = (date) => {
    let dateArr = date.split('-'),
      year = dateArr[0],
      month = dateArr[1],
      day = dateArr[2];
    let selectDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    this.changeState({
      selectDate: date.replace('-', '').replace('-', ''),
      pickTimeDes: `${selectDate.getMonth() + 1}月${selectDate.getDate()}日`,
      pickTime: selectDate.getTime()
    }, ()=> {
      this._getData()
    })
  }
  /**
   * 选择服务站后的回调方法
   * @return {[type]} [description]
   */
  _selectStorehouseCallback = (ids, names)=> {
    this.changeState({
      // storeHouseName: ids.length === 0 ? '全部服务站' : `已选${ids.length}个服务站`,
      storeHouseIds: ids
    }, ()=> {
      this._getData();
    })
  }
  /**
   * [头部右侧按钮点击事件]
   * @date   2016-10-10
   * @return {[type]}   [description]
   */
  _rightEvent = () => {
    //当存在服务站列表时 才能跳转
    if(this.state.marketDtoList.length != 0){
      this.navigator().push({
        callback: this._selectStorehouseCallback,
        component: StoreHouseList,
        name: 'StoreHouseList',
        data: this.state.marketDtoList
      })
    }
  }
  /**
   * 预售列表-列渲染方法
   * @param  {[type]} rowData   [description]
   * @param  {[type]} sectionID [description]
   * @param  {[type]} rowID     [description]
   * @return {[type]}           [description]
   */
  _renderRow(rowData, sectionID, rowID){
    return (
      <View style={s.item}>
        <View>
          <SText fontSize="mini" color="999">{rowData.skuId}</SText>
        </View>
        <Row>
          <SText style={s.flex1} fontSize="mini" color="333">{rowData.itemName}</SText>
          <SText style={[s.width70, {marginRight: 24}]} fontSize="mini" color="333">{rowData.depositOrderNum === null ? '-' : rowData.depositOrderNum}</SText>
          <SText style={s.width70} fontSize="mini" color="333">{rowData.normalOrderNum === null ? '-' : rowData.normalOrderNum}</SText>
        </Row>
      </View>
    )
  }
  render(){
    return (
      <Page
        pageName='今日订单报表-预售报表'
        title='预售报表'
        pageLoading={this.state.pageLoading} 
        rightEvent={this._rightEvent}
        rightContent={this._renderRightBtn()}
        back={()=>this.navigator().pop()}
      >
        <Row style={s.header}>
          <Row 
            style={s.left_btn}
            onPress={()=>this._getNextOrLastDay(-1)}
          >
            <Image style={s.icon_left} source={ICON_LEFT} />
            <SText fontSize="mini" color="white">前一天</SText>
          </Row>
          <Row 
            onPress={this._selectDate}
            style={s.mid_btn}
          >
            <SText fontSize="mini" color="blue">提货日期 {this.state.pickTimeDes}</SText>
            <Image style={s.icon_cal} source={ICON_CAL} />
          </Row>
          <Row 
            onPress={()=>this._getNextOrLastDay(1)}
            style={s.right_btn}
          >
            <SText fontSize="mini" color="white">后一天</SText>
            <Image style={s.icon_right} source={ICON_RIGHT} />
          </Row>
        </Row>
        <Row style={s.list_header}>
          <SText style={s.flex1} fontSize="mini" color="999">商品名称</SText>
          <SText style={[s.width70, {marginRight: 24}]} fontSize="mini" color="999">定金订单(件)</SText>
          <SText style={s.width70} fontSize="mini" color="999">全款订单(件)</SText>
        </Row>
        <ListView
          style={{flex: 1, backgroundColor: '#fff'}}
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
          initialListSize={7}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.presellOrderList)}
          renderRow={this._renderRow} 
        />
      </Page>
    )
  }
}
