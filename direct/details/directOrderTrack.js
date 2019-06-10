'use strict';
import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  InteractionManager,
  PixelRatio
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button,Row} from 'components';
import {UtilsAction} from 'actions';
import { str } from 'tools'
const slimLine = 1 / PixelRatio.get()

const s = SStyle({
  lineItem: {
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#fff',
    borderTopWidth:1,
    borderColor:'#efefef',
    paddingTop:12,
    paddingBottom:12,
  },
  dot:{
    width:6,
    height:6,
    borderRadius:3,
    backgroundColor:'#2296F3',
    marginRight:8
  },
});
module.exports = class DirectOrderTrack extends SComponent{
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
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

  _getData() {
    const directPlanId = this.getRouteData('data').directPlanId;
    commonRequest({
      apiKey: 'queryDirectOrderTrackKey', 
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
    }).catch((err)=>{
      this.changeState({
          pageLoading: false,
      });
      __STORE.dispatch(UtilsAction.toast(err.errorMessage, 1000));
    });
  }

  render(){
    const { pageLoading } = this.state;
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.pageLoading}
            onRefresh={this._getData.bind(this)}
          />
        }
      >
        {
          pageLoading
            ?
            null
            :
            <View>
              {this._renderTitle()}
              {this._renderGoodsList()}
            </View>
        }
      </ScrollView>
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
  _renderTitle(){
    return(
      <Row style={{height:35,alignItems:'center',borderBottomWidth:1 / PixelRatio.get(),borderColor:'#eee',backgroundColor:'#fff',paddingLeft:15,paddingRight:15,marginTop:10}}>
        <SText fontSize='tiny_plus' color='dark5' style={{flex:1}} >商品名</SText>
        <SText fontSize='tiny_plus' color='dark5' style={{width:60,textAlign:'center'}}>价格(元/斤)</SText>
        <SText fontSize='tiny_plus' color='dark5' style={{width:60,textAlign:'center'}}>订单件数</SText>
        <SText fontSize='tiny_plus' color='dark5' style={{width:60,textAlign:'right'}}>预估件数</SText>
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
  _renderGoodsList(){
    console.log('_renderGoodsList',this.state.pickVO,this.state)
    if (this.state.pickVO){
      return(
        this.state.pickVO.map((item, index)=>{
          return(
            <View style={{backgroundColor:'#fff',paddingLeft:15,marginTop:index===0?0:10}}>
              <Row style={{flex:1,borderTopWidth:index === 0 ? 0 : 1 / PixelRatio.get(),borderColor:'#eee',paddingTop:10,paddingBottom:10,flexDirection:'row',alignItems:'center'}}>
                <View style={s.dot}/>
                <SText fontSize='caption_plus' color='dark' style={{fontWeight:'500' }} >{item.pickHouseName}</SText>
                <SText  fontSize='caption_plus' color='dark5' style={{flex:1}} > {this._getTimeLabel(item)}</SText>
                <SText fontSize='mini_plus' color='dark' style={{width:60,textAlign:'center'}}>{item.totalOrderNum !== null ? item.totalOrderNum+'' : '-'}</SText>
                <SText fontSize='mini_plus' color='dark' style={{width:60,textAlign:'right',marginRight:15}}>{item.totalForecastNum !== null ? item.totalForecastNum+'' : '-'}</SText>
              </Row>
              {
                item.skuAndSaleVOS ? item.skuAndSaleVOS.map((cItem)=>{
                  return(
                    <Row style={{marginLeft:15,paddingRight:15,paddingTop:10,paddingBottom:10,borderTopWidth: 1 / PixelRatio.get(),borderColor:'#eee'}}>
                      <View style={{flex:1}} >
                        <Row style={{alignItems:'center'}}>
                          <View style={{borderWidth:slimLine,borderColor:'rgba(2,29,51,0.3)',height:18,paddingLeft:2,paddingRight:2,marginRight:5}}>
                            <SText fontSize='mini_plus' color='dark' >{cItem.skuId}</SText>
                          </View>
                          <SText fontSize='caption_plus' color='dark' >{cItem.localTitle}</SText>
                        </Row>
                        {/*<SText fontSize='caption_plus' color='dark' >{cItem.localTitle}</SText>*/}
                        <SText fontSize='mini_plus' color='dark5'  style={{marginTop:3}}>{cItem.spuName}</SText>
                      </View>
                      <Row style={{alignItems:'center'}}>
                        <SText fontSize='mini_plus' color='dark5' style={{width:60,textAlign:'center'}}>{cItem.forecastPrice ? cItem.forecastPrice : '-'}</SText>
                        <SText fontSize='mini_plus' color={cItem.saleWarn?'#FF7043':'dark5'} style={{width:60,textAlign:'center'}}>{cItem.orderNum ? cItem.orderNum+'' : '-'}</SText>
                        <SText fontSize='mini_plus' color='dark5' style={{width:60,textAlign:'right'}}>{cItem.forecastNum !== null ? cItem.forecastNum+'' : '-'}</SText>
                      </Row>
                    </Row>
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
}

class OrderItem extends SComponent{
  render(){
    const { catName, pickHouseName, totalEstimateNum, totalOrderNum, directItemList } = this.props;
    return (
      <View style={{backgroundColor:'red'}}>
        <View style={s.lineItem}>
          <ItemTitle style={{flex:3}} title={catName} subTitle={pickHouseName} />
          <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='rgba(2,29,51,0.54)'>{totalEstimateNum || '0'}</SText>
          <SText style={{flex:1,textAlign:'center'}} fontSize={13} color='rgba(2,29,51,0.54)'>{totalOrderNum || '0'}</SText>
        </View>
        {
          directItemList && directItemList.length?
          directItemList.map((item, i) =>
            <View key={i} style={s.lineItem}>
              <View style={{flex:3}}>
                <SText style={{marginLeft:35}} fontSize={15} color='#021D33'>{item.itemName}</SText>
              </View>
              <SText style={{flex:1,textAlign:'center'}} fontSize={15} color='#3C424B'>{item.estimateNum || '0'}</SText>
              <SText style={{flex:1,textAlign:'center'}} fontSize={15} color='#3C424B'>{item.orderNum || '0'}</SText>
            </View>
          )
          :
          null
        }
      </View>
    )
  }
}

class ItemTitle extends SComponent{
  render(){
    return (
      <View style={[{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'},this.props.style]}>
        <View style={{marginLeft:15, backgroundColor:'#1C86E8', width:8, height:8, borderRadius:4}} />
        <SText style={{fontWeight:'500', marginLeft:12}} fontSize={15}>{this.props.title}</SText>
        <SText style={{marginLeft:12}} fontSize={13} color='rgba(2,29,51,0.54)'>{this.props.subTitle}</SText>
      </View>
    )
  }
}