'use strict';
import React from 'react';
import ReactNative, {
  View, 
  Text, 
  Linking, 
  WebView,
  Navigator,
  UIManager,
  ScrollView,
  TouchableWithoutFeedback, 
  InteractionManager,
  TouchableOpacity,
  Image,
  StyleSheet,
  ListView,
} from 'react-native';
import {connect} from 'react-redux';
import {SStyle, SComponent, SText} from 'sxc-rn';
import WebBridge from 'react-native-webview-bridge';
import {Page, Button, Row, CommonSelect} from 'components';
import ScrollableTabView from 'react-native-scrollable-tab-view';
//服务站列表
import PickHouseList from './pickHouseList';
//客户列表
import CustomerList from './customerList';
import {
  ICON_DOWN_L, 
  ICON_WARN, 
  ICON_NEXT, 
  ICON_DROPDOWN,
} from 'config';

let s = SStyle({
  wrap: {
    height: '@window.height',
    width: '@window.width',
  },
  icon_down: {
    marginTop: 2,
    marginLeft: 10,
    width: 17,
    height: 10,
  },
  web: {
    height: 210
  },
  warning_box: {
    height: 60,
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  icon_warning: {
    width: 15,
    height: 15,
  },
  icon_next: {
    width: 9,
    height: 15,
    marginRight: 15,
  },
  customer_box: {
    flexWrap: 'wrap',
    overflow: 'hidden',
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    flexDirection: 'row',
  },
  btn: {
    height: 24,
    justifyContent: 'center',
    borderColor: '#D4D4D4',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 3,
    paddingRight: 3,
    marginRight: 10,
    marginBottom: 10,
  },
  dropdown_wrap: {
    backgroundColor: '#fff', 
    alignItems: 'center', 
    paddingBottom: 6
  },
  icon_dropdown: {
    width: 15,
    height: 9,
  },
  scrolltabview: {
    marginTop: 2,
    // flex: 1,
    minHeight: 400,
    // height: 1500
  },
  right_styl: {
    position: 'absolute',
    top: -44,
    height: 44,
    left: 40,
    right: 15,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
    backgroundColor: '#2C98F0'
  }
});

//注入script
const injectScript =`
    function webViewBridgeReady(cb) {
      if (window.WebViewBridge) {
          cb(window.WebViewBridge);
          return;
      }
      function handler() {
          document.removeEventListener("WebViewBridge", handler, false);
          cb(window.WebViewBridge);
      }
      document.addEventListener("WebViewBridge", handler, false);
    }
    webViewBridgeReady(function (webViewBridge) {
      webViewBridge.onMessage = function (message) {
          eval(message);
      };
      window.IOS = {
          send: function(message){
              webViewBridge.send(message);
          }
      }
    });
`;

class MonitorCategory extends SComponent{
    constructor(props){
        super(props);
        this._tabHeightObj = {};
        this._ds = new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2});
        this.state = {
          activeTag: {},
          webViewData: {
            todayProfileList: []
          },
          tagWrapOpen: false,    //折叠标签组
          pageLoading: true,
          catId: [],        //品类的ID
          catSelected: [],      //被选中的品类
          citySelected: [],     //被选中的城市
          selectedCityCode: [],   //选中的城市的编码
          citySelector: [],   //城市列表
          warningInfo: '',    //预警信息
          tagLibList: [],     //用户标签列表

          dataSource: [],
          customers: [],   //客户列表
          pickHouses: [],  //服务站列表
        };
    }

    componentDidMount(){
        InteractionManager.runAfterInteractions( () => {
            this._getData1();
        })
    }
    
    //首先获取种类与城市
    _getData1(){
        commonRequest({
            apiKey: 'getCityCatInfoKey', 
            objectName: 'dealMonitorQueryDO',
            params: {}
        }).then( (res) => {   //方法返回的结果
            let data = res.data;
            let selectedCity = data.cityList ? [data.cityList[0]] : [];
            if(data.cityList && data.cityList.length > 0){
              data.cityList.map( city =>{
                if(city.cityCode === this.props.userState.cityCode){
                  selectedCity = [city];
                }
              })
            }
            this.setState({
                citySelector: data.cityList,
                catSelector: data.catList,
                catSelected: [data.catList[0]],
                citySelected: selectedCity,
                res: res,
            }, ()=>{
              this._getData2()
            });
        }).catch( err => {
          console.log('errr1:',err)
        })
    }
    
    //然后根据上一个接口的结果与tagId获取H5的数据
    _getData2(){
      commonRequest({
        apiKey: 'getDealMonitorInfoKey', 
        objectName: 'dealMonitorQueryDO',
        params: {
          catId: this.state.catSelected[0].catId, 
          selectedCityCode: this.state.citySelected[0].cityCode,
          tagId: -1
        }
      }).then( (res) => {
        let data = res.data;
        this.setState({
          webViewData: {
            todayProfileList: data.todayProfileList || []
          },
          activeTag: data.tagLibList ? data.tagLibList[0] : {},
          pageLoading: false,
          warningInfo: data.warningInfo,
          tagLibList: data.tagLibList || [],
          pickHouses: data.pickHouses || [],
          customers: data.customers || []
        }, ()=>{
          if(data.todayProfileList){
            this.refs.webviewbridge.sendToBridge('javascript: renderPage('+JSON.stringify(this.state.webViewData)+')')
          }
        });
      }).catch( err => {
        console.log('errr2:',err)
      })
    }

    _switchTag = ()=>{
      commonRequest({
        apiKey: 'getDealMonitorInfoKey', 
        objectName: 'dealMonitorQueryDO',
        withLoading: true,
        params: {
          catId: this.state.catSelected[0].catId, 
          selectedCityCode: this.state.citySelected[0].cityCode,
          tagId: this.state.activeTag.tagId !== undefined ? this.state.activeTag.tagId : -1
        }
      }).then( (res) => {
        let data = res.data;
        this.setState({
          webViewData: {
            todayProfileList: data.todayProfileList || []
          },
          pageLoading: false,
          warningInfo: data.warningInfo,
          tagLibList: data.tagLibList || [],
          pickHouses: data.pickHouses || [],
          customers: data.customers || []
        }, ()=>{
          if(data.todayProfileList){
            this.refs.webviewbridge.sendToBridge('javascript: renderPage('+JSON.stringify(this.state.webViewData)+')')
          }
        });
      }).catch( err => {
        console.log('errr2:',err)
      })

    }

    _onBridgeMessage(message){
      if(message == 'windowLoadEnd' && this.refs.webviewbridge){
        this.refs.webviewbridge.sendToBridge('javascript: renderPage('+JSON.stringify(this.state.webViewData)+')')
      }
    }
    
    _renderCenterBtn(){
      return(
        <Row style={{justifyContent: 'center'}}>
          <Image
            style={s.icon_down}
            source={ICON_DOWN} 
          />
        </Row>
      )
    }

    //头部右侧按钮
    _renderRightBtn(){
      return(
        <Row style={s.right_styl}>
          <Row 
            onPress={()=>{
              this.changeState({
                currentName: 'cat',
                keyName: 'catName',
                dataSource: this.state.catSelector,
                selected: this.state.catSelected
              }, ()=>{
                this._commonSelect._toggle()
              })
            }}
            style={{left: -10}}
          >
            <SText numberOfLines={1} fontSize='body' color='white'>{this.state.catSelected[0] ? this.state.catSelected[0].catName : ''}</SText>
            <Image style={[s.icon_down, {marginLeft: 1}]} source={ICON_DOWN_L} />
          </Row>
          <Row 
            onPress={()=>{
              this.changeState({
                currentName: 'city',
                keyName: 'cityName',
                dataSource: this.state.citySelector,
                selected: this.state.citySelected
              },()=>{
                this._commonSelect._toggle()
              })
            }}
            style={{position: 'absolute',right: 0, top: 12}}>
            <SText numberOfLines={1} fontSize='body' color='white'>{this.state.citySelected[0] ? this.state.citySelected[0].cityName : ''}</SText>
            <Image style={[s.icon_down, {marginLeft: 1}]} source={ICON_DOWN_L} />
          </Row>
        </Row>
      )
    }
    
    //切换选择列表
    _rightEvent = () => {
      this._commonSelect._toggle();
    }

    /**
     * CommonSelect 回调
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    _commonSelectCallback = (data, name) =>{
      this.changeState({
        [name + 'Selected']: data
      },()=>{
        this._switchTag()
      })
    }

    _tabClick = (tag) =>{
      this.changeState({
        activeTag: tag
      }, ()=>{
        this._switchTag();
      })
    }

    _renderTagLib(){
      if(this.state.tagLibList && this.state.tagLibList.length > 0){
        return (
          <View>
            <View style={[s.customer_box, this.state.tagWrapOpen ? {} : {height: 40}]}>
              {
                this.state.tagLibList.map(tag =>{
                  return (
                    <TouchableOpacity 
                      key={tag.tagId}
                      style={[s.btn, this.state.activeTag.tagId === tag.tagId ? {backgroundColor: '#FFF9EA', borderColor: '#FFCDB0'} : {}]}
                      onPress={()=>{
                        this._tabClick(tag);
                      }}
                    >
                      <SText fontSize='mini' color={this.state.activeTag.tagId === tag.tagId ? 'deepOrange' : '999'}>{tag.tagName}</SText>
                    </TouchableOpacity>
                  )
                })
              }
            </View>
            <TouchableOpacity 
              style={s.dropdown_wrap}
              onPress={()=>{
                this.changeState({
                  tagWrapOpen: !this.state.tagWrapOpen
                })
              }}
            >
              <Image 
                source={ICON_DROPDOWN} 
                style={[s.icon_dropdown, this.state.tagWrapOpen ? {transform: [{rotate: '180deg'}]} : {}]} 
              />
            </TouchableOpacity>
          </View>
        )
      }
      return null;
    }

    _renderWarnInfo(){
      if(this.state.warningInfo && this.state.warningInfo !== ''){
        return (
          <TouchableOpacity style={s.warning_box} onPree={this._checkWarningCustomer}>                        
              <Image source={ICON_WARN} style={s.icon_warning}/>
              <SText fontSize='caption' color='000' style={{marginLeft: 5}}>{this.state.warningInfo}</SText>
              <Image source={ICON_NEXT} style={s.icon_next}/>
          </TouchableOpacity>
        )
      }
      return null;
    }

    /**
     * 计算各个tab的高度
     * @param {[type]} key    [description]
     * @param {[type]} height [description]
     */
    _setHeight(key, height){
      this._tabHeightObj[key] = height + 60;
      this.changeState({
        currentTabHeight: height + 60
      })
    }

    _onChangeTab = (obj) => {
      if(this._tabHeightObj[obj.i]){
        this.changeState({
          currentTabHeight: this._tabHeightObj[obj.i]
        })
      }
    }


    render(){
      return (
        <Page 
          title={''}
          pageName='品类监控'
          pageLoading={this.state.pageLoading}
          back={() => this.navigator().pop()}
        >
          {this._renderRightBtn()}
          <ScrollView>
            {this._renderWarnInfo()}
            {this._renderTagLib()}
            {
              this.state.webViewData.todayProfileList && this.state.webViewData.todayProfileList.length > 0 ? 
              (
                <WebBridge
                  scrollEnabled={false}
                  automaticallyAdjustContentInsets={true}
                  ref="webviewbridge"
                  source={{uri: 'http://static.songxiaocai.com/sxf/KAModule/KACatGroup/index.html'}}
                  onBridgeMessage={this._onBridgeMessage.bind(this)}
                  injectedJavaScript={injectScript}
                  style={s.web} 
                />
              )
              : null
            }
            <ScrollableTabView
                initialPage={0}
                onChangeTab={this._onChangeTab}
                scrollWithoutAnimation={true}
                tabBarBackgroundColor={'#fff'}
                tabBarTextStyle={{fontSize: 16}}
                tabBarActiveTextColor={'#4E92DF'}
                tabBarInactiveTextColor={'#333'}
                tabBarUnderlineColor={'#4E92DF'}
                ref='ScrollableTabView'
                style={this.state.currentTabHeight ? {marginTop: 10, height: this.state.currentTabHeight} : {marginTop: 10}}
                // style={s.scrolltabview} 
            >
              <PickHouseList setHeight={this._setHeight.bind(this, 0)} data={this.state.pickHouses} ref="pickHouse" tabLabel="服务站" route={this.props.route} navigator={this.props.navigator} />
              <CustomerList setHeight={this._setHeight.bind(this, 1)} data={this.state.customers} ref="customer" tabLabel="客户" route={this.props.route} navigator={this.props.navigator} />
            </ScrollableTabView>
          </ScrollView>
          <CommonSelect 
            name={this.state.currentName}
            keyName={this.state.keyName}
            ref={ view => this._commonSelect = view}
            selectCallback={this._commonSelectCallback}
            dataSource={this.state.dataSource}
            selected={this.state.selected}
            multiple={false}
          />
        </Page>
      )
    }
}

let setState = (state) => {
  return {
    userState: state.userState
  }
};

module.exports = connect(setState)(MonitorCategory);