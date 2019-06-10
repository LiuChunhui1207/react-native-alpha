'use strict';
import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Row, Button, SInput} from 'components';
import {UtilsAction} from 'actions';
// import ScrollableTabView from 'react-native-scrollable-tab-view';
import {ICON_SEARCH_W} from 'config';
//商品列表-售卖中
import SkuList from './skuList';
//商品列表-仓库中
import SkuListStored from './skuListStored';


let s = SStyle({
  input: {
    flex: 1,
    marginLeft: 10,
    paddingLeft: 10,
    height: 35,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  rightBtn: {
    width: 24,
    height: 24
  },
  search_wrap: {
    top: -40,
    left: 0,
    right: 0,
    height: 44,
    position: 'absolute',
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: '#2C98F0'
  },
  cancel: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTabItem: {
    width: 80,
    height: 28,
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  active: {
    color: '#fff',
    fontSize: 16
  },
  normal: {
    color: '#3BB8FF',
    fontSize: 14
  }
});

/**
 * 商品品类列表页面
 * @type {[type]}
 */
module.exports = class Index extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      page: 0,
      showSearchInput: false
    }
  }

  _switchTab = (tab1, tab2) =>{
    console.log('12321321312')
    this.changeState({
      page: tab1
    })
    if(tab1 === 0){
      this._onSale._tabClick(tab2);
    }
    if(tab2 === 1){
      this._stored._tabClick(tab2);
    }
  }

  _renderRightBtn(){
    return(
      <View style={s.rightBtnWrap}>
        <Image
          style={s.rightBtn}
          source={ICON_SEARCH_W} />
      </View>
    )
  }
  /**
   * [头部右侧按钮点击事件]
   * @date   2016-10-10
   * @return {[type]}   [description]
   */
  _rightEvent = () =>{
    //点击取消时 需要显示全部数据
    if(this.state.showSearchInput){
      this._onChangeText();
    }
    this.changeState({
      showSearchInput: !this.state.showSearchInput
    })
    // //售卖中
    // if(this.state.page === 0){
    //   this._onSale._search()
    // }
    // //仓库中
    // else{
    //   this._stored._search()
    // }
  }

  _onChangeText = (text) => {
    clearTimeout(this._timer);
    this._timer = setTimeout( ()=> {
      //售卖中
      if(this.state.page === 0){
        this._onSale._search(text);
      }
      //仓库中
      else{
        this._stored._search(text);
      }
    }, 500)
  }

  _onChangeTab = (obj)=>{
    this.state.page = obj.i
  }

  /**
   * 渲染搜索框
   * @return {[type]} [description]
   */
  _renderSearchInput(){
    if(this.state.showSearchInput){
      return (
        <Row style={s.search_wrap}>
          <SInput onChangeText={this._onChangeText} style={s.input} placeholder="可输入商品关键字搜索" />
          <TouchableOpacity style={s.cancel} onPress={this._rightEvent}>
            <SText fontSize="caption" color="white">取消</SText>
          </TouchableOpacity>
        </Row>
      )
    }
    return null;
  }
  _renderTitle(){
    return(
      <View style={{flex: 1,flexDirection: 'row',justifyContent: 'center'}}>
        <TouchableOpacity style={s.headerTabItem} onPress={() => {
          if(this.state.page != 0){
            this.changeState({ page: 0 })
          }
        }}>
          <Text style={this.state.page == 0 ? s.active : s.normal}>售卖中</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.headerTabItem} onPress={() => {
          if(this.state.page != 1){
            this.changeState({ page: 1 })
          }
        }}>
          <Text style={this.state.page == 1 ? s.active : s.normal}>仓库中</Text>
        </TouchableOpacity>
      </View>
    )
  }
  render(){
    return (
      <Page title={this._renderTitle()}
        pageLoading={false}
        pageName='商品管理首页'
        rightEvent={this._rightEvent}
        rightContent={this._renderRightBtn()}
        back={()=>this.navigator().pop()}
      >
        {this._renderSearchInput()}
        {/* <ScrollableTabView
          prerenderingSiblingsNumber={2}
          page={this.state.page}
          onChangeTab={this._onChangeTab}
          tabBarTextStyle={{
            fontSize: 18,
          }}
          tabBarBackgroundColor="#fff"
          tabBarActiveTextColor="#2296F3"
          tabBarInactiveTextColor="#999"
          tabBarUnderlineColor="#2296F3"
        >
          <SkuList ref={v=> this._onSale = v} switchTab={this._switchTab} {...this.props} tabLabel="售卖中" />
          <SkuListStored ref={v=> this._stored = v} switchTab={this._switchTab} {...this.props} tabLabel="仓库中" />
        </ScrollableTabView> */}
        {this.state.page == 0 ?
          <SkuList ref={v=> this._onSale = v} switchTab={this._switchTab} {...this.props} tabLabel="售卖中" />
          :
          <SkuListStored ref={v=> this._stored = v} switchTab={this._switchTab} {...this.props} tabLabel="仓库中" />
        }
      </Page>
    )
  }
}
