'use strict';
import React from 'react';
import {
  View,
  Image,
  TextInput,
  ScrollView,
  InteractionManager,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, Row, SXCDateTimePicker, CommonSelect} from 'components';
import {UtilsAction} from 'actions';
import {str} from 'tools';
import {
  ICON_NEXT,
  ICON_ADD_BLUE,
} from 'config';

let s = SStyle({
  num_wrap: {
    paddingLeft: 12,
    alignItems: 'center',
    height: 55
  },
  flex1: {
    flex: 1
  },
  input: {
    flex: 1,
    textAlign: 'right'
  },
  feePrice: {
    textAlign: 'right',
    paddingRight: 8,
    marginTop: 4,
    width: 80,
    height: 36,
    borderWidth: 'slimLine',
    borderColor: 'f0'
  },
  input_wrap: {
    alignItems: 'center',
    height: 45,
    flex: 1,
  },
  item: {
    backgroundColor: 'fff',
    height: 45,
    paddingLeft: 14,
    paddingRight: 12,
    alignItems: 'center'
  },
  border_bottom: {
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  icon_next: {
    marginLeft: 8,
    width: 8,
    height: 13
  },
  driver_info_wrap: {
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#fff',
    width: '@window.width',
    height: '@window.height*0.3',
    position: 'absolute',
    left: 0,
    top: 100,
    bottom: 0,
    right: 0,
  },
});
/**
 * 创建物流单-填写送货信息
 * @type {[type]}
 */
module.exports = class AddDeliveryInfo extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      feeUnit: {},
      ...props.route.data,
    };
  }

  componentDidMount() {
    // InteractionManager.runAfterInteractions( () => {
    //   if(this._edit){
    //     this._getDetail();
    //   }
    //   else{
    //     this._getData();
    //   }
    // })
  }

  /**
   * 选择时间后的回调方法
   * @param  {[type]} date [时间戳]
   * @param  {[type]} key  []
   * @return {[type]}      [description]
   */
  _timePickerCallback(key, date){
    this.changeState({
      [key]: date
    })
  }

  /**
   * modal框回调方法
   * @return {[type]} [description]
   */
  _commonSelectCallback = (data, name) =>{
    console.log('do  in callback');
    console.log(data);
    this.changeState({
      feeUnit: data[0]
    })
  }

  /**
   * 选择司机
   * @return {[type]} [description]
   */
  _chooseDriver = (driver)=>{
    this.changeState({
      matchWords: null,
      driverName: driver.driverName,
      driverPhone: driver.driverPhone,
      driverCarId: driver.driverCarIds[0]
    })
  }


    /**
     * 验证车辆信息
     * @param vehicleNumber
     * @returns {boolean}
     */
    isVehicleNumber(vehicleNumber) {
        let result = false;
        if (vehicleNumber && vehicleNumber.length == 7){
            let expressAll = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[a-zA-Z]{1}[a-zA-Z0-9]{4}[a-zA-Z0-9挂学警港澳]{1}$/;
            result = expressAll.test(vehicleNumber);
        }
        //后面5位中至少有3位数字
        if(result){
            let str = vehicleNumber.substr(2);
            let expressNum = /^.*\d.*\d.*\d.*$/;
            result = expressNum.test(str);
        }
        return result;
    }

    /**
     * 验证手机号
     * @param phone
     * @returns {boolean}
     */
    isPhone(phone){
        var result = false;
        if(phone){
            var express = /^1[34578]\d{9}$/;
            result = express.test(phone);
        }
        return result;
    }

  /**
   * 发货按钮方法
   * @return {[type]} [description]
   */
  _delivery = ()=>{
    let params = {},
      state = this.state,
      errMsg = '';
    if(!state.driverName){
      return __STORE.dispatch(UtilsAction.toast('司机姓名不能为空！', 1000));
    }
    if(!this.isPhone(state.driverPhone)){
        return __STORE.dispatch(UtilsAction.toast('请输入正确的司机手机', 1000));
    }
    // if(!state.driverPhone){
    //   return __STORE.dispatch(UtilsAction.toast('司机电话不能为空！', 1000));
    // }
    if(!this.isVehicleNumber(state.driverCarId)){
        return __STORE.dispatch(UtilsAction.toast('请输入正确的车牌号', 1000));
    }
    // if(!state.driverCarId){
    //   return __STORE.dispatch(UtilsAction.toast('车辆信息不能为空！', 1000));
    // }
    if(state.feePrice == '' || state.feePrice == undefined){
      return __STORE.dispatch(UtilsAction.toast('运费不能为空！', 1000));
    }
    if(state.feeUnit.id === undefined){
      return __STORE.dispatch(UtilsAction.toast('运费单位不能为空！', 1000));
    }
    let apiKey = this.props.route.data.edit ? 'cmUpdateDeliveryOrderKey' : 'cmDeliveryOrderCreateKey';
    params = {
      deliveryTime: state.currentDeliveryTime,
      exportTime:   state.currentExportTime,      
      driver: {
        driverCarId: state.driverCarId,
        driverName:  state.driverName,
        driverPhone: state.driverPhone
      },
      feePrice:      state.feePrice * 100,
      feePriceUnit:  state.feeUnit.id,
      orderSkus:     state.orderSkus
    }
    //编辑时 需要传入物流主单id
    if(this.props.route.data.edit){
      params['deliveryOrderParentId'] = this.state.deliveryOrderParentId;
    }
    commonRequest({
      apiKey: apiKey, 
      withLoading: true,
      objectName: 'deliverOrderEditDO',
      params: params
    }).then( (res) => {
      let data = res.data;
      if(data){
        //跳转至列表页
        let route = this.navigator().getRoute('name', 'Delivery');
        this.navigator().popToRoute(route);
        this.props.route.callback && this.props.route.callback();
      }
    }).catch( err => {
      console.log(err)
    })
  }

  render(){
    return (
      <Page title='本次送货信息' pageLoading={false} back={()=>this.navigator().pop()}>
        <Row style={s.num_wrap}>
          <SText fontSize="body" color="999">
            待发件数：
            <SText fontSize="body" color="333">{this.state.totalWaitNum}  </SText>
            实发件数：
            <SText fontSize="body" color="orange">{this.state.totalActualNum}</SText>
          </SText>
        </Row>
        <ScrollView style={s.flex1}>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">司机姓名</SText>
            <TextInput 
              underlineColorAndroid={'transparent'}
              value={this.state.driverName}
              onChangeText={(text)=>{this.changeState({driverName: text, matchWords: text})}}
              placeholder="请输入"
              style={s.input} 
            />
          </Row>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">司机电话</SText>
            <TextInput 
              underlineColorAndroid={'transparent'}
              value={this.state.driverPhone}
              onChangeText={(text)=>{this.changeState({driverPhone: text})}}
              placeholder="请输入"
              keyboardType='numeric'
              style={s.input} 
            />
          </Row>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">车牌号</SText>
            <TextInput 
              underlineColorAndroid={'transparent'}
              placeholder="请输入"
              value={this.state.driverCarId}
              onChangeText={(text)=>{this.changeState({driverCarId: text})}}
              style={s.input} 
            />
          </Row>
          <Row style={[s.item, s.border_bottom]}>
            <SText style={s.flex1} fontSize="body" color="666">运费</SText>
            <TextInput 
              underlineColorAndroid={'transparent'}
              value={this.state.feePrice + ''}
              onChangeText={(text)=>{this.changeState({feePrice: text})}}
              style={s.feePrice} 
            />
            <Row
              onPress={()=>{
                this._commonSelect._toggle()
              }}
              style={{height: 45, alignItems: 'center', width: 80}} 
            >
              <View pointerEvents={'none'} style={[s.flex1, {height: 40}]}>
                <TextInput 
                  underlineColorAndroid={'transparent'}
                  style={{flex: 1, textAlign: 'right'}}
                  value={this.state.feeUnit ? this.state.feeUnit.value : ''}
                  placeholder="请选择"
                />
              </View>
              <Image source={ICON_NEXT} style={s.icon_next} />
            </Row>
          </Row>
          <Row style={[s.item, s.border_bottom]}>
            <SText style={s.flex1} fontSize="body" color="666">目的地</SText>
            <SText fontSize="body" color="666">{this.state.storehouseName}</SText>
          </Row>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">发货时间</SText>
            <Row 
              onPress={()=>{
                this._dateTimePicker._toggle(this._timePickerCallback.bind(this, 'currentDeliveryTime'))
              }}
              style={s.input_wrap}
            >
              <View pointerEvents={'none'} style={s.flex1}>
                <TextInput 
                  underlineColorAndroid={'transparent'}
                  value={str.date(this.state.currentDeliveryTime).format('y-m-d h:i')}
                  style={s.input} 
                  placeholder="请选择"
                />
              </View>
              <Image source={ICON_NEXT} style={s.icon_next} />
            </Row>
          </Row>
          <Row style={s.item}>
            <SText fontSize="body" color="666">预计到达时间</SText>
            <Row 
              onPress={()=>{
                this._dateTimePicker._toggle(this._timePickerCallback.bind(this, 'currentExportTime'))
              }}
              style={s.input_wrap}
            >
              <View pointerEvents={'none'} style={s.flex1}>
                <TextInput 
                  underlineColorAndroid={'transparent'}
                  value={str.date(this.state.currentExportTime).format('y-m-d h:i')}
                  style={s.input} 
                  placeholder="请选择"
                />
              </View>
              <Image source={ICON_NEXT} style={s.icon_next} />
            </Row>
          </Row>
        </ScrollView>
        <SXCDateTimePicker ref={view => this._dateTimePicker = view} />
        <CommonSelect
          keyName="value"
          ref={ view => this._commonSelect = view}
          selectCallback={this._commonSelectCallback}
          dataSource={this.state.feeUnitsSelector}
          name={this.state.currentName}
          selected={this.state.feeUnit}
          multiple={false}
        />
        <DriverList chooseDriver={this._chooseDriver} matchWords={this.state.matchWords} dataSource={this.state.drivers} />
        <Button onPress={this._delivery} type="green" size="large">确认发货</Button>
      </Page>
    )
  }
}

class DriverList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      dataSource: props.dataSource
    }
  }
  render(){
    let matchedArray = [];
    this.state.dataSource.map(item => {
      if(item.selectedInfo.indexOf(this.props.matchWords) != -1){
        matchedArray.push(item);
      }
    })
    if(!this.props.matchWords || matchedArray.length === 0){
      return null
    }
    return (
      <ScrollView style={s.driver_info_wrap}>
        {
          matchedArray.map((driver,index) => {
            return (
              <TouchableOpacity 
                onPress={()=>this.props.chooseDriver(driver)}
                style={[s.border_bottom, {height: 40, justifyContent: 'center', alignItems: 'flex-end'}]} 
                key={index}
              >
                <SText fontSize="caption" color="666">{driver.selectedInfo}</SText>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>
    )
  }
}
