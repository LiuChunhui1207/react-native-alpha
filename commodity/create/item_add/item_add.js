'use strict'
import React from 'react';
import {
  View,
  ListView,
  Image,
  Animated,
  PanResponder,
  Platform,
  TouchableOpacity,
  InteractionManager,
  ScrollView
} from 'react-native';
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';
import {SComponent, SText} from 'sxc-rn';
import {Page, GalleryList, Select, Button, Upload, Camera} from 'components';
import s from './item_add.style';
// import {WCSpuQueryDO, WCSpuCreateDO} from 'sxc-do';
import {UtilsAction} from 'actions';
import ItemDetail from './item_detail/item_detail';
import Content from './content/content';
import {str} from 'tools';
import SelectLabel from './content/select_label';
import AreaChoose from './area_choose';
import InputLabel from './content/input';
import InputRangeLabel from './content/input_range';

// let areaProppertyId = 2008;
//编辑、新建商品页面
module.exports = class ItemAdd extends SComponent {
  constructor(props){
      super(props);
      this._tabHeightObj = {};
      this.state = {
          pageLoading: true,
          loading: false,
          edit: props.route.edit,
          title: props.route.data.title,
          selectedprin: '',
          selectedcity: '',
          selectedarea: '',
          selectedspu: '',
          lspuVO: {
          },
          mainPropertyMap: {
              /**
               * treeId:
               * item: {
               *  parentPropertyId:
               *  propertyId:
               *  propertyName:
               *  propertyType:
               *  valueData:
               * }
               */
          },
          propertyMap: {

          },
          fileName: ''

      };
      this.catId = props.route.data.catId;
      this.code = 12;

  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if(this.props.route.edit){
        this._getEditData()
      }
      else{
        this._getData();
      }
    })
      //添加业务参数的方法必须写在render之后，不然 buryVO为null
      if (_Bury){
          let buryVO= this.getRef('page')('_getBuryVO')();
          if(buryVO==null){
              return
          }
          buryVO.feature=JSON.stringify({
              catId:this.catId,
              catName:this.state.title
          })
      }
  }

  /**
   * 编辑时 获取初始化数据
   * @return {[type]} [description]
   */
  _getEditData = () =>{
    commonRequest({
      apiKey: 'querySpuDetailKey',
      objectName: 'wcSpuQueryDO',
      params: {
        spuId: this.props.route.data.spuId
      }
    }).then( (res) => {
      let data = res.data;
      !str.arrIsEmpty(data.propertyValuesDTOs) ? data.propertyValuesDTOs.map((item) => {
          this.state.mainPropertyMap[item.treeId] = {
              parentPropertyId: item.parentPropertyId,
              propertyId: item.propertyId,
              propertyName: item.propertyName,
              propertyType: item.propertyType,
              valueData: item.valueData,
              valueId: item.valueId
          }
      }): null;
      this.state.topPropertyValuesList = data.propertyValuesDTOs;
      this.changeState({
        pageLoading: false,
        mainImage: data.mainImage && data.mainImage.img ? [data.mainImage.img] : [],
        propertyValuesList: data.catPropertiesTemplateDTOs,
        lspuVO: data.lspuVO,
      })
    }).catch(err => {
      console.log("do in err:", err)
    })
  }

  /**
   * 创建商品时 获取初始化数据
   * @return {[type]} [description]
   */
  _getData = () => {
    commonRequest({
      apiKey: 'queryKeyPropertyListKey',
      objectName: 'wcSpuQueryDO',
      params: {
        catId: this.props.route.data.catId
      }
    }).then( (res) => {
      let data = res.data;
      !str.arrIsEmpty(data.propertyValuesDTOs) ? data.propertyValuesDTOs.map((item) => {
          this.state.mainPropertyMap[item.treeId] = {
              parentPropertyId: item.parentPropertyId,
              propertyId: item.propertyId,
              propertyName: item.propertyName,
              propertyType: item.propertyType,
              valueData: item.valueData,
              valueId: item.valueId
          }
      }): null;
      this.state.topPropertyValuesList = data.propertyValuesDTOs;
      if(str.arrIsEmpty(data.propertyValuesDTOs)){
        this._getPropertyData([]);
      }
      else{
        this.changeState({
          pageLoading: false,
        })
      }
    }).catch(err => {
      console.log("do in err:", err)
    })
  }

  _getPropertyData(properties: Array){
    commonRequest({
      apiKey: 'queryCatPropertiesTemplateKey',
      objectName: 'wcSpuQueryDO',
      params: {
        catId: this.props.route.data.catId,
        propertyValuesDTOs: properties
      }
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        pageLoading: false,
        propertyValuesList: data.catPropertiesTemplateDTOs,
        lspuVO: data.lspuVO,
       });
    }).catch(err => {
      console.log("do in err:", err)
    })
  }

  _renderProperty(list: Array) {
      if (!str.arrIsEmpty(list)) {
          let elements = [];
          elements = list.map((item, key) => {
              if (item.propertyId == 2008) {
                  return (
                      <AreaChoose
                          {...this.props}
                          edit={this.state.edit}
                          isDisableFetch={this.state.edit ? false : true}
                          key={key}
                          data={item}
                          onChange={this._onChangeValue}
                      ></AreaChoose>
                  )
              } else {
                  switch (item.entryType) {
                      case 1:
                          return (
                              <SelectLabel
                                  {...this.props}
                                  edit={this.state.edit}
                                  key={key}
                                  data={item}
                                  onChange={this._onChangeValue}
                              ></SelectLabel>
                          )
                          break;
                      case 2:
                          return (
                              <InputLabel
                                  {...this.props}
                                  edit={this.state.edit}
                                  key={key}
                                  data={item}
                                  onChange={this._onChangeValue}
                              ></InputLabel>
                          );
                          break;
                      case 3:
                          return (
                              <InputRangeLabel
                                  {...this.props}
                                  edit={this.state.edit}
                                  key={key}
                                  data={item}
                                  onChange={this._onChangeValue}
                              ></InputRangeLabel>
                          )
                          break;
                  }
              }
          });

          return elements;
      }
  }

  _getImg(data){
      this.changeState({
          fileName: data
      });
  }
  render() {
      return (
          <Page
            ref="page"
            pageName={this.state.edit ? '编辑商品' : '新建商品'}
            title={this.state.edit ? '编辑'+this.state.title+'商品' : '新建'+this.state.title+'商品'}
            pageLoading={this.state.pageLoading}
            back={() => this.navigator().jumpBack()}
          >
          <ScrollView>
            {
              str.arrIsEmpty(this.state.topPropertyValuesList) ?
              null :
              <View style={s.header}>
                {this._renderProperty(this.state.topPropertyValuesList)}
                {this._renderSpuInfo()}
              </View>
            }
            {this._renderTab()}
            <View style={s.uploadContainer}>
                <View style={s.uploadSubHeader}>
                    <SText fontSize='caption' color='999'>商品主图</SText>
                </View>
                <View style={{alignItems: 'flex-start', padding: 10}}>
                  <Camera picArray={this.state.edit ? this.state.mainImage : []} ref={v=>this._camera = v} single showMsg={this._showMsg.bind(this)} />
                </View>
            </View>
          </ScrollView>

          <View>
              <Button type='green' size='large' onPress={() => this._onSubmitPress()}>保存</Button>
          </View>
          </Page>
      );
  }

  _showMsg(msg) {
    __STORE.dispatch(UtilsAction.toast(msg, 1500));
  }

  _onSubmitPress(){
    let picArray = this._camera._submit();
    if (picArray.length < 1) {
      return this._showMsg('请上传商品主图');
    }
    this.propertyList = [];
    this.errFlag = '';
    this._mapTheTree(this.state.propertyValuesList);
    if (this.errFlag) {
      return this._showMsg('请填写'+this.errFlag);
    }
    else {
      let params = {};
      if (!this.state.lspuVO.lspuId) {
        console.log('dodoodo in _submit');
        console.log(this.state.topPropertyValuesList)
        for (var variable in this.state.topPropertyValuesList) {
          this.propertyList.push({
            parentPropertyId: this.state.topPropertyValuesList[variable].parentPropertyId,
            propertyId: this.state.topPropertyValuesList[variable].propertyId,
            valueData: this.state.topPropertyValuesList[variable].valueData,
            propertyName: this.state.topPropertyValuesList[variable].propertyName,
            propertyType: this.state.topPropertyValuesList[variable].propertyType
          });
        }
      }
      else {
        params['lspuId'] = this.state.lspuVO.lspuId;
      }
      params['catId'] = this.catId;
      params['catName'] = this.state.title;
      //创建商品时 需要类目信息
      if(this.state.edit){
        params['spuId'] = this.props.route.data.spuId;
        params['skuId'] = this.props.route.data.skuId;
      }
      params['propertyList'] = this.propertyList;
      params['fileName'] = picArray[0];
      params['sourceType'] = this.props.route.from === 'SupplyInfo' ? 2 : 1;  //spu来源 1:发布商品 2:市调
      commonRequest({
        apiKey: this.state.edit ? 'editSpuKey' : 'addSpuKey',
        withLoading: true,
        objectName: 'wcSpuCreateDO',
        params: params
      }).then( (res) => {
        this._showMsg('操作成功!');
        //从供应信息进入 则返回上级目录 从商品管理进入 则跳至商品列表
        //编辑时也返回上级目录
        if(this.state.edit || this.props.route.from === 'SupplyInfo'){
          this.navigator().pop();
          this.props.route.callback && this.props.route.callback();
        }
        else{
          let route = this.navigator().getRoute('name', 'CommodityList');
          this.navigator().popToRoute(route);
          this.props.route.callback && this.props.route.callback(1, 1);
        }
      }).catch(err => {
        console.log("do in err:", err)
      })
    }
  }

  _mapTheTree(sourceTree){
      for (var v in sourceTree) {
          //是否叶子属性
          if(str.arrIsEmpty(sourceTree[v].childrenPropertyList)){
              //是叶子属性则直接赋值
              if (sourceTree[v].required && !sourceTree[v].valueData) {
                  this.errFlag = sourceTree[v].propertyName;
                  return sourceTree[v].propertyName;
              } else {
                  if (sourceTree[v].valueData) {
                      this.propertyList.push({
                          parentPropertyId: sourceTree[v].parentPropertyId,
                          propertyId: sourceTree[v].propertyId,
                          propertyName: sourceTree[v].propertyName,
                          propertyType: sourceTree[v].propertyType,
                          valueData: this._replacePercentage(sourceTree[v].valueData)
                      });
                  }
              }
          } else {
              //不是叶子属性，但是是拼接属性
              if (sourceTree[v].mosaic) {
                  //获取拼接属性的叶子属性值
                  let propArr = [];
                  if (!str.arrIsEmpty(sourceTree[v].childrenPropertyList)) {
                      // 验证是否是拼接属性中子属性必填，这时需要使得父亲必填。例如毛重这个拼接属性.
                      const leafs = sourceTree[v].childrenPropertyList.filter((child) => {
                        return child.childrenPropertyList.length === 0;
                      });
                      //拼接属性的必填
                      if(leafs.map((leaf) => leaf.required).reduce((prev,next) => prev + next) === leafs.length){
                        //如果没有填写
                        if(leafs.filter((leaf) => leaf.valueData != null && leaf.valueData != '').length !== leafs.length) {
                          this.errFlag = sourceTree[v].propertyName;
                          return sourceTree[v].propertyName;
                        }
                      }
                      for (var v1 in sourceTree[v].childrenPropertyList) {
                          if(!str.arrIsEmpty(sourceTree[v].childrenPropertyList[v1].childrenPropertyList)){
                            this._mapTheTree(sourceTree[v].childrenPropertyList[v1].childrenPropertyList);
                          }
                          else if (!sourceTree[v].childrenPropertyList[v1].valueData) {
                            continue;
                          }
                          else if (sourceTree[v].childrenPropertyList[v1].required && !sourceTree[v].childrenPropertyList[v1].valueData) {
                              this.errFlag = sourceTree[v].propertyName;
                              return sourceTree[v].propertyName;
                          }
                          else{
                            let obj = {
                                parentPropertyId: sourceTree[v].childrenPropertyList[v1].parentPropertyId,
                                propertyId: sourceTree[v].childrenPropertyList[v1].propertyId,
                                propertyName: sourceTree[v].childrenPropertyList[v1].propertyName,
                                propertyType: sourceTree[v].childrenPropertyList[v1].propertyType,
                                valueData: this._replacePercentage(sourceTree[v].childrenPropertyList[v1].valueData+'')
                            }
                            propArr.push(obj);
                          }
                      }
                  }
                  propArr.map((valueTemp) => {
                      this.propertyList.push(valueTemp);
                  })
              } else {
                  this._mapTheTree(sourceTree[v].childrenPropertyList);
              }
          }
      }
  }


  _replacePercentage(strValue){
      return strValue.replace('%', 'percent')
  }


  _renderSpuInfo = () => {
      if(this.state.lspuVO && this.state.lspuVO.lspuId){
          return (
              <ItemDetail
                  data={this.state.lspuVO}
              ></ItemDetail>
          )
      }
  }

  /**
   * 计算各个tab的高度
   * @param {[type]} key    [description]
   * @param {[type]} height [description]
   */
  _setHeight(key, height){
    // if(!this._tabHeightObj[key]){
    //   this._tabHeightObj[key] = height + 50;
    //   this.changeState({
    //     currentTabHeight: height + 50
    //   })
    // }
      console.log('_setHeight',this._tabHeightObj)

      this._tabHeightObj[key] = height + 50;
      this.changeState({
          currentTabHeight: height + 50
      })
  }

  _onChangeTab = (obj) => {
    if(this._tabHeightObj[obj.i]){
      this.changeState({
        currentTabHeight: this._tabHeightObj[obj.i]
      })
    }
  }

  _renderTab = () => {
      if (!str.arrIsEmpty(this.state.propertyValuesList)) {
          let tabs = this.state.propertyValuesList.map((value, key) => {
              return (
                  <Content
                      {...this.props}
                      isDisableFetch={this.state.edit ? false : true}
                      edit={this.state.edit}
                      setHeight={this._setHeight.bind(this, key)}
                      tabLabel={value.propertyName}
                      key={key}
                      data={value}
                  ></Content>
              )
          });

          return (
              <ScrollableTabView
                  ref='ScrollableTabView'
                  initialPage={0}
                  onChangeTab={this._onChangeTab}
                  prerenderingSiblingsNumber={this.state.edit ? 3 : 0}
                  scrollWithoutAnimation={false}
                  tabBarInactiveTextColor='#999'
                  tabBarUnderlineColor='#2296f3'
                  tabBarActiveTextColor='#2296f3'
                  tabBarTextStyle={s.items}
                  renderTabBar={() => <ScrollableTabBar underlineHeight={2} style={s.tabbar} />}
                  style={this.state.currentTabHeight ? {marginTop: 10, height: this.state.currentTabHeight} : {marginTop: 10}}
                  // style={ Platform.OS == 'ios' ? {marginTop: 10} : {marginTop: 10,flex:1,minHeight:this.state.currentTabHeight}}
              >
                  {tabs}
              </ScrollableTabView>
          )
      }
  }

  _onChangeValue = (treeId, value) => {
      // console.log('_onChangeValue')
      if (this.state.mainPropertyMap[treeId] && value) {
          this.state.mainPropertyMap[treeId].valueData = value.valueData;
          this.state.mainPropertyMap[treeId].valueId = value.valueId;

      }

      let inputAll = true;
      let propertyValuesDTOs = [];
      for (var variable in this.state.mainPropertyMap) {
          propertyValuesDTOs.push({
              parentPropertyId: this.state.mainPropertyMap[variable].parentPropertyId,
              propertyId: this.state.mainPropertyMap[variable].propertyId,
              valueId: this.state.mainPropertyMap[variable].valueId,
          });
          if(!this.state.mainPropertyMap[variable].valueId){
              inputAll = false;
          }
      }
      if (inputAll) {
          this._getPropertyData(propertyValuesDTOs);
      }
  }
};
