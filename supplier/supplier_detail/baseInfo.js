'use strict';
import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Text,
  TextInput,
  LayoutAnimation,
  InteractionManager
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, SXCRadio, Row, SInput, CommonSelect, Camera, GalleryList} from 'components';
import {UtilsAction} from 'actions';
import {str} from 'tools';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import {
  ICON_ADD2
} from 'config';

let s = SStyle({
  head: {
    height: 30,
    backgroundColor: 'f0',
    justifyContent: 'center',
    paddingLeft: 15
  },
  item: {
    height: 45,
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center'
  },
  border_bottom: {
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  flex1: {
    flex: 1
  },
  input: {
    flex: 1,
    color: '#333',
    textAlign: 'right'    
  },
  radio_group: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row'
  },
  brand_img: {
    marginTop: 8,
    width: 70,
    height: 70,
    marginRight: 16
  },
  brand_box: {
    height: 116,
    backgroundColor: 'fff',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 14,
    paddingRight: 18
  },
  input_mul: {
    flex: 1,
    height: 96,
    fontSize: 16,
    color: '#333'
  },
  icon_add_box: {
    flex: 1,
    alignItems: 'flex-end'
  },
  icon_add: {
    width: 14,
    height: 15
  },
  idCard_box: {
    paddingTop: 15,
    paddingLeft: 15,
    paddingBottom: 11,
    backgroundColor: 'fff'
  }
});

/**
 * 供应商基础信息
 * @type {[type]}
 */
module.exports = class BaseInfo extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      wholesaleMarketEnums: [],  //所有批发市场
      wholesaleMarkets: [],      //选中批发市场
      brandPicUrls: [],
      edit: false,
      creat: false
    }
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
      apiKey: 'querySupplierBaseInfoUpdateInitKey', 
      withLoading: true,
      objectName: 'supplyUserQueryDO',
      params: {
        supplierId: this.props.route.data.supplierId
      }
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        ...data,
        edit: false
      });
    }).catch( err => {})
  }

  _onChangeTab = (obj)=>{
    //当前激活的tab index
  }

  /**
   * textinput内容变化回调
   * @param  {[type]} text [description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  _onChangeText(text, name){
    this.changeState({
      [name]: text
    })
  }

  /**
   * 渲染身份类型
   * 编辑时不能修改
   * @return {[type]} [description]
   */
  _renderidType(){
    if(this.state.edit){
      return (
        <SXCRadio.SXCRadioGroup style={s.radio_group} onChange={text =>this._onChangeText(text, 'idType')}>
          <SXCRadio.Option checked={this.state.idType === 0} value={0} style={{marginRight: 5}}>
            <SText fontSize="body" color="333">个人</SText>
          </SXCRadio.Option>
          <SXCRadio.Option checked={this.state.idType === 1} value={1}>
            <SText fontSize="body" color="333">企业</SText>
          </SXCRadio.Option>
        </SXCRadio.SXCRadioGroup>
      )
    }
    return <SText style={s.input} fontSize="body" color="333">{this.state.idTypeDes}</SText>
  }

  /**
   * 渲染APP是否展示
   * @return {[type]} [description]
   */
  _renderShowBrand(){
    //品牌名称存在时 显示是否在宋小菜APP展示
    if(this.state.supplierBrand){
      if(this.state.edit){
        return (
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">宋小菜APP是否展示</SText>
            <SXCRadio.SXCRadioGroup style={s.radio_group} onChange={text =>this._onChangeText(text, 'showBrand')}>
              <SXCRadio.Option checked={this.state.showBrand === 0} value={0} style={{marginRight: 5}}>
                <SText fontSize="body" color="333">不展示</SText>
              </SXCRadio.Option>
              <SXCRadio.Option checked={this.state.showBrand === 1} value={1}>
                <SText fontSize="body" color="333">展示</SText>
              </SXCRadio.Option>
            </SXCRadio.SXCRadioGroup>
          </Row>
        )
      }
      return (
        <Row style={[s.item, s.border_bottom]}>
          <SText fontSize="body" color="666">宋小菜APP是否展示</SText>
          <SText style={s.input} fontSize="body" color="333">{this.state.showBrand === 1 ? '展示' : '不展示'}</SText>
        </Row>
      )
    }
    return null;
  }

  _showErrorMsg(str){ curTabId:0,
    __STORE.dispatch(UtilsAction.toast(str, 1000));
  }

  /**
   * 品牌图片
   * @return {[type]} [description]
   */
  _renderBrandPic(){
    //品牌名称存在时 显示品牌图片和介绍
    if(this.state.supplierBrand){
      if(this.state.edit){
        let picArray = this.state.brandPicUrls[0] ? [this.state.brandPicUrls[0].img] : []
        return (
          <Row style={s.brand_box}>
            <Camera 
              ref={v=> this._brand = v}
              style={{marginTop: 6}}
              single 
              showErrorMsg={this._showErrorMsg}
              picArray={picArray} 
            />
            <SInput 
              placeholder="请填写品牌信息"
              onChangeText={text=>{
                this._onChangeText(text, 'brandIntroduce')
              }}
              onFocus={(event)=>{
                this._scrollResponder.scrollResponderScrollNativeHandleToKeyboard(event.target,120,true)
              }}
              editable={this.state.edit}
              value={this.state.brandIntroduce} 
              style={s.input_mul}
              multiline
            />
          </Row>
        )
      }
      //如果图片不存在 切处于查看状态下 隐藏展示图片区域
      else if(this.state.brandPicUrls[0]){
        return (
          <Row style={s.brand_box}>
            <GalleryList
              containerStyle={{width: 80}}
              imageList={[this.state.brandPicUrls[0].img]}
              horizontal={true}
              imageStyle={s.brand_img}
            />
            <SInput 
              value={this.state.brandIntroduce} 
              editable={this.state.edit} 
              style={s.input_mul} 
              multiline 
            />
          </Row>
        )
      }
      return null
    }
    return null;
  }

  /**
   * 批发市场
   * @return {[type]} [description]
   */
  _renderWholesaleMarket(){
    //编辑状态
    if(this.state.edit){
      return this.state.wholesaleMarkets.map((market, index) => {
        if(market.wholesaleMarketAddress === null || market.wholesaleMarketAddress === null){
          market.wholesaleMarketAddress = '';
        }
        return (
          <Row key={index} style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">{market.wholesaleMarketName}</SText>
            <SInput 
              style={[s.flex1, {marginLeft: 10}]}
              onChangeText={text=>{
                market.wholesaleMarketAddress = text;
                this.forceUpdate();
              }}
              value={market.wholesaleMarketAddress}
              placeholder="请填写档口号" />
            <TouchableOpacity 
              onPress={()=>{
                let s = this.state.wholesaleMarkets.splice(index, 1);
                this.forceUpdate();
              }}
            >
              <SText fontSize="caption" color="red" >删除</SText>
            </TouchableOpacity>
          </Row>
        )
      })
    }
    //查看状态
    return this.state.wholesaleMarkets.map((market, index) => {
      return (
        <Row key={index} style={[s.item, s.border_bottom]}>
          <SText fontSize="body" color="666">{`${market.wholesaleMarketName}  ${market.wholesaleMarketAddress}`}</SText>
        </Row>
      )
    })
  }

  /**
   * 实名区域
   * 查看状态如果证件号码为空 则整块不显示
   * @return {[type]} [description]
   */
  _renderAutonym(){
    if(this.state.edit){
      let picArray = this.state.supplierImgs.map(item => item.img);
      return (
        <View>
          <View style={s.head}>
            <SText fontSize="caption" color="999">实名认证</SText>
          </View>
          {
            this.state.idType === 0 ? null 
            :
             <Row style={[s.item, s.border_bottom]}>
               <SText fontSize="body" color="666">企业名称</SText>
               <SInput 
                  placeholder="企业名称"
                  onChangeText={text=>{
                    this._onChangeText(text, 'companyName')
                  }}
                  onFocus={(event)=>{
                    this._scrollResponder.scrollResponderScrollNativeHandleToKeyboard(event.target,120,true)
                  }}
                  editable={this.state.edit} 
                  value={this.state.companyName} 
                  style={s.input} 
                />
             </Row>
          }
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">{this.state.idType === 0 ? '身份证号码' : '营业执照注册号'}</SText>
            <SInput 
              onFocus={(event)=>{
                this._scrollResponder.scrollResponderScrollNativeHandleToKeyboard(event.target,120,true)
              }}
              onChangeText={text=>{
                this._onChangeText(text, 'idCard')
              }}
              editable={this.state.edit} 
              value={this.state.idCard} 
              style={s.input}
            />
          </Row>
          <View style={s.idCard_box}>
            <SText style={{marginBottom: 6}} fontSize="mini" color="666">{this.state.idType === 0 ? '身份证照片' : '营业执照照片'}</SText>
            <Camera 
              ref={v=> this._autonym = v}
              showErrorMsg={this._showErrorMsg} 
              picArray={picArray} 
            />
          </View>
        </View>
      )
    }
    else {
      if(this.state.idCard || this.state.supplierImgs){
        console.log('dodoodo:ssssss:', this.state.supplierImgs)
        return (
          <View>
            <View style={s.head}>
              <SText fontSize="caption" color="999">实名认证</SText>
            </View>
            <Row style={[s.item, s.border_bottom]}>
              <SText fontSize="body" color="666">{this.state.idType === 0 ? '身份证号码' : '营业执照注册号'}</SText>
              <SInput editable={this.state.edit} value={this.state.idCard} style={s.input} />
            </Row>
            <View style={s.idCard_box}>
              <SText fontSize="mini" color="666">{this.state.idType === 0 ? '身份证照片' : '营业执照照片'}</SText>
              <Row>
              {
                this.state.supplierImgs && this.state.supplierImgs.map((supplierImg, index) => {
                  return <Image key={index} style={s.brand_img} source={{uri: supplierImg.img}} />
                })
              }
              </Row>
            </View>
          </View>
        )
      }
      return null
    }
  }

  /**
   * 查看状态下点击 切换至编辑状态
   * 编辑状态点击则提交数据
   * @return {[type]} [description]
   */
  _btnClick = () =>{
    //提交数据
    if(this.state.edit){
      if(str.isEmpty(this.state.supplierName)){
        return this._showErrorMsg('供应商名字不能为空！');
      }
      if(str.isEmpty(this.state.mobilePhone)){
        return this._showErrorMsg('供应商手机号不能为空！');
      }
      let param = {
        brandIntroduce: this.state.brandIntroduce,
        companyImgs: this.state.idType === 1 ? this._autonym._submit() : [],
        companyName: this.state.companyName,
        idCard: this.state.idCard,
        idType: this.state.idType,
        showBrand: this.state.showBrand,
        supplierBrand: this.state.supplierBrand,
        supplierId: this.state.supplierId,
        supplierImgs: this.state.idType === 0 ? this._autonym._submit() : [],
        wholesaleMarkets: this.state.wholesaleMarkets
      }
      //品牌信息不为空时 图片和介绍必填
      if(!str.isEmpty(this.state.supplierBrand)){
        let brandPicUrls = this._brand._submit();
        if(brandPicUrls.length === 0){
          return this._showErrorMsg('请完善品牌信息！');
        }
        else{
          param['brandPicUrls'] = brandPicUrls;
        }
      }
      commonRequest({
        apiKey: 'updateSupplierBaseInfoKey', 
        withLoading: true,
        objectName: 'baseInfoEditDO',
        params: param
      }).then( (res) => {
        let data = res.data;
        if(res.data){
          // this._getData();
          this.changeState({
            edit: false
          })
          // this.navigator().pop();
        }
      }).catch( err => {})
    }
    else{
        this.changeState({
          edit: true
        })
    }
  }

  /**
   * 选择批发市场后的回调方法
   * @return {[type]} [description]
   */
  _commonSelectCallback = (data, name) =>{
    this.changeState({
      wholesaleMarkets: data
    })
  }

  render(){
    return (
      <View style={s.flex1}>
        <ScrollView 
          ref={v=>{
            this._scrollResponder = v;
          }}
          style={s.flex1}>
          <View style={s.head}>
            <SText fontSize="caption" color="999">基础信息</SText>
          </View>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">姓名</SText>
            <SInput 
              onChangeText={text=>{
                this._onChangeText(text, 'supplierName')
              }}
              editable={this.state.creat} 
              value={this.state.supplierName} 
              style={s.input} 
            />
          </Row>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">手机号码</SText>
            <SInput 
              onChangeText={text=>{
                this._onChangeText(text, 'mobilePhone')
              }}
              keyboardType="numeric" 
              editable={this.state.creat} 
              value={this.state.mobilePhone} 
              style={s.input} 
            />
          </Row>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">身份类型</SText>
            {this._renderidType()}
          </Row>
          <View style={s.head}>
            <SText fontSize="caption" color="999">品牌信息</SText>
          </View>
          <Row style={[s.item, s.border_bottom]}>
            <SText fontSize="body" color="666">品牌信息</SText>
            <SInput 
              onChangeText={text=>{
                this._onChangeText(text, 'supplierBrand')
              }}
              placeholder="-"
              editable={this.state.edit} 
              value={this.state.supplierBrand ? this.state.supplierBrand : ''} 
              style={s.input} 
            />
          </Row>
          {this._renderShowBrand()}
          {this._renderBrandPic()}
          <View style={s.head}>
            <SText fontSize="caption" color="999">所在批发市场</SText>
          </View>
          {
            this.state.edit ? 
              <Row 
                onPress={()=>{
                  this._commonSelect._toggle()
                }}
                style={[s.item, s.border_bottom, {backgroundColor: '#FAFAFA'}]}
              >
                <SText style={s.flex1} fontSize="body" color="666">添加批发市场</SText>
                  <Image source={ICON_ADD2} style={s.icon_add} />                  
              </Row>
              : null
          }
          {this._renderWholesaleMarket()}
          {this._renderAutonym()}
        </ScrollView>
        <Button onPress={this._btnClick} type='green' size='large'>{this.state.edit ? '保存' : '编辑'}</Button>
        <CommonSelect 
          keyName="wholesaleMarketName"
          ref={ view => this._commonSelect = view}
          selectCallback={this._commonSelectCallback}
          dataSource={this.state.wholesaleMarketEnums}
          selected={this.state.wholesaleMarkets}
          multiple
        />
      </View>
    )
  }
}
