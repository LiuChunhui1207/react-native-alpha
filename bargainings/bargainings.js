'use strict';
import React from 'react';
import {
  View,
  InteractionManager,
  StyleSheet
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
//议价列表
import BargainingList from './bargainingList';

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

module.exports = class Bargainings extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      pageLoading: true,

      itemCatList: [],
    }
  }

  componentDidMount(){
      let called = false;
      let timeout = setTimeout( () => {
          called = true;
          this._getData();
      }, 1000);

      InteractionManager.runAfterInteractions(() => {
          if (called) {
              return;
          }
          clearTimeout(timeout);
          this._getData();
      })
  }

  _getData = (endRefresh:Function) => {
    this.changeState({
      pageLoading: true
    })
    commonRequest({
      apiKey: 'queryBargainingOrderList', 
      objectName: 'bargainingPageQueryDO',
      params: {
        catId: -1
      }
    }).then( (res) => {
      let data = res.data;
      console.log(data)
      this.changeState({
        pageLoading: false,
        itemCatList: data.itemCatList,
      });
    }).catch( err => {
      this.changeState({
        pageLoading: false
      })
    })
  }

  _onChangeTab = (obj) => {
    // obj.ref._getData();
    // if(obj.i == 0){
    //   this.getRef('all')('_getData')();
    // } else if(obj.i == 1){
    //   this.getRef('waiting')('_getData')();
    // } else if(obj.i == 2) {
    //   this.getRef('resolved')('_getData')();
    // } else if(obj.i == 3) {
    //   this.getRef('rejected')('_getData')();
    // }
  }

  render(){
    const {
      pageLoading,
      itemCatList,
    } = this.state;
    const hasData = itemCatList && itemCatList instanceof Array && itemCatList.length>0;
    return (
      <Page title='议价列表' loading={false} pageLoading={pageLoading} back={()=>this.navigator().pop()}>
        {
          hasData
          ?
          <ScrollableTabView
            initialPage={0}
            scrollWithoutAnimation={true}
            onChangeTab={this._onChangeTab}
            tabBarBackgroundColor={'#fff'}
            tabBarTextStyle={{fontSize: 16}}
            tabBarActiveTextColor={'#0B90FF'}
            tabBarInactiveTextColor={'#333'}
            tabBarUnderlineColor={'#0B90FF'}
            renderTabBar={() => <ScrollableTabBar />}
            ref='ScrollableTabView'
            style={s.scrolltabview} >
            {
              itemCatList.map(itemCat => 
                <BargainingList 
                  key={itemCat.key}
                  ref={itemCat.key}
                  tabLabel={itemCat.value}
                  catId={itemCat.key}
                  route={this.props.route}
                  navigator={this.props.navigator}
                />
              )
            }
          </ScrollableTabView>
          :
          <View style={{marginTop: 30, alignItems: 'center'}}>
            <SText fontSize="body" color="000">暂无数据</SText>
          </View>
        }
      </Page>
    )
  }
}
