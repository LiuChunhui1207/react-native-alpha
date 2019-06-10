'use strict';
import React from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  LayoutAnimation,
  InteractionManager,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, SXCRadio, Row} from 'components';
import {UtilsAction} from 'actions';
import SelectCategory from './selectCategory';
import AddSupplierSPUInfo from './addSupplierSPUInfo';
import {
  ICON_SEARCH,
  ICON_ADD2
} from 'config';

let s = SStyle({
  card: {
    backgroundColor: 'fff',
    marginTop: 15
  },
  item: {
    height: 45,
    alignItems: 'center',
    borderBottomWidth: 'slimLine',
    borderColor: 'e5',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15
  },
  red: {
    color: 'red'
  },
  input: {
    flex: 1,
    textAlign: 'right',
    paddingLeft: 10,
    paddingRight: 5
  },
  radio_group: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end'
  },
  icon_add2: {
    width: 14,
    height: 14
  },
  next_step: {
    marginTop: 25
  }
});

/**
 * 创建供应商
 * @type {[type]}
 */
module.exports = class AddSupplierDetailInfo extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      validate: __DEV__ ? true : false,
      pageLoading: true,
      catIds: [],  //选中品类
      idTypes: [], //身份类型
      cats:    []  //所有供应品类
    }
    this._submitObj = {
      idType: 0,
      catIds: []
    };
    this._onRadioChange = this._onRadioChange.bind(this);
    this._selectCategory = this._selectCategory.bind(this);
    this._selectCategoryCallback = this._selectCategoryCallback.bind(this);
    this._submit = this._submit.bind(this);
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
    // commonRequest({
    //   apiKey: 'briefInfoCreateInitKey', 
    //   objectName: 'supplyUserQueryDO',
    //   params: {}
    // }).then( (res) => {
    //   let data = res.data;
    //   this.changeState({
    //     pageLoading: false,
    //     idTypes: data.idTypes,
    //     cats:    data.cats,
    //   })
    //   console.log(data);
    // }).catch( err => {})
  }

  render(){
    return (
      <Page title="创建供应商" scrollEnabled={true} pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        <Row>
          <Button onPress={this._submit} style={[s.next_step, this.state.validate ? {} : {backgroundColor: '#ccc'}]} disabled={!this.state.validate} type='green' size='middle'>下次再填</Button>
          <Button onPress={this._submit} style={[s.next_step, this.state.validate ? {} : {backgroundColor: '#ccc'}]} disabled={!this.state.validate} type='green' size='middle'>提交</Button>
        </Row>
      </Page>
    )
  }
}
