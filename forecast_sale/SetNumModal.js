'use strict';
import React from 'react';
import { View, TouchableOpacity, Dimensions, TextInput, Modal, ScrollView, KeyboardAvoidingView  } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {SStyle, SComponent, SText } from 'sxc-rn';
import { Input, SInput, Toast } from 'components';
import {UtilsAction} from 'actions';
import { ICON_Loading_oval } from 'config';
let { height, width } = Dimensions.get('window');

const s = SStyle({
  container: {
    width: '@window.width*0.8',
    height: 150,
    backgroundColor: 'fff',
    borderWidth: 1,
    overflow: 'hidden',
    borderRadius: 10
  },
  wrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal:20
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  textInput: {
    width: width*0.8*0.5,
    height: 60,
    fontSize: 24,
    alignSelf: 'center',
    marginTop:0,
    padding: 0
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
export default class SetNumModal extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      visible: true,
      disabled: false,
      availableNum: null,
    };
  }
  componentWillMount(){
    this.state.availableNum = this.getRouteData('data').availableNum;
  }
  _handleTextChange = (text) => {
    this.changeState({
      availableNum: text
    });
  }
  _handleRightBtnPress = () => {
    this.setState({disabled: true});
    let availableNum = this.state.availableNum;
    let { forecastSkuId, catId } = this.getRouteData('data').activeRowInfo;
    if(availableNum == ''){
      return;
    }else if(!/^\d+$/gi.test(availableNum)){
      __STORE.dispatch(UtilsAction.toast('请输入数字'));
      return;
    }
    commonRequest({
      apiKey: 'salesForecastEditAvailableKey',
      objectName: 'skuAvailableDO',
      params: {
        forecastSkuId,
        availableNum,
        catId
      }
    })
    .then((res) => {
      if(res.success){
        let catAvailableNum = res.data.availableNum;
        this.getRouteData('callback')({catAvailableNum, availableNum});
        this.navigator().pop();
      }
    })
    .catch((err) => {
      console.log(err);
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
          this.navigator().pop();
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
        }}
        onPress={this._handleRightBtnPress}
      >
        <SText color='blue' fontSize='body'>确定</SText>
      </TouchableOpacity>
    )
  }
  render(){
    return (
      <KeyboardAvoidingView behavior='position' style={s.keyboardAvoidingView}>
          <View style={s.container}>
            <View style={s.wrapper}>
              <SText fontSize='mini_p' color='666' >预估销售量</SText>
              <TextInput
                ref={(ref) => { this._input = ref; }}
                style={s.textInput}
                clearButtonMode='while-editing'
                keyboardType={'numeric'}
                textAlign='center'
                value={this.state.availableNum + ''}
                onChangeText={this._handleTextChange}
                autoFocus={true}
                selectTextOnFocus={true}
              ></TextInput>
            </View>
            <View style={s.buttonContainer}>
              {this._renderLeftBtn()}
              {this._renderRightBtn()}
            </View>
          </View>
        <Toast ref={(ref) => this.toast = ref } />
      </KeyboardAvoidingView>
    )
  }
}
