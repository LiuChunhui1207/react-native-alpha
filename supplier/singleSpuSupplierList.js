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
import {Page, Button, SXCSearchBox} from 'components';

//全供应商列表
import SupplierList from './supplierList';
//创建采购订单页面
import AddPurchaseOrder from '../purchase/addPurchaseOrder';

let s = SStyle({
  title: {
    backgroundColor: 'e5',
    marginTop: 10,
    flexDirection: 'row',
    height: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15
  },
  row_item: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: 'fff',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  status_box: {
    marginLeft: 5,
    borderRadius: 2,
    padding: 2,
    borderWidth: 'slimLine',
    borderColor: '#FF8B00'
  },
  status: {
    fontSize: 10,
    color: '#FF8B00',
  },
  titleStyl: {
    fontSize: 18
  }
});

/**
 *  该spu供应商列表
 * @type {[type]}
 */
module.exports = class SingleSpuSupplierList extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      title: props.route.data.spuName ? `供应商-${props.route.data.spuName}` : '供应商',
      pageLoading: true,
      dataSource: [],
      refreshing: false,
    }
    //查询入参
    this._queryObj = {
      spuId: props.route.data.spuId
    }

    this._renderRow = this._renderRow.bind(this);
    this._onSearchChange = this._onSearchChange.bind(this);
    this._allSupplier = this._allSupplier.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  /**
   * 获取供应商列表
   * @return {[type]} [description]
   */
  _getData(){
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'querySupplierListKey', 
      objectName: 'supplyUserQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        pageLoading: false,
        originalData: data.supplyUsers,   //清除过滤条件 恢复的源数据
        dataSource: data.supplyUsers,
        refreshing: false
      })
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }

  _renderStatus(status){
    if(status === 0){
      return (
        <View style={s.status_box}>
          <Text style={s.status}>未审核</Text>
        </View>
      )
    }
    return null;
  }

  _renderRow(rowData, sectionID, rowID){
    return (
      <TouchableOpacity 
        onPress={()=>{
          if(this.props.route.from === 'SwitchSupplier'){
            this.props.route.callback && this.props.route.callback(rowData);
            this.navigator().pop();
          }
          else{
            this.navigator().push({
              component: require('../purchase/addPurchaseOrder'),
              callback: this.props.route.callback,
              name: 'AddPurchaseOrder',
              data: {
                supplierId: rowData.supplierId,
                skuId: this.props.route.data.skuId
              }
            })
          }
        }}
        style={s.row_item}>
        <SText fontSize="body" color="333">
          {rowData.supplierName}
        </SText>
        {this._renderStatus(rowData.checkStatus)}
        <SText style={{flex: 1, textAlign: 'right'}} fontSize="body" color="333">{rowData.mobilePhone}</SText>
      </TouchableOpacity>
    )
  }

  /**
   * 搜索框内容变化
   * @param  {[type]} text [description]
   * @return {[type]}      [description]
   */
  _onSearchChange(text){
    let newDataSource = [],
      isNum = text * 0 === 0;
    if(text == ''){
      newDataSource = this.state.originalData;
    }
    else{
      this.state.originalData.map( item => {
        if(isNum){
          if(item.mobilePhone.indexOf(text) != -1){
            newDataSource.push(item);
          }
        }
        else {
          if(item.supplierName.indexOf(text) != -1){
            newDataSource.push(item);
          }
        }
      });
    }
    this.changeState({
      dataSource: newDataSource
    })
  }

  _allSupplier(){
    this.navigator().push({
      component: SupplierList,
      from: 'SingleSpuSupplierList',
      name: 'SupplierList',
      data: this.props.route.data
    })
  }

  render(){
    return (
      <Page
          pageName='spu供应商列表'
        title={this.state.title} 
        titleStyl={s.titleStyl}
        pageLoading={this.state.pageLoading} 
        back={()=>this.navigator().pop()}
      >
        <SXCSearchBox onChangeText={this._onSearchChange}/>
        <View style={s.title}>
          <SText fontSize="caption" color="999">姓名/企业名</SText>
          <SText fontSize="caption" color="999">手机号</SText>
        </View>
        <ListView
          style={{flex: 1}}
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
          initialListSize={20}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow} 
        />
        <Button onPress={this._allSupplier} type='green' size='large'>找不到，去选择其他供应商</Button>
      </Page>
    )
  }
}
