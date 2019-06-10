'use strict';
import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
  InteractionManager,
  Linking,
  PixelRatio
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button,Row} from 'components';
import {UtilsAction} from 'actions';
import {ICON_LOCATION_CAR} from 'config';
import DirectLogisticsDetail from './directLogisticsDetail'
import  SupplierList from '../../supplier/supplierList'
const slimLine = 1 / PixelRatio.get()

const s = SStyle({
  summary: {
    marginLeft:15, 
    marginRight:15, 
    marginTop:10, 
    marginBottom:10, 
    backgroundColor:'#fff',
    borderRadius:3,
    paddingLeft:15, 
    paddingRight:15, 
    paddingTop:10, 
    paddingBottom:10,
  },
  lineItem: {
    flexDirection:'row',
    justifyContent:'space-between',
    borderTopWidth:1,
    borderColor:'#efefef',
    paddingTop:12,
    paddingBottom:12,
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
  dot:{
    width:6,
    height:6,
    borderRadius:3,
    backgroundColor:'#2296F3',
    marginRight:8
  }
});
module.exports = class DirectPlanSummary extends SComponent{
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,

      directArrivedTime: '',
      directPlanId: '',
      directPlanName: '',
      directRouteLocationDesc: '',
      directSupplierItems: [],
      logisticsSummaryList: [],
    };
  }
  componentDidMount(){
    let called = false;
    let timeout = setTimeout( () => {
      called = true;
      this._getData();
    }, 1000);

    InteractionManager.runAfterInteractions(() => {
      if (called) {
        return;
      }
      clearTimeout(timeout);
      this._getData();
    })
  }

  _getData = () => {
    const directPlanId = this.getRouteData('data').directPlanId;
    commonRequest({
      apiKey: 'queryDirectPlanSummaryKey', 
      objectName: 'directBaseQueryDO',
      params: {
        directPlanId: directPlanId,
      }
    }).then((data) => {
      data = data.data;
      this.changeState({
        pageLoading: false,
        ...data,
      });
      if (this.props.showCancel && data.canDelete) this.props.showCancel();
    }).catch((err)=>{
      this.changeState({
          pageLoading: false
      });
      __STORE.dispatch(UtilsAction.toast(err.errorMessage, 1000));
    });
  }

  _goLogisticsDetail = (schedulingId) => {
    const directPlanId = this.getRouteData('data').directPlanId;
    this.setRouteData({
      data:{
        directPlanId: directPlanId,
        locationId: -2, //fixed
        schedulingId: schedulingId,
      }
    }).push({
      name: 'DirectLogisticsDetail',
      component: DirectLogisticsDetail,
    });
  }

  render(){
     // if (this.state.pageLoading){
     //   return null
     // }else {
     //
     // }
    return(
      <View style={{flex:1}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.pageLoading}
              onRefresh={this._getData.bind(this)}
            />
          }
        >
          {this.state.pageLoading ? null : this._renderView()}
        </ScrollView>
        {this.state.pageLoading ? null : this._actionView()}
      </View>
    )
  }
  _renderView=()=>{
    const {

      directArrivedTime,
      directPlanId,
      directPlanName,
      directRouteLocationDesc,
      directSupplierItems,
      logisticsSummaryList,
    } = this.state
    return(
      <View style={{flex:1}}>
        <Summary directPlanName={directPlanName} directRouteLocationDesc={directRouteLocationDesc} directArrivedTime={directArrivedTime}
          directPlanStatus={this.state.directPlanStatus} />
        {
          directSupplierItems && directSupplierItems.length
            ?
            directSupplierItems.map((item, i) =>
              <SupplierItem key={i} directSupplierItem={item} />
            )
            :
            null
        }
        <LogisticsSummaryList goLogisticsDetail={this._goLogisticsDetail} logisticsSummaryList={logisticsSummaryList} />
        <Contact  directPlanEmergencyContactVOS={this.state.directPlanEmergencyContactVOS}/>
      </View>
    )
  }
  _actionView=()=>{
    if (this.state.allowOperation){
      return(
        <Row style={{height:45,alignItems:'center',backgroundColor:'#fff',paddingLeft:15}}>
          <SText style={{flex:1}} fontSize={13} color='dark5' >请尽快完成采购订单</SText>
          <TouchableOpacity
            onPress={()=>this._gotoCreatePurchaseOrder()}
            style={{width:110,height:45,backgroundColor:'#1394F6',alignItems:'center',justifyContent:'center'}}
          >
            <SText  fontSize={15} color='white' >创建采购单</SText>
          </TouchableOpacity>
        </Row>
      )
    }
  }
  //创建采购单
  _gotoCreatePurchaseOrder=()=>{
    //供货商数量只有一个
    if (this.state.suppliersNum === 1){
      this.navigator().push({
        callback: this._getData,
        component: require('../../purchase/addPurchaseOrder'),
        name: 'AddPurchaseOrder',
        data: {
          supplierId: this.state.supplierId,
          directPlanId:this.state.directPlanId
        }
      })
    }else { //供货商数量为0或者多个 先跳转选择供应商页面
      this.navigator().push({
        callback: this._getData,
        component: SupplierList,
        name: 'SupplierList',
        from:'Direct',
        data:{
          directPlanId:this.state.directPlanId
        }
      })
    }
  }
}
class Contact extends SComponent{

  render(){
    const { directPlanEmergencyContactVOS} = this.props
    return (
      <View style={{backgroundColor:'#fff',marginTop:10}}>
        <InfoTitle  title="紧急联系人" />
        {
          directPlanEmergencyContactVOS?directPlanEmergencyContactVOS.map((item,index)=>{
            return(
              <TouchableOpacity
                onPress={()=>{
                  if (item.phone) {
                    Linking.openURL('tel://'+item.phone)
                  }
                }}
                style={{backgroundColor:'#fff',paddingLeft:30, borderColor:'#F7F7F7',borderTopWidth:index===0 ? 1 / PixelRatio.get() : 0, flexDirection:'row'}}>
                <Row style={{borderColor:'#F7F7F7',borderBottomWidth:1,height:45,alignItems:'center',flex:1,paddingRight:15}}>
                  <SText style={{flex:1}} fontSize='caption_plus' color="dark">{item.dept}</SText>
                  <SText fontSize='caption_plus' color="#1495F7">{item.contactName+' '+item.phone}</SText>
                </Row>
              </TouchableOpacity>
            )
          }):null
        }
      </View>

    )
  }

}

class Summary extends SComponent{
  render(){
    const { directArrivedTime, directPlanName, directRouteLocationDesc,directPlanStatus } = this.props;
    return (
      <View style={s.summary}>
        <Row>
          <SText style={{fontWeight:'500',flex:1}} fontSize={15} color='dark' >{directPlanName}</SText>
          <View style={[s.label_frame,{borderColor:this._getTypeColor(directPlanStatus ? directPlanStatus.type : undefined)}]}>
            <SText fontSize='tiny_plus' color={this._getTypeColor(directPlanStatus ? directPlanStatus.type : undefined)} >{directPlanStatus ? directPlanStatus.statusCn : ''}</SText>
          </View>
        </Row>
        <SText style={{marginTop:5}} fontSize={13} color='dark5'>{directRouteLocationDesc}</SText>
        <SText style={{marginTop:15}} fontSize={13} color='dark5'>直发到货日期：{directArrivedTime}</SText>
      </View>
    )
  }
  /**
   * @Description: 颜色返回
   //异常 红色
   public static final int ERR = 1;
   //通过 使用绿色
   public static final int ADOPT = 2;
   //辅助灰色
   public static final int AUXILIARY = 3;
   //警告 橙色
   public static final int WARN = 4;
   * @param
   * @return
   * @throws
   * @author       chengfy@songxiaocai.com
   * @date         2017/8/12 14:11
   */
  _getTypeColor(colorType){
    switch (colorType){
      case 1:
        return '#FF703A';
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

class SupplierItem extends SComponent{
  render(){
    const { supplierName, directItems } = this.props.directSupplierItem;
    if (!directItems || !directItems.length) return null;
    return (
      <View style={{backgroundColor:'#fff'}}>
        <InfoTitle title="供应商信息" />
        <View style={s.lineItem}>
          <SText style={{flex:1,marginLeft:15}} fontSize={15} color="dark">供应商姓名</SText>
          <SText style={{flex:2,marginRight:15,textAlign:'right'}}>{supplierName || '无'}</SText>
        </View>
        <View style={s.lineItem}>
          <SText style={{flex:2,marginLeft:15}} fontSize={13} color='dark5'>商品名</SText>
          <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='dark5'>预估件数</SText>
          <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='dark5'>订单件数</SText>
          <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='dark5'>已采件数</SText>
        </View>
        {
          directItems.map((item, i) =>
            <View key={i} style={s.lineItem}>
              <View style={{flex:2,marginLeft:15}}>
                <Row style={{alignItems:'center'}} >
                  <View style={{borderWidth:slimLine,borderColor:'rgba(2,29,51,0.3)',height:18,paddingLeft:2,paddingRight:2,marginRight:5}}>
                    <SText fontSize='mini_plus' color='dark' >{item.skuId}</SText>
                  </View>
                  <SText fontSize={15} color='dark'>{item.itemName}</SText>
                </Row>
                <SText fontSize={15} color='dark5'>{item.spuName}</SText>
              </View>
              <SText style={{flex:1,textAlign:'center'}} fontSize={15} color='#3C424B'>{item.estimateNum || '0'}</SText>
              <SText style={{flex:1,textAlign:'center'}} fontSize={15} color={item.orderWarn?'#FF7043':'#3C424B'}>{item.orderNum || '0'}</SText>
              <SText style={{flex:1,textAlign:'center'}} fontSize={15} color='#3C424B'>{item.alreadyPurchaseNum || '0'}</SText>
            </View>
          )
        }
      </View>
    )
  }
}

class LogisticsSummaryList extends SComponent{
  _getMapStaticImageUri(carLocation) {
    if (!carLocation) return '';
    const width = Dimensions.get('window').width-50;
    const height = 150;
    const url = 'http://api.map.baidu.com/staticimage/v2';
    const ak = 'pzRrx7tXVcoAlxQRGAiMBfVq';
    const location = `${carLocation.carLongitude},${carLocation.carLatitude}`;
    const zoom = 13;
    let uri = `${url}?ak=${ak}&width=${width}&height=${height}&center=${location}&zoom=${zoom}&random=${Math.random()}`;
    return uri;
  }

  render(){
    const { logisticsSummaryList, goLogisticsDetail } = this.props;
    if (!logisticsSummaryList || !logisticsSummaryList.length) return null;
    return (
      <View style={{backgroundColor:'#fff',marginTop:10,paddingBottom:30}}>
        <InfoTitle title="物流信息" />
        {
          logisticsSummaryList.map((item, i) =>
            <View key={i}>
              <ItemTitle title={item.carNo} />
              <View style={s.lineItem}>
                <SText style={{marginLeft:35}} fontSize={15} color="dark">当前车辆位置</SText>
                <SText style={{marginRight:15,width:185,textAlign:'right'}} color='rgba(2,29,51,0.54)'>{item.carNowLocation}</SText>
              </View>
              <View style={s.lineItem}>
                <SText style={{marginLeft:35}} fontSize={15} color="dark">司机姓名</SText>
                <SText style={{marginRight:15}} color='dark5'>{item.driverName}</SText>
              </View>
              <View style={s.lineItem}>
                <SText style={{marginLeft:35}} fontSize={15} color="dark">联系电话</SText>
                <SText style={{marginRight:15}} color='dark5'>{item.driverPhone}</SText>
              </View>
              {
                item.carLongitude && item.carLatitude?
                <TouchableOpacity onPress={() => {
                  goLogisticsDetail && goLogisticsDetail(item.schedulingId);
                }}>
                  <Image
                    style={{marginLeft:35, width:Dimensions.get('window').width-50, height:150,
                      justifyContent:'center', alignItems:'center', marginBottom:15
                    }}
                    source={{uri: this._getMapStaticImageUri({ 
                      carLatitude:item.carLatitude, 
                      carLongitude:item.carLongitude 
                    })}}
                  >
                    <Image style={{width:32,height:45}} source={ICON_LOCATION_CAR} />
                  </Image>
                </TouchableOpacity>
                :
                null
              }
            </View>
          )
        }
      </View>
    )
  }
}

class InfoTitle extends SComponent{
  render(){
    return (
      <View style={[s.lineItem,{justifyContent:'flex-start',alignItems:'center'}]}>
        <View style={{marginLeft:15, backgroundColor:'#1C86E8', width:4, height:18, borderRadius:1.5}} />
        <SText style={{fontWeight:'500', marginLeft:10}} fontSize={15}>{this.props.title}</SText>
      </View>
    )
  }
}

class ItemTitle extends SComponent{
  render(){
    return (
      <View style={[s.lineItem,{justifyContent:'flex-start',alignItems:'center'}]}>
        <View style={{marginLeft:15, backgroundColor:'#1C86E8', width:8, height:8, borderRadius:4}} />
        <SText style={{fontWeight:'500', marginLeft:12}} fontSize={15}>{this.props.title}</SText>
      </View>
    )
  }
}