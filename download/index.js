'use strict';
import React from 'react';
import {
  View, 
  Dimensions,
  NativeModules,
  InteractionManager,
  Image
} from 'react-native';
import {SComponent, SStyle, SText} from 'sxc-rn';
import {Page, } from 'components';
import RNFS from 'react-native-fs';
import {UtilsAction} from 'actions';
import { 
    IC_LAUNCHER
} from 'config';

const { width, height } = Dimensions.get('window');

module.exports = class Index extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      percentage: 0,
      url: props.route.url,
      width: 0
    }
  }

  componentDidMount() {
    let SXCUpdate= NativeModules.SXCUpdate;
    let progress = data => {
      let percentage = Math.floor((data.bytesWritten/data.contentLength) * 100);
      if(this.state.percentage != percentage){
        this.changeState({
          percentage: percentage,
          width: Math.floor(percentage * ((width - 20) / 100))
        })
      }
    };
    InteractionManager.runAfterInteractions( () => {
      RNFS.exists(SXCUpdate.documentFilePath).then( flag=> {
        if(!flag){
          RNFS.mkdir(SXCUpdate.documentFilePath).then( ()=> {
            RNFS.downloadFile({
              fromUrl: this.state.url,
              toFile: SXCUpdate.documentFilePath + 'songxiaocang.apk',
              progress: progress
            }).promise.then((response) => {
              if (response.statusCode == 200) {
                this.changeState({
                  percentage: 100,
                  width: width - 20
                })
                SXCUpdate.installApk(SXCUpdate.documentFilePath + 'songxiaocang.apk');
              } 
              else {
                __STORE.dispatch(UtilsAction.toast('下载失败，请稍后重试', 1000));
              }
            }).catch((err) => {});
          })
        }
        else{
          RNFS.downloadFile({
            fromUrl: this.state.url,
            toFile: SXCUpdate.documentFilePath + 'songxiaocang.apk',
            progress: progress
          }).promise.then((response) => {
            if (response.statusCode == 200) {
              SXCUpdate.installApk(SXCUpdate.documentFilePath + 'songxiaocang.apk');
            } 
            else {
              __STORE.dispatch(UtilsAction.toast('下载失败，请稍后重试', 1000));
            }
          }).catch((err) => {});
        }
      })
    })
  }

  render(){
      let style = {
          width: this.state.percentage
      }
      return (
          <Page pageLoading={false} title='更新' >
              <View style={{alignItems: 'center',justifyContent: 'center'}}>
                  <Image source={IC_LAUNCHER} style={{width: 120,height: 120, marginTop: 40}} />
              </View>
              <View style={{marginTop: 20, marginBottom: 30, alignItems: 'center'}}>
                  <SText
                      ref={view => this._text = view}
                      fontSize='caption' 
                      color='333'>
                      已完成{this.state.percentage}%
                  </SText>
              </View>
              <View style={{alignItems: 'center',justifyContent: 'center'}}>
                  <View style={{width: width - 20, borderRadius: 8, height: 10,backgroundColor: '#CCCCCC'}} />
                  <View 
                      ref={view=> this._progress = view} 
                      style={{position:'absolute', borderRadius: 8, width: this.state.width, left: 10, top: 0, height: 10,backgroundColor: '#4F92E0'}} />
              </View>
          </Page>
      )
  }
}
