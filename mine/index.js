'use strict';
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity
} from 'react-native';
import {connect} from 'react-redux';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import { apiCfg } from 'config';
import {userAction, UtilsAction} from 'actions';
import CatList from './catList';
import * as storage from '../../service/storage';


var s = SStyle({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'fff',
    height: 45,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  flex1: {
    flex: 1
  },
  exitBtn: {
    marginTop: 20
  }
});

/**
 * 我的信息页面
 */
class Index extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      showInput: false,
      catListSize: 0,
      catList: []
    }
    this._logout = this._logout.bind(this);
  }
  /**
   * 退出
   * @return {[type]} [description]
   */
  _logout(){
    this.props.logout();
  }
  componentDidMount() {
    this._getData();
    storage.getItem('ENV_TYPE').then( item => {
      this.changeState({
        envType: item
      })
    })

  }
  /**
   * 获取我的品类数据
   * @return {[type]} [description]
   */
  _getData(){
    commonRequest({
      apiKey: 'queryMyCatListKey', 
      objectName: 'performanceQueryDO',
      params: {}
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        catListSize: data.catListSize,
        catList:     data.catList
      });
    }).catch( err => {})
  }
  /**
   * 切换环境
   * @return {[type]} [description]
   */
  _switchEnv = () => {
    let str = this._envType.toUpperCase();
    if(str === 'DEV' || str === 'PROD'){
      storage.setItem('ENV_TYPE', str);
      apiCfg.url = 1;
      this._logout();
    }
    else {
      __STORE.dispatch(UtilsAction.toast('请输入正确的环境参数！', 2000));
    }
  }
  render(){
    let userState = this.props.userState;
    return (
      <Page  ref='page' title='我的信息' pageLoading={false} back={()=>this.navigator().pop()}>
        <View style={s.item}>
          <SText fontSize="body" color="666" style={s.flex1}>姓名</SText>
          <SText fontSize="body" color="333">{userState.userName}</SText>
        </View>
        <View style={s.item}>
          <SText fontSize="body" color="666" style={s.flex1}>手机号</SText>
          <SText fontSize="body" color="333">{userState.mobilePhone}</SText>
        </View>
        <TouchableOpacity 
          onPress={()=>{
            this.navigator().push({
              component: CatList,
              name: 'CatList',
              data: this.state.catList
            })
          }} 
          activeOpacity={1} 
          style={s.item}
        >
          <SText fontSize="body" color="666" style={s.flex1}>我的品类</SText>
          <SText fontSize="body" color="333">{this.state.catListSize}</SText>
        </TouchableOpacity>
        <View style={[s.item, {marginTop: 10}]}>
          <SText fontSize="body" color="666" style={s.flex1}>当前版本</SText>
          <SText fontSize="body" color="333">{__TEST__ ? '' : 'v'}{__CACHE.get('deviceInfo').version}</SText>
        </View>
        <Button style={s.exitBtn} type='green' size='middle' onPress={this._logout}>退出登录</Button>
        {
          this.state.showInput ? 
            <View>
              <View 
                style={s.item}
              >
                <SText fontSize="body" color="666" style={s.flex1}>当前环境参数</SText>
                <SText fontSize="body" color="666" style={s.flex1}>{this.state.envType}</SText>
              </View>
              <View 
                style={s.item}
              >
                <SText fontSize="body" color="666" style={s.flex1}>dev：开发环境prod：正式环境</SText>
                <TextInput 
                  autoFocus 
                  onChangeText={(text)=>{
                    this._envType = text;
                  }}
                  style={s.flex1} 
                />
                <Button style={{width: 60}} type='green' size='middle' onPress={this._switchEnv}>确定</Button>
              </View>
            </View>
            : null
        }
        {
          __TEST__ ? 
            <TouchableOpacity 
              onLongPress={()=>{
                this.changeState({
                  showInput: true
                })
              }}
              style={s.flex1}
            >
            </TouchableOpacity>
            : null
        }
      </Page>
    )
  }
}
let setState = (state) => {
  return {
    userState: state.userState
  }
};
let setAction = (dispatch) => {
  return {
    logout: () => dispatch(userAction.logout())
  }
}
module.exports = connect(setState, setAction)(Index);
