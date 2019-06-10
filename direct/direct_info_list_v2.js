/**
 *
 * 项目名称：captain-rn
 * 文件描述：直发看板 二期 覆盖一期
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：2017/8/10 17:50
 * 修改人：cfy
 * 修改时间：2017/8/10 17:50
 * 修改备注：
 * @version
 */
import {
  View,
  Image,
  TouchableOpacity,
  InteractionManager,
  ScrollView,
  ListView,
  RefreshControl,
  ART,
  PixelRatio
} from 'react-native'
import React from 'react'
import { SComponent, SStyle, SText } from 'sxc-rn'
import { Page, Refresh,Row } from 'components'
import { str } from "tools"
import Dimensions from 'Dimensions'
import {UtilsAction} from 'actions'
import {IconEditBlue,IconCarGray,IconCarBlue,IconCarOrange} from 'config'
import DirectPlanInfoDetails from './details/directPlanInfoDetails'
import DirectLogisticsDetail from './details/directLogisticsDetail'
import DirectPlanGoodsDetails  from './details/directPlanGoodsDetails'
import SupplierList from '../supplier/supplierList'
let { height, width }= Dimensions.get('window')
const BLUE = '#2296F3'

let s = SStyle({
  container: {
    flex:1
  },
  circle_white:{
    width:30,
    height:30,
    borderRadius:15,
    backgroundColor:'#fff',
    justifyContent:'center',
    alignItems:'center'
  },
  day_uncheck:{
    width:30,
    height:30,
    justifyContent:'center',
    alignItems:'center'
  },
  day:{
    width:(width-20)/7,
    backgroundColor:BLUE,
    alignItems:'center'
  },
  dot_white:{
    width:6,
    height:6,
    borderRadius:3,
    backgroundColor:'#fff'
  },
  direct_item:{
    backgroundColor:'#fff',
    borderColor:'#eee',
    borderWidth:'slimLine',
    borderRadius:3,
    marginLeft:15,
    marginRight:15,
    marginBottom:10,
    paddingTop:15,
    paddingBottom:15
  },
  base_item_bg:{
    backgroundColor:'#fff',
    borderTopLeftRadius:3,
    borderTopRightRadius:3,
    paddingLeft:15,
    paddingRight:15,
    paddingBottom:15,
    borderBottomWidth:'slimLine',
    borderColor:'#eee'
  },
  btn_create:{
    flexDirection:'row',
    backgroundColor:BLUE,
    height:40,
    width:114,
    borderRadius:20,
    alignItems:'center',
    justifyContent:'center',
    position:'absolute',
    bottom:25,
    right:15
  },
  icon_create:{
    height:18,
    width:19
  },
  dialog: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  dialog_item: {
    justifyContent: 'center',
    backgroundColor: 'fff',
    width:width,
    height:45,
    borderBottomWidth:'slimLine',
    borderColor:'#eee',
    paddingLeft:15
  },
  label_frame:{
    borderWidth:'slimLine',
    borderRadius:3,
    paddingLeft:3,
    paddingRight:3,
    justifyContent:'center',
    alignItems:'center',
    height:18,
  },
  item_gray:{
    backgroundColor:'#FBFBFC',
    borderBottomWidth:'slimLine',
    borderColor:'#eee',
    height:45,
    alignItems:'center',
    paddingLeft:15,
    paddingRight:15,
    flexDirection:'row'
  },
  icon_car:{
    width:16,
    height:21,
    marginRight:5
  },
  day_dot:{
    width:16,
    height:16,
    backgroundColor:'#FF703A',
    borderRadius:8,
    justifyContent:'center',
    alignItems:'center',
    borderColor:'#fff',
    borderWidth:'slimLine'
  },
  dot_red:{
    width:6,
    height:6,
    backgroundColor:'#FF703A',
    borderRadius:3
  }
})
module.exports = class DirectInfoListV2 extends SComponent {
  constructor(props){
    super(props)
    this.state = {
      pageLoading:true,
      refreshing:true
    }
    this._ds = new ListView.DataSource({
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
      rowHasChanged: (r1, r2) => r1 !== r2,
    })
    //埋点数据
    this.buryVO={}
    this.firstReqCatList=true

  }

  componentDidMount(){
    InteractionManager.runAfterInteractions(() => {
      if(_Bury){
        this.buryVO = {
          viewShowName:'直发计划列表',
          entryTime:new Date().getTime()
        }
      }
      this._getWebData()
    })
  }

  /**
   * @Description: 获取品类
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/7/17 17:06
   */
  _getWebCat=()=>{
    commonRequest({
      apiKey: 'queryDirectInitCatInfoKey',
      objectName: 'directPlanListQueryDO',
      params: {
        directTime:this.state.curSelectedDay?this.state.curSelectedDay.directArriveTime:undefined,
      }
    }).then( (res) => {
      let {data}=res
      let selectedCat=this.state.selectedCat
      if (selectedCat&&data.catBaseVOList){
        data.catBaseVOList.map((item)=>{
          if (item.catId==selectedCat.catId){
            item.checked=true
            selectedCat=item
          }else {
            item.checked=false
          }
        })
      }
      this.changeState({
        ...data,
        selectedCat
      })
    }).catch( err => {
    })
  }

  /**
   * @Description: 获取时间列表
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/7/17 17:06
   */
  _getWebWeek=()=>{
    commonRequest({
      apiKey: 'queryDirectInitTimeInfoKey',
      objectName: 'directPlanListQueryDO',
      params: {
        catId:this.state.selectedCat?this.state.selectedCat.catId:undefined,
        directTime:this.state.curSelectedDay?this.state.curSelectedDay.directArriveTime:undefined,
      }
    }).then( (res) => {
      let {data}=res
      data.directListTimeInitLists.map((time,index)=>{
        if(time.checked){
          this.state.curSelectedDay=time
        }
      })
      this.changeState({
        ...data,
      })
      if (this.firstReqCatList){
        this.firstReqCatList=false
        setTimeout(()=>{
          this._scrollToCheckedDay()
        },1500)
      }
    }).catch( err => {
    })
  }
  /**
   * @Description: 获取直发列表
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/7/25 12:00
   */
  _getWebDirectList=()=>{

    //业务埋点
    this.buryVO.feature=JSON.stringify({
      catId:this.state.selectedCat?this.state.selectedCat.catId:undefined,
      directTime:this.state.curSelectedDay?this.state.curSelectedDay.directArriveTime:undefined,
    })
    //上传埋点
    if (_Bury){
      _Bury.stop(this.buryVO)
    }
    commonRequest({
      apiKey: 'queryDirectInfoListKey',
      objectName: 'directPlanListQueryDO',
      params: {
        catId:this.state.selectedCat?this.state.selectedCat.catId:undefined,
        directTime:this.state.curSelectedDay?this.state.curSelectedDay.directArriveTime:undefined,
      }
    }).then( (res) => {
      console.log('res',res)
      let {data}=res
      this.changeState({
        ...data,
        pageLoading: false,
        refreshing:false
      })
    }).catch( err => {
      console.log('err',err)
      this._showMsg(err.errorMessage)
      this.changeState({
        pageLoading: false,
        refreshing:false
      })
    })
  }

  /**
   * @Description: 获取直发计划
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/7/17 14:36
   */
  _getWebData=()=>{
    this.changeState({
      refreshing:true
    })
    // this.getRef('listView')('scrollTo')({x: 0, y: 0, animated: true})
    this._getWebWeek()
    this._getWebCat()
    this._getWebDirectList()
  }


  render(){
    return(
      <Page
        stopBury={true}
        title={'直发看板'}
        pageLoading={this.state.pageLoading}
        loading={false}
        back={()=>this.navigator().pop()}
        rightContent={this._renderHeadRight()}
        rightEvent={()=>{
          if (this.state.catBaseVOList && this.state.catBaseVOList.length>0){
            this.changeState({
              showCatDialog: !this.state.showCatDialog,
            })
          }else {
            this._showMsg('品类列表为空')
          }
        }}
      >
        <View style={{height:72}}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            ref='scrollView'
            horizontal={true}
            style={{backgroundColor:BLUE,height:72,flex:0, paddingLeft:10, paddingRight:10}}>
            {this._renderWeekDay()}
          </ScrollView>
        </View>
        {this._renderDay()}
        <ListView
          ref='listView'
          style={{flex:1}}
          initialListSize={15}
          dataSource={this._ds.cloneWithRows(this.state.directPlanCardVOS?this.state.directPlanCardVOS:[])}
          renderRow={this._renderRow.bind(this)}
          enableEmptySections={true}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              style={{backgroundColor:'transparent'}}
              onRefresh={this._getWebData.bind(this)}
              tintColor="#228FDF"
              title="加载中..."
              titleColor="#999"
              colors={['#2296f3']}
              progressBackgroundColor="#fff"
            />
          }
        />

        {this._renderCatDialog()}
      </Page>
    )
  }
  /**
   * @Description: 品类选择按钮
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/7/17 17:07
   */
  _renderHeadRight(){
    return(
      <Row style={{alignItems:'center'}}>
        <SText fontSize='mini_plus' color='white'>{this.state.selectedCat?this.state.selectedCat.catName:'全部'}</SText>
        <SText fontSize='mini_plus' color='white' style={{fontSize:8,marginLeft:5}}>▼</SText>
      </Row>
    )
  }
  /**
   * @Description: 日期筛选
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/7/17 11:55
   */
  _renderWeekDay(){
    if (!this.state.directListTimeInitLists){
      return
    }
    return(
      this.state.directListTimeInitLists.map((item)=>{
        return(
          <TouchableOpacity
            onPress={()=>this._btnWeekDay(item)}
            style={s.day}>

            <SText fontSize='mini_plus' color='#BEDFFB'>{item.weekDay}</SText>
            <View style={[item.checked?s.circle_white:s.day_uncheck,{marginTop:5}]}>
              <SText fontSize='mini_plus' color={item.checked?BLUE:'white'}>{item.monthDay}</SText>
            </View>
            {
              item.messageNum === null || item.messageNum === 0  ? null :
                <View style={[s.day_dot,{position:'absolute',top:16,right:6}]} >
                  <SText fontSize='tiny' color='white'>{item.messageNum+''}</SText>
                </View>
            }
            {item.weatherDirected?<View style={[s.dot_white,{marginTop:5}]}/>:null}
          </TouchableOpacity>
        )
      })

    )
  }

  /**
   * @Description: 日期
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/7/17 13:46
   */
  _renderDay(){
    return(
      <Row style={{paddingLeft:15,paddingTop:10,paddingBottom:10,paddingRight:15}}>
        <SText fontSize='mini' color='dark5' style={{flex:1}}>{this.state.directPlanTime}</SText>
        <SText fontSize='mini' color='dark5' >{this.state.totalDirectPlanNumInfo}</SText>
      </Row>
    )
  }

  _renderRow=(rowData, sectionID, rowID)=>{
    return(
      <View
        style={s.direct_item}>
        {this._renderBase(rowData,sectionID,rowID)}
        {this._renderStorehouse(rowData,sectionID,rowID)}
        {this._renderDriver(rowData,sectionID,rowID)}
        {this._renderCardFooter(rowData,sectionID,rowID)}
      </View>
    )
  }

  /**
   * @Description: 看板基础信息
   * 1.销售待提报，2.pm确定中，3.采购中，4.配送中，5.完结, 6异常完结
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/12 10:34
   */
  _renderBase=(rowData, sectionID, rowID)=>{
    if(rowData.directPlanStatus === undefined) {
      rowData.directPlanStatus = {}
    }
    return(
      <TouchableOpacity
        onPress={()=>this._gotoDirectDetails(rowData)}
        style={s.base_item_bg}>
        <Row>
          <Row style={{flex:1,marginRight:5,alignItems:'center'}}>
            {rowData.hadRead ? null : <View style={[s.dot_red,{marginRight:3}]}/>}
            <SText fontSize='caption_plus' color='dark' style={{fontWeight:'500',flex:1}}>{rowData.directPlanName}</SText>
          </Row>
          <View style={[s.label_frame,{borderColor:this._getTypeColor(rowData.directPlanStatus?rowData.directPlanStatus.type:undefined)}]}>
            <SText fontSize='tiny_plus' color={this._getTypeColor(rowData.directPlanStatus?rowData.directPlanStatus.type:undefined)} >{rowData.directPlanStatus ? rowData.directPlanStatus.statusCn :''}</SText>
          </View>
        </Row>
        <SText fontSize='mini_plus' color='dark5' style={{marginTop:3}}>{rowData.itemInfo}</SText>
        <Row style={{marginTop:10}}>
          <View style={{flex:1,alignItems:'center',borderRightWidth:1 / PixelRatio.get(),borderColor:'#eee'}}>
            <SText fontSize='body_plus' color={rowData.forecastNum !== null ?'dark':'dark3'} style={{fontWeight:rowData.forecastNum !== null ? '500' : '400' }}>{rowData.forecastNum !==null ?rowData.forecastNum+'':'-'}</SText>
            <SText fontSize='mini_plus' color='dark3' style={{marginTop:2}}>预报件数</SText>
          </View>
          <View style={{flex:1,alignItems:'center',borderRightWidth:1 / PixelRatio.get(),borderColor:'#eee'}}>
            <SText fontSize='body_plus' color={rowData.orderNum !== null ?'dark':'dark3'} style={{fontWeight:rowData.orderNum !== null ? '500' : '400' }}>{rowData.orderNum !==null ?rowData.orderNum+'':'-'}</SText>
            <SText fontSize='mini_plus' color='dark3' style={{marginTop:2}}>订单件数</SText>
          </View>
          <View style={{flex:1,alignItems:'center',borderRightWidth:1 / PixelRatio.get(),borderColor:'#eee'}}>
            <SText fontSize='body_plus' color={rowData.purchaseNum !== null ?'dark':'dark3'} style={{fontWeight:rowData.purchaseNum !== null ? '500' : '400' }}>{rowData.purchaseNum !==null ?rowData.purchaseNum+'':'-'}</SText>
            <SText fontSize='mini_plus' color='dark3' style={{marginTop:2}}>已采件数</SText>
          </View>
          <View style={{flex:1,alignItems:'center'}}>
            <SText fontSize='body_plus' color={rowData.carNum !== null ?'dark':'dark3'} style={{fontWeight:rowData.carNum !== null ? '500' : '400' }}>{rowData.carNum !== null ? rowData.carNum+'':'-'}</SText>
            <SText fontSize='mini_plus' color='dark3' style={{marginTop:2}}>车辆</SText>
          </View>
        </Row>
      </TouchableOpacity>
    )
  }

  /**
   * @Description: 服务站信息 在完结状态5与配送中状态4下显示
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/12 10:32
   */
  _renderStorehouse=(rowData)=>{
    if(rowData.directPlanStatus.status >= 5 ){
      return null
    }
    if (rowData.planCardPickHouseVOList){
      return(
        rowData.planCardPickHouseVOList.map((item)=> {
          return(
            <TouchableOpacity
              onPress={()=>this._gotoDirectDetails(rowData)}
              style={s.item_gray}>
              <SText fontSize='mini_plus' color='dark5'>{item.pickHouseName}</SText>
              {
                item.passOrReportStatusDesc ?
                  <View style={[s.label_frame,{borderColor:this._getTypeColor(item.passOrReportStatus),marginLeft:10}]}>
                    <SText fontSize='mini' color={this._getTypeColor(item.passOrReportStatus)} >{item.passOrReportStatusDesc}</SText>
                  </View>
                  :
                  null
              }
              <SText fontSize='mini_plus' color='dark5' style={{flex:1,textAlign:'right'}}>{this._getStorehouseRightLabel(rowData.directPlanStatus?rowData.directPlanStatus.status:undefined,item)}</SText>
            </TouchableOpacity>
          )
        })
      )
    }
  }
  _getStorehouseRightLabel(directPlanStatus,item){
    if (directPlanStatus === undefined) return
    let label=directPlanStatus <= 3?'预估：':'订单：'
    if(directPlanStatus <= 3){
      label =  item.forecastNum === null ? label+'-' :label+item.forecastNum
    }else{
      label =  item.orderNum === null ? label+'-' :label+item.orderNum
    }
    return label
  }

  /**
   * @Description: 物流信息 配送中显示
   * carStatus 枚举
   * 1无车辆信息
   * 2无车辆坐标
   * 3有车辆坐标
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/12 10:32
   */
  _renderDriver=(rowData)=>{
    if (rowData.directPlanStatus ===undefined) return
    if(rowData.directPlanStatus.status === 5 && rowData.planCardLogisticsVOS){
      return(
        rowData.planCardLogisticsVOS.map((item)=> {
          return(
            <TouchableOpacity
              onPress={()=>{
                this.setRouteData({
                  data:{
                    directPlanId: rowData.directPlanId,
                    locationId: item.locationId,
                    schedulingId: item.schedulingId,
                  }
                }).push({
                  name: 'DirectLogisticsDetail',
                  component: DirectLogisticsDetail,
                })
              }}
              disabled={ item.carStatus === 3 ? false : true }
              style={[s.item_gray,{flexDirection:'row'}]}>
              <Image style={s.icon_car} source={this._getCarIcon(item.carStatus)}/>
              <SText fontSize='mini_plus' color={item.carNo ? 'dark':'dark3'}  style={{flex:1}}>{item.carNo?item.carNo:'无车辆信息'}</SText>
              <SText fontSize='mini_plus' color='dark5' >{item.locationName}</SText>
            </TouchableOpacity>
          )
        })
      )
    }
  }
  /**
   * @Description: 获取车辆icon
   * 1无车辆信息
   * 2无车辆坐标
   * 3有车辆坐标
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/12 15:09
   */
  _getCarIcon(carStatus){
    switch (carStatus){
      default:
      case 1:
        return IconCarGray
      case 2:
        return IconCarOrange
      case 3:
        return IconCarBlue
    }
  }

  /**
   * @Description: 待销售提报
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/12 10:34
   */
  _renderCardFooter=(rowData,sectionID,rowID)=>{
    if (rowData.directPlanStatus ===undefined){
      rowData.directPlanStatus={}
    }
    return(
      <View
        style={{paddingTop:5}}>
        {
          rowData.allowOperation ?
            <TouchableOpacity
              onPress={()=>{
                this._readCard(rowData)
                this._gotoCreatePurchaseOrder(rowData)
              }}
              style={{marginLeft:15,marginRight:15,backgroundColor:'#2296F3',borderRadius:3,height:45,flex:1,justifyContent:'center',alignItems:'center',marginTop:10}}>
              <SText fontSize='caption_plus' color='white' >去采购</SText>
            </TouchableOpacity>
            :
            null
        }
        {
          rowData.directPlanTags?
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              style={{height:23,flex:0, paddingLeft:15, paddingRight:5,marginTop:10}}>
              {this._renderLabels(rowData.directPlanTags)}
            </ScrollView>
            :
            null
        }
        {
          rowData.tips?
            <SText fontSize='mini_plus' color={rowData.directPlanStatus.status >=5 ? 'dark' : 'dark3'} style={{marginTop:10,marginLeft:rowData.directPlanStatus.status >= 5 ? 15 :0,textAlign:rowData.directPlanStatus.status >= 5 ? 'left':'center'}} >{rowData.tips}</SText>
            :
            null
        }
        {
          rowData.dateInfo?
            <SText fontSize='mini_plus' color='dark3' style={{marginTop:5,marginLeft:15}} >{rowData.dateInfo}</SText>
            :
            null
        }
      </View>
    )
  }

  /**
   * @Description: 标签
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/12 11:13
   */
  _renderLabels=(directPlanTags)=>{
    if (directPlanTags){
      return(
        directPlanTags.map((item)=>{
          return(
            <View style={{backgroundColor:this._getTypeColor(item.tagType),paddingLeft:3,paddingRight:3,marginRight:10,alignItems:'center',justifyContent:'center'}}>
              <SText fontSize='mini' color='white'  >{item.tagName}</SText>
            </View>
          )
        })
      )
    }
  }

  /**
   * @Description: 颜色返回
   * 1:红色 2:绿色 3:灰色 4橙色
   * @param colorType
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/12 14:11
   */
  _getTypeColor(colorType){
    switch (colorType){
      case 1:
        return '#FF703A'
      case 2:
        return '#00BF00'
      case 3:
        return 'rgba(2, 29, 51, 0.54)'
      case 4:
        return '#F99D08'
      default:
        return 'rgba(2, 29, 51, 1.0)'
    }
  }

  /**
   * @Description: 品类对话框
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         17/7/17 17:04
   */
  _renderCatDialog = () => {
    if (this.state.showCatDialog&&this.state.catBaseVOList) {
      let dialogHeight=0
      if (this.state.catBaseVOList.length>=5){
        dialogHeight=250
      }else {
        dialogHeight=this.state.catBaseVOList.length*45
      }
      return (
        <TouchableOpacity
          style={s.dialog}
          onPress={() => {
            if (this)
              this.changeState({
                showCatDialog: !this.state.showCatDialog,
              })
          }}
        >
          <View
            style={{backgroundColor:'#fff',flex:0,height:dialogHeight}}>
            <ScrollView style={{backgroundColor:'#fff',flex:0,height:dialogHeight}}>
              {this.state.catBaseVOList.map((item)=>{
                return(
                  <TouchableOpacity
                    onPress={()=>{
                      //如果点了当前已选中的品类 则不请求数据
                      if (item.checked){
                        this.changeState({
                          showCatDialog: false,
                          selectedCat:item
                        })
                      }else {
                        this.state.catBaseVOList.map((cat)=>{
                          if (cat.catId==item.catId){
                            cat.checked=true
                          }else {
                            cat.checked=false
                          }
                        })
                        this.state.selectedCat=item
                        this.changeState({
                          showCatDialog: false,
                        })
                        this._getWebData()
                      }

                    }}
                    style={s.dialog_item}>
                    <SText fontSize='caption_plus' color={item.checked?BLUE:'dark'} >{item.catName}</SText>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>

        </TouchableOpacity>
      )
    }
  }


  //第一次进入页面 默认选中的日期 滚动到第三个
  _scrollToCheckedDay=()=>{
    if(!this.state.directListTimeInitLists){
      return
    }
    this.state.directListTimeInitLists.map((item,index)=>{
      if (item.checked&&index>2){
        console.log('scrollToCheckedDay')
        let scrollToX=(index-2)*((width-20)/7)
        this.getRef('scrollView')('scrollTo')({x: scrollToX, y: 0, animated: true})
        return
      }
    })
  }
  //选择日期
  _btnWeekDay=(item)=>{
    if(item.checked){
      return
    }
    this.state.directListTimeInitLists.map((time)=>{
      if (time.directArriveTime === item.directArriveTime){
        time.checked=true
      }else {
        time.checked=false
      }
    })
    this.state.selectedCat={
      catId:-1
    }
    this.state.curSelectedDay = item
    this._getWebData()

  }


  /**
   * @Description: 读
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/29 13:52
   */
  _readCard=(rowData)=>{
    if(!rowData.hadRead){
      this.state.curSelectedDay.messageNum =this.state.curSelectedDay.messageNum-1
      rowData.hadRead=true
      this.changeState({})
    }
  }
  //创建采购单
  _gotoCreatePurchaseOrder=(rowData)=>{
    //供货商数量只有一个
    if (rowData.suppliersNum === 1){
      this.navigator().push({
        callback: this._getWebData,
        component: require('../purchase/addPurchaseOrder'),
        name: 'AddPurchaseOrder',
        data: {
          supplierId: rowData.supplierId,
          directPlanId: rowData.directPlanId
        }
      })
    }else { //供货商数量为0或者多个 先跳转选择供应商页面
      this.navigator().push({
        callback: this._getWebData,
        component: SupplierList,
        name: 'SupplierList',
        from:'Direct',
        data:{
          directPlanId:rowData.directPlanId
        }
      })
    }
  }
  /**
   * @Description: 跳转详情页面
   * 直发状态为 销售待提报@status==1跟PM待确认@status==2之前跳转SubmitAndConfirmGoodsDirectNum
   * 之后跳转DirectPlanInfoDetails
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/16 15:39
   */
  _gotoDirectDetails=(rowData)=>{
    switch (rowData.directPlanStatus.status){
      case 1:
      case 2:
      case 3:
        this.setRouteData({
          data:{
            directPlanScheduleId: rowData.directPlanScheduleId,
          },
          refresh: this._getWebData,
        }).push({
          name: 'DirectPlanGoodsDetails',
          component: DirectPlanGoodsDetails,
        })
        break
      case 7:
        if(rowData.source === 1){
          this.setRouteData({
            data:{
              directPlanScheduleId:rowData.directPlanScheduleId,
            },
            //销售角色：提交1 pm角色：确认2 详情3
            refresh: this._getWebData
          }).push({
            name:'DirectPlanGoodsDetails',
            component:DirectPlanGoodsDetails
          })
        }else if (rowData.source === 2){
          this.setRouteData({
            data:{
              directPlanId:rowData.directPlanId
            },
            refresh: this._getWebData,
          }).push({
            name: 'DirectPlanInfoDetails',
            component: DirectPlanInfoDetails
          })
        }else {
          this._showMsg('source为空')
        }
        break
      default:
        this.setRouteData({
          data:{
            directPlanId: rowData.directPlanId,
          },
          refresh: this._getWebData,
        }).push({
          name: 'DirectPlanInfoDetails',
          component: DirectPlanInfoDetails,
        })
        break
    }

  }

  _showMsg(str){
    __STORE.dispatch(UtilsAction.toast(str, 1000))
  }
}
