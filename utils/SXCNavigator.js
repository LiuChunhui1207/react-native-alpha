'use strict';
import React from 'react';
import {
  View,
  Platform,
  BackAndroid,
  StatusBar,
  Dimensions,
  Navigator,
} from 'react-native';

import {UtilsAction} from 'actions';
import customNavigatorSceneCfg from '../../config/routeSceneConfigs';
import Toast from './toast';
import Loading from './loading';
// var invariant = require('fbjs/lib/invariant');

let { height, width } = Dimensions.get('window');

if(Platform.OS == 'android' && Platform.Version < 21){
  height = height - 25;
} 

module.exports = class SXCNavigator extends React.Component {

  constructor(props){
    super(props);
    this._initialRouteStack = [];
    if(props.initialRoute instanceof Array){
      this._initialRouteStack = props.initialRoute;
    }
    else {
      this._initialRouteStack.push(props.initialRoute);
    }
  }

  componentWillUnmount() {
    BackAndroid.removeEventListener('hardwareBackPress',this._navigatorPop);
    global['showModal'] = null;
    global['hideModal'] = null;
  }

  componentDidMount() {
    //覆盖_hideScenes和_popN方法 使用路由实现modal
    this._refNavigator._hideScenes = this._hideScenes.bind(this._refNavigator)
    this._refNavigator.popN = this.popN.bind(this._refNavigator)
    this._refNavigator.replaceWithAnimation = this.replaceWithAnimation.bind(this._refNavigator)
  }

  _navigatorPop = () => {
    let routesArr = this._navigator.getCurrentRoutes(),len = routesArr.length;
    //modal层弹出时 禁用安卓物理返回键
    if(routesArr[len - 1].type == 'modal'){
      return true;
    }
    //路由栈中存在大于一个路由时 返回上级页面 否则退出程序 _exitFlag用来标记倒计时
    if (this._navigator && len > 2) {
      this._navigator.pop();
      return true;
    }
    else if(this._exitFlag){
      BackAndroid.exitApp();
      return false;
    }
    else {
      __STORE.dispatch(UtilsAction.toast('再按一次，退出程序', 2000));
      this._exitFlag = true;
      this._timer = setTimeout( () => {
          this._exitFlag = false;
      }, 2000);
      return true;
    }
  }

  replaceWithAnimation(route) {
    let activeLength = this.state.presentedIndex + 1;
    let activeStack = this.state.routeStack.slice(0, activeLength);
    let activeAnimationConfigStack = this.state.sceneConfigStack.slice(0, activeLength);
    let nextStack = activeStack.concat([route]);
    let destIndex = nextStack.length - 1;
    let nextSceneConfig = this.props.configureScene(route, nextStack);
    let nextAnimationConfigStack = activeAnimationConfigStack.concat([nextSceneConfig]);
    let replacedStack;
    if(this.state.routeStack[this.state.presentedIndex]['type'] === 'modal'){
      replacedStack = activeStack.slice(0, activeLength - 2).concat([route]);
    }
    else{
      replacedStack = activeStack.slice(0, activeLength - 1).concat([route]);
    }
    this._emitWillFocus(nextStack[destIndex]);
    this.setState({
      routeStack: nextStack,
      sceneConfigStack: nextAnimationConfigStack,
    }, () => {
      this._enableScene(destIndex);
      this._transitionTo(destIndex, nextSceneConfig.defaultTransitionVelocity, null, () => {
        this.immediatelyResetRouteStack(replacedStack);
      });
    });
  };

  /**
   * Override
   * Hides all scenes that we are not currently on, gesturing to, or transitioning from
   */
  _hideScenes() {
    let gesturingToIndex = null;
    if (this.state.activeGesture) {
      gesturingToIndex = this.state.presentedIndex + this._deltaForGestureAction(this.state.activeGesture);
    }
    for (let i = 0; i < this.state.routeStack.length; i++) {
      if (
          i === this.state.presentedIndex ||
          i === this.state.transitionFromIndex ||
          (i === this.state.presentedIndex - 1 && this.state.routeStack[this.state.presentedIndex]['type'] === 'modal') ||
          i === gesturingToIndex) {
        continue;
      }
      this._disableScene(i);
    }
  }

  /**
   * Override
   */
  popN(n) {
    // invariant(typeof n === 'number', 'Must supply a number to popN');
    n = parseInt(n, 10);
    if (n <= 0 || this.state.presentedIndex - n < 0) {
      return;
    }
    var popIndex = this.state.presentedIndex - n;
    var presentedRoute = this.state.routeStack[this.state.presentedIndex];
    var popSceneConfig = this.props.configureScene(presentedRoute); // using the scene config of the currently presented view
    //modal后退时 解决ios界面抖动
    if(this.state.routeStack[this.state.presentedIndex].type != 'modal'){
      this._enableScene(popIndex);
    }
    this._emitWillFocus(this.state.routeStack[popIndex]);
    this._transitionTo(
      popIndex,
      popSceneConfig.defaultTransitionVelocity,
      null, // no spring jumping
      () => {
        this._cleanScenesPastIndex(popIndex);
      }
    );
  }

  _renderScene =(route, navigator) => {
    //暴露showModal 和 hideModal方法到全局对象上 供SXCModal使用 感觉不是太好
    if(!global['showModal']){
      global['showModal'] = function(route){
        navigator.push({
          type: 'modal',
          ...route
        });
      }
      global['hideModal'] = function(route){
        let lastRoute = navigator.getCurrentRoutes().pop();
        if(lastRoute.type === 'modal'){
          navigator.pop();
        }
      }
    }
    //Android物理返回键事件监听
    if(Platform.OS == 'android' && !this._navigator){
      this._navigator = navigator;
      BackAndroid.addEventListener('hardwareBackPress', this._navigatorPop);
    }
    // if(route.type == 'modal'){
    //   let style = route.passStyle || {};
    //   console.log('dododo in  modal');
    //   console.log(route.component);
    //   if(typeof route.component === 'object'){
    //     // return (
    //     //   // <View style={[{flex: 1, width: width, height: height, backgroundColor: 'rgba(0,0,0,0.6)'}, style]}>
    //     //     route.component
    //     //   // </View>
    //     // )
    //     return route.component;
    //   }
    //   return (
    //     // <View style={[{flex: 1, width: width, height: height, backgroundColor: 'rgba(0,0,0,0.6)'}, style]}>
    //       <route.component
    //         navigator={navigator}
    //         route={route}
    //       />
    //     // </View>
    //   )
    // }
    if(typeof route.component === 'object'){
      return route.component;
    }
    return <route.component navigator={navigator} route={route} />
  }

  render() {
    return (
      <View style={{width: width, height: height, flex: 1, backgroundColor: 'transparent'}}>
        <StatusBar
          barStyle={this.props.barStyle || 'default'}
          translucent={true}
          backgroundColor="#495158" 
        />
        <Navigator
          ref={ view => this._refNavigator = view}
          configureScene={
            (route) => {
              let sceneConfig = route.configureScene || Object.assign({}, Navigator.SceneConfigs.FloatFromRight);
              if(route.type == 'modal'){
                sceneConfig.animationInterpolators = customNavigatorSceneCfg.FloatFromBottom.animationInterpolators;
              }
              // if(route.type == 'modal'){
              //     //去掉手势
              //     sceneConfig.gestures = {}
              // }
              //去掉进入动画
              if(route.animated == 'none'){
                  sceneConfig.animationInterpolators = customNavigatorSceneCfg.None.animationInterpolators;
              }

              if(route.animated == 'slide'){
                  sceneConfig.animationInterpolators = customNavigatorSceneCfg.FloatFromBottom.animationInterpolators;
              }
              //去掉手势
              sceneConfig.gestures = {};
              return sceneConfig;
            }
          }
          initialRouteStack={this._initialRouteStack}
          renderScene={this._renderScene} 
        />
        <Toast />
        <Loading />
      </View>
    );
  }
}
