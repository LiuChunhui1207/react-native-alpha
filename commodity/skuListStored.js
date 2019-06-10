'use strict';
import React from 'react';
import {
  View,
  RefreshControl,
  TouchableOpacity,
  ListView,
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {UtilsAction} from 'actions';
import {Page, Row, Col, Button} from 'components';
//商品属性页面
import SKUDetail from './skuDetail';
//选择品类页面
import SelectCategory from './create/select_category';

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
    paddingBottom: 10,
    backgroundColor: 'fff',
    marginBottom: 10
  },
  num_box: {
    marginTop: 10,
    marginBottom: 6
  }
});

/**
 * 商品列表-仓库中
 *
 * @type {[type]}
 */
module.exports = class SkuListStored extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      activeTab: 0,
      refreshing: false,
      originalDataSource: [],
      itemVOs: []
    }
    this._queryObj = {
      spuStatus: 1,
      skuStatus: 2
    }
  }
  componentDidMount() {
    this._getData();
  }
  /**
   * [获取商品列表数据]
   * @return {[type]} [description]
   */
  _getData = () =>{
    this.changeState({
      refreshing: true
    }, ()=>{
      commonRequest({
        apiKey: 'queryItemListKey',
        objectName: 'wcItemQueryDO',
        params: this._queryObj
      }).then( (res) => {
        let data = res.data;
        this.changeState({
          refreshing: false,
          originalDataSource: data.itemVOs,
          itemVOs: data.itemVOs
        })
      }).catch( err => {
        this.changeState({
          refreshing: false
        })
      })
    })
  }

  _refresh = ()=>{
    commonRequest({
      apiKey: 'queryItemListKey',
      objectName: 'wcItemQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        originalDataSource: data.itemVOs,
        itemVOs: data.itemVOs
      })
    }).catch( err => {})
  }

  _search(text){
    if(this.state.originalDataSource.length > 0 && text != '' && text != undefined){
      let result = [];
      this.state.originalDataSource.map( item => {
        if(item.skuName.indexOf(text) != -1){
          result.push(item);
        }
      })
      this.changeState({
        itemVOs: result
      })
    }
    else{
      this.changeState({
        itemVOs: this.state.originalDataSource
      })
    }
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
    let fontStyl = "333";
    switch(rowData.spuStatus){
      //待审核
      case 0:
        fontStyl = "orange";
        break;
      //已通过
      case 1:
        fontStyl = "greenFont";
        break;
      //未通过
      case 2:
        fontStyl = "red"
        break;
      default:
        break;
    }
    return (
      <TouchableOpacity
        onPress={()=>{
          this.navigator().push({
            component: SKUDetail,
            from: 'SkuListStored',
            refresh: this._refresh,
            callback: this.props.switchTab,
            name: 'SKUDetail',
            data: {
              skuId: rowData.skuId,
              spuId: rowData.spuId
            }
          })
        }}
        style={s.item}
      >
        <Row>
          <SText style={s.flex1} fontSize="body" color="333">{rowData.skuName}</SText>
          <SText fontSize="body" color={fontStyl}>{rowData.spuStatusName}</SText>
        </Row>
        <SText style={s.num_box} fontSize="caption" color="666">
          已售<SText fontSize="caption" color="333">{` ${rowData.soldNum} `}</SText>件   库存<SText fontSize="caption" color="333">{` ${rowData.stockNum} `}</SText>件
        </SText>
        <SText fontSize="caption" color="666">上架城市  {rowData.shelvesCitys}</SText>
      </TouchableOpacity>
    )
  }

  /**
   * 城市上架/未上架城市点击事件
   * 0：城市上架
   * 1：未上架城市
   * @return {[type]} [description]
   */
  _tabClick = (num) =>{
    console.log('doddoodododo ');
    console.log(num);
    if(this.state.activeTab !== num){
      if(num === 0){
        this._queryObj = {
          spuStatus: 1,
          skuStatus: 2
        }
      }
      else{
        this._queryObj = {
          spuStatus: 0,
          skuStatus: 2
        }
      }
      this.changeState({
        activeTab: num
      }, ()=>{
        this._getData()
      })
    }
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
  }

  render(){
    return (
      <View style={s.flex1}>
        <Row style={s.btn_box}>
          <TouchableOpacity
            style={[s.btn, s.btn_left, this.state.activeTab === 0 ? s.btn_active : {}]}
            onPress={()=>{
              this._tabClick(0);
            }}
          >
            <SText fontSize="caption" color={this.state.activeTab === 0 ? 'white' : 'blue'}>可售卖</SText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={()=>{
              this._tabClick(1);
            }}
            style={[s.btn, s.btn_right, this.state.activeTab === 1 ? s.btn_active : {}]}
          >
            <SText fontSize="caption" color={this.state.activeTab === 1 ? 'white' : 'blue'}>不可售</SText>
          </TouchableOpacity>
        </Row>
        <ListView
          style={s.flex1}
          refreshControl={
            <RefreshControl
              style={{backgroundColor:'transparent'}}
              refreshing={this.state.refreshing}
              onRefresh={this._getData.bind(this)}
              tintColor="#54bb40"
              title="加载中..."
              titleColor="#999"
              colors={['#2296f3']}
              progressBackgroundColor="#fff"
            />
          }
          initialListSize={10}
          removeClippedSubviews={false}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.itemVOs)}
          renderRow={this._renderRow}
        />
        <Button type='green' size='large' onPress={this._saveItem} >发布商品</Button>
      </View>
    )
  }
}
