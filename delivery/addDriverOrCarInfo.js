'use strict';
import React from 'react';
import {
  View,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {connect} from 'react-redux';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, Upload} from 'components';
import {UtilsAction} from 'actions';
import {
  EXAMPLE_PIC1,
  EXAMPLE_PIC2,
  UPLOAD_PIC
} from 'config';

let uploadUrl = 'http://218.244.135.116:8080/frmLossH5/imageUpload.do';;

if(__DEV__){
    uploadUrl = 'http://218.244.135.116:8080/frmLossH5/imageUpload.do';
}else{
    uploadUrl = 'http://erp.songxiaocai.com/frmLossH5/imageUpload.do';
}

let s = SStyle({
  text_input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: 'ccc'
  },
  add_pic: {
    marginTop: 10,
    width: 100,
    height: 100
  },
  example_pic1: {
    marginTop: 10,
    width: 150,
    height: 100
  },
  example_pic2: {
    marginTop: 10,
    width: 180,
    height: 100
  },
  item: {
    flexDirection: 'row',
    paddingLeft: 15,
    height: 45,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  pic_box: {
    marginBottom: 45,
    paddingLeft: 15,
    paddingRight: 45,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 10
  },
  upload: {}
});

class Index extends SComponent{
  constructor(props){
    super(props);
    this._id = 0;
    this._itemPictures = (
      <Upload
        {...props}
        picStyle={s.add_pic}
        showMsg={this._showMsg.bind(this)}
        changeData={this._photoChange.bind(this)}
        style={s.upload}
        key={this._id + ''}
        tag={this._id + ''}
        delete={this._photoDelete.bind(this)}
        uploadUrl={uploadUrl}
      />
    );

    if(props.route.type == 'driverName'){
      this._submitObj = {
        cityCode: props.userState.cityCode,
        type: props.route.id,
        phone: '',
        driverName: '',
        driverImg: ''
      }
    }
    else {
      this._submitObj = {
        cityCode: props.userState.cityCode,
        driverId: props.route.id,
        carImg: '',
        carId: ''
      }
    }
  }

  _showMsg(msg: String){
    __STORE.dispatch(UtilsAction.toast(msg, 1000));
  }

  _photoChange(photoUrl){
    if(this.props.route.type == 'driverName'){
      this._submitObj['driverImg'] = photoUrl;
    }
    else {
      this._submitObj['carImg'] = photoUrl;
    }
  }

  _photoDelete(){
    this._id++;
    this._itemPictures = (
      <Upload
        {...this.props}
        picStyle={s.add_pic}
        showMsg={this._showMsg.bind(this)}
        changeData={this._photoChange.bind(this)}
        style={s.upload}
        key={this._id + ''}
        tag={this._id + ''}
        delete={this._photoDelete.bind(this)}
        uploadUrl={uploadUrl}
      />
    );
    this.forceUpdate();
  }

  _onChangeText(type, value){
    this._submitObj[type] = value;
  }
  /**
   * 保存司机信息
   * @return {[type]} [description]
   */
  _submit(){
    //保存成功后 返回上一级页面 并且将司机信息传回
    commonRequest({
      apiKey: this.props.route.type == 'driverName' ? 'createDriverKey' : 'createCarKey', 
      objectName: this.props.route.type == 'driverName' ? 'driverQueryDO' : 'carQueryDO', 
      params: this._submitObj
    }).then( (res) => {
      if(res.success){
        this.navigator().pop();
        this.props.route.callback(res.data, this.props.route.type);
      }
      else{
        __STORE.dispatch(UtilsAction.toast(res.errorMessage, 1000));
      }
    }).catch( err => {})
  }

  render(){
    //添加司机
    if(this.props.route.type == 'driverName'){
      return (
        <Page title='添加物流司机' pageLoading={false} back={()=>this.navigator().pop()}>
          <View style={[s.item, {marginTop: 10}]}>
            <SText fontSize="body" color="333">司机姓名</SText>
            <TextInput onChangeText={this._onChangeText.bind(this, 'driverName')} style={s.text_input} placeholder="填写司机姓名" />
          </View>
          <View style={s.item}>
            <SText fontSize="body" color="333">手机号码</SText>
            <TextInput 
              maxLength={11} 
              keyboardType="numeric"
              onChangeText={this._onChangeText.bind(this, 'phone')} 
              style={s.text_input} 
              placeholder="填写司机手机号码" 
            />
          </View>
          <View style={s.pic_box}>
            <View>
              <SText fontSize="body" color="333">上传驾照图片</SText>
              {this._itemPictures}
            </View>
            <View>
              <SText fontSize="body" color="333">示例</SText>
              <Image style={s.example_pic1} source={EXAMPLE_PIC1}/>
            </View>
          </View>
          <Button type='green' size='middle' onPress={this._submit.bind(this)}>保存</Button>
        </Page>
      )
    }
    return (
      <Page title='添加物流车辆' pageLoading={false} back={()=>this.navigator().pop()}>
        <View style={[s.item, {marginTop: 10}]}>
          <TextInput onChangeText={this._onChangeText.bind(this, 'carId')} style={s.text_input} placeholder="填写车牌号码，例如:浙AF1234" />
        </View>
        <View style={s.pic_box}>
          <View>
            <SText fontSize="body" color="333">上传行驶证图片</SText>
            {this._itemPictures}
          </View>
          <View>
            <SText fontSize="body" color="333">示例</SText>
            <Image style={s.example_pic2} source={EXAMPLE_PIC2}/>
          </View>
        </View>
        <Button type='green' size='middle' onPress={this._submit.bind(this)}>保存</Button>
      </Page>
    )
  }
}

let setState = (state) => {
  return {
    userState: state.userState
  }
};

module.exports = connect(setState)(Index);
