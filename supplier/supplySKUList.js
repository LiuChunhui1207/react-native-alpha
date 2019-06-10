'use strict';
import React from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  ListView,
  RefreshControl,
  InteractionManager,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, SXCSearchBox, Row} from 'components';
import AddSupplier from './addSupplier';
import {
  ICON_CHOSE_ACTIVE,
  ICON_CHOSE
} from 'config';

let s = SStyle({
  title: {
    height: 45,
    alignItems: 'center',
    paddingLeft: 15,
    backgroundColor: '#F8F8F8',
    marginTop: 10
  },
  row_item: {
    height: 45,
    alignItems: 'center',
    paddingLeft: 15,
    backgroundColor: 'fff',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  chose_img: {
    width: 20,
    height: 20,
    marginRight: 20
  },
  bottom_wrap: {
    height: 47, 
    backgroundColor: '#fff', 
    alignItems: 'center'
  },
  bottom_btn: {
    height: 47,
    width: 95,
    backgroundColor: '#4A90E2'
  },
  flex1: {
    flex: 1
  },
  icon_box: {
    padding: 6
  }
});

/**
 * 某个供应商的sku列表
 * @type {[type]}
 */
module.exports = class SupplierSKUList extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      selected: props.route.selected || [],
      pageLoading: true,
      dataSource: [],
    }

    this._queryObj = {
      ...props.route.data
    }

    this._renderRow = this._renderRow.bind(this);
    this._onSearchChange = this._onSearchChange.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  /**
   * 查询某供应商商品列表
   * @return {[type]} [description]
   */
  _getData(){
    commonRequest({
      apiKey: 'queryPurchaseSKUInfoListKey', 
      objectName: 'purchaseOrderQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        pageLoading:  false,
        originalData: data.purchaseSKUInfoVOs,
        dataSource:   data.purchaseSKUInfoVOs
      })
    }).catch( err => {})
  }

  /**
   * 搜索框内容变化方法
   * @param  {[type]} text [description]
   * @return {[type]}      [description]
   */
  _onSearchChange(text){
    let newDataSource = [];
    if(text == ''){
      newDataSource = this.state.originalData;
    }
    else{
      this.state.originalData.map( item => {
        if(item.skuName.indexOf(text) != -1 || (item.skuId + '').indexOf(text) != -1){
          newDataSource.push(item);
        }
      });
    }
    this.changeState({
      dataSource: newDataSource
    })
  }

  /**
   * 渲染是否有绑定供应商
   * @return {[type]} [description]
   */
  _renderTips(status, tips){
    //1:已绑定
    if(status === 1){
      return <SText style={s.band_supplier} fontSize="mini" color="deepOrange">{tips}</SText>
    }
    //2:已绑定,临时解绑
    if(status === 2){
      return <SText style={[s.band_supplier, {opacity: 0.4}]} fontSize="mini" color="deepOrange">{tips}</SText>
    }
    //0:未绑定
    return null
  }

  _renderRow(rowData, sectionID, rowID){
    return (
      <Row 
        style={s.row_item}
        onPress={()=>{
          let arr;
          if(this._isSelected(rowData.skuId)){
            arr = this.state.selected.filter(item => item.skuId != rowData.skuId)
          }
          else{
            arr = this.state.selected;
            arr.push(rowData)
          }
          this.changeState({
            selected: arr
          })
        }}
      >
        <Image style={s.chose_img} source={this._isSelected(rowData.skuId) ? ICON_CHOSE_ACTIVE : ICON_CHOSE} />
        <View style={s.flex1}>
          <SText fontSize="mini" color="666">
            {rowData.skuId + '  '}
            {this._renderTips(rowData.bandSupplierStatus, rowData.bandSupplierTip)}
          </SText>
          <SText fontSize="mini" color="333">{rowData.skuName}</SText>
        </View>
      </Row>
    )
  }

  /**
   * 该条记录是否被选中
   * @return {Boolean} [description]
   */
  _isSelected(id){
    let flag = false;
    this.state.selected.map( item => {
      if(item.skuId === id){
        flag = true;
      }
    })
    return flag
  }

  /**
   * 确认方法
   * @return {[type]} [description]
   */
  _confirm = ()=>{
    this.navigator().pop();
    this.props.route.callback && this.props.route.callback(this.state.selected);
  }

  render(){
    return (
      <Page title="选择sku" pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        <SXCSearchBox onChangeText={this._onSearchChange}/>
        <Row 
          style={s.title}
          onPress={()=>{
            let selectAll = !this.state.selectAll, selected;
            if(selectAll){
              selected = this.state.dataSource;
            }
            else {
              selected = [];
            }
            this.changeState({
              selectAll,
              selected
            })
          }}
        >
          <Image style={s.chose_img} source={this.state.selectAll ? ICON_CHOSE_ACTIVE : ICON_CHOSE} />
          <SText fontSize="mini" color="333">商品名称</SText>
        </Row>
        <ListView
          // style={{flex: 1}}
          initialListSize={10}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow} 
        />
        <Row style={s.bottom_wrap}>
          <SText style={[s.flex1, {paddingLeft: 15}]} fontSize="caption" color="666">
            已选 {this.state.selected.length}种商品
          </SText>
          <Button onPress={this._confirm} style={s.bottom_btn} type="green" size="large">确认</Button>
        </Row>
      </Page>
    )
  }
}
