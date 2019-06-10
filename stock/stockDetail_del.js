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

	_getData(){
		commonRequest({
				apiKey: 'queryStoreHouseItemDetailKey',
				objectName: 'wcItemQueryDO',
				params: this._queryObj
		}).then( (res) => {
				let data = res.data;
				// let urllist = data.picUrlList.map(item => item.img);
				console.log('----------')
				console.log(data);
				this.changeState({
					itemSpecies: data.itemSpecies,
          images: [data.image.img],
					pageLoading: false,
          itemPropertyVOs: data.itemPropertyVOs,
					spuName: data.spuName
			})
		}).catch(err => {
      console.log('do in errr', err)
    })
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

	render(){
		return(
			<Page
				pageName='商品属性详情页面'
				title='商品详情' pageLoading={this.state.pageLoading} back={() => this.navigator().pop()}>
        <ScrollView>
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
			</Page>
		)
	}
}

