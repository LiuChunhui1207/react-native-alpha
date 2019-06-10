'use strict';
import React from 'react';
import {
  View,
  RefreshControl,
  TouchableOpacity,
  ListView,
} from 'react-native';
import ScrollableTabView , { ScrollableTabBar }from 'react-native-scrollable-tab-view';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {UtilsAction} from 'actions';
import {Page, Row, Col, Button} from 'components';
//编辑商品信息页面
import SKUInfo from './skuInfo';
//选择品类页面
import SelectCategory from './create/select_category';
//定价页面
import ItemFixPrice from './itemFixPrice';

let s = SStyle({
  flex1: {
    flex: 1
  },
  btn_box: {
    height: 50,
    paddingLeft: 15,
    alignItems: 'center',
    paddingRight: 15
  },
  btn: {
    flex: 1,
    height: 30,
    backgroundColor: 'fff',
    justifyContent: 'center',
    borderColor: '#2296F3',
    alignItems: 'center'
  },
  btn_left: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4
  },
  btn_right: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4
  },
  btn_active: {
    borderWidth: 0,
    backgroundColor: '#2296F3'
  },
  item: {
    paddingLeft: 15,
    paddingTop: 15,
    paddingRight: 15,
    backgroundColor: 'fff',
    marginBottom: 10
  },
  num_box: {
    marginTop: 10,
    marginBottom: 6
  },
  operation: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
    height: 52,
    borderTopWidth: 1,
    borderColor: '#eee'
  },
  operationItem: {
    width: 88,
    height: 34,
    marginLeft: 10
  }
});
/**
 * 商品列表-售卖中
 *
 * @type {[type]}
 */
module.exports = class SkuList extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      activeTab: 0,
      refreshing0: false,
      refreshing1: false,
      originalDataSource0: [],
      originalDataSource1: [],
      itemVOs0: [],
      itemVOs1: []
    }
    this._queryObj = {
      shelves: 1,
      skuStatus: 1
    }
  }
  componentDidMount() {
    this._getData(0);
    this._getData(1);
  }

  _search(text){
    const activeTab = this.state.activeTab;
    if(this.state[`originalDataSource${activeTab}`].length > 0 && text != '' && text != undefined){
      let result = [];
      this.state[`originalDataSource${activeTab}`].map( item => {
        if(item.skuName.indexOf(text) != -1){
          result.push(item);
        }
      })
      this.changeState({
        [`itemVOs${activeTab}`]: result
      })
    }
    else{
      this.changeState({
        [`itemVOs${activeTab}`]: this.state[`originalDataSource${activeTab}`]
      })
    }
  }
  /**
   * [获取商品列表数据]
   * @return {[type]} [description]
   */
  _getData(tabIndex){
    this.changeState({
      [`refreshing${tabIndex}`]: true
    }, ()=>{
      commonRequest({
        apiKey: 'queryItemListKey',
        objectName: 'wcItemQueryDO',
        params: {
          shelves: tabIndex == 0 ? 1 : 0,
          skuStatus: 1
        }
      }).then( (res) => {
        let data = res.data;
        this.changeState({
          [`refreshing${tabIndex}`]: false,
          [`originalDataSource${tabIndex}`]: data.itemVOs,
          [`itemVOs${tabIndex}`]: data.itemVOs
        })
      }).catch( err => {
        this.changeState({
          [`refreshing${tabIndex}`]: false
        })
      })
    })
  }
  _renderCore(isCoreSku){
    if(!!isCoreSku){
      return (
        <View style={{width:56,height: 20,flex:0,alignItems: 'center',justifyContent: 'center', borderWidth: 1,borderColor: '#0092FF',borderRadius: 4}}>
          <SText color='blue' fontSize='mini'>核心商品</SText>
        </View>
      )
    }else{
      return null;
    }
  }
  /**
   * 商品列渲染方法
   * @return {[type]} [description]
   */
  _renderRow = (rowData, sectionID, rowID)=>{
    return (
      <View style={s.item}>
        <View style={{ flexDirection: 'row',flex: 1}}>
          <SText fontSize="body" color="333" style={{flex: 1}}>{rowData.skuName}</SText>
          {this._renderCore(rowData.coreSku)}
        </View>
        <SText style={s.num_box} fontSize="caption" color="666">
          已售<SText fontSize="caption" color="333">{` ${rowData.soldNum} `}</SText>件   库存<SText fontSize="caption" color="333">{` ${rowData.stockNum} `}</SText>件
        </SText>
        <SText fontSize="caption" color="666">上架城市  {rowData.shelvesCitys}</SText>
        {this._renderOperation(rowData)}
      </View>
    )
  }
  //todo 后端这次没做
  _renderSkuInfo(){

  }
  _renderCityInfoList(){

  }
  _renderOperation(rowData){
    return (
      <View style={s.operation}>
        <Button size='small' type='blue' style={s.operationItem} onPress={() => {
          this.navigator().push({
            component: ItemFixPrice,
            name: 'ItemFixPrice',
            data: {
              skuId: rowData.skuId
            }
          })
        }}>编辑价格</Button>
        <Button size='small' type='activeBlue' style={s.operationItem} onPress={() => {
          this.navigator().push({
            component: SKUInfo,
            name: 'SKUInfo',
            data: {
              skuId: rowData.skuId,
              spuId: rowData.spuId
            }
          })
        }}>编辑商品</Button>
      </View>
    )
  }
  /**
   * 城市上架/未上架城市点击事件
   * 0：城市上架
   * 1：未上架城市
   * @return {[type]} [description]
   */
  _tabClick = (num) =>{
    if(this.state.activeTab !== num){
      if(num === 0){
        // this._queryObj = {
        //   shelves: 1,
        //   skuStatus: 1
        // }
        this.changeState({
          activeTab: num
        })
      }
      else{
        // this._queryObj = {
        //   shelves: 0,
        //   skuStatus: 1
        // }
        this.changeState({
          activeTab: num
        })
      }
    }
  }
  _onChangeTab = (tabInfo) => {
    this._tabClick(tabInfo.i);
  }
  /**
   * 发布商品
   * @return {[type]} [description]
   */
  _saveItem = ()=>{
    this.navigator().push({
      callback: this.props.switchTab,
      component: SelectCategory,
      name: 'SelectCategory'
    })
    // __STORE.dispatch(UtilsAction.toast('功能开发中', 1000));
  }

  render(){
    return (
      <View style={s.flex1}>
        <ScrollableTabView
          renderTabBar={(props) =>  <ScrollableTabBar underlineHeight={2} style={s.tabbar} />}
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
          <ListView
            style={s.flex1}
            refreshControl={
              <RefreshControl
                style={{backgroundColor:'transparent'}}
                refreshing={this.state.refreshing0}
                onRefresh={this._getData.bind(this,0)}
                tintColor="#54bb40"
                title="加载中..."
                titleColor="#999"
                colors={['#2296f3']}
                progressBackgroundColor="#fff"
              />
            }
            initialListSize={10}
            enableEmptySections={true}
            dataSource={this._ds.cloneWithRows(this.state.itemVOs0)}
            renderRow={this._renderRow}
            tabLabel="城市上架"
          />
          <ListView
            style={s.flex1}
            refreshControl={
              <RefreshControl
                style={{backgroundColor:'transparent'}}
                refreshing={this.state.refreshing1}
                onRefresh={this._getData.bind(this,1)}
                tintColor="#54bb40"
                title="加载中..."
                titleColor="#999"
                colors={['#2296f3']}
                progressBackgroundColor="#fff"
              />
            }
            initialListSize={10}
            enableEmptySections={true}
            dataSource={this._ds.cloneWithRows(this.state.itemVOs1)}
            renderRow={this._renderRow}
            tabLabel="城市未上架"
          />
        </ScrollableTabView>
        <Button type='green' size='large' onPress={this._saveItem} >发布商品</Button>
      </View>
    )
  }
}
