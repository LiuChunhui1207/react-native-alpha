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
import {Page, Button, SXCSearchBox, TipBox} from 'components';
import AddSupplier from './addSupplier';
//添加供应品类信息
import AddSupplierSPUInfo from './addSupplierSPUInfo';
//供应商详情页面
import SupplierDetail from './supplier_detail';

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
  }
});

/**
 * 供应商列表
 * @type {[type]}
 */
module.exports = class SupplierList extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    //首页从供应商管理进入 页面title和底部button不同
    this._queryObj = {};
    if(props.route.from === 'Home'){
      this._showName = {
        title: '供应商列表',
        btnName: '创建供应商'
      }
    }
    //编辑sku信息时 绑定供应商
    else if(props.route.from === 'EditSKUInfo'){
      this._showName = {
        title: '选择供应商',
      }
      this._queryObj['catId'] = props.route.data.catId;
    }else if (props.route.from === 'Direct'){
      this._showName = {
        title: '选择供应商',
        btnName: '去创建新的供应商'
      }
      this._queryObj['directPlanId'] = props.route.data.directPlanId;
    }
    else{
      this._showName = {
        title: '选择供应商',
        btnName: '找不到，去创建新的供应商'
      }
    }
    this.state = {
      pageLoading: true,
      dataSource: [],
      refreshing: false,
    }

    this._renderRow = this._renderRow.bind(this);
    this._onSearchChange = this._onSearchChange.bind(this);
    this._addSupplier = this._addSupplier.bind(this);
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
  _getData = () => {
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'querySupplierListKey', 
      objectName: 'supplyUserQueryDO',
      params: this._queryObj
    }).then( (res) => {
      let data = res.data;
      //如果是从创建巡场日志进入，剔除已经添加的供货商 有点慢 建议优化@cfy
      if (this.props.route.from === 'CreatePatorlLog'){
          for (let i=0;i<this.props.route.existSuppliers.length;i++){
            let supplierId=this.props.route.existSuppliers[i].supplierId;
              for (let j=0;j<data.supplyUsers.length;j++){
                  if (supplierId==data.supplyUsers[j].supplierId) {
                      data.supplyUsers.splice(j, 1);
                      break;
                  }
              }
          }
      }
      this.changeState({
        pageLoading: false,
        originalData: data.supplyUsers,   //清除过滤条件 恢复的源数据
        dataSource: data.supplyUsers,
        tips: data.tips,
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
          //如果是从今日订单报表过来 则去添加供应品类细信息
          if(this.props.route.from === 'SingleSpuSupplierList'){
            this.navigator().push({
              from: this.props.route.from,
              callback: this.props.route.callback,
              component: AddSupplierSPUInfo,
              name: 'AddSupplierSPUInfo',
              data: {
                ...this.props.route.data,
                supplierId: rowData.supplierId,
                supplierName: rowData.supplierName,
              }
            })
          }
          //首页 供应商管理进入 点击供应商跳至供应商详情页面
          else if(this.props.route.from === 'Home'){
            this.navigator().push({
              component: SupplierDetail,
              name: 'SupplierDetail',
              data: {
                supplierId: rowData.supplierId,
                supplierName: rowData.supplierName,
              }
            })
          }
          else if(this.props.route.from === 'EditSKUInfo'){
            this.navigator().pop();
            this.props.route.callback && this.props.route.callback(rowData);
          }
          //从创建巡场日志进入此页面
          else  if (this.props.route.from === 'CreatePatorlLog'){
              this.navigator().pop();
              this.props.route.callback && this.props.route.callback(rowData);
          }
          else{
            this.navigator().push({
              callback: this.props.route.callback,
              component: require('../purchase/addPurchaseOrder'),
              name: 'AddPurchaseOrder',
              data: {
                supplierId: rowData.supplierId,
                directPlanId: this.props.route.data && this.props.route.data.directPlanId ?  this.props.route.data.directPlanId:undefined
              }
            })
          }
          }
        }
        style={s.row_item}
      >
        <SText fontSize="body" color="333">
          {rowData.supplierName}
        </SText>
        {this._renderStatus(rowData.checkStatus)}
        <SText style={{flex: 1, textAlign: 'right'}} fontSize="body" color="333">{rowData.mobilePhone}</SText>
      </TouchableOpacity>
    )
  }

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

  _addSupplier(){
    let params = {};
    if(this.props.route.data){
      params = {
        data: {
          catId: this.props.route.data.catId,
          spuId: this.props.route.data.spuId,
          skuId: this.props.route.data.skuId,
          spuName: this.props.route.data.spuName,
          key: this.props.route.data.catId,
          value: this.props.route.data.catName
        }
      }
    }
    this.navigator().push({
      from: this.props.route.from,
      callback: this._getData,
      ...params,
      component: AddSupplier,
      name: 'AddSupplier'
    })
  }

  render(){
    return (
      <Page  pageName='供应商列表' title={this._showName.title} pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        {this.props.route.from == 'addPurchaseOrder' ? null : <TipBox warnText={this.state.tips} />}
        <SXCSearchBox style={{marginTop: 0}} onChangeText={this._onSearchChange}/>
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
          initialListSize={10}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow} 
        />
        {
          this.props.route.from === 'SingleSpuSupplierList' || this.props.route.from === 'Home' ? <Button onPress={this._addSupplier} type='green' size='large'>{this._showName.btnName}</Button> : null
        }
      </Page>
    )
  }
}
