'use strict';
import React from 'react';
import ReactNative, {
  View,
  Image,
  ListView,
  TouchableOpacity,
  InteractionManager
} from 'react-native';

import {Page, Row, SXCSearchBox} from 'components';
import {SComponent, SStyle, SText} from 'sxc-rn';
import {ICON_NEXT} from 'config';
import {str} from 'tools';
import ItemSelect from './item_select/item_select';

let s = SStyle({
  row: {
    height: 45,
    paddingLeft: 15,
    alignItems: 'center',
    paddingRight: 15
  },
  border_bottom: {
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  header: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 15
  },
  flex1: {
    flex: 1
  },
  icon_next: {
    width: 8,
    height: 12
  },
  search: {
    marginBottom: 10
  }
});

module.exports = class SelectCategory extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2)=> obj.isDifferent(r1, r2)}),
    this.state = {
      pageLoading: true,
      originalDataSource: [],
      dataSource: []
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  /**
   * [获取商品列表数据]
   * @return {[type]} [description]
   */
  _getData(){
    commonRequest({
      apiKey: 'queryCatListKey', 
      objectName: 'wcSpuQueryDO',
      params: {}
    }).then( (res) => {
      this.changeState({
        pageLoading: false,
        originalDataSource: res.data,
        dataSource: res.data
      })
    }).catch( err => {
      console.log('err:', err)
      this.changeState({
        refreshing: false
      })
    })
  }

  _renderRow = (rowData: String, sectionID: string, rowID: string) =>{
    return (
      <Row 
        onPress={()=>{
          this.navigator().push({
            component: ItemSelect,
            from: this.props.route.from,
            callback: this.props.route.callback,
            name: 'ItemSelect',
            data: {
              supplierId: this.props.route.data ? this.props.route.data.supplierId : '',
              catId: rowData.catId,
              catName: rowData.catName
            }
          })
        }}
        style={[s.row, s.border_bottom]} 
        underlayColor="#fafafa"
      >
        <SText style={s.flex1} fontSize='body' color='333'>{rowData.catName}</SText>
        <Image style={s.icon_next} source={ICON_NEXT} />
      </Row>
    )
  }

  _onChangeText = (text) => {
    if(!str.isEmpty(text)){
      let result = [];
      result = this.state.originalDataSource.filter(item =>item.catName.indexOf(text) != -1);
      this.changeState({
        dataSource: result
      })
    }
    else{
      this.changeState({
        dataSource: this.state.originalDataSource
      })
    }
  }
  
  render(){
    return (
      <Page  pageName='选择品类' pageLoading={this.state.pageLoading} title='选择品类' back={this.navigator().pop}>
        <SXCSearchBox onChangeText={this._onChangeText} style={s.search} />
        <ListView
          style={{backgroundColor: '#fff'}}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow}
        />
      </Page>
    )
  }
}
