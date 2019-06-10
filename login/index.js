/**
 * @Author: jimmydaddy
 * @Date:   2017-06-06 11:21:19
 * @Email:  heyjimmygo@gmail.com
 * @Filename: index.js
 * @Last modified by:   willing
 * @Last modified time: 2017-06-27T11:52:11+08:00
 * @License: GNU General Public License（GPL)
 * @Copyright: ©2015-2017 www.songxiaocai.com 宋小菜 All Rights Reserved.
 */



'use strict';
import React from 'react';
import {
  View,
  Switch,
  Image,
  Keyboard,
  InteractionManager,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import {connect} from 'react-redux';
import {Page, Input, Button} from 'components';
import {SComponent, SStyle, SText} from 'sxc-rn';
import {userAction} from 'actions';
import { ICON_WARN } from 'config';
import Home from '../home';

let s = SStyle({
  username: {
  marginTop: 15,
  marginBottom: 'slimLine'
  },
  tipContainer: {
    marginLeft: 20,
    marginTop: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  tipIcon: {
    width: 15,
    height: 15,
    marginRight: 5
  },
  loginBtn: {
    marginTop: 25
  }
});

/**
 * 登录页
 */
class Content extends SComponent{
  static propTypes = {
    navigator: React.PropTypes.object.isRequired,
  };
  constructor(props){
    super(props);
    this.state = {
      showPassword: false,
      errorTip: null
    };
    this.params = {};
    if(__DEV__){
      this.params = {
        // loginName: '陈浩2',
        // loginName: '肖崇本',
        // loginName: '皮桥林',
        // loginName: '陈炉',
        // loginName: '谢敏雪',
        // loginName: '余玲兵',
        // loginName: '陈浩',
        // loginName: 'ued2',
        // loginName: '何为1',
          loginName: '周星星',
        // loginName: '肖秋艳',
        // loginName: '陈浩',
        //  loginName: 'lmh采购',
        // loginName: '陈炉',
        password:  '12345',
        // password:  'minlove'

      }
    }
    this._submit = this._submit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if(!nextProps.userState.sessionId){
      this.navigator().popToTop();
    }
  }

  _inputTextChange(key, value){
    if(this.state.errorTip){
      this.changeState({errorTip: null});
    }
    this.params[key] = value;
  }

  _submit(){
    if(!this.params['loginName']){
      return this.changeState({errorTip: '请填写用户名'});
    }
    if(!this.params['password']){
      return this.changeState({errorTip: '请填写密码'});
    }
    this.props.login(this.params).then( data => {
      Keyboard.dismiss();
      this.navigator().push({
        name: 'Home',
        component: Home
      })
    }).catch( err=>{});
  }
  render(){
    return (
      <Page
          pageName='登录'
          title='采秘' pageLoading={false} scrollEnabled={true}>
        <ScrollView keyboardShouldPersistTaps>
          <Input
            placeholder='请输入用户名'
            style={s.username}
            ref='username'
            underlineColorAndroid={'transparent'}
            onSubmitEditing={()=>{this.getRef('password')('focus')()}}
            onChangeText={(e)=>{this._inputTextChange('loginName', e)}}
          >
          </Input>
          <Input
            placeholder='请输入密码'
            ref="password"
            underlineColorAndroid={'transparent'}
            secureTextEntry={!this.state.showPassword}
            onSubmitEditing={this._submit}
            onChangeText={(e)=>{this._inputTextChange('password', e)}}
          >
          </Input>
          {this._renderErrorTip()}
          <Button style={s.loginBtn} type='green' size='middle' onPress={this._submit}>登录</Button>
        </ScrollView>
      </Page>
    )
  }
  _renderErrorTip(){
    if(this.state.errorTip){
      return (
        <View style={s.tipContainer}>
          <Image source={ICON_WARN} style={s.tipIcon} ></Image>
          <SText color='red' fontSize='caption'>{this.state.errorTip}</SText>
        </View>
      )
    }
  }
}
let setState = (state) => {
  return {
    userState: state.userState
  }
};
let setAction = (dispatch) => {
  return {
    login: (userQueryDO) => dispatch(userAction.login(userQueryDO))
  }
}
module.exports = connect(setState, setAction)(Content);
