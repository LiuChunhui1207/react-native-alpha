/**
 * @Author: Niu
 * @Date:   2017-05-04 02:36:20
 * @Email:  niu@gmail.com
 * @Filename: app.js
 * @Last modified by:   willing
 * @Last modified time: 2017-06-27T14:13:57+08:00
 * @License: GNU General Public License（GPL)
 * @Copyright: ©2015-2017 www.songxiaocai.com 宋小菜 All Rights Reserved.
 */

'use strict';
import React from 'react';
import {
  connect,
} from 'react-redux';
import {Alert, Modal,View,Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import SplashScreen from './utils/splashScreen';
import SXCNavigator from './utils/SXCNavigator';
import {userAction} from 'actions';
import Login from './login';
import Home from './home';
import DoctorstrangeUpdater from 'react-native-doctorstrange-updater';
import AppUpdate from 'react-native-sxc-appupdate';
// import JPushModule from 'jpush-react-native';
import JPushManage from './jpush'
import * as Progress from 'react-native-progress';
import {SStyle, SText} from 'sxc-rn';
let s = SStyle({
    contentContainer: {
        backgroundColor: 'white',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    }
})

//DEV 区分debug包或release包
//TEST 区分测试环境或生产环境
global.__TEST__ = true;

if (!__DEV__) {
  global.console = {
    info: () => {},
    log: () => {},
    warn: () => {},
    error: () => {},
  };
}
//将设备信息存入全局变量中
__CACHE.set('deviceInfo', {
  uuid: DeviceInfo.getUniqueID(),
  version: DeviceInfo.getVersion(),
  deviceInfo: DeviceInfo.getModel(),
  sdk: DeviceInfo.getBuildNumber()   //app build number
});

class App extends React.Component {

  constructor(props) {
    super(props);
    __STORE.dispatch(userAction.getLocalUser()).catch( err=>{});
    this.state = {
      splashScreen: true,
      showDownLoad: false,
      downloadProgress: 0,
      downLoadEnd: false,
    }
    this._initialRoute = [{
      name: 'Login',
      index: 0,
      component: Login
    }]
    this._startRequest = Date.now();
  }

  componentDidMount() {
    this._hideSplashScreen();
    let appUpdate = new AppUpdate({
    apkVersionUrl: 'http://nodemiddleware.songxiaocai.org/caimi?platform=Android',
    iosAppId: '',
    enterprise: true,
    enterpriseUrl: 'https://songxiaocai.com/sxc_apps/index.html?name=caimi',
    iosEnterpriseVersionUrl: 'http://nodemiddleware.songxiaocai.org/caimi',
    needUpdateApp: (needUpdate, remoteData) => {
        Alert.alert(
          '有新版本啦,是否立即更新？',
          remoteData.attention? remoteData.attention : '无特别说明',
          [
            {text: '取消', onPress: () => {}},
            {text: '更新', onPress: () => needUpdate(true)}
          ]
        );
    },
    forceUpdateApp: () => {
        console.log("Force update will start")
    },
    notNeedUpdateApp: () => {
        console.log("App is up to date")
    },
    downloadApkStart: () => {
        this.setState({
            showDownLoad: true
        })
    },
    downloadApkProgress: (progress) => {
        this.setState({
            downloadProgress: progress,
        })
    },
    downloadApkEnd: () => {
        console.log("End")
        this.setState({
            showDownLoad: false
        })
    },
    onError: () => {
        Alert.alert(
          '下载出错',
          '请检查您的网络设置',
        );
    },

});
      appUpdate.checkUpdate();

    let updater = DoctorstrangeUpdater.getDoctorStrangeUpdater({
        // DEBUG打测试包设为true，打正式包时改为false
        DEBUG: true,
        debugVersionHost: 'http://192.168.0.146:3002/update/version/selectlatest',
        debugDownloadHost: 'http://192.168.0.146:3002/update/download',
        debugErrorReportHost: 'http://192.168.0.146:3002/update/errorreport',
        versionHost: `http://doctorstrange.songxiaocai.org/update/version/selectlatest`,
        downloadHost: `http://doctorstrange.songxiaocai.org/update/download`,
        errorReportHost: `http://doctorstrange.songxiaocai.org/update/errorreport`,
        allowCellularDataUse: true,
        showInfo: true,
        askReload: (reload) => {
            Alert.alert(
              '新功能准备就绪，是否立即应用?',
              null,
              [
                {text: '取消', onPress: () => {}},
                {text: '应用', onPress: () => reload(true)}
              ]
            );
        },
        //
        alreadyUpdated: () => {
            updater.showMessageOnStatusBar('已全部更新');
        },
        //
        needUpdateApp: () => {
            Alert.alert('应用版本过低', '请更新', [
                {text: '取消', onPress: ()=>{}},
                {text: '更新', onPress: ()=>{
                    Linking.openURL('https://songxiaocai.com/sxc_apps/index.html?name=caimi');
                }},
            ]);
        }
    });
    updater.checkUpdate();

      JPushManage.jPushInit()
  }

  componentWillReceiveProps(nextProps) {
    JPushManage.setJPushAlias(nextProps.userState.userId);
    if (nextProps.userState.sessionId) {
      this._initialRoute = [{
        name: 'Login',
        index: 0,
        component: Login
      },{
        name: 'Home',
        index: 1,
        component: Home
      }]
    }
  }

  _hideSplashScreen() {
    let diff = Date.now() - this._startRequest;
    if (diff > 2000) {
      this.setState({
        splashScreen: false
      });
    } else {
      setTimeout(() => {
        this.setState({
          splashScreen: false
        });
      }, 2000 - diff)
    }
  }

  _renderAppDownload = () => {

      return (
          <Modal
              transparent={true}
              visible={this.state.showDownLoad}
              onRequestClose={() => {
              }}
              >
              <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center'}}>
                  <View style={s.contentContainer}>
                      <SText fontSize='body' color='blue'>正在下载更新，请稍候：已下载{this.state.downloadProgress}%</SText>
                      <Progress.Bar progress={this.state.downloadProgress/100} width={300} />
                  </View>
              </View>
          </Modal>
      )
  }

  render() {
    if (this.state.splashScreen) {
      return ( <SplashScreen /> )
    }
    else {
      return (
        <View style={{flex: 1}}>
          <SXCNavigator
            barStyle="light-content"
            initialRoute={this._initialRoute}
          />
          {this._renderAppDownload()}
        </View>

      )
    }
  }


}

let setProps = (state) => {
  return {
    userState: state.userState
  }
}

module.exports = connect(setProps)(App);
