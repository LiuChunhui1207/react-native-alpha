/**
 *
 * 项目名称：captain-rn
 * 文件描述：直发商品详情页 PM待确认之前 进入此详情页
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：2017/8/14 10:02
 * 修改人：cfy
 * 修改时间：2017/8/14 10:02
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
  Platform,
  Alert,
  PixelRatio
} from 'react-native'
import React from 'react'
import { SComponent, SStyle, SText,TextInput } from 'sxc-rn'
import { Page,Row } from 'components'
import { str } from 'tools'
import Dimensions from 'Dimensions'
import {UtilsAction} from  'actions'
let { width }= Dimensions.get('window')
const BLUE = '#2296F3'
const slimLine = 1 / PixelRatio.get()
let s = SStyle({
  container: {
    flex:1
  },
  item: {
    backgroundColor: '#fff',
    width:width,
    height:45,
    borderBottomWidth:'slimLine',
    borderColor:'#eee',
    paddingLeft:15,
    flexDirection:'row',
    alignItems:'center',
    paddingRight:15,
  },
  circle_uncheck:{
    width:20,
    height:20,
    borderRadius:10,
    borderColor:'#C4C6CF',
    borderWidth:'slimLine',
    marginRight:10,
  },
  dot:{
    width:6,
    height:6,
    borderRadius:3,
    backgroundColor:BLUE,
    marginRight:8
  },
  label_frame:{
    borderWidth:'slimLine',
    borderRadius:3,
    paddingLeft:3,
    paddingRight:3,
    justifyContent:'center',
    alignItems:'center',
    height:18
  },
  input:{
    color:'rgba(2,29,51,0.54)',
    fontSize:14,
    textAlign:'right',
    backgroundColor:'#F6F6F6',
    paddingRight:5,
    width:70,
    marginRight:15,
    height:35
  }
})

module.exports = class DirectPlanGoodsDetails extends SComponent{
  constructor(props){
    super(props)
    this.pageType=this.getRouteData('pageType')
    console.log('this.pageType',this.pageType)
    this.state = {
      pageLoading:true,
      directPlanStatus:{}
    }
    this._ds = new ListView.DataSource({
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
      rowHasChanged: (r1, r2) => r1 !== r2,
    })
  }

  componentDidMount(){
    InteractionManager.runAfterInteractions( () => {
      this._getWebData()
    })
  }

  _getWebData=()=>{

    commonRequest({
      apiKey: 'queryConfirmDirectPlanKey',
      objectName: 'confirmDirectPlanQueryDO',
      params: {
        directPlanScheduleId: this.getRouteData('data') ? this.getRouteData('data').directPlanScheduleId : undefined
      }
    }).then( (res) => {
      let {data}=res
      this.changeState({
        pageLoading: false,
        ...data,
      })
    }).catch( err => {
      __STORE.dispatch(UtilsAction.toast(err.errorMessage, 1000))
      this.changeState({
        pageLoading: false
      })
    })



  
  }

  render(){
    return(
      <Page
        title={'提报详情'}
        pageName={'提报详情'}
        pageLoading={this.state.pageLoading}
        loading={false}
        back={() => this.navigator().pop()}
      >
        <ScrollView>
          {this._renderBase()}
          {this._renderSubmitTitle()}
          {this._renderSubmitGoodsList()}
        </ScrollView>
      </Page>
    )
  }
  /**
   * @Description: 提交、确认直发量 基础信息
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/14 11:11
   */
  _renderBase(){
    if(this.state.directPlanStatus ===null ||this.state.directPlanStatus ===undefined){
      this.state.directPlanStatus={}
    }
    return(
      <View>
        <Row style={s.item}>
          <SText fontSize='caption_plus' color='dark' >计划名称:</SText>
          <SText fontSize='caption_plus' color='dark5' style={{flex:1,marginLeft:5,textAlign:'right'}} numberOfLines={1} >{this.state.directPlanName}</SText>
          <View style={[s.label_frame,{borderColor:this._getTypeColor(this.state.directPlanStatus.type),marginLeft:3}]}>
            <SText fontSize='tiny_plus' color={this._getTypeColor(this.state.directPlanStatus.type)} >{this.state.directPlanStatus?this.state.directPlanStatus.statusCn:''}</SText>
          </View>
        </Row>
        <Row style={s.item}>
          <SText fontSize='caption_plus' color='dark' style={{flex:1}}>直发到货时间:</SText>
          <SText fontSize='caption_plus' color='dark5'  >{this.state.arrivalTime? str.date(this.state.arrivalTime).format('y-m-d'):'' }</SText>
        </Row>
        <Row style={s.item}>
          <SText fontSize='caption_plus' color='dark' style={{flex:1}}>提报截止时间:</SText>
          <SText fontSize='caption_plus' color='dark5'  >{this.state.endGatherTime}</SText>
        </Row>
      </View>
    )
  }


  /**
   * @Description: 提报直发量 商品标题
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/15 10:17
   */
  _renderSubmitTitle(){
    return(
      <Row style={{height:35,alignItems:'center',borderBottomWidth:slimLine,borderColor:'#eee',backgroundColor:'#fff',paddingLeft:15,paddingRight:15,marginTop:10}}>
        <SText fontSize='tiny_plus' color='dark5' style={{flex:1}} >商品名</SText>
        <SText fontSize='tiny_plus' color='dark5' style={{width:70,textAlign:'center'}}>价格(元/斤)</SText>
        <SText fontSize='tiny_plus' color='dark5' style={{width:70,textAlign:'right'}}>预报数量(件)</SText>
      </Row>
    )
  }

  /**
   * @Description: 提报直发量 商品信息
   * skUandSaleVOS 这种命名 我也是日了🐶了
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/14 11:12
   */
  _renderSubmitGoodsList(){
    if (this.state.pickVO){
      return(
        this.state.pickVO.map((item, index)=>{
          return(
            <View style={{backgroundColor:'#fff',marginBottom:10}}>
              <Row style={{flex:1,borderTopWidth:index===0?0:slimLine,borderColor:'#eee',paddingTop:10,paddingBottom:10,flexDirection:'row',alignItems:'center',paddingLeft:15}}>
                <View style={s.dot}/>
                <SText fontSize='caption_plus' color='dark' style={{fontWeight:'500'}} >{item.pickHouseName}</SText>
                <SText  fontSize='caption_plus' color='dark5'  > {this._getTimeLabel(item)}</SText>
              </Row>
              {
                item.skuAndSaleVOS ? item.skuAndSaleVOS.map((cItem)=>{
                  return(
                    <View style={{paddingLeft:30}}>
                      <Row style={{borderTopWidth:slimLine,borderColor:'#eee',paddingTop:10,paddingBottom:10,alignItems:'center'}}>
                        <View style={{flex:1}}>
                          <Row style={{alignItems:'center'}}>
                            <View style={{borderWidth:slimLine,borderColor:'rgba(2,29,51,0.3)',height:18,paddingLeft:2,paddingRight:2,marginRight:5}}>
                              <SText fontSize='mini_plus' color='dark' >{cItem.skuId}</SText>
                            </View>
                            <SText fontSize='caption_plus' color='dark' >{cItem.localTitle}</SText>
                          </Row>
                          {/*<SText fontSize='caption_plus' color='dark'>{cItem.localTitle}</SText>*/}
                          <SText fontSize='mini_plus' color='dark5'  style={{marginTop:5}} >{cItem.spuName}</SText>
                        </View>
                        <SText fontSize='mini_plus' color='dark5' style={{width:70,textAlign:'center'}}>{cItem.forecastPrice ? cItem.forecastPrice:'-'}</SText>
                        <SText fontSize='mini_plus' color='dark5' style={{width:70,textAlign:'right',marginRight:15}}>{cItem.forecastNum !== null ? cItem.forecastNum+'':-''}</SText>
                      </Row>
                    </View>
                  )
                }) : null
              }
            </View>
          )
        })
      )
    }
  }
  _getTimeLabel=(item)=>{
    if (item.storehouseArriveStartTime && item.storehouseArriveEndTime){
      if (this._isMultiDay(item.storehouseArriveStartTime,item.storehouseArriveEndTime)){
        return '(当日'+str.date(item.storehouseArriveStartTime).format('h:i')+'-'+ '次日'+str.date(item.storehouseArriveEndTime).format('h:i')+')'
      }else {
        return '('+str.date(item.storehouseArriveStartTime).format('h:i')+'-'+str.date(item.storehouseArriveEndTime).format('h:i')+')'
      }
    }
  }
  /**
   * @Description: 是否多天
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/9/12 14:15
   */
  _isMultiDay(startTime,endTime){
    let startDate=new Date(startTime)
    let endDate=new Date(endTime)
    if( endDate.getYear() > startDate.getYear() || endDate.getMonth() > startDate.getMonth() || endDate.getDate() > startDate.getDate()){
      return true
    }else {
      return false
    }
  }

  /**
   * @Description: 颜色返回
   * 1:红色 2:绿色 3:灰色
   * @param
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
        return '#0B0'
      case 3:
        return '#748391'
      case 4:
        return '#F99D08'
      default:
        return '#333'
    }
  }
}