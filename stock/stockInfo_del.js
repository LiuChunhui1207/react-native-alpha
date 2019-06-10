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
import {Page, Button, GalleryList} from 'components';
import StockDetail from './stockDetail';
import EditStockInfo from './editStockInfo';
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
	icon_next2: {
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
			spuName: String
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
			component: StockDetail,
	    name: 'StockDetail'
		})
	}

  /**
   * 编辑商品信息页面
   * @return {[type]} [description]
   */
	_editStockInfo = () =>{
		this.navigator().push({
      data: {
        itemSpecies: this.state.itemSpecies,
        cityVOs: this.state.dataSource,
        picUrlList: this.state.urllist,
        skuId: this.props.route.data.skuId,
        stockNum: this.state.stockNum
      },
      callback: this._getData,
			component: EditStockInfo,
			name: 'EditStockInfo'
		})
	}

	_getData = () =>{
		commonRequest({
			apiKey: 'querySaleItemDetailKey',
			objectName: 'wcItemQueryDO',
			params: this._queryObj
		}).then( (res) => {
			let data = res.data,
        urllist = data.picUrlList.map(item => item.img),
			  stockArray = data.cityVOs;
      //增加总库存到数组中 直接list渲染出来
			// stockArray.push({
			// 	cityName: '总库存',
			// 	stockNum: data.stockNum
			// })
				this.changeState({
		      stockNum: data.stockNum,   //总库存
					itemSpecies: data.itemSpecies,
					dataSource: data.cityVOs,
					pageLoading: false,
					urllist: urllist,
					spuName: data.spuName
				})
		}).catch(err => {
			console.log('do in errrr')
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

	render(){
		return(
			<Page
				pageName='商品基本信息页面'
				title='商品详情' pageLoading={this.state.pageLoading} back={() => this.navigator().pop()}>
				<TouchableOpacity 
					onPress={this._checkStockDetail}
					style={s.stock_box}
				>
					<SText fontSize="body" color="333">{this.state.spuName}</SText>
					<Image source={ICON_NEXT} style={s.icon_next2}/>
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