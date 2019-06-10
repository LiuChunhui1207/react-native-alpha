'use strict';
import React from 'react';
import ReactNative, {
    View,
    Image,
    RefreshControl,
    Platform,
    UIManager,
    ScrollView,
    Switch,
    InteractionManager,
    LayoutAnimation,
    ListView,
    TouchableOpacity,
    Navigator,
    TextInput
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, GalleryList, CommonSelect, Row, Camera, SXCTimePicker, Popover} from 'components';
import {str} from 'tools';
import SKUInfo from './skuInfo';
import {UtilsAction} from 'actions';
import KeyboardSpacer from 'react-native-keyboard-spacer';
//供应商列表
import SupplierList from '../supplier/supplierList';
import {
    ARROW_DOWN_S
} from 'config';

let s = SStyle({
    content: {
        paddingBottom: 20
    },
    info_box: {
        backgroundColor: 'fff',
        borderBottomWidth: 'slimLine',
        borderColor: 'f0',
        marginTop: 10,
    },
    info_name: {
        height: 35,
        borderColor: 'f0',
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 'slimLine',
    },
    info_item: {
        marginTop: 7,
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    stock_image: {
        height: 70,
        width: 70,
        paddingLeft: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    card: {
        backgroundColor: 'fff',
        // marginBottom: 5,
        // marginTop: 7,
    },
    row_item: {
        backgroundColor: 'fff',
        borderBottomWidth: 'slimLine',
        borderColor: 'f0',
        flexDirection: 'row',
    },
    item: {
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 10,
        height: 45,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 'slimLine',
        borderColor: 'f0',
    },
    row: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center'
    },
    arrow_down_s: {
        marginLeft: 6,
        width: 12,
        height: 7
    },
    head_box: {
        paddingLeft: 15,
        paddingRight: 15,
        height: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    head_item: {
        marginTop: 7,
        flex: 1,
        textAlign: 'center',
    },
    flex1: {
        flex: 1
    },
    width120: {
        width: 120,
    },
    width80: {
        width: 80,
        textAlign: 'right'
    },
    item_input: {
        flex: 1,
        textAlign: 'right',
        paddingRight: 5,
        marginRight: 5,
    },
    city_name_box: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingLeft: 15,
    }
});

/**
 * 发布商品时 使用 后端没时间修改接口 去掉绑定供应商信息
 * @type {[type]}
 */
module.exports = class EditSKUInfo1 extends SComponent {
	constructor(props){
		super(props);
		let selectCityName = [], disableCity = [];
		props.route.data.cityVOs.map(item => {
			if(item.selected){
				item.disable = true;
				disableCity.push(item);
				selectCityName.push(item.cityName);
			}
		})
		this.state = {
			...props.route.data,
			selectCityName,
			disableCity,
			pageLoading: true,
			hasSupplier: false,
			cityShowName: selectCityName.join(','),
            selectedCity: [],
            currentDataSource: [],
            currentSelected: []
        }
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this.changeState({
                pageLoading: false
            })
        })
    }

    /**
     * 校验数据
     * @return {[type]} [description]
     */
    _validate = () =>{
        let params = {},
            cityVOs = [],
            totalStock = 0,
            hasNotInput = false,
            errMsg = false;
        this.state.disableCity.map(city=>{
            if(city.inputStockNum != -1){
                totalStock += Number(city.inputStockNum);
            }
            else{
                hasNotInput = true;
            }
            cityVOs.push({
                cityCode: city.cityCode,
                cutoffTime: (city.cutoffTime + 'a').replace(':00a',''),
                stockNum: city.inputStockNum
            })
        })
        this.state.selectedCity.map(city=>{
            if(city.inputStockNum != -1){
                totalStock += Number(city.inputStockNum);
            }
            else{
                hasNotInput = true;
            }
            cityVOs.push({
                cityCode: city.cityCode,
                cutoffTime: (city.cutoffTime + 'a').replace(':00a',''),
                stockNum: city.inputStockNum
            })
        })
        params['cityVOs'] = cityVOs;
        console.log('do in _validate')
        //如果有库存未输入 则输入的库存应该小于等于 总库存 否则 应该等于总库存
        if(hasNotInput){
            if(totalStock > this.state.stockNum){
                errMsg = '库存输入有误！'
            }
        }
        else{
            if(totalStock != this.state.stockNum){
                errMsg = '库存输入有误！'
            }
        }
        if(str.isEmpty(this.state.ItemSpecies)){
            errMsg = '请填写商品别名!'
        }
        if(errMsg){
            __STORE.dispatch(UtilsAction.toast(errMsg, 1500));
            return;
        }
        params['price'] = str.toFen(this.state.price);
        params['itemSpecies'] = this.state.ItemSpecies;
        params['picUrlList'] = this._camera._submit();
        params['spuId'] = this.state.spuId;
        params['stockNum'] = this.state.stockNum;
        if(this.props.route.data.skuId){
            params['skuId'] = this.props.route.data.skuId;
        }
        this._submitObj = params;
        this._submit()
    }

    _submit = ()=>{
        commonRequest({
            apiKey: 'saveItemKey',
            objectName: 'wcItemSaveDTO',
            withLoading: true,
            params: this._submitObj
        }).then( (res) => {
            if(res.data){
                let route = this.navigator().getRoute('name', 'CommodityList');
                this.navigator().popToRoute(route);
                this.props.route.callback && this.props.route.callback(0, 1);
            }
        }).catch(err => {})
        // let route = this.navigator().getRoute('name', 'CommodityList');
        // this.navigator().popToRoute(route);
        // // this.navigator().pop();
        // this.props.route.callback && this.props.route.callback();
    }

    /**
     * 渲染选中的城市
     * @return {[type]} [description]
     */
    _renderSelectCity(){
        let citys = this.state.disableCity.concat(this.state.selectedCity);
        return citys.map(city => {
            if(city.inputStockNum === undefined){
                city.inputStockNum = city.stockNum;
            }
            return (
				<View key={city.cityCode} style={s.item}>
					<View style={s.width120}>
						<SText fontSize="body" color="999">{city.cityName}</SText>
					</View>
					<Row
						onPress={()=>{
                            this._SXCTimePicker._toggle(date=>{
                                city.cutoffTime = date;
                                this.forceUpdate();
                            })
                        }}
						style={[s.flex1, {alignItems: 'center'}]}
					>
						<SText style={s.width80} fontSize="body" color="333">{city.cutoffTime}</SText>
						<Image source={ARROW_DOWN_S} style={s.arrow_down_s}/>
					</Row>
					<View style={s.flex1}>
						<TextInput
							underlineColorAndroid={'transparent'}
							keyboardType="numeric"
							placeholder="请输入"
							onChangeText={text=>{
                                if(text < 0 || text === ''){
                                    city.inputStockNum = -1;
                                }
                                else{
                                    city.inputStockNum = text;
                                    //如果只有一个城市 修改库存时 同步修改总库存
                                    if(citys.length === 1){
                                        this.state.stockNum = text;
                                    }
                                }
                                this.forceUpdate();
                            }}
							value={(city.inputStockNum == -1 || city.inputStockNum === null)? '' : city.inputStockNum + ''}
							style={s.item_input}
						/>
					</View>
				</View>
            )
        })
    }

    /**
     * 必填显示
     * @return {[type]} [description]
     */
    _renderRedStar(){
        return <SText fontSize="caption" color="red">*</SText>
    }

    /**
     * 选择供应商回调方法
     * @param  {[type]} supplier [description]
     * @return {[type]}          [description]
     */
    _selectSupplierCallback = (supplier) =>{
        this.changeState({
            supplierId: supplier.supplierId,
            supplierName: supplier.supplierName
        })
    }

    _commonSelectCallback = (data, name)=>{
        if(name === 'city'){
            let selectCity = data.map(item => {
                item.cutoffTime = '19:00:00';
                return item.cityName;
            });
            this.changeState({
                cityShowName: this.state.selectCityName.concat(selectCity).join(','),
                selectedCity: data
            })
        }
        else{
            this.changeState({
                ['selected' + name]: data
            })
        }
    }

    /**
     * 显示modal框
     * @return {[type]} [description]
     */
    _showCommonSelect(name, keyName){
        let currentObj;
        if(name === 'city'){
            currentObj = {
                keyName: keyName,
                currentName: name,
                multiple: true,
                currentSelected: this.state.selectedCity || [],
                currentDataSource: this.state.cityVOs || []
            }
        }
        if(name === 'PriceUnit'){
            currentObj = {
                keyName: keyName,
                currentName: name,
                multiple: false,
                currentSelected: this.state.selectedPriceUnit || [],
                currentDataSource: this.state.priceUnits || []
            }
        }
        if(name === 'DailySupplyUnit'){
            currentObj = {
                keyName: keyName,
                currentName: name,
                multiple: false,
                currentSelected: this.state.selectedDailySupplyUnit || [],
                currentDataSource: this.state.dailySupplyUnits || []
            }
        }
        this.changeState(currentObj, ()=>{
            this._commonSelect._toggle()
        })
    }


    render(){
        return(
			<Page title='发布商品' pageLoading={this.state.pageLoading} back={() => this.navigator().pop()}>
				<ScrollView style={s.content}>
					<View style={s.info_box}>
						<View style={s.item}>
							<SText fontSize='body' color='999'>商品别名{this._renderRedStar()}</SText>
							<TextInput
								underlineColorAndroid={'transparent'}
								placeholder='请输入'
								onChangeText={text=>{
                                    this.changeState({
                                        ItemSpecies: text
                                    })
                                }}
								style={s.item_input}
							/>
						</View>
						<SText style={s.info_item} fontSize='caption' color='999'>上传商品实物图</SText>
						<SText style={s.info_item} fontSize='caption' color='333'>建议按照单果、外包装、内包装的顺序上传</SText>
						<Camera ref={v=>this._camera = v} style={{padding: 15}} maxNum={9} picArray={this.state.picUrlList} />
					</View>
					<View style={[s.card, {marginTop: 10}]}>
						<View style={s.item}><SText fontSize="body" color="999">当前可供价格{this._renderRedStar()}</SText>
							<View style={s.row}>
								<TextInput
									underlineColorAndroid={'transparent'}
									placeholder='请输入'
									onChangeText={text=>{
                                        this.changeState({
                                            price: text
                                        })
                                    }}
									value={this.state.price ? this.state.price + '' : ''}
									style={s.item_input}
								/>
								<SText fontSize="body" color="333">元/斤</SText>
							</View>
						</View>
						<Row
							onPress={()=>this._showCommonSelect('city', 'cityName')}
							style={s.item}>
							<SText fontSize="body" color="999">申请供应城市{this._renderRedStar()}</SText>
							<Row style={s.city_name_box}>
								<SText fontSize="body" color="333">{this.state.cityShowName}</SText>
								<Image source={ARROW_DOWN_S} style={s.arrow_down_s}/>
							</Row>
						</Row>
						<View style={s.item}>
							<SText fontSize="body" color="999">总库存</SText>
							<View style={s.row}>
								<TextInput
									underlineColorAndroid={'transparent'}
									keyboardType="numeric"
									onChangeText={text=>{
                                        this.changeState({
                                            stockNum: text
                                        })
                                    }}
									placeholder='请输入可供应总量'
									value={this.state.stockNum ? this.state.stockNum + '' : ''}
									style={s.item_input}
								/>
								<SText fontSize="body" color="333">件</SText>
							</View>
						</View>
					</View>
					<View style={s.head_box}>
						<SText style={s.width120} fontSize='caption' color="999">城市</SText>
						<SText style={s.width80} fontSize="caption" color="999">截单时间</SText>
						<SText style={[s.flex1, {textAlign: 'right'}]} fontSize="caption" color="999">库存(件)</SText>
					</View>
					<View style={s.card}>
                        {this._renderSelectCity()}
					</View>
                </ScrollView>
				<KeyboardSpacer />
                <Button onPress={this._validate} type='green' size='large'>保存</Button>
				<CommonSelect
					keyName={this.state.keyName}
					name={this.state.currentName}
					ref={ view => this._commonSelect = view}
					selectCallback={this._commonSelectCallback}
					dataSource={this.state.currentDataSource}
					selected={this.state.currentSelected}
					multiple={this.state.multiple}/>
				<SXCTimePicker ref={v=>this._SXCTimePicker = v} />
			</Page>
        )
    }
}