'use strict';
import React from 'react';
import ReactNative, {
	View,
	Image,
	RefreshControl,
  ScrollView,
	Platform,
	UIManager,
	InteractionManager,
	LayoutAnimation,
	ListView,
	TouchableOpacity,
	Navigator
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, GalleryList} from 'components';
import {UtilsAction} from 'actions';
//发布商品页面
import ItemAdd from './create/item_add/item_add';

let s = SStyle({
	stock_box: {
    height: 48,
		paddingLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
	},
	info_box: {
		backgroundColor: 'fff',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
    paddingBottom: 7,
  },
  info_name: {
    paddingTop: 10,
    paddingBottom: 10,
		paddingLeft: 15,
  },
	card: {
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
  },
  item_title: {
    backgroundColor: 'f0',
    height: 30,
    paddingLeft: 15,
    justifyContent: 'center',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
  },
	item: {
    flexDirection: 'row',
    paddingTop: 7,
    paddingBottom: 7,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
  },
  stock_image: {
		height: 70,
		width: 70,
		paddingLeft: 15,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
  containerStyle: {
    paddingLeft: 15,
    paddingBottom: 10
  }
});

/**
 * 商品属性详情页面
 * @type {[type]}
 */
module.exports = class StockDetail extends SComponent {
	constructor(props){
		super(props);
    this._queryObj = {...props.route.data}
		this._ds = new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2});
		this.state = {
      itemPropertyVOs: [],     //商品属性列表
			pageLoading: true,
      images: [],
		}

		this._getData = this._getData.bind(this);
	}
	
	componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
    	this._getData();
    })
	}

	_getData = () =>{
		commonRequest({
			apiKey: 'queryStoreHouseItemDetailKey',
			objectName: 'wcItemQueryDO',
			params: this._queryObj
		}).then( (res) => {
				let data = res.data;
				this.changeState({
          catId: data.catId,
          catName: data.catName,
          spuStatus: data.spuStatus,   //商品审核状态
          spuStatusTip: data.spuStatusTip, //审核状态提示文案
          images: [data.image.img],
					pageLoading: false,
          itemPropertyVOs: data.itemPropertyVOs,
					spuName: data.spuName     //商品名称
			})
		}).catch(err => {
      console.log('do in errr', err)
    })
	}

  _editCallback = ()=>{
    this._getData();
    this.props.route.refresh && this.props.route.refresh();
  }

  /**
   * 渲染商品属性
   * @return {[type]} [description]
   */
  _renderItemProps(){
    return this.state.itemPropertyVOs.map((item, index) => {
      return (
        <View key={index}>
          <View style={s.item_title}>
              <SText fontSize="caption" color="999">{item.propertyTypeName}</SText>
          </View>
          <View style={s.card}>
            {
              item.propertyVOs.map((property, i) => {
                return (
                  <View style={s.item} key={`${index}-${i}`}>
                      <SText fontSize="body" color="999">{property.propertyName}</SText>
                      <SText fontSize="body" color="999">{property.propertyValue}</SText>
                  </View>
                )
              })
            }
          </View>
        </View>
      )
    })
  }

  /**
   * 从商品管理列表进入该页面时 需要显示商品的售卖状态
   * @return {[type]} [description]
   */
  _renderStatus(){
    if(this.props.route.from === 'SkuListStored'){
      switch(this.state.spuStatus){
        case 0:
          return (
            <View style={{backgroundColor: '#FFF5E5', height: 30, justifyContent: 'center', alignItems: 'center'}}>
              <SText fontSize="mini" color="orange">{this.state.spuStatusTip}</SText>
            </View>
          )
        case 1:
          return (
            <View style={{backgroundColor: '#FFF5E5', height: 30, justifyContent: 'center', alignItems: 'center'}}>
              <SText fontSize="mini" color="greenFont">{this.state.spuStatusTip}</SText>
            </View>
          )
        case 2:
          return (
            <View style={{backgroundColor: '#FFF5E5', height: 30, justifyContent: 'center', alignItems: 'center'}}>
              <SText fontSize="mini" color="red">{this.state.spuStatusTip}</SText>
            </View>
          )
        default:
          return null
      }
    }
    return null;
  }

  /**
   * 从商品管理页面进入时 需要根据状态显示按钮
   * 已通过---开始售卖 跳至发布商品页面
   * 未通过---再次提交 跳至编辑商品页面
   * 
   * @return {[type]} [description]
   */
  _renderBottomBtn(){
    if(this.props.route.from === 'SkuListStored'){
      switch(this.state.spuStatus){
        //已通过
        case 1:
          return <Button type='green' size='large' onPress={this._startSale} >开始售卖</Button>
        //未通过
        case 2:
          return <Button type='green' size='large' onPress={this._reSubmit} >再次提交</Button>
        default:
          return null
      }
    }
    return null;
  }

  /**
   * 单个商品数据
   * @return {[type]} [description]
   */
  _getItemData(spuId){
    return commonRequest({
      apiKey: 'querySaleItemDetailKey',
      withLoading: true,
      objectName: 'wcItemQueryDO',
      params: {
        spuId
      }
    })
  }

  /**
   * 开始售卖
   * @return {[type]} [description]
   */
  _startSale = () =>{
    this._getItemData(this.props.route.data.spuId).then(res=>{
      this.navigator().push({
        component: require('./editSKUInfo1'),
        name: 'EditSKUInfo1',
        callback: this.props.route.callback,
        data: {
          ...res.data,
          skuId: this.props.route.data.skuId
        }
      })
    }).catch(err => {
      __STORE.dispatch(UtilsAction.toast('查询商品信息出错', 1000));
    })
  }

  /**
   * 再次提交
   * @return {[type]} [description]
   */
  _reSubmit = () =>{
    this.navigator().push({
      callback: this._editCallback,
      component: ItemAdd,
      edit: true,
      name: 'ItemAdd',
      data: {
        spuId: this.props.route.data.spuId,
        skuId: this.props.route.data.skuId,
        catId: this.state.catId,
        title: this.state.catName
      }
    })
  }

	render(){
		return(
			<Page title='商品详情' pageLoading={this.state.pageLoading} back={() => this.navigator().pop()}>
        <ScrollView>
          {this._renderStatus()}
  				<View style={s.stock_box}>
  					<SText fontSize='body' color='greenFont'>{this.state.spuName}</SText>
  				</View>
  				<View style={s.info_box}>
						<View style={s.info_name}>
							<SText fontSize='caption' color='999'>商品主图</SText>
						</View>
						<GalleryList
              containerStyle={s.containerStyle}
							imageList={this.state.images}
							horizontal={true}
							imageStyle={s.stock_image}
						/>	
  				</View>
  		    {this._renderItemProps()}
        </ScrollView>
        {this._renderBottomBtn()}
			</Page>
		)
	}
}

