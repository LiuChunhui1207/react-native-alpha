'use strict';
import React from 'react';
import { View, TouchableOpacity, InteractionManager, Dimensions, Image, TextInput, Modal, Platform, ScrollView, Animated, Easing, Keyboard } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {SStyle, SComponent, SText } from 'sxc-rn';
import { Popover, Input, SInput, Toast } from 'components';
import {UtilsAction} from 'actions';
import { ICON_Loading_oval } from 'config';
let { height, width } = Dimensions.get('window');
if(Platform.OS == 'android' && Platform.Version < 21){
    height = height - 25;
}

const s = SStyle({
  container: {
      width: '@window.width*0.8',
      backgroundColor: 'fff'
  },
  buttonContainer: {
      height: 45,
      flexDirection: 'row',
      borderColor: '#eee',
      borderTopWidth: 1
  },
  // 默认左边按钮样式
  leftBtn: {
      backgroundColor: 'f0',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
  },
  rightBtn: {
      backgroundColor: 'greenFill',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
  }
});
export default class CalModal extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      visible: false,
      disabled: false,
      basePrice: null,
      itemPrice: null,//单价
      predictionFirstNetProfit: null,//预估一毛净额
      predictionFirstNetProfitRate: null,//预估一毛净率
    };
    this.spinValue = new Animated.Value(0);
    this.debouceTimer = null;
  }
  componentWillMount(){
    let {basePrice,itemPrice,predictionFirstNetProfit,predictionFirstNetProfitRate} = this.props;
    this.setState({
      basePrice,itemPrice,predictionFirstNetProfit,predictionFirstNetProfitRate
    })
  }
  componentDidMount(){
    this.DeviceInfoStr = DeviceInfo.getModel();
  }
  spinning = () => {
    this.spinValue.setValue(0);
    Animated.timing(
      this.spinValue,
      {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear
      }
    ).start();
  }
  componentWillReceiveProps(nextProps){
    let {basePrice,itemPrice,predictionFirstNetProfit,predictionFirstNetProfitRate} = nextProps;
    this.setState({
      basePrice,itemPrice,predictionFirstNetProfit,predictionFirstNetProfitRate
    })
  }
  _handleSave(){
    let { basePrice,itemPrice,predictionFirstNetProfit,predictionFirstNetProfitRate } = this.state;
    this.props.onSave({basePrice,itemPrice,predictionFirstNetProfit,predictionFirstNetProfitRate})
  }
  _handleCalc(basePrice){
    commonRequest({
      apiKey: 'calcItemPredictionFirstNetProfitKey',
      objectName: 'calItemPredictionFirstNetProfitQueryDO',
      params: {
        basePrice,
        itemId: this.props.itemId
      }
    }).then( (res) => {
      let { predictionFirstNetProfit, predictionFirstNetProfitRate } = res.data;
      this.setState({predictionFirstNetProfit, predictionFirstNetProfitRate,isCalculating: false,disabled: false});
    }).catch((err) => {
      this.setState({isCalculating: false,disabled: false});
      this.toast._show(err);
    })
  }
  _toggle = () => {
    this.setState({
      visible: !this.state.visible
    });
  }
  _handleBasePriceChange = (val) => {
    clearTimeout(this.debouceTimer);
    this.setState({
      basePrice: val
    });
    if(val === ''){

    }else{
      let basePrice = val - 0;
      //basePrice 不为NaN
      if(basePrice === basePrice) {
        let itemPrice = (basePrice/this.props.productWeight).toFixed(2);
        this.setState({itemPrice});
        this.debouceTimer = setTimeout(() => {
          this.spinning();
          this.setState({isCalculating: true,disabled: true});
          this._handleCalc(basePrice);
          this.debouceTimer = null;
        },500);
      }else{
        this.toast._show('请输入正确的数字',500);
        clearTimeout(this.debouceTimer);
      }
    }
  }
  _handleRightBtnPress = () => {
    if(this.state.disabled === true){
      return;
    }else if( (this.state.predictionFirstNetProfit - 0) < 0 || (this.state.predictionFirstNetProfitRate - 0) < 0){
      this.toast._show('不能定价为负毛利');
      return;
    }else if(this.state.basePrice == null || this.state.basePrice === ''){
      this.toast._show('基础价格不能为空');
      return;
    }else{
      let basePrice = this.state.basePrice - 0;
      if(basePrice !== basePrice){
        this.toast._show('请输入正确的基础价格');
        return;
      }
    }
    this.setState({disabled: true});
    commonRequest({
      apiKey: 'itemBasePriceSaveKey',
      objectName: 'itemBasePriceSaveDTO',
      params: {
        basePrice: this.state.basePrice,
        itemId: this.props.itemId
      }
    }).then((res) => {
      if(res.data){
        this.state.disabled = false;
        this._toggle();
        this._handleSave();
        setTimeout(() => {
          __STORE.dispatch(UtilsAction.toast('保存成功',800));
        },300)
      }else{
        this.toast._show(res.errorMessage);
      }
    }).catch((err) => {
      this.toast._show(err);
    })
  }
  _renderLeftBtn(){
    return(
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          borderColor: '#fff',
          borderWidth: 1,
          borderRadius: 10,
        }}
        onPress={() => {
          this.setState({
            visible: false
          });
        }}
      >
        <SText color='666' fontSize='body'>取消</SText>
      </TouchableOpacity>
    )
  }
  _renderRightBtn(){
    return(
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          borderColor: '#fff',
          borderWidth: 1,
          borderRadius: 10,
          opacity: this.state.disabled ? 0.7 : 1,
        }}
        onPress={this._handleRightBtnPress}
      >
        <SText color='blue' fontSize='body'>确定</SText>
      </TouchableOpacity>
    )
  }
  render(){
    let spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    return (
        <Modal
          visible={this.state.visible}
          animationType='fade'
          transparent={true}
        >
          <ScrollView
            ref={(ref) => this.ScrollView = ref }
            keyboardShouldPersistTaps={false}
          >
            <View style={{flex: 1, width: width, height: height, backgroundColor: 'rgba(0,0,0,0.6)',justifyContent: 'center', alignItems: 'center'}}>
              <View style={[s.container,{borderWidth: 1,overflow: 'hidden',borderRadius: 10}]}>
                <View style={{justifyContent: 'space-between',alignItems: 'center',paddingTop: 20,paddingHorizontal:20}}>
                  <SText fontSize='mini_p' color='666' >基准定价(元/件)</SText>
                  <TextInput
                    ref={(ref) => this.basePriceInput = ref }
                    style={{width: width*0.8*0.5,height: 60,fontSize: 24,alignSelf: 'center',marginTop:0,padding: 0}}
                    clearButtonMode='while-editing'
                    keyboardType={'default'}
                    textAlign='center'
                    defaultValue={this.state.basePrice + ''}
                    onChangeText={this._handleBasePriceChange}
                    autoFocus={true}
                    onFocus={() => {
                      this.ScrollView.scrollTo({y: 130})
                    }}
                    onBlur={() => {
                      this.ScrollView.scrollTo({y: 0})
                    }}
                  ></TextInput>
                  <SText fontSize='mini_p' color='666' >{this.state.itemPrice === null ?  '-' : this.state.itemPrice} 元/斤</SText>
                  <View style={{flexDirection:'row',justifyContent: 'space-between',borderTopWidth: 1,borderColor: '#eee',marginTop: 10,paddingVertical: 10}}>
                    <View style={{flex: 1,alignItems: 'center'}}>
                      <SText fontSize='mini_p' color='666'>预估一毛净额(元)</SText>
                      {this.state.isCalculating ?
                        <Animated.Image source={ICON_Loading_oval} style={{width: 15,height: 15,transform: [{rotate: spin}] }}></Animated.Image>
                        :
                        <SText fontSize='caption_p' color={this.state.predictionFirstNetProfit < 0 ? 'red' : '666'}>{this.state.predictionFirstNetProfit}</SText>
                      }
                    </View>
                    <View style={{flex:1,alignItems: 'center'}}>
                      <SText fontSize='mini_p' color='666'>预估一毛率</SText>
                      {this.state.isCalculating ?
                        <Animated.Image source={ICON_Loading_oval} style={{width: 15,height: 15,transform: [{rotate: spin}]}}></Animated.Image>
                        :
                        <SText fontSize='caption_p' color={this.state.predictionFirstNetProfitRate < 0 ? 'red' : '666'}>{this.state.predictionFirstNetProfitRate}%</SText>
                      }
                    </View>
                    {/* <Input
                      multiline={true}
                      style={{borderColor: '#eee',borderWidth: 1,borderRadius: 4,minHeight: 40}}
                      placeholder='请填写定价过低的原因（最少4个字）'>
                    </Input> */}
                  </View>
                </View>
                <View style={s.buttonContainer}>
                  {this._renderLeftBtn()}
                  {this._renderRightBtn()}
                </View>
              </View>
            </View>
            <KeyboardSpacer></KeyboardSpacer>
            <Toast ref={(ref) => this.toast = ref } />
          </ScrollView>
        </Modal>
    )
  }
}
