/**
 * @Author: willing
 * @Date:   2017-06-18T16:57:31+08:00
 * @Email:  zhangweilin@songxiaocai.com
 * @Project: sxf
 * @Last modified by:   willing
 * @Last modified time: 2017-06-26T20:44:49+08:00
 * @License: GNU General Public License（GPL)
 * @Copyright: ©2015-2017 www.songxiaocai.com 宋小菜 All Rights Reserved.
 */



import React from 'react';
import { View, Image, InteractionManager } from 'react-native';
import SVG, { Polyline } from 'react-native-svg';
import { SComponent, SText, SStyle } from 'sxc-rn';
import { Page, Button, SXCDatePicker, Row, Select } from 'components';
import ScrollableTabView , { ScrollableTabBar }from 'react-native-scrollable-tab-view';
import Svg, { Plogn } from 'react-native-svg';
import SelectDate from '../delivery/selectDate';//选择日期页面
import TotalCategoryList from './totalCategoryList';
import ForecastDetail from './forecastDetail';
import {
  ICON_RIGHT,
  ICON_LEFT,
  ICON_CAL
} from 'config';

const s = SStyle({
  header: {
    height: 42,
    backgroundColor: '#0087FF'
  },
  headerStyle: {
    backgroundColor: '#0087FF'
  },
  scrollableTabViewWrap: {
    flex: 1,
    backgroundColor: '#fff'
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
  tabbar: {
    height: 45
  }
})

module.exports = class ForecastSale extends SComponent{
  constructor(props){
    super(props);
    //计算当前月份前后一个月
    const now = new Date();
    const tomorrow = new Date((new Date()).setDate(now.getDate() + 1));
    startDate = new Date(),
    endDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    this.state = {
      pageLoading: true,
      categoryList: [],
      isHistory: false,
      selectedCatId: null,
      pickTime: +tomorrow,
      pickTimeDes: `${tomorrow.getMonth() + 1}月${tomorrow.getDate()}日 周${this.constructor.transWeekDay(tomorrow.getDay())}`,
      startDate,
      endDate,
    };
    this.rangeTime = this.constructor.getRangeTime();
  }
  static getRangeTime() {
    const now = new Date();
    const tomorrow = new Date((new Date()).setDate(now.getDate() + 1));
    const startTimeStr = [tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate()].join('/');
    const endTimeStr = [tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate() + 1].join('/');
    return {
      startTime: +new Date(startTimeStr),
      endTime: +new Date(endTimeStr),
    };
  }
  static transWeekDay(dayNum :Number){
    switch (dayNum) {
      case 0:
        return '日'
        break;
      case 1:
        return '一'
      case 2:
        return '二'
      case 3:
        return '三'
      case 4:
        return '四'
      case 5:
        return '五'
      case 6:
        return '六'
      default:
        break;
    }
  }
  componentDidMount(){
    InteractionManager.runAfterInteractions(() => {
      this._getUserHoldCategory();
    });
  }
  static transDateStr(time){
    let date = new Date(time);
    let dateStr = date.getMonth() + 1 > 9 ? `${date.getFullYear()}${date.getMonth() + 1}${date.Date()}` : `${date.getFullYear()}0${date.getMonth() + 1}${date.getDate()}`;
    return dateStr.replace('-', '').replace('-', '');
  }
  /**
   * [description 初始化获取核心品类]
   *
   */
  _getUserHoldCategory(){
    commonRequest({
      apiKey: 'salesForecastUserHoldCategoryListKey',
      objectName: 'userHoldCategoryQueryDO',
      params: {
        queryDt: this.state.pickTime
      }
    })
    .then((res) => {
      if(res.success){
        const _categoryList = res.data;
        this.setState({
          categoryList: _categoryList.map((cat) => ({name: cat.catName,value: cat.catId})),
          selectedCatId: _categoryList.length != 0 ? _categoryList[0].catId : null,
          selectedCatName: _categoryList.length != 0 ? _categoryList[0].catName : null,
          pageLoading: false
        },() => {
          this.TotalCategoryList._refresh();
          this.ForecastDetail._refresh();
        });
      }
    })
    .cath((err) => {
      console.log('error',err);
    })
  }

  _selectDate = ()=> {
    this.navigator().push({
      callback: this._selectDateCallback,
      component: SelectDate,
      name: 'SelectDate',
      selectDate: this.constructor.transDateStr(this.state.pickTime),
      startDate: this.state.startDate,
      endDate: this.state.endDate
    })
  }
  /**
   * 选择时间-回调方法
   * @param  {[type]} date [2017-06-06]
   * @return {[type]}      [description]
   */
  _selectDateCallback = (date :String) => {
    let dateArr = date.split('-'),
      year = dateArr[0],
      month = dateArr[1],
      day = dateArr[2];
    let selectDate = new Date(year, month - 1 , day, 0, 0, 0, 0);
    this.changeState({
      selectDate: date.replace('-', '').replace('-', ''),
      pickTimeDes: `${selectDate.getMonth() + 1 }月${selectDate.getDate()}日 周${this.constructor.transWeekDay(selectDate.getDay())}`,
      pickTime: +selectDate,
      isHistory: +selectDate < this.rangeTime.startTime
    },() => {
      this._getUserHoldCategory();
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
      pickTimeDes: `${date.getMonth() + 1}月${date.getDate()}日 周${this.constructor.transWeekDay(date.getDay())}`,
      pickTime: +date,
      isHistory: +date < this.rangeTime.startTime
    },() => {
      this._getUserHoldCategory();
    })
  }
  _reloadForecastDetail = () => {
    this.ForecastDetail._refresh();
  }
  _rightEvent = () => {
    if(this.state.categoryList.length !== 0) {
      this.setRouteData({
          dataList: this.state.categoryList,
          multiply: false,
          selectedData: this.state.selectedCatId,
          onChange: (selectedValue) => {
            if(!selectedValue){
              return;
            }
            this.changeState({
              selectedCatId: selectedValue,
              selectedCatName: this.state.categoryList.filter((cat) => cat.value === selectedValue)[0].name
            },() => {
              this.TotalCategoryList._refresh();
              this.ForecastDetail._refresh();
            });
          },
      }).push({
          type: 'modal',
          name: 'Select',
          component: Select
      })
    }
  }
  _renderRightBtn(){
    return (
      <View style={{flex: 1,flexDirection: 'row',alignItems: 'center'}}>
        <SText color='fff' fontSize='body' style={{marginRight: 5}}>{ this.state.categoryList.length !== 0 ? this.state.selectedCatName : '-' }</SText>
        {this.state.categoryList.length !== 0 ?
          <SVG width='5' height='4'>
            <Polyline
              points="0,0 5,0 2.5,4 0,0"
              fill="#fff"
              strokeWidth="0"
            />
          </SVG>
          :
          null
        }
      </View>
    )
  }
  _renderDatePicker(){
    return(
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
          <SText fontSize="mini" color="blue">{this.state.pickTimeDes}</SText>
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
    )
  }
  render(){
    return (
      <Page
        title='预报销量'
        headerStyle={s.headerStyle}
        pageLoading={this.state.pageLoading}
        rightEvent={this._rightEvent}
        rightContent={this._renderRightBtn()}
        back={()=>this.navigator().pop()}
      >
        {this._renderDatePicker()}
        <View style={s.scrollableTabViewWrap}>
            <ScrollableTabView
              locked={true}
              renderTabBar={(props) => (<ScrollableTabBar underlineHeight={2} style={s.tabbar}/>)}
              prerenderingSiblingsNumber={2}
              tabBarTextStyle={{
                fontSize: 15,
              }}
              tabBarBackgroundColor="#fff"
              tabBarActiveTextColor="#2296F3"
              tabBarInactiveTextColor="#999"
              tabBarUnderlineColor="#2296F3"
            >
              <TotalCategoryList
                ref={(ref) => {this.TotalCategoryList = ref}}
                tabLabel='品类总计'
                {...this.props}
                isHistory={this.state.isHistory}
                queryDate={this.state.pickTime}
                catId={this.state.selectedCatId}
                reloadForecastDetail={this._reloadForecastDetail}
              />
              <ForecastDetail
                ref={(ref) => {this.ForecastDetail = ref}}
                tabLabel='预估详情'
                isHistory={this.state.isHistory}
                queryDate={this.state.pickTime}
                catId={this.state.selectedCatId}
              />
            </ScrollableTabView>
        </View>
      </Page>
    )
  }
}
