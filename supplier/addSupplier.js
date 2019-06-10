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
import {Page, Button, SXCRadio} from 'components';
import {UtilsAction} from 'actions';
import SelectCategory from './selectCategory';
import AddSupplierSPUInfo from './addSupplierSPUInfo';
import CreateSupplier from './createSupplier'
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
module.exports = class AddSupplier extends SComponent{
  constructor(props){
    super(props);
    //提交数据对象
    this._submitObj = {
      idType: 0,
      catIds: []
    };
    let catIds = [];
    if(props.route.data && props.route.data.skuId){
      catIds.push({
        ...props.route.data,
        _isDefault: true,
      });
      this._submitObj.catIds.push(props.route.data.catId);
    }
    this.state = {
      validate: false,
      pageLoading: true,
      catIds: catIds,  //选中品类
      idTypes: [], //身份类型
      cats:    []  //所有供应品类
    }

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
    commonRequest({
      apiKey: 'briefInfoCreateInitKey', 
      objectName: 'supplyUserQueryDO',
      params: {}
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        pageLoading: false,
        idTypes: data.idTypes,
        cats:    data.cats,
      })
    }).catch( err => {})
  }

  _onRadioChange(value){
    this._submitObj.idType = value;
    this._validate();
  }

  /**
   * 过滤出已经选中的品类
   * @return {[type]} [description]
   */
  _filter(){
    let result = [];
    this.state.cats.map( item => {
      let isExisted = false;
      this.state.catIds.map( selectedItem => {
        if(selectedItem.key === item.key){
          isExisted = true;
        }
      })
      if(!isExisted){
        result.push(item)
      }
    })
    return result;
  }

  /**
   * 校验数据合法性
   * 当姓名 手机号和供应品类都有值时 校验通过
   * @return {[type]} [description]
   */
  _validate(){
    //校验姓名
    if(this._submitObj.supplierName == '' || this._submitObj.supplierName === undefined){
      this.changeState({
        validate: false
      })
      return;
    }
    //校验手机号
    if(!(/^1[34578]\d{9}$/.test(this._submitObj.mobilePhone))){
      this.changeState({
        validate: false
      })
      return;
    }
    if(this._submitObj.catIds.length == 0){
      this.changeState({
        validate: false
      })
      return;
    }
    this.changeState({
      validate: true
    })
  }

  _selectCategoryCallback(ids){
    let selectedCategoryList = this.state.catIds, selectedIds = [];
    ids.map( item => {
      selectedCategoryList.push(this._unSelectedCategoryList[item]);
    })
    this.changeState({
      catIds: selectedCategoryList
    });
    selectedCategoryList.map( category => {
      selectedIds.push(category.key)
    })
    this._submitObj['catIds'] = selectedIds;
    this._validate();
  }
  /**
   * 选择供应品类
   * @return {[type]} [description]
   */
  _selectCategory(){
    this._unSelectedCategoryList = this._filter();
    //构造一个ListSelect 需要的数据结构
    let data = [];
    this._unSelectedCategoryList.map( item => {
      data.push(item.value);
    })
    this.navigator().push({
      component: SelectCategory,
      name: 'SelectCategory',
      data: data,
      callback: this._selectCategoryCallback
    })
  }
  /**
   * 删除选中品类
   * @return {[type]} [description]
   */
  _deleteCategory(index){
    let oldSelecCategoryList = this.state.catIds, selectedIds = [];
    oldSelecCategoryList.splice(index, 1);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    oldSelecCategoryList.map( category => {
      selectedIds.push(category.key)
    })
    this._submitObj['catIds'] = selectedIds;
    this.changeState({
      catIds: oldSelecCategoryList
    });
    this._validate();
  }
  /**
   * 渲染已经选中的品类 默认品类不能修改
   * @return {[type]} [description]
   */
  _renderSelectedCategory(){
    return this.state.catIds.map( (item, index) => {
      let deleteBtn = null;
      if(!item._isDefault){
        deleteBtn = <Text style={s.red} onPress={this._deleteCategory.bind(this, index)}>删除</Text>
      }
      return (
        <View style={s.item} key={item.key}>
          <SText style={{flex: 1}} fontSize="body" color="666">{item.value}</SText>
          {deleteBtn}
        </View>
      )
    })
  }
  /**
   * 输入框内容变化回调
   * @return {[type]} [description]
   */
  _onChangeText(type, value){
    this._submitObj[type] = value;
    this._validate();
  }
  /**
   * 创建供应商
   * 成功则跳转至填写供应信息页面
   * @return {[type]} [description]
   */
  _submit(){
    commonRequest({
      apiKey: 'createSupplierBriefInfoKey', 
      objectName: 'baseInfoCreateDO',
      withLoading: true,
      params: this._submitObj
    }).then( (res) => {
      __STORE.dispatch(UtilsAction.toast('供应商创建成功', 1000));
      let data = {};
      //如果上个页面有传入商品信息
      if(this.props.route.data && this.props.route.data.skuId){
        data = {
          spuId: this.props.route.data.spuId,
          skuId: this.props.route.data.skuId,         //商品id
          pageTitle: this._submitObj.supplierName + '-' + this.props.route.data.value,
          spuName: this.props.route.data.spuName,    //商品名称
          supplierId: res.data.supplierId,
          idType: this._submitObj.idType,
        }
        this.navigator().push({
          from: this.props.route.from,
          component: AddSupplierSPUInfo,
          name: 'AddSupplierSPUInfo',
          data,
        })

      }
      else {
        data = {
          pageTitle: '供应信息',
          supplierId: res.data.supplierId,
          idType: this._submitObj.idType,
        }
        this.navigator().push({
          callback: this.props.route.callback,
          from: this.props.route.from,
          component: CreateSupplier,
          name: 'CreateSupplier',
          data,
        })
      }
      // this.navigator().push({
      //   from: this.props.route.from,
      //   component: AddSupplierSPUInfo,
      //   name: 'AddSupplierSPUInfo',
      //   data,
      // })
      // this.navigator().push({
      //     from: this.props.route.from,
      //     component: CreateSupplier,
      //     name: 'CreateSupplier',
      //     data,
      // })
    }).catch( err => {})
  }

  render(){
    return (
      <Page title="创建供应商" scrollEnabled={true} pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        <View style={s.card}>
          <View style={s.item}>
            <SText fontSize="body" color="666">
              姓名
              <Text style={s.red}>*</Text>
            </SText>
            <TextInput onChangeText={this._onChangeText.bind(this, 'supplierName')} style={s.input} placeholder="请填写" />
          </View>
          <View style={s.item}>
            <SText fontSize="body" color="666">
              手机号码
              <Text style={s.red}>*</Text>
            </SText>
            <TextInput onChangeText={this._onChangeText.bind(this, 'mobilePhone')} keyboardType="phone-pad" maxLength={11} style={s.input} placeholder="请填写" />
          </View>
          <View style={s.item}>
            <SText fontSize="body" color="666">
              身份类型
              <Text style={s.red}>*</Text>
            </SText>
            <SXCRadio.SXCRadioGroup style={s.radio_group} onChange={this._onRadioChange}>
              {
                this.state.idTypes.map( item => {
                  return(
                    <SXCRadio.Option checked={item.value == '个人'} key={item.key} value={item.key}>
                      <SText fontSize="caption" color="333" style={{marginLeft: 4}}>{item.value}</SText>
                    </SXCRadio.Option>
                  )
                })
              }
            </SXCRadio.SXCRadioGroup>
          </View>
          <TouchableOpacity 
            onPress={this._selectCategory}
            style={[s.item, {backgroundColor: '#fafafa'}]}
          >
            <SText fontSize="body" color="666" style={{flex: 1}}>
              供应品类
              <Text style={s.red}>*</Text>
            </SText>
            <Image source={ICON_ADD2} style={s.icon_add2}/>
          </TouchableOpacity>
          {this._renderSelectedCategory()}
        </View>
        <Button onPress={this._submit} style={[s.next_step, this.state.validate ? {} : {backgroundColor: '#ccc'}]} disabled={!this.state.validate} type='green' size='middle'>下一步</Button>
      </Page>
    )
  }
}
