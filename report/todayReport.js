'use strict';
import React from 'react';
import {
  View,
  Image,
  RefreshControl,
  Platform,
  UIManager,
  InteractionManager,
  LayoutAnimation,
  ListView,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Row, CommonSelect} from 'components';
import EditItemInfo from './editItemInfo';
import {str} from 'tools';
import {UtilsAction} from 'actions';
import StoreHouseList from './storeHouseList';
//设置单个商品库存页面
import SKUInfo from '../commodity/skuInfo';
//选择供应商页面-根据spu过滤
import SingleSpuSupplierList from '../supplier/singleSpuSupplierList';
//创建采购订单页面
import AddPurchaseOrder from '../purchase/addPurchaseOrder';

import {
  ICON_NEXT,
  ICON_LOCATION
} from 'config';

let s = SStyle({
  right_box: {
    alignItems: 'center'
  },
  icon_location: {
    marginBottom: 2,
    width: 12,
    height: 16
  },
  service_box: {
    height: 45,
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  icon_next: {
    width: 7,
    height: 12
  },
  head_box: {
    flexDirection: 'row',
    height: 45,
    alignItems: 'center'
  },
  head_item: {
    flex: 1,
    textAlign: 'center'
  },
  row_item: {
    backgroundColor: 'fff',
  },
  row_box: {
    justifyContent: 'center',
    borderBottomWidth: 'slimLine',
    paddingLeft: 15,
    borderColor: 'e5',
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5
  },
  row_title: {
    flex: 1,
    marginLeft: 15,
  },
  btn_box: {
    flexDirection: 'row',
    paddingBottom: 10,
    paddingTop: 10,
    paddingLeft: 15,
    paddingRight: 15
  },
  btn_item: {
    flex: 1,
    backgroundColor: '#fff',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    marginRight: 3,
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 4
  },
  band_supplier: {
    height: 20,
    borderWidth: 1, 
    borderRadius: 4, 
    borderColor: '#FE7D00', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5, 
    paddingRight: 5, 
    marginRight: 15
  },
  spuName: {
    paddingTop: 10,
    paddingBottom: 6
  }
});

/**
 * 今日订单报表页面
 * @type {[type]}
 */
module.exports = class TodayReport extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      pageNum: 0,
      skuInfos: [],
      citySelector: [],
      citySelected: [],
      currentRowData: {},
      refreshing: false,
      cityVOs:    [],
      markets:    [],
      dataSource: []
    }
    //选择服务站内容
    this._showName = '选择服务站';
    if(props.route.data.fromTodayMatters){
      this._queryObj = {
        currentPage: 1,
        searchCityCodes: [],
        searchPickhouseIds: [],
        pageJump: props.route.data.pageJump
      }
    }
    else{
      this._queryObj = {
        currentPage: 1,
        searchCityCodes: [],
        searchPickhouseIds: []
      }
    }
  }

  _renderRightBtn(){
    return(
      <View style={s.right_box}>
        <Image source={ICON_LOCATION} style={s.icon_location}/>
        <SText fontSize='mini' color='fff'>{this.state.citySelected[0] ? this.state.citySelected[0].value : ''}</SText>
      </View>
    )
  }

  _rightEvent = () =>{
    this._commonSelect._toggle();
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  _getData = () =>{
    this.changeState({
      refreshing: true
    }, ()=>{
      commonRequest({
        apiKey: 'getSkuExpandInfoListKey_new', 
        objectName: 'todayOrderQueryDO',
        params: this._queryObj
      }).then( (res) => {
        let data = res.data;
        if(this.state.citySelected.length === 0){
          this.state.citySelected = [data.citySelector[0]];
        }
        this.changeState({  
          refreshing: false,
          pageNum: data.pageNum,
          citySelector: data.citySelector,
          pickhouseSelector: data.pickhouseSelector,
          // citySelected: this.state.citySelected.length === 0 ? [data.citySelector[0]],
          skuInfos: data.skuInfos
        });
      }).catch( err => {
        this.changeState({
          refreshing: false
        })
      })
    })
  }

  /**
   * 创建采购单 回调
   * @return {[type]} [description]
   */
  _addPurchaseOrderCallback = ()=>{
    commonRequest({
      apiKey: 'getSkuExpandInfoListKey_new', 
      withLoading: true,
      objectName: 'todayOrderQueryDO',
      params: {
        ...this._queryObj,
        fullPage: 1,
      }
    }).then( (res) => {
      let data = res.data;
      this.changeState({  
        pageNum: data.pageNum,
        // citySelector: data.citySelector,
        skuInfos: data.skuInfos
      });
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }

  _search = (loading) =>{
    this._queryObj.currentPage = 1;
    this._listView.scrollTo({x: 0, y: 0, animated: true});
    commonRequest({
      apiKey: 'getSkuExpandInfoListKey_new', 
      withLoading: loading === false ? false : true,
      objectName: 'todayOrderQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      this.changeState({  
        currentRowData: {},
        pageNum: data.pageNum,
        pickhouseSelector: data.pickhouseSelector,
        skuInfos: data.skuInfos
      });
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }

  /**
   * 加载更多数据
   * @return {[type]} [description]
   */
  _loadMore = () =>{
    this._queryObj.currentPage++;
    commonRequest({
        apiKey: 'getSkuExpandInfoListKey_new', 
        objectName: 'todayOrderQueryDO',
        params: this._queryObj
    }).then( (res) => {
        let data = res.data;
        this.changeState({
            skuInfos: this.state.skuInfos.concat(data.skuInfos),
            pageNum: data.pageNum,
        });
    }).catch( err => {
        this._queryObj.currentPage--;
    })
  }

  _runAnimate(rowData){
    if(this.state.currentRowData.spuId === rowData.spuId){
      //隐藏按钮组
      this.setState({
        currentRowData: {}
      })
    }
    else{
      //隐藏原按钮组 并且显示新的
      this.setState({
        currentRowData: rowData
      })
    }
  }

  /**   this.props.route.name /spuid/skuid
   * 编辑商品信息
   * @return {[type]} [description]
   */
  _btnHandler(type){
      let route = {}, currentRowData = this.state.currentRowData;
      //修改库存
      if(type == 'modify'){
        route = {
          component: SKUInfo,
          name: 'SKUInfo',
          data: {
            spuId: currentRowData.spuId,
            skuId: currentRowData.skuId
          }
        }
      } 
      //编辑信息
      else if(type == 'edit'){
        route = {
          component: EditItemInfo,
          name: 'EditItemInfo',
          skuId: currentRowData.skuId,
          spuId: currentRowData.spuId
        }
      }
      //去采购
      else if(type == 'purchase'){
        //有绑定供应商 直接跳至创建采购单页面
        if(currentRowData.bandSupplierStatus === 1){
          route = {
            callback: this._addPurchaseOrderCallback,
            component: AddPurchaseOrder,
            name: 'AddPurchaseOrder',
            data: {
              supplierId: currentRowData.supplierId,
              skuId: currentRowData.skuId
            }
          }
        }
        else{
          route = {
            callback: this._addPurchaseOrderCallback,
            component: SingleSpuSupplierList,
            name: 'SingleSpuSupplierList',
            data: currentRowData
          }
        }
      }
      this.navigator().push(route)
  }

  _renderBtns(rowId, style){
    if(this.state.currentRowData.spuId && this.state.currentRowData.spuId == rowId){
      return (
        <View style={{paddingBottom: 5, backgroundColor: '#fff'}}>
          <View style={[s.btn_box]}>
            <TouchableOpacity 
              onPress={
                ()=>{
                  this._btnHandler('modify')
                }
              }
              style={s.btn_item}
            >
              <SText fontSize="body" color="blue">修改库存</SText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={
                ()=>{
                  this._btnHandler('edit')
                }
              }
              style={s.btn_item}
            >
              <SText fontSize="body" color="blue">编辑信息</SText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={
                ()=>{
                  this._btnHandler('purchase')
                }
              }
              style={s.btn_item}
            >
              <SText fontSize="body" color="blue">去采购</SText>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    return null;
  }

  /**
   * 选择服务站后的回调
   * @param  {[type]} ids [description]
   * @return {[type]}     [description]
   */
  _selectStorehouseCallback = (ids, showName) =>{
    this._queryObj.searchPickhouseIds = ids;
    this._showName = showName;
    this._search();
  }

  /**
   * 前往选择服务站列表
   * @return {[type]} [description]
   */
  _selectStorehouse = () =>{
    //单个城市才支持 按服务站过滤
    if(this.state.citySelected.length > 0 && this.state.citySelected[0].id !== -1){
      let selectedObj = {}, nameArray = this._showName.split('、');
      this._queryObj.searchPickhouseIds.map( (id, index) => {
        selectedObj[id] = nameArray[index];
      })
      this.navigator().push({
        callback: this._selectStorehouseCallback,
        selected: selectedObj,
        component: StoreHouseList,
        name: 'StoreHouseList',
        data: this.state.pickhouseSelector
      })
    }
    else {
      return __STORE.dispatch(UtilsAction.toast('请切换至单个城市', 1500));
    }
  }

  /**
   * 渲染是否有绑定供应商
   * @return {[type]} [description]
   */
  _renderTips(status){
    //1:已绑定
    if(status === 1){
      return (
        <View style={s.band_supplier}>
          <SText style={{color: '#FE7D00'}} fontSize="mini" color="deepOrange">绑定供应商</SText>
        </View>
      )
    }
    //2:已绑定,临时解绑
    if(status === 2){
      return (
        <View style={[s.band_supplier, {opacity: 0.4}]}>
          <SText style={{color: '#FE7D00'}} fontSize="mini" color="deepOrange">绑定供应商</SText>
        </View>
        )
    }
    //0:未绑定
    return null
  }

  /**
   * 城市维度展示sku信息
   * @return {[type]} [description]
   */
  _renderCitySkuInfos(citySkuInfos){
    if(!str.arrIsEmpty(citySkuInfos)){
      return citySkuInfos.map(sku => {
        return (
          <View key={sku.cityCode} style={[s.row_box, sku.warnFlag ? {backgroundColor: 'rgba(255,0,0,0.1)'} : {}]}>
            <View style={{flex: 1.5, flexDirection: 'row'}} >
              {
                this.state.citySelected.length > 0 && this.state.citySelected[0].id !== -1 ? null
                :
                <SText style={{width: 60, marginTop: 1}} fontSize="body" color="666">{sku.cityName}</SText>
              }
              <SText style={sku.warnFlag ? {flex: 1, textAlign: 'center', color: '#FF0000'} : {}} fontSize="body" color="666">{sku.needPurchaseNum}</SText>
            </View>
            <SText style={s.head_item} fontSize="body" color="666">{sku.stockNum}</SText>
            <SText style={s.head_item} fontSize="body" color="666">{sku.purchaseNum}</SText>
            <SText style={s.head_item} fontSize="body" color="666">{sku.orderNum}</SText>
            <SText style={s.head_item} fontSize="body" color="666">{sku.estimateStockNum}</SText>
          </View>
        )
      })
    }
    return null;
  }

  _renderRow = (rowData, sectionID, rowID) =>{
    return (
      <View key={rowData.spuId} style={{marginTop: 10}}>
        <TouchableOpacity 
          activeOpacity={1}
          onPress={()=>{
            this._runAnimate(rowData);
          }}
          style={s.row_item}
        >
          <Row style={s.spuName}>
            <SText style={s.row_title} fontSize="body" color="333">{rowData.skuName}</SText>
            {this._renderTips(rowData.bandSupplierStatus)}
          </Row>
          {this._renderCitySkuInfos(rowData.citySkuInfos)}
        </TouchableOpacity>
        {this._renderBtns(rowData.spuId)}
      </View>
    )
  }

  /**
   * 选择城市回调
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  _commonSelectCallback = (data) => {
    this._queryObj.searchCityCodes = [data[0].id];
    if(data[0] && data[0].id === -1){
      this._showName = '选择服务站';
      this._queryObj.searchPickhouseIds = [];
    }
    this.changeState({
      citySelected: data
    }, ()=>{
      this._search()
    });
  }

  render(){
    return (
      <Page 
        title='今日订单报表' 
        pageLoading={false} 
        rightContent={this._renderRightBtn()} 
        rightEvent={this._rightEvent}
        back={()=>this.navigator().pop()}
      >
        <TouchableOpacity 
          onPress={this._selectStorehouse}
          style={s.service_box}
        >
          <SText numberOfLines={1} fontSize="body" color="333">{this._showName}</SText>
          <Image source={ICON_NEXT} style={s.icon_next}/>
        </TouchableOpacity>
        <View style={s.head_box}>
          <SText style={[s.head_item, {flex: 1.5}]} fontSize="body" color="blue">剩余应采</SText>
          <SText style={s.head_item} fontSize="body" color="666">库存</SText>
          <SText style={s.head_item} fontSize="body" color="666">已采</SText>
          <SText style={s.head_item} fontSize="body" color="666">总订单</SText>
          <SText style={s.head_item} fontSize="body" color="666">预估</SText>
        </View>
        <ListView
          ref={v => this._listView = v}
          // style={{flex: 1, backgroundColor: '#fff'}}
          refreshControl={
            <RefreshControl
              style={{backgroundColor:'transparent'}}
              refreshing={this.state.refreshing}
              onRefresh={()=>{
                this._queryObj.currentPage = 1;
                this._getData()
              }}
              tintColor="#54bb40"
              title="加载中..."
              titleColor="#999"
              colors={['#2296f3']}
              progressBackgroundColor="#fff"
            />
          }
          onEndReachedThreshold={20}
          initialListSize={10}
          onEndReached={this.state.pageNum > this._queryObj.currentPage ? this._loadMore : null}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.skuInfos)}
          renderRow={this._renderRow} 
        />
        <CommonSelect 
          keyName="value"
          ref={ view => this._commonSelect = view}
          selectCallback={this._commonSelectCallback}
          dataSource={this.state.citySelector}
          // name={this.state.currentName}
          selected={this.state.citySelected}
          multiple={false}
        />
      </Page>
    )
  }
}
