/**
 * @Author: willing
 * @Date:   2017-06-18T16:57:13+08:00
 * @Email:  zhangweilin@songxiaocai.com
 * @Project: sxf
 * @Last modified by:   willing
 * @Last modified time: 2017-06-24T01:28:40+08:00
 * @License: GNU General Public License（GPL)
 * @Copyright: ©2015-2017 www.songxiaocai.com 宋小菜 All Rights Reserved.
 */



'use sctict';
import React from 'react';
import ReactNative, {
	View,
	Image,
	RefreshControl,
	Platform,
	UIManager,
	InteractionManager,
	LayoutAnimation,
	ListView,
	TouchableOpacity,
	Navigator
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, GalleryList, Row} from 'components';
//商品详细属性页
import SKUDetail from './skuDetail';
//编辑商品信息页
import EditSKUInfo from './editSKUInfo';
import {
	ICON_NEXT
} from 'config';

let s = SStyle({
	stock_box: {
    height: 45,
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
	},
	icon_next: {
		width: 7,
		height: 12
	},
	head_box: {
    height: 35,
    flexDirection: 'row',
    alignItems: 'center'
	},
	head_item: {
		flex: 1,
    paddingLeft: 15
	},
  list_box: {
    flex: 1,
    backgroundColor: '#fff'
  },
	row_item: {
    height: 35,
    alignItems: 'center',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
    flexDirection: 'row',
  },
  info_box: {
		backgroundColor: 'fff',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
    paddingBottom: 16,
    marginTop: 10,
  },
  info_name: {
		flexDirection: 'row',
    height: 35,
		paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  border_bottom: {
    borderColor: 'f0',
    borderBottomWidth: 'slimLine',
  },
	info_item: {
		marginTop: 7,
		marginBottom: 7,
		textAlign: 'center'
	},
	stock_image: {
		height: 70,
		width: 70,
    marginLeft: 8,
	},
  width80: {
    width: 80,
    textAlign: 'center'
  },
  width100: {
    width: 100,
    textAlign: 'center'
  },
  supplier_box: {
    flexDirection: 'row',
    height: 45,
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

/**
 * 商品基本信息页面
 * @type {[type]}
 */
module.exports = class StockInfo extends SComponent {
	constructor(props){
		super(props);
    //查询数据入参
    this._queryObj = {
      spuId: props.route.data.spuId,
      skuId: props.route.data.skuId,
    }
		this._ds = new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2});
		this.state = {
			pageLoading: true,
			urllist: [],
			dataSource: [],
			spuName: String,

		}
	}

	componentDidMount(){
		InteractionManager.runAfterInteractions(() => {
			this._getData();
		})
	}

  /**
   * 商品详细属性页面
   * @return {[type]} [description]
   */
	_checkStockDetail = () =>{
		this.navigator().push({
      data: this._queryObj,
			component: SKUDetail,
	    name: 'SKUDetail'
		})
	}

  /**
   * 编辑商品信息页面
   * @return {[type]} [description]
   */
	_editStockInfo = () =>{
		this.navigator().push({
      data: {
        catId:                   this.state.catId,
        bandSupplier:            this.state.bandSupplier,
        supplierName:            this.state.supplierName,
        itemSpecies:             this.state.itemSpecies,
        priceUnits:              this.state.priceUnits,
        cityVOs:                 this.state.dataSource,
        picUrlList:              this.state.urllist,
        skuId:                   this.props.route.data.skuId,
        stockNum:                this.state.stockNum,
        dailySupplyUnits:        this.state.dailySupplyUnits,
        selectedPriceUnit:       this.state.priceUnits.slice(0,1),       //默认当前可供价格单位
        selectedDailySupplyUnit: this.state.dailySupplyUnits.slice(0,1),  //默认当前可供价格单位
        coreSku: this.state.coreSku
      },
      callback: this._getData,
			component: EditSKUInfo,
			name: 'EditSKUInfo'
		})
	}

	_getData = () =>{
		commonRequest({
			apiKey: 'querySaleItemDetailKey',
			objectName: 'wcItemQueryDO',
			params: this._queryObj
		}).then( (res) => {
      console.log('skuInfo',res);
			let data = res.data,
        urllist = data.picUrlList.map(item => item.img),
			  stockArray = data.cityVOs;
			this.changeState({
        catId: data.catId,                //类目id
        bandSupplier: data.bandSupplier, //是否绑定供应商
        supplierName: data.supplierName, //供应商名字
        stockNum: data.stockNum,         //总库存
				itemSpecies: data.itemSpecies,   //商品别名
        priceUnits: data.priceUnits,     //当前可供价格单位枚举
        dailySupplyUnits: data.dailySupplyUnits,
				dataSource: data.cityVOs,
				pageLoading: false,
				urllist: urllist,
				spuName: data.spuName,
        coreSku: !!data.coreSku
			})
		}).catch(err => {
			console.log('do in errrr')
      console.log(err)
			this.changeState({
					refreshing: false
			})
		})
	}

	_renderRow = (rowData, SectionData, rowID) =>{
    //显示选中城市或者总库存
    if(rowData.selected || rowData.cityName === '总库存'){
  		return(
  			<View style={s.row_item}>
  				<SText style={s.head_item} fontSize='body' color='999'>{rowData.cityName}</SText>
  				<SText style={s.width100} fontSize='body' color='999'>{rowData.cutoffTime}</SText>
  				<SText style={s.width80} fontSize='body' color='999'>{rowData.soldNum}</SText>
  				<SText style={s.width80} fontSize='body' color='999'>{rowData.stockNum}</SText>
  			</View>
  		)
    }
    return null
	}

  /**
   * 渲染总仓库存
   * @return {[type]} [description]
   */
  _renderFooter = ()=>{
    if(this.state.dataSource.length > 0){
      return (
        <View style={[s.row_item, {backgroundColor: '#fafafa'}]}>
          <SText style={s.head_item} fontSize='body' color='999'>总库存</SText>
          <SText style={s.width80} fontSize='body' color='999'>{this.state.stockNum}</SText>
        </View>
      )
    }
    return null;
  }

  /**
   * 绑定了供应商则显示供应商名字
   * @return {[type]} [description]
   */
  _renderSupplierInfo(){
    if(this.state.bandSupplier){
      return (
        <Row style={s.supplier_box}>
          <SText fontSize="body" color="999">供应商</SText>
          <SText fontSize="body" color="333">{this.state.supplierName}</SText>
        </Row>
      )
    }
    return null;
  }
  /**
   * [_renderIsKernelItem 核心商品]
   * @return {[type]} [component]
   */
  _renderIsKernelItem(){
    if(this.state.coreSku){
      return (
        <Row style={[s.supplier_box,s.border_bottom]}>
          <SText fontSize="body" color="999">核心商品</SText>
          <SText fontSize="body" color="333">核心商品</SText>
        </Row>
      )
    }
    return null;
  }
	render(){
		return(
			<Page title='商品详情' pageLoading={this.state.pageLoading} back={() => this.navigator().pop()}>
				<TouchableOpacity
					onPress={this._checkStockDetail}
					style={s.stock_box}
				>
					<SText fontSize="body" color="333">{this.state.spuName}</SText>
					<Image source={ICON_NEXT} style={s.icon_next}/>
				</TouchableOpacity>
				<View style={s.info_box}>
						<View style={[s.info_name, s.border_bottom]}>
							<SText style={s.info_item} fontSize='body' color='999'>商品别名</SText>
							<SText style={s.info_item} fontSize='body' color='999'>{this.state.itemSpecies}</SText>
						</View>
						<View style={s.info_name}>
							<SText style={s.info_item} fontSize='caption' color='999'>商品主图</SText>
						</View>
						<View style={{paddingLeft: 15}}>
							<GalleryList
								imageList={this.state.urllist}
								horizontal={true}
								imageStyle={s.stock_image}
							/>
						</View>
				</View>
        {this._renderIsKernelItem()}
        {this._renderSupplierInfo()}
        <View style={s.head_box}>
          	<SText style={s.head_item} fontSize='mini' color="999">城市名称</SText>
          	<SText style={s.width100} fontSize="mini" color="999">截单时间</SText>
          	<SText style={s.width80} fontSize="mini" color="999">订单量(件)</SText>
          	<SText style={s.width80} fontSize="mini" color="999">库存(件)</SText>
        </View>
        <ListView
          style={s.list_box}
          initialListSize={10}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
        />
        <Button onPress={this._editStockInfo} type='green' size='large'>编辑</Button>
      </Page>
		)
	}
}
