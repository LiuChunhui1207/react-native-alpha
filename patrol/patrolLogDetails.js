/**
 *
 * 项目名称：caimi-rn
 * 文件描述：巡场日志 详情
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/5/22 14:04
 * 修改人：cfy
 * 修改时间：17/5/22 14:04
 * 修改备注：
 * @version
 */
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
import {SComponent, SStyle, SText,SItem} from 'sxc-rn';
import {Row,Page, Button,SXCModal,Refresh} from 'components';
import {str} from 'tools';
import {
  ICON_RIGHT,
  ICON_LEFT,
  ICON_CAL,
  IconLocationBlue,
  IC_LAUNCHER,
  IconForward,
  IconZanGray,
  IconSaw,
  IconZanBlue,
  IconDropSelect
} from 'config';
import Echarts from 'native-echarts';
import DeepCopy from 'lodash'

import SelectDate from '../delivery/selectDate';
import CreatePatorlLog from './createPatorlLog';
import ProductList from './product_list'

const Dimensions = require('Dimensions');
const { width } = Dimensions.get('window');

let s = SStyle({
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
    marginTop: 10,
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
  header: {
      height: 42,
      flexDirection: 'row',
      backgroundColor: '#2C98F0'
  },
  leftBtn: {
      flex: 1,
      flexDirection: 'row',
      width: 70,
      alignItems: 'center'
  },
  rightBtn: {
      flex: 1,
      flexDirection: 'row',
      width: 70,
      alignItems: 'center',
      justifyContent: 'flex-end'
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
  mid_btn: {
      marginTop: 6,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: 'ccc',
      alignItems: 'center',
      justifyContent: 'center',
      width: 148,
      backgroundColor: '#fff',
      height: 30,
      borderRadius: 2
  },
  font_styl: {
      fontSize: 12,
      color: '#fff'
  },
  icon_cal: {
      marginLeft: 6,
      width: 16,
      height: 16
  },
  border_bottom:{
      borderColor:'#f7f7fa',
      borderBottomWidth:1,
  },
  row_item:{
      flexDirection:'row',
      alignItems:'center'
  },
  tab:{
      height:45,
      backgroundColor:'#fff',
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'center',
      flex:1
  },
  iconLocation:{
      width:11,
      height:15
  },
  text:{
      paddingLeft:15,
      paddingRight:15,
      paddingBottom:10,
      paddingTop:10,
      backgroundColor:'fff'
  },
  itemTitle: {
      flex:1,
      paddingLeft:15,
      paddingTop:7,
      paddingBottom:7,
      backgroundColor:'#fafafa',
      marginTop:5
  },img:{
      width:75,
      height:75
  },
  checkBoxBgNor:{
      width:60,
      height:30,
      backgroundColor:'#fff',
      justifyContent:'center',
      alignItems:'center'
  },
  checkBoxBg:{
      width:60,
      height:30,
      backgroundColor:'#2094F3',
      justifyContent:'center',
      alignItems:'center'
  },
    //价格行情
  materialRow: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 11,
    paddingBottom: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: '#eee',
    borderTopWidth: 'slimLine',
  },
  materialIndex: {
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#00BF00',
    borderRadius: 3,
  },
  yuanliao: {
    fontSize: 'mini_plus',
    lineHeight: 18,
    color: '#fff',
  },
  materialName: {
    fontSize: 'caption_plus',
    color: '#021D33',
    marginLeft: 5,
    fontFamily: 'PingFangSC-Medium',
  },
  materialNum: {
    fontSize: 'mini_plus',
    color: '#021D33',
    opacity: 0.54,
  },
  forward: {
    width: 7,
    height: 12,
    marginLeft: 10
  },
  spaceLine: {
    padding: 0,
    marginLeft: 15,
    marginRight: 15,
    height: 1,
    backgroundColor: '#eee',
  },
  priceRow: {
    marginTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 'slimLine',
    borderBottomColor: '#eee',
  },
  priceItem: {
    flex: 1,
  },
  priceNum: {
    marginLeft: 15,
    fontSize: 19,
    color: '#021D33',
    fontFamily: 'PingFangSC-Medium',
  },
  priceDesc: {
    marginLeft: 15,
    marginTop: 2,
    fontSize: 'mini_plus',
    color: '#021D33',
    opacity: 0.54
  },

  //互动记录
  interRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5'
  },
  interTime: {
    fontSize: 'mini_plus',
    letterSpacing: 0.37,
    color: '#021D33',
    lineHeight: 16
  },
  iconZan: {
    width: 15,
    height: 15,
  },
  zan: {
    fontSize: 'tiny_plus',
    color: '#999',
    marginLeft: 6,
  },
  zanRow: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  iconView: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
  manSaw: {
    width: '@window.width-50'
  },

  //标题栏下拉选择
  dropDown: {
    width: 8,
    height: 2.8,
  },
  title: {
    fontSize: 'body_plus', 
    color: '#fff',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalInnerContainer: {
    width: '@window.width',
    backgroundColor: '#fff',
    zIndex: 2,
    },
  });
//图表样式
let mOption = {
  backgroundColor:'#fff',
  title: {
      text: '',
      left:'center',
      textStyle:{
          color:'#444A4E',
          fontSize:14
      },
      show:false
  },
  legend: {
      show:false,
  },
  tooltip:{
      //是否显示提示框组件，包括提示框浮层
      show:false
  },
  xAxis: {
      // data: [],

      //坐标轴
      axisLine:{
          show:false
      },
      //坐标轴刻度
      axisTick:{
          show:false,
      },
      //刻度标签
      axisLabel:{
          textStyle:{
              fontSize:10,
              color:'#D4D8DC'
          }
      }
  },
  yAxis: {
      show:false,
      min:0
  },
  grid:{
      left:0,
      top:20,
      rigth:0,
      bottom:30,
      width:width

  },
  series: [{
      type: 'line',
      data: [],
      itemStyle:{//曲线线条色
          normal:{
              color:(params)=>{
                  if (params.dataIndex==6) {
                      return '#F6BC54'
                  }else {
                      return '#78C3FB'
                  }
              }
          }
      },
      lineStyle:{
          normal:{
              color:'#5AB5F9'
          }
      },
      smooth:true,//曲线是否圆滑
      areaStyle:{ //填充色
          normal:{
              color:'#E8F3FC',
          }
      },
      symbolSize:10,//标记大小
      label:{
          normal:{
              show:true,
              textStyle:{
                  color:'#374C5C',
                  fontSize:10,
              }
          }
      }
  }]
};
let xData=[
  ["05-10","05-11","05-12","05-13","05-14","05-15","05-16"],
  ["04-10","04-11","04-12","04-13","04-14","04-15","04-16"]
];
let yData=[
  [5.6, 5.3, 5.5, 5.2, 5.6, 5.7,5.8],
  [4.6, 4.3, 4.5, 4.2, 4.6, 4.7,4.8],
]

//拿货价单位 元/件
const  PRICR_UNIT_OF_PIECE=1;
//拿货价单位 元/斤
const PRICR_UNIT_OF_WEIGHT=2;

module.exports = class PatrolLogDetails extends SComponent{
  constructor(props){
    super(props);
    //计算当前月份前后一个月
    let startDate = new Date(),
        endDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 2);
    endDate.setDate(0);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.priceQuotationMaterials = [],
    this.state={
      pageLoading:true,
      selectedDateStr:'',
      priceUnitType:PRICR_UNIT_OF_PIECE,
      pageMarketHeadName:'一批行情',
      startDate,
      endDate,
      curTabId:0,
      //图表信息
      wholeMarketChartEntity: {},
      //价格波动
      priceFluctuateEntities: [],
      //图片
      goodsQualityImages: [],
      goodsNumFluctuateEntities: [],
      pieceWCPatrolSpuDetailDTOS: [],
      jinWCPatrolSpuDetailDTOS: [],
      noData: true,
      priceQuotationMaterials: [],
      interactionRecordDTO: {},
      materialId: '',
      marketName: '',
      storeHouseList: this._ds.cloneWithRows([]),
      showOption: false,
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getStoreHouseData();
    })
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.state.catId != prevState.catId) {
  //     this._getWebData();
  //   }
  // }

  //查询市场列表
  _getStoreHouseData=(endRefrsh)=>{
    commonRequest({
      apiKey: 'queryVirtualStorehousesKey',
      objectName: 'patrolDiaryQueryDO',
      params: {}
    }).then( (res) => {
      let storeHouseList = res.data;
      this.marketCityCode = storeHouseList[0].key,
      this.changeState({
        pageLoading: false,
        marketName: storeHouseList[0].value,
        storeHouseList: this._ds.cloneWithRows(storeHouseList ? storeHouseList : []),              
      });
      endRefrsh? endRefrsh() : null;
      this._getWebData();
    }).catch( err => {
      this.changeState({
        pageLoading:false,
        noData:true,    
      });
      endRefrsh? endRefrsh() : null;
    })
  }
    
  //这里是三个模块的共有接口
  _getWebData=(endRefrsh)=>{
    commonRequest({
      apiKey: 'queryPatrolDiaryDetailKey',
      objectName: 'patrolDiaryQueryDO',
      params: {
        catId: this.props.route.data.catId,
        dateTime: this.state.dateTime ? this.state.dateTime : '',
        patrolDiaryId: this.props.route.data.patrolDiaryId,
        marketCityCode: this.marketCityCode,
      }
    }).then( (res) => {
      let {data} = res;
      let date = new Date(data.dateTime);
      let selectedDateStr = `${date.getMonth() + 1}月${date.getDate()}日`+this._getWeekDes(date.getDay());
      let priceQuotationMaterials = res.data.priceQuotationMaterials;
      this.priceQuotationMaterials = res.data.priceQuotationMaterials;
      this.changeState({
        pageLoading: false,
        noData: false,
        ...data,
        selectedDateStr,
        priceQuotationMaterials: this._ds.cloneWithRows(priceQuotationMaterials ? priceQuotationMaterials : []),
        interactionRecordDTO: res.data.interactionRecordDTO,              
      });
      endRefrsh? endRefrsh() : null;
    }).catch( err => {
      this.changeState({
        pageLoading:false,
        noData:true,
      });
      endRefrsh? endRefrsh() : null;
    })
  }

  //点赞
  _getDzData = () => {
    commonRequest({
      apiKey: 'dzKey',
      objectName: 'patrolDiaryQueryDO',
      params: {
          patrolDiaryId: this.state.patrolDiaryId
      }
    }).then( (res) => {
      this.like = res.data
    }).catch( err => {
      Toast.show(err.errorMessage);
    })
  }
    
  //取消点赞
  _getCancelDzData = () => {
    commonRequest({
      apiKey: 'cancelDzKey',
      objectName: 'patrolDiaryQueryDO',
      params: {
          patrolDiaryId: this.state.patrolDiaryId
      }
    }).then( (res) => {
      this.like = res.data
    }).catch( err => {
      Toast.show(err.errorMessage);
    })
  }

  /**
   * @Description: 日期选择
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/5/22 14:17
   */
  _renderDate(){
    return(
      <View style={s.header}>
        <TouchableOpacity
          style={s.leftBtn}
          onPress={()=>this._getNextOrLastDay(-1)}
        >
          <Image style={s.icon_left} source={ICON_LEFT} />
          <SText style={s.font_styl} fontSize="mini" color="#fff">前一天</SText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={()=>this._selectDate()}
          style={s.mid_btn}
        >
          <SText  fontSize="mini" color="blue">{this.state.selectedDateStr}</SText>
          <Image style={s.icon_cal} source={ICON_CAL} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={()=>this._getNextOrLastDay(1)}
          style={s.rightBtn}
        >
          <SText style={s.font_styl} fontSize="mini" color="#fff">后一天</SText>
          <Image style={s.icon_right} source={ICON_RIGHT} />
        </TouchableOpacity>
      </View>
    )
  }

  _getWeekDes=(day)=>{
    switch (day){
      case 0:
        return ' 周日';
      case 1:
        return ' 周一';
      case 2:
        return ' 周二';
      case 3:
        return ' 周三';
      case 4:
        return ' 周四';
      case 5:
        return ' 周五';
      case 6:
        return ' 周六';
    }
  }

  _getNextOrLastDay(num){
    let date = new Date(this.state.dateTime), selectedDate;
    date.setDate(date.getDate() + num);
    selectedDate = date.getMonth() + 1 > 9 ? `${date.getFullYear()}${date.getMonth() + 1}${date.Date()}` : `${date.getFullYear()}0${date.getMonth() + 1}${date.getDate()}`;
    this.changeState({
      dateTime: date.getTime(),
      selectedDateStr: `${date.getMonth() + 1}月${date.getDate()}日`+this._getWeekDes(date.getDay())
    }, ()=> {
      this._getWebData();
    })
  }

  _selectDate = ()=> {
    let selectDate= str.date(this.state.dateTime||'0').format('ymd');
    this.navigator().push({
      callback: this._selectDateCallback,
      component: SelectDate,
      name: 'SelectDate',
      selectDate: selectDate,
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
    //如果是同一天 则不请求新数据
    if(selectDate.getTime()==this.state.dateTime){
      return
    }
    this.changeState({
      dateTime: selectDate.getTime(),
      selectedDateStr: `${selectDate.getMonth() + 1}月${selectDate.getDate()}日`+this._getWeekDes(selectDate.getDay()),
      // pickTime: selectDate.getTime()
    }, ()=> {
      this._getWebData()
    })
  }

  /**
   * @Description: 导航tab
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/5/23 11:45
   */
  _renderTabs=()=>{
    return(
      <Row style={s.border_bottom}>
        <TouchableOpacity
          style={s.tab}
          onPress={()=>{
            this.getRef('scrollView')('scrollTo')({x: 0, y: 0, animated: true});
            this.changeState({
                curTabId: 0,
            });
          }}>
          {this.state.curTabId==0?<Image source={IconLocationBlue} style={s.iconLocation}/>:null}
          <SText fontSize='body' color={this.state.curTabId==0?'#4A90E2':'#5F646E'} style={{marginLeft:3}}>市场行情</SText>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.tab}
          onPress={() => {
            this.getRef('scrollView')('scrollTo')({ x: 0, y: this.state.moduleBazaarHeight, animated: true });
            this.changeState({
                curTabId: 1,
            });
          }}
        >
          {this.state.curTabId == 1 ? <Image source={IconLocationBlue} style={s.iconLocation} /> : null}
          <SText fontSize="body" color={this.state.curTabId == 1 ? '#4A90E2' : '#5F646E'} style={{ marginLeft: 3 }}>价格行情</SText>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.tab}
          onPress={() => {
            this.getRef('scrollView')('scrollTo')({ x: 0, y: this.state.moduleBazaarHeight + this.state.modulePriceHeight, animated: true });
            this.changeState({
                curTabId: 2,
            });
          }}
      >
          {this.state.curTabId == 2 ? <Image source={IconLocationBlue} style={s.iconLocation} /> : null}
          <SText fontSize="body" color={this.state.curTabId == 2 ? '#4A90E2' : '#5F646E'} style={{ marginLeft: 3 }}>互动记录</SText>
        </TouchableOpacity>
      </Row>
    )
  }
    
  /**
   * @Description:  头部右边按钮
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/5/19 11:52
   */
  _renderRightBtn=()=>{
    return(
      <SText fontSize='caption' color='fff'>更新</SText>
    )
  }

  /**
   * @Description: 右边按钮点击事件
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/5/19 11:54
   */
  _rightEvent=()=>{
    this.navigator().push({
      component: CreatePatorlLog,
      name: 'CreatePatorlLog',
      refresh:this._getWebData,
      data:{
        catId:this.props.route.data.catId,
        patrolDiaryId:this.props.route.data.patrolDiaryId
      }
    })
  }
  
  //渲染主体内容
  _renderBody(){
    return(
      <ScrollView
        ref='scrollView'
        onScroll={this._onScroll}
      >
        {this._renderBazaar()}
        {this._renderPrice()}
        {this._renderInteraction()}
      </ScrollView>
    )
  }

  render(){
    return(
      <Page
        title={this._renderTitle()}
        pageName='巡场日志详情'
        pageLoading={this.state.pageLoading}
        rightEvent={this._rightEvent}
        rightContent={this._renderRightBtn()}
        back={()=>this.navigator().pop()}
      > 
        {this._renderDate()}
        {this.state.noData?null:this._renderTabs()}
        {this.state.noData?null:this._renderBody()}
        {this._renderOption()}
      </Page>
    )
  }

  //渲染标题
  _renderTitle = () => {
    return(
    <TouchableOpacity style={{justifyContent: 'flex-start', alignItems: 'center', width: width-150}} onPress={() => this.changeState({ showOption: true})}>
      <SText style={s.title}>{this.state.marketName}</SText>
      <Image source={IconDropSelect} style={s.dropDown} />
    </TouchableOpacity>
    )
  }

  //显示包括市场列表的遮罩层
  _renderOption = () => {
    if (this.state.showOption) {
      return (
        <TouchableOpacity style={s.modalContainer} onPress={() => this.changeState({ showOption: !this.state.showOption})}>
          <View style={s.modalInnerContainer}>
            <ListView
              dataSource={this.state.storeHouseList}
              renderRow={this._renderCat}
              initialListSize={10}
              enableEmptySections={true}
            />
          </View>
        </TouchableOpacity>
      )
    }
  }

  //渲染市场列表，包含各项的点击事件
  _renderCat = (rowData, sectionID, rowID) => {
    return(
      <TouchableOpacity
        style={{
          height: 45,
          width: width,
          borderBottomWidth: 0.5,
          borderColor: '#e5e5e5',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingLeft: 15,
        }}
        onPress={() => {
          this.changeState({
            showOption: false, 
            marketName: rowData.value, 
          });
          this.marketCityCode = rowData.key, 
          this._getWebData();
        }}
      >
        <SText fontSize='body' color='333'>{rowData.value}</SText>
      </TouchableOpacity>
    )
  }

  /**
   * @Description:  市场行情
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/5/22 18:07
   */
  _renderBazaar(){
    return(
      <View
        ref="bazaar"
        onLayout={(event)=>{this.state.moduleBazaarHeight=event.nativeEvent.layout.height}}
      >   
        <Row style={s.listHeader}>
          <Row style={s.listHeaderLeft}>
            <SText style={[s.listHeaderTitle,{marginLeft: 0}]}>售卖建议</SText>
          </Row>
        </Row>
        <SText fontSize='body' color='333' style={[s.text]}>{this.state.saleSuggestions}</SText>

        <Row style={s.listHeader}>
          <Row style={s.listHeaderLeft}>
            <View style={s.headerMark} />
            <SText style={s.listHeaderTitle}>价格行情</SText>
          </Row>
        </Row>
        <View style={{backgroundColor:'#fff',paddingTop:15}}>
          <Row style={{marginBottom:5}}>
              <SText fontSize='caption' color='#22394C' style={{flex:1,marginLeft:15}} >{this.state.wholeMarketChartEntity.chartTopic}</SText>
              <SText fontSize='mini' color='#22394C' style={{flex:1,textAlign:'right',marginRight:15}} >{this.state.wholeMarketChartEntity.priceTendencyDesc}</SText>
          </Row>
          <Echarts option={this._getOption()} height={130}  />
          <SText fontSize='caption' color='#82909B' style={{marginLeft:15}} >{this.state.wholeMarketChartEntity.chartRemark}</SText>
          <SText fontSize='body' color='333' style={[s.text]}>{this.state.fluctuateRemark}</SText>
            {
              this.state.priceFluctuateEntities.length == 1 
              ? null 
              : <View>
                <Row style={s.listHeader}>
                  <Row style={s.listHeaderLeft}>
                    <SText style={[s.listHeaderTitle,{marginLeft: 0}]}>价格波动</SText>
                  </Row>
                </Row>
                <View style={{backgroundColor:'#FAFAFA',marginLeft:15,marginRight:15,margin:15,paddingLeft:15,paddingRight:15,paddingTop:15,borderRadius:5}}>
                  {
                    this.state.priceFluctuateEntities.map((item,index)=>{
                      return(
                        <Row >
                          <View style={{justifyContent:'center',alignItems:'center'}}>
                            <View style={{borderRadius:5,height:10,width:10,borderColor:'#6EC0FE',borderWidth:1}}/>
                            <View style={{height:25,width:1,borderColor:'#6EC0FE',borderLeftWidth:1}}/>
                          </View>
                          <SText fontSize='caption' color='#73828E' style={{marginLeft:5}}>{item.fluctuateTime}</SText>
                          <SText fontSize='caption' color='333' style={{marginLeft:10}}>{item.priceFluctuateDesc}</SText>
                        </Row>
                      )
                    })
                  }
                </View>
              </View>
            }
            </View>

              <Row style={s.listHeader}>
                <Row style={s.listHeaderLeft}>
                  <View style={s.headerMark} />
                  <SText style={s.listHeaderTitle}>到货量行情</SText>
                </Row>
              </Row>
                <View style={{backgroundColor:'#fff',paddingLeft:15,paddingRight:15}}>
                    <SItem
                        disabled={true}
                        content='整体库存'
                        contentStyle={{fontSize:15,color:'#999'}}
                        label={this.state.wholeStockNum}
                        labelStyle={{fontSize:15,color:'#333'}}
                        style={{paddingLeft:0,paddingRight:0}}
                    />
                    <SItem
                        disabled={true}
                        content='新到货'
                        contentStyle={{fontSize:15,color:'#999'}}
                        label={this.state.newGoodsNum}
                        labelStyle={{fontSize:15,color:'#333'}}
                        style={{paddingLeft:0,paddingRight:0}}
                    />
                    <SItem
                        disabled={true}
                        content='今日销货速度'
                        contentStyle={{fontSize:15,color:'#999'}}
                        label={this.state.goodsSaleSpeed}
                        labelStyle={{fontSize:15,color:'#333'}}
                        style={{paddingLeft:0,paddingRight:0}}
                    />
                    <SItem
                        disabled={true}
                        content='预估库存'
                        contentStyle={{fontSize:15,color:'#999'}}
                        label={this.state.estimateStockTendency}
                        labelStyle={{fontSize:15,color:'#333'}}
                        style={{paddingLeft:0,paddingRight:0}}
                    />
                    {
                        this.state.goodsNumFluctuateEntities.length == 1 ? null : 
                        <View>
                            <SText fontSize='caption' color='999' style={{marginTop:10}} >到货量波动</SText>
                            <View style={{backgroundColor:'#FAFAFA',marginLeft:15,marginRight:15,margin:15,paddingLeft:15,paddingRight:15,paddingTop:15,borderRadius:5}}>
                                {
                                    this.state.goodsNumFluctuateEntities.map((item,index)=>{
                                        return(
                                            <Row >
                                                <View style={{justifyContent:'center',alignItems:'center'}}>
                                                    <View style={{borderRadius:5,height:10,width:10,borderColor:'#6EC0FE',borderWidth:1}}/>
                                                    <View style={{height:25,width:1,borderColor:'#6EC0FE',borderLeftWidth:1}}/>
                                                </View>
                                                <SText fontSize='caption' color='#73828E' style={{marginLeft:5}}>{item.fluctuateTime}</SText>
                                                <SText fontSize='caption' color='333' style={{marginLeft:10}}>{item.numFluctuateDesc}</SText>
                                            </Row>
                                        )
                                    })
                                }
                            </View>
                        </View>
                    }
                </View>

                <Row style={s.listHeader}>
                  <Row style={s.listHeaderLeft}>
                    <View style={s.headerMark} />
                    <SText style={s.listHeaderTitle}>质量行情</SText>
                  </Row>
                </Row>
                <View style={{backgroundColor:'#fff',padding:15}}>
                    <Row>
                        {
                            this.state.goodsQualityImages.map((item,index)=>{
                                return(
                                    <Image style={[s.img,{marginRight:10}]} source={{uri:item.img}}/>
                                )
                            })
                        }
                    </Row>
                    <Row style={{marginTop:10}} >
                        <SText fontSize='caption' color='#5F646E' >总体质量差:</SText>
                        <SText fontSize='caption' color='333' style={{marginLeft:5}}>{this.state.imperfectProperties}</SText>
                    </Row>
                    <SText fontSize='caption' color='#5F646E' style={{marginTop:5}}  >{this.state.goodsQualityDesc}</SText>
                    <SText fontSize='body' color='333' style={[s.text,{paddingLeft:0}]}>{this.state.goodsQualityRemake}</SText>
                </View>
            </View>
        )
    }

  //价格行情
  _renderPrice = () => {
    return (
      <View
        ref='price'
        onLayout={(event) => {
        this.state.modulePriceHeight = event.nativeEvent.layout.height;
        }}
      >    
        <Row style={{ alignItems: 'center', justifyContent: 'center', height: 40, backgroundColor: '#E5E5E5' }}>
          <View style={{ height: 1, width: 40, borderColor: '#CDD0D2', borderTopWidth: 1 }} />
          <SText fontSize="caption_plus" color="#6A7883" style={[{ marginLeft: 3, marginRight: 3 }]}>价格行情(元/斤)</SText>
          <View style={{ height: 1, width: 40, borderColor: '#CDD0D2', borderTopWidth: 1 }} />
        </Row>
        <ListView
          dataSource={this.state.priceQuotationMaterials}
          renderRow={this._renderPriceRow}
          initialListSize={10}
          enableEmptySections={true}
        />
      </View>
    )
  }
  
  //价格行情列表
  _renderPriceRow = (rowData, sectionID, rowID) => {
    return(
      <View style={rowID == this.priceQuotationMaterials.length - 1 ? {backgroundColor: '#fff'} : { backgroundColor: '#fff', marginBottom: 10 }}>
        <TouchableOpacity style={s.materialRow} onPress={() => {this._jumpToProductList(rowData.materialId)}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={s.materialIndex}>
              <SText style={s.yuanliao}>原料</SText>
            </View>
            <SText style={s.materialName}>{rowData.materialName}</SText>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <SText style={s.materialNum}>{rowData.itemNumDesc}</SText>
            <Image source={IconForward} style={s.forward}/>
          </View>
        </TouchableOpacity>
        <View style={s.spaceLine} />
        <Row style={s.priceRow}>
          <View style={[s.priceItem,{borderRightWidth: 0.5, borderRightColor: '#eee'}]}>
            <SText style={s.priceNum}>{rowData.sxcPriceDesc}</SText>
            <SText style={s.priceDesc}>小菜价</SText>
          </View>
          <View style={[s.priceItem,{borderRightWidth: 0.5, borderRightColor: '#eee'}]}>
            <SText style={s.priceNum}>{rowData.marketInquiryPriceDesc}</SText>
            <SText style={s.priceDesc}>一批市场价</SText>
          </View>
          <View style={s.priceItem}>
            <SText style={[s.priceNum,{opacity: 0.54}]}>{rowData.materialInquiryPriceDesc}</SText>
            <SText style={s.priceDesc}>产地原料价</SText>
          </View>
        </Row>
      </View>
    )
  }
  
  //跳转到商品列表
  _jumpToProductList = (materialId) => {
    this.setRouteData({
      lspuId: materialId,
      dateTime: this.state.dateTime,
      saleCityCode: this.marketCityCode
    }).push({
      component: ProductList,
      name: 'ProductList'
    });
  }
  
  //互动中心模块
  _renderInteraction = () => {
    return(
      <View
        ref='interaction'
        style={{marginBottom: 44}}
        onLayout={(event) => {
          this.state.moduleinteractionHeight = event.nativeEvent.layout.height;
        }}
      >
        <Row style={{ alignItems: 'center', justifyContent: 'center', height: 40, backgroundColor: '#E5E5E5' }}>
          <View style={{ height: 1, width: 40, borderColor: '#CDD0D2', borderTopWidth: 1 }} />
          <SText fontSize="caption_plus" color="#6A7883" style={[{ marginLeft: 3, marginRight: 3 }]}>互动记录</SText>
          <View style={{ height: 1, width: 40, borderColor: '#CDD0D2', borderTopWidth: 1 }} />
        </Row>
        {this._renderInteractionRow()}
      </View>
    )
  }
  
  //查看与点赞模块
  _renderInteractionRow = () => {
    return(
      <View style={{backgroundColor: '#fff'}}>
        <View style={s.interRow}> 
          <SText style={s.interTime}>{this.state.interactionRecordDTO.ownerInfo}</SText>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} 
            onPress={() => {
              this.state.interactionRecordDTO.like ? this._getCancelDzData() : this._getDzData();
              this._getWebData();
            }}
          >
            {
              this.state.interactionRecordDTO.like
              ? <Image source={IconZanBlue} style={s.iconZan}/> 
              : <Image source={IconZanGray} style={s.iconZan}/>
            }
            {
              this.state.interactionRecordDTO.like
              ? <SText style={[s.zan,{color: '#1485CE'}]}>赞</SText>
              : <SText style={s.zan}>赞</SText>
            }
          </TouchableOpacity>
        </View>
        {
          this.state.interactionRecordDTO.fwList !== '' 
          ? <Row style={[s.zanRow,{paddingTop: 10, paddingBottom: 11}]}>
              <Image source={IconSaw} style={s.iconView} />
              <View style={s.manSaw}>
                <SText style={[s.interTime,{opacity: 0.54}]} numberOfLines={10}>{this.state.interactionRecordDTO.fwList}</SText>
              </View>
          </Row> 
          : null
        }
        {
          this.state.interactionRecordDTO.dzList !== '' 
          ? <Row style={[s.zanRow,{paddingBottom: 12}]}>
              <Image source={IconZanBlue} style={s.iconView} />
              <View style={s.manSaw}>
                <SText style={[s.interTime,{opacity: 0.54}]} numberOfLines={10}>{this.state.interactionRecordDTO.dzList}</SText>
              </View>
          </Row> 
          : null
        }
      </View>
    )
  }
   
  /**
   * @Description: 获取图标数据
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/5/19 15:10
   */
  _getOption(){
    let option= DeepCopy.cloneDeep(mOption);
    if (this.state.wholeMarketChartEntity){
      option.xAxis.data=this.state.wholeMarketChartEntity.chartDates;
      option.yAxis.min=this.state.wholeMarketChartEntity.minHign;
      option.series[0].data=this.state.wholeMarketChartEntity.chartNums;
    }
    return option
  }

  /**
   * @Description:  滚动导航tab切换
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/5/23 14:19
   */
  _onScroll=(e)=>{
    if (e.nativeEvent.contentOffset.y < this.state.moduleBazaarHeight-1 && this.state.curTabId != 0){
      this.changeState({
          curTabId:0
      })
    }else if (this.state.moduleBazaarHeight - 1 < e.nativeEvent.contentOffset.y < this.state.modulePriceHeight - 1 && this.state.curTabId != 1) {
      this.changeState({
          curTabId: 1,
      });
    } else if (e.nativeEvent.contentOffset.y >= this.state.modulePriceHeight - 1 && this.state.curTabId != 2) {
      this.changeState({
          curTabId: 2,
      });
    }
  }
}



/**
 * modal层内容组件
 */
// class ModalContent extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       pageLoading:true,
//     }
//   }

//   componentDidMount() {
//     InteractionManager.runAfterInteractions( () => {
//       this._getWebData();
//     })
//   }

//   _getWebData(){
//     commonRequest({
//       apiKey: 'queryPatrolDiarySupplierDetailKey',
//       objectName: 'patrolSupplierQueryDO',
//       params: this.props.params
//     }).then( (res) => {
//       let {data} = res;
//       this.setState({
//         pageLoading:false,
//         ...data
//       });
//     }).catch( err => {
//       this.setState({
//         pageLoading:false,
//         ...data
//       });
//     })
//   }

//     render() {
//        if (this.state.pageLoading){
//            return null
//        }else {
//            return (
//                <TouchableOpacity
//                    activeOpacity={1}
//                    style={{backgroundColor:'#fff',padding:15,width:width-60,justifyContent:'center'}}>
//                    <Row style={[s.border_bottom,{paddingBottom:15}]}>
//                        <Row style={{alignItems:'flex-end',flex:1}}>
//                            <SText fontSize='body' color='#646972'>{this.state.supplierName}</SText>
//                            <SText fontSize='caption' color='999' style={{marginLeft:10}}>{this.state.supplierAddress}</SText>
//                        </Row>
//                        <TouchableOpacity
//                            onPress={()=>this.props.sxcmodal._toggle()}
//                            style={{justifyContent:'flex-end',alignItems:'flex-end',width:30}}>
//                            <SText fontSize='body' color='999'>x</SText>
//                        </TouchableOpacity>
//                    </Row>
//                    <Row style={[s.border_bottom,{paddingTop:15,paddingBottom:15}]}>
//                        <SText fontSize='caption' color='666'>{'新到货 '+this.state.newGoodsDesc} </SText>
//                        <SText fontSize='caption' color='666' style={{marginLeft:40}}>{'日均销售量 '+this.state.avgSaleDesc}</SText>
//                    </Row>
//                    {
//                        str.isEmpty(this.state.goodsImages)?null
//                            :
//                            <View
//                                style={{marginTop:10,height:76}}>
//                                <ScrollView
//                                    horizontal={true}
//                                    showsHorizontalScrollIndicator={false}>
//                                    {
//                                        this.state.goodsImages.map((item,index)=>{
//                                            return(
//                                                <Image source={{uri:item.img}} style={{width:76,height:76,marginRight:10}}/>
//                                            )})
//                                    }
//                                    </ScrollView>
//                            </View>
//                    }
//                    <SText fontSize='caption' color='666'  style={{marginTop:10}}>{this.state.detailRemark}</SText>
//                    <SText fontSize='mini' color='999'  style={{marginTop:10,marginBottom:10}}>{this.state.gmtModified}</SText>
//                    {
//                        str.isEmpty(this.state.wCPatrolSupplierSpuDetailDTOS)?null
//                            :
//                        this.state.wCPatrolSupplierSpuDetailDTOS.map((item,index)=>{
//                            return(
//                                <View style={{borderTopWidth:1,borderColor:'#f7f7fa',height:60,justifyContent:'center'}}>
//                                    <Row style={{alignItems:'center'}}>
//                                        <SText fontSize='caption' color='#032744' style={{flex:1}}>{item.spuName}</SText>
//                                        <SText fontSize='caption' color='#8192A0' >存货</SText>
//                                        <SText fontSize='caption' color='#032744'  style={{marginLeft:5}}>{item.oldGoodsNumDesc}</SText>
//                                    </Row>
//                                    <Row style={{marginTop:10}}>
//                                        <SText fontSize='mini' color='666'>{item.coreUserPrice} </SText>
//                                        <SText fontSize='mini' color='666' style={{marginLeft:20}}>{item.normalUserPrice} </SText>
//                                    </Row>
//                                </View>
//                            )
//                        })
//                    }
//                </TouchableOpacity>
//            )
//        }

//     }
// }