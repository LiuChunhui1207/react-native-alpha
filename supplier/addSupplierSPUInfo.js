'use strict';
import React from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  LayoutAnimation,
  ScrollView,
  InteractionManager,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText, MonthSelect} from 'sxc-rn';
import {Page, Button, SXCRadio, CommonSelect, SXCCitySelect} from 'components';
import {UtilsAction} from 'actions';
import {str} from 'tools';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {
  ARROW_DOWN_S,
  ICON_DOWN,
  ICON_ADD2
} from 'config';

let s = SStyle({
  content: {
    flex: 1
  },
  title: {
    height: 45,
    backgroundColor: 'f0',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 10
  },
  row_item: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center'
  },
  border_bottom: {
    borderBottomWidth: 'slimLine',
    borderColor: 'e5'
  },
  more_btn: {
    flexDirection: 'row',
    borderTopWidth: 'slimLine',
    borderColor: 'e5',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'fa'
  },
  marginL15: {
    marginLeft: 15
  },
  flex1: {
    flex: 1
  },
  red: {
    color: 'red'
  },
  text_input: {
    flex: 1,
    textAlign: 'right',
    borderRightWidth: 'slimLine',
    borderColor: 'e5'
  },
  select_input: {
    width: 60,
    textAlign: 'right'
  },
  border_right: {
    width: 'slimLine',
    height: 25,
    backgroundColor: 'e5',
    marginLeft: 5,
    marginRight: 11
  },
  icon_down: {
    width: 13,
    height: 8,
    marginLeft: 6,
    marginRight: 15  
  },
  icon_add: {
    width: 14,
    height: 15,
    marginRight: 15
  },
  month_select: {
    marginLeft: 15,
    marginTop: 15,
    marginBottom: 15
  },
  channel_box: {
    backgroundColor: 'fff',
    paddingTop: 14,
    paddingBottom: 12,
    paddingLeft: 15,
    paddingRight: 25
  },
  item: {
    height: 45,
    alignItems: 'center',
    borderBottomWidth: 'slimLine',
    borderColor: 'e5',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15
  }
});

/**
 * 填写供应信息
 * @type {[type]}
 */
module.exports = class AddSupplierSPUInfo extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      title: props.route.data.supplierName,
      spuName: props.route.data.spuName,
      cardOpen: false,
      dailySupplyUnitsSelected: [],
      priceUnitsSelected: [],
      purchaseFromsSelected: [],
      salesFromsSelected: [],
      currentDataSource: [], //commonList 显示的数据源
      purchaseAreas: [],  //进货区域
      salesAreas: []   //销售区域
    };
    if(props.route.data){
      this._submitObj = {
        spuId: props.route.data.spuId,  //上级页面传入
        supplierId: props.route.data.supplierId  //上级页面传入
      };
    }
    this._handlemoreBtn = this._handlemoreBtn.bind(this);
    this._commonSelectCallback = this._commonSelectCallback.bind(this);
    this._citySelectCallback = this._citySelectCallback.bind(this);
    this._submit = this._submit.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }

  _toggleScrollEnabled(enabled){
    //设置外层能否滚动
    this._scrollView.setNativeProps({
      scrollEnabled: enabled
    });
  }
  /**
   * 显示modal弹框 
   * 根据type设置弹框里的数据源
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  _showCommonSelect(type){
    let currentObj = {
      currentName: type,
      multiple: type.indexOf('Units') != -1 ? false : true,
      currentSelected: this.state[type + 'Selected'] || [],
      currentDataSource: this.state[type + 'DataSource'] || []
    }
    this.changeState(currentObj, ()=>{
      this._commonSelect._toggle()
    })
  }
  /**
   * 显示选择地区弹框
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  _showCitySelect(type){
    this.changeState({
      currentCityName: type
    }, this._citySelect._toggle)
    // this._citySelect._toggle();
  }
  /**
   * modal弹框 选择数据后的回调
   * @param  {[type]} data [description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  _commonSelectCallback(data, name){
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.changeState({
      [name + 'Selected']: [...data]
    })
  }

  /**
   * 获取供应商供应spu初始化信息
   * @return {[type]} [description]
   */
  _getData(){
    commonRequest({
      apiKey: 'querySupplierSpuCreateInitKey', 
      objectName: 'supplySpuQueryDO',
      params: {spuId: this.props.route.data.spuId}
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        dailySupplyUnitsSelected:   [data.dailySupplyUnits[0]],  //默认选中第一项
        priceUnitsSelected:         [data.priceUnits[0]],        //默认选中第一项
        dailySupplyUnitsDataSource: data.dailySupplyUnits,     //每日供应量单位列表
        priceUnitsDataSource:       data.priceUnits,           //当前供货价单位列表
        purchaseFromsDataSource:    data.purchaseFroms,        //进货渠道列表
        salesFromsDataSource:       data.salesFroms            //出货渠道列表
      })
    }).catch( err => {})
  }

  /**
   * 创建spu信息
   * @return {[type]} [description]
   */
  _submit(){
    //校验每日供应量 当前供货价 单位
    if(this.state.dailySupplyUnitsSelected.length === 0){
      __STORE.dispatch(UtilsAction.toast('每日供应量单位不能为空', 1000));
      return;
    }
    if(this.state.priceUnitsSelected.length === 0){
      __STORE.dispatch(UtilsAction.toast('当前供应价单位不能为空', 1000));
      return;
    }
    if(this._submitObj.currentPrice === undefined){
      __STORE.dispatch(UtilsAction.toast('当前供应价不能为空', 1000));
      return;
    }
    if(this._submitObj.dailySupply === undefined){
      __STORE.dispatch(UtilsAction.toast('每日供应量不能为空', 1000));
      return;
    }
    this._submitObj['currentPriceUnit'] = this.state.priceUnitsSelected[0].key; //当前供应价单位
    this._submitObj['dailySupplyUnit'] = this.state.dailySupplyUnitsSelected[0].key; //每日供应量单位
    this._submitObj['purchaseAreas'] = this.state.purchaseAreas; //进货区域
    this._submitObj['salesAreas'] = this.state.salesAreas;  //销售区域
    this._submitObj['purchaseFroms'] = this.state['purchaseFromsSelected'].map( item => item.key); //purchaseFroms
    this._submitObj['salesFroms'] = this.state['salesFromsSelected'].map( item => item.key);  //salesFroms
    // this._submitObj['currentPrice'] = this._submitObj['currentPrice'] * 100;
    commonRequest({
      apiKey: 'createSupplierSpuKey', 
      objectName: 'supplierSpuEditDO',
      withLoading: true,
      params: this._submitObj
    }).then( (res) => {
      let data = res.data;
      __STORE.dispatch(UtilsAction.toast('创建成功', 1000));
      //创建完供应商后 调至创建采购订单页 需要重置路由栈
      if(this.props.route.from == 'SingleSpuSupplierList'){
        let route = {
          component: require('../purchase/addPurchaseOrder'),
          name: 'AddPurchaseOrder',
          data: {
            supplierId: this.props.route.data.supplierId,
            skuId: this.props.route.data.skuId
          }
        }
        let routeStack = this.navigator().getCurrentRoutes();
        routeStack.length = routeStack.length - 3;
        routeStack.push(route);
        this.navigator().immediatelyResetRouteStack(routeStack);
      }
      if(this.props.route.from == 'SupplyInfo'){
        let route = this.navigator().getRoute('name', 'SupplierDetail');
        this.navigator().popToRoute(route);
        this.props.route.callback && this.props.route.callback()
      }
    }).catch( err => {})
  }
  /**
   * 渲染选中的渠道
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  _renderSelectChannel(data){
    if(data.length > 0){
      let strArray = [];
      data.map(item => {
        strArray.push(item.value);
      })
      return (
        <View style={s.channel_box}>
          <SText fontSize="body" color="333">{strArray.join('、')}</SText>
        </View>
      )
    }
    return null;
  }

  /**
   * 供货月份等选填信息
   * @return {[type]} [description]
   */
  _renderMoreInfo(){
    if(this.state.cardOpen){
      return (
        <View>
          <View style={s.card}>
            <View style={[s.row_item, s.border_bottom, {backgroundColor: '#fafafa'}]}>
              <SText style={s.marginL15} fontSize="body" color="666">
                供货月份
                <SText fontSize="body" color="999">(可多选)</SText>
              </SText>
            </View>
            <MonthSelect
              style={s.month_select}
              toggleScrollEnabled={this._toggleScrollEnabled.bind(this)}
              onChange={(monthList)=>{
                this._submitObj['supplyMonths'] = (monthList + '').split('');
              }}
            />
          </View>
          <View style={s.card}>
            <TouchableOpacity 
              onPress={()=>this._showCommonSelect('purchaseFroms')}
              style={[s.row_item, s.border_bottom, {backgroundColor: '#fafafa'}]}
            >
              <SText style={[s.marginL15, s.flex1]} fontSize="body" color="999">进货渠道</SText>
              <Image style={s.icon_down} source={ARROW_DOWN_S}/>
            </TouchableOpacity>
            {this._renderSelectChannel(this.state['purchaseFromsSelected'])}
            <TouchableOpacity 
              onPress={()=>this._showCitySelect('purchaseAreas')}
              style={[s.row_item, s.border_bottom, {backgroundColor: '#fafafa'}]}
            >
              <SText style={[s.marginL15, s.flex1]} fontSize="body" color="999">货源区域</SText>
              <Image style={s.icon_add} source={ICON_ADD2}/>
            </TouchableOpacity>
            {this._renderSelectedCity('purchaseAreas')}
          </View>
          <View style={s.card}>
            <TouchableOpacity 
              onPress={()=>this._showCommonSelect('salesFroms')}
              style={[s.row_item, s.border_bottom, {backgroundColor: '#fafafa'}]}
            >
              <SText style={[s.marginL15, s.flex1]} fontSize="body" color="999">出货渠道</SText>
              <Image style={s.icon_down} source={ARROW_DOWN_S}/>
            </TouchableOpacity>
            {this._renderSelectChannel(this.state['salesFromsSelected'])}
            <TouchableOpacity 
              onPress={()=>this._showCitySelect('salesAreas')}
              style={[s.row_item, s.border_bottom, {backgroundColor: '#fafafa'}]}
            >
              <SText style={[s.marginL15, s.flex1]} fontSize="body" color="999">销售区域</SText>
              <Image style={s.icon_add} source={ICON_ADD2}/>
            </TouchableOpacity>
            {this._renderSelectedCity('salesAreas')}
          </View>
        </View>
      )
    }
    return null;
  }
  /**
   * 关闭打开选填信息
   * @return {[type]} [description]
   */
  _handlemoreBtn(){
    this.changeState({
      cardOpen: !this.state.cardOpen
    })
  }

  /**
   * 渲染选中城市
   * @return {[type]} [description]
   */
  _renderSelectedCity(name){
    return this.state[name].map( (item, index) => {
      let deleteBtn = null;
      return (
        <View style={s.item} key={item.proviceCode + item.cityCode + item.areaCode}>
          <SText style={{flex: 1}} fontSize="body" color="666">{this._filterNull(item.proviceStr) + this._filterNull(item.cityStr) + this._filterNull(item.areaStr)}</SText>
          <Text style={s.red} onPress={this._deleteCity.bind(this, index, name)}>删除</Text>
        </View>
      )
    })
  }

  _filterNull(str){
    return str ? str : ''
  }

  _deleteCity(index, name){
    let oldState = this.state;
    oldState[name].splice(index, 1);
    this.changeState(oldState);
  }

  _citySelectCallback(data, name){
    let oldState = this.state,
      hasSameObj = false;
    oldState[name].map( item => {
      if(item.proviceCode == data.proviceCode && item.cityCode == data.cityCode && item.areaCode == data.areaCode){
        hasSameObj = true;
      }
    });
    if(!hasSameObj){
      oldState[name].push(data);
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.changeState(oldState);
  }

  render(){
    return (
      <Page title={'供应商'} scrollEnabled={true} pageLoading={false} back={()=>this.navigator().pop()}>
        <ScrollView ref={view => this._scrollView = view} style={s.content}>
          <View style={s.title}>
            <SText style={s.marginL15} fontSize="title" color="greenFill">{this.state.spuName}</SText>
          </View>
          <View style={s.card}>
            <View style={[s.row_item, s.border_bottom, {marginLeft: 10}]}>
              <SText fontSize="body" color="999">每日供应量</SText>
              <Text style={s.red}>*</Text>
              <TextInput onChangeText={value => this._submitObj['dailySupply'] = value} keyboardType="numeric" style={s.text_input} placeholder="请输入"/>
              <View style={s.border_right}/>
              <TouchableOpacity activeOpacity={1} style={{width: 60}} onPress={()=>this._showCommonSelect('dailySupplyUnits')}>
                <TextInput 
                  value={this.state['dailySupplyUnitsSelected'][0] ? this.state['dailySupplyUnitsSelected'][0]['value'] : null} 
                  editable={false} 
                  style={[s.flex1, {textAlign: 'right'}]} 
                  placeholder="请选择"
                />
              </TouchableOpacity>
              <Image style={s.icon_down} source={ARROW_DOWN_S}/>
            </View>
            <View style={[s.row_item, {marginLeft: 10}]}>
              <SText fontSize="body" color="999">当前供货价</SText>
              <Text style={s.red}>*</Text>
              <TextInput onChangeText={value => this._submitObj['currentPrice'] = str.toFen(value)} keyboardType="numeric" style={s.text_input} placeholder="请输入"/>
              <View style={s.border_right}/>
              <TouchableOpacity activeOpacity={1} style={{width: 60}} onPress={()=>this._showCommonSelect('priceUnits')}>
                <TextInput 
                  value={this.state['priceUnitsSelected'][0] ? this.state['priceUnitsSelected'][0]['value'] : null} 
                  editable={false} 
                  style={[s.flex1, {textAlign: 'right'}]} 
                  placeholder="请选择"
                />
              </TouchableOpacity>
              <Image style={s.icon_down} source={ARROW_DOWN_S}/>
            </View>
            <TouchableOpacity activeOpacity={1} onPress={this._handlemoreBtn} style={s.more_btn}>
              <SText fontSize="caption" color="blue">{this.state.cardOpen ? '收起' : '填写更多'}</SText>
              <Image 
                source={ICON_DOWN} 
                style={[
                  s.icon_down, 
                  this.state.cardOpen ? {
                    transform: [{
                      rotateZ: '180deg'
                    }]
                  } : {}
                ]}
              />
            </TouchableOpacity>
          </View>
          {this._renderMoreInfo()}
        </ScrollView>
        <KeyboardSpacer />
        <CommonSelect 
          keyName="value"
          ref={ view => this._commonSelect = view}
          selectCallback={this._commonSelectCallback}
          dataSource={this.state.currentDataSource}
          name={this.state.currentName}
          selected={this.state.currentSelected}
          multiple={this.state.multiple}
        />
        <SXCCitySelect 
          ref={ view => this._citySelect = view}
          name={this.state.currentCityName}
          callback={this._citySelectCallback}
        />
        <Button onPress={this._submit} type='green' size='large'>提交</Button>
      </Page>
    )
  }
}
