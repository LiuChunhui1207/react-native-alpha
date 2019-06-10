'use strict';
import React from 'react';
import {
  View,
  Image,
  ListView,
  TouchableOpacity
} from 'react-native';

import {Page, ListSelect, Button, Toast} from 'components';
import {SComponent, SStyle, SText} from 'sxc-rn';
import {ICON_SELECT_GREEN} from 'config';

let s = SStyle({
  header: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 15
  },
  row_item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: 'e5',
    borderBottomWidth: 'slimLine'
  },
  title: {
    paddingLeft: 15,
    height: 30,
    backgroundColor: 'f0',
    justifyContent: 'center'
  },
  icon_select: {
    width: 20,
    height: 15
  }
});

module.exports = class StoreHouseList extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    let titleArray = [], dataObj = {};
    console.log('ddod in StoreHouseList:', props.route)
    props.route.data.map( item => {
      titleArray.push(item.marketName);
      dataObj[item.marketName] = item.wcStorehouseDTOs;
    })
    this._selectedObj = props.route.selected || {};
    // if(props.route.selected)
    this.state = {
      dataObj,
      titleArray,
      selectAll: Object.keys(this._selectedObj).length > 0 ? false : true,
    };

    this._renderRow = this._renderRow.bind(this);
    this._confirm = this._confirm.bind(this);
    this._renderSectionHeader = this._renderSectionHeader.bind(this);
  }

  _renderHeader(){
    return (
      <SText style={s.header} color='666' fontSize='caption'>可多选</SText>
    )
  }

  _confirm(){
    let selectedArray = [], nameArray = [];
    if(!this.state.selectAll){
      for(let key in this._selectedObj){
        selectedArray.push(key);
        nameArray.push(this._selectedObj[key]);
      }
    }
    else{
      nameArray = ['选择服务站']
    }
    this.navigator().pop();
    this.props.route.callback(selectedArray, nameArray.join('、'));
  }

  /**
   * 子列表选中时去掉全选
   * @return {[type]} [description]
   */
  _cancelAll(){
    if(this.state.selectAll){
      this.changeState({
        selectAll: false
      })
    }
  }

  _renderRow(rowData, sectionID, rowID){
    return (
      <Row data={rowData} selectAll={this.state.selectAll} selectedObj={this._selectedObj} cancelAll={this._cancelAll.bind(this)} />
    )
  }

  _renderSectionHeader(sectionData, sectionID) {
    return (
      <View style={s.title}>
        <SText fontSize="body" color="666">{sectionID}</SText>
      </View>
    );
  }

  _renderIcon(flag){
    if(flag){
      return (
        <Image style={s.icon_select} source={ICON_SELECT_GREEN} />
      )
    }
    return null;
  }
  
  render(){
    return (
      <Page
          pageName='今日订单报表-服务站列表' loading={false} pageLoading={false} title='选择供应品类' scrollEnabled={true} back={this.navigator().pop}>
        <TouchableOpacity 
          onPress={()=>{this.changeState({selectAll: true});this._selectedObj = {};}}
          style={[s.row_item, {backgroundColor: '#fff'}]}>
          <SText fontSize="body" color="333">全部</SText>
          {this._renderIcon(this.state.selectAll)}
        </TouchableOpacity>
        <ListView
          style={{flex: 1, backgroundColor: '#fff'}}
          initialListSize={10}
          enableEmptySections={true}
          renderSectionHeader={this._renderSectionHeader}
          dataSource={this._ds.cloneWithRowsAndSections(this.state.dataObj, this.state.titleArray)}
          renderRow={this._renderRow} 
        />
        <Button type='green' size='large' onPress={this._confirm.bind(this)}>确定</Button>
      </Page>
    )
  }
}

class Row extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      checked: this.props.selectedObj[props.data.storehouseId],
      data: props.data
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.selectAll != this.props.selectAll){
      this.setState({
        checked: nextProps.selectedObj[nextProps.data.storehouseId],
        data: nextProps.data,
        refresh: true
      })
    }
  }

  _renderIcon(flag){
    if(flag && !this.props.selectAll){
      return (
        <Image style={s.icon_select} source={ICON_SELECT_GREEN} />
      )
    }
    return null;
  }

  _toggle(id, name){
    this.setState({
      checked: !this.state.checked
    });
    //选中
    if(!this.state.checked){
      this.props.selectedObj[id] = name;
      this.props.cancelAll();
    }
    //取消选中
    else{
      delete this.props.selectedObj[id];
    }
  }

  render(){
    let data = this.state.data;
    return (
      <TouchableOpacity 
        onPress={()=> this._toggle(data.storehouseId, data.storehouseName)}
        style={s.row_item}>
        <SText fontSize="body" color="333">{data.storehouseName}</SText>
        {this._renderIcon(this.state.checked)}
      </TouchableOpacity>
    )
  }
}
