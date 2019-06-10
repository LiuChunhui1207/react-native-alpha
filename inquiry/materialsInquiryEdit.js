// /**
//  * @Author: liuchunhui
//  * @Date:   2017-08-08 17:54:40
//  * @Email:  liuchunhui1207@gmail.com
//  * @Filename: inquiryEdit.js
//  * @Last modified by:   liuchunhui
//  * @Last modified time: 2017-08-08 17:31:54
//  * @License: GNU General Public License（GPL)
//  * @Copyright: ©2015-2017 www.songxiaocai.com 宋小菜 All Rights Reserved.
	
'use strict'

import React from 'react';
import{
  View,
  Image,
  ListView,
  InteractionManager,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
} from 'react-native';
import { SComponent, SStyle, SText, SXCEnum } from 'sxc-rn';
import { Page, Button, Select } from 'components';
import { str } from 'tools';
import { IconForward, ICON_DOWN_L, IconDelete } from 'config';
import {UtilsAction} from 'actions';
import InquiryInfo from './inquiryInfo';
import EditInquiry from './editInquiry';
import Echarts from 'native-echarts';

// 引入询价记录模块
import InquiryRecordList from './inquiryRecordList'

let s = SStyle({
	submit: {
		fontSize: 16,
		color: '#fff',
		marginRight: 5,
	},
	skuContainer: {
		width: '@window.width',
		paddingLeft: 15,
		paddingTop: 6,
		paddingBottom: 6,
		backgroundColor: '#fff',
		flexDirection: 'row',
	},
	skuContainerLeft: {
		flex: 7,
	},
	skuContainerRight: {
		flex: 3,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingRight: 15,
	},
	skuName: {
    fontSize: 15,
		color: '#000',
		lineHeight: 22,
		marginTop: 7,
		marginBottom: 7,
	},
	keyName: {
		fontSize: 15,
		color: '#000',
		lineHeight: 22,
		marginTop: 12, 
		marginBottom: 12
	},
	selectText: {
		fontSize: 13,
		lineHeight: 20,
		color: '#768591',
	},
	record: {
		fontSize: 13,
		lineHeight: 17,
		color: '#021D33',
		opacity: 0.54,
	},
	more: {
		width: 6.8,
		height: 12,
		marginLeft: 10.3,
	},
  detailContainer: {
    width: '@window.width',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  row: {
  	backgroundColor: '#fff',
  	flexDirection: 'row',
  	justifyContent: 'space-between',
  	alignItems: 'center',
  	paddingLeft: 15,
  	paddingRight: 15,
  	borderBottomWidth: 1,
  	borderBottomColor: '#eee',
  },
  rowLeft: {
  	flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rowRightCanvel: {
  	flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 44,
    width: 44 
  },
  arrowDown: {
  	width: 12,
  	height: 6.8,
  	marginLeft: 10,
  },
  delete: {
  	width: 16,
  	height: 16,
  },
  remark: {
  	paddingLeft: 15,
  	paddingTop: 10,
  	fontSize: 15,
  	lineHeight: 20,
  	color: '#061E30',
  },
  textInputS: {
  	marginLeft: 15,
  	marginTop: 14,
  	width: 150,
  	height: 21,
  	padding: 0,
  	marginBottom: 11
  },
  textInputM: {
  	marginLeft: 15,
  	marginRight: 15,
  	marginTop: 10,
  	marginBottom: 15,
  	height: 64,
  	padding: 10,
  	borderWidth: 1,
  	borderColor: 'rgba(0,0,0,0.1)',
  	borderRadius: 3,
  	fontSize: 15,       //value的字号，继承自Text
  },
});

/**
 * 询价编辑页面
 */
module.exports = class SkuInquiryEdit extends SComponent {
  constructor(props){
    super(props);
		this.state = {
			pageLoading: false,
			loading: false,
			refreshing: false,

			itemName: '',
		  itemSpecies: '', 
		  selectedSupplierId: '',     //选中的供应商的id
		  selectedSupplierName: '',  //选中的供应商 
		  supplierList: [],    //供应商列表

		  showFirstCancel: false,
		  zeroFirstValue: false,
      
      firstInput: null,
      remark: '',
      showKeyBoard: true,
		};
    
  }

	componentDidMount(){
		InteractionManager.runAfterInteractions( () => {
			// 对应sku的id或者原料的id
			const id = this.getRouteData('id');
			// 对应sku的名称或者原料的名称
			const name = this.getRouteData('name');
			this._getInitData();
		})
	}

	_getInitData = () => {
		this.changeState({
			refreshing: true
		});
		// 对应sku的id
	  const id = this.getRouteData('id');
		// 对应sku的名称
		const name = this.getRouteData('name');
		commonRequest({
			apiKey: 'createInquiryPriceInitKey',
			objectName: 'inquiryPriceQueryDO',
			params: {
				inquiryItemId: id,
				inquiryType: 2
			}
		}).then( (res) => {
			let  data = res.data;
			let _supplierList = res.data.suppliers;
			this.changeState({
				refreshing: false,
				itemName: data.itemName,
				itemSpecies: data.itemSpecies,
				selectedSupplierName: _supplierList.length == 0 ? '' : data.suppliers[0].value,
				selectedSupplierId: _supplierList.length == 0 ? null : data.suppliers[0].key,
				supplierList: _supplierList.map((cat) => ({name: cat.value, value: cat.key})),
			});
		}).catch( err => {
			this.changeState({
				refreshing: false,
			});
			Toast.show('有错误');
		}) 
	}

	_accMul(arg1,arg2)  {  
    var m=0,s1=arg1.toString(),s2=arg2.toString();  
    try{m+=s1.split(".")[1].length}catch(e){}  
    try{m+=s2.split(".")[1].length}catch(e){}  
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);  
  }

	_getSubmitData = () => {
		if(this.state.firstInput == null || this.state.firstInput == 0){
			Toast.show('请填写相关价格');
			return;
		}
    this.changeState({
    	refreshing: true
    });
    // 对应sku的id
	  const id = this.getRouteData('id');
    commonRequest({
    	apiKey: 'createLspuInquiryPriceKey',
			objectName: 'lspuInquiryPriceCreateDO',
			params: {
				lspuId: id,     //原料id
				purchasePrice: this._accMul(this.state.firstInput,100),   //一批市场价
				remark: this.state.remark,        //备注
				supplierId: this.state.selectedSupplierId,     //供应商id 
			}
    }).then(res => {
			const { success } = res
			if (success) {
				this.navigator().pop();
				this.props.route.callback();
			} else {
				__STORE.dispatch(UtilsAction.toast('提交失败', 1000));
			}
		});
	}

	_renderRightBtn = () => {
		return(
			<SText style={s.submit}>提交</SText>
		)
	} 


  //顶端SKU
	_renderSkuView = () => {
		return(
			<View style={s.skuContainer}>
				<View style={s.skuContainerLeft}>
					<SText style={s.skuName}>{this.state.itemName}</SText>
				</View>
				<TouchableOpacity 
					onPress={
						() => {
							Keyboard.dismiss();
							this.setRouteData({
								id: this.getRouteData('id'),
								name: this.getRouteData('name'),
								inquiryType: this.getRouteData('inquiryType')
							}).push({
								name: 'InquiryRecordList',
								component: InquiryRecordList,
								title: this.props.route.title
							})
						}
					}
					style={s.skuContainerRight}
				>
					<SText style={s.record}>询价记录</SText>
					<Image style={s.more} source={IconForward}/>
				</TouchableOpacity>
			</View>
		)
	}

	_renderDetail = () => {
		return(
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View style={s.detailContainer}>
				<View style={s.row}>
					<SText style={s.keyName}>供应商</SText>
					<TouchableOpacity style={s.rowRight} onPress={() => {this._renderSuppliers()}}>
						<SText style={s.selectText}>{this.state.selectedSupplierName}</SText>
			      <Image style={s.arrowDown} source={ICON_DOWN_L}/>					
			    </TouchableOpacity>
				</View>

				<View style={s.row}>
				  <View style={s.rowLeft}>
				    <SText style={s.keyName}>产地收货价</SText>
				    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						  <TextInput style={s.textInputS} placeholder='0' keyboardType='numeric' autoFocus={true} 
						    onFocus={()=> {
							    this.changeState({
								  showFirstCancel: true,
								  showKeyBoard: true
							  });
						  }}
              onBlur={()=> {
							  this.changeState({
								  showFirstCancel: false,
								  showKeyBoard: false
							  })
						  }}
						  onChangeText={(text) => {
							  this.changeState({
								  firstInput: text,
								  zeroFirstValue: false,
								  showKeyBoard: true
							  })
						  }}
						  value={this.state.zeroFirstValue ? null : this.state.firstInput}
						  />	
						</TouchableWithoutFeedback>
			    </View>
			    <View style={{flexDirection: 'row', alignItems: 'center'}}>
			    	{
			    	  this.state.showFirstCancel ? 
			    	  <TouchableOpacity style={s.rowRightCanvel} onPress={ () => {
                this.changeState({
              	  zeroFirstValue: true
                });
			    	  }}>
			          <Image style={s.delete} source={IconDelete}/>					
			        </TouchableOpacity> 
			        : null
			      }
			      <SText style={[s.record,{marginLeft: 10}]}>元/斤</SText>
			    </View>
				</View>

				<View>
					<SText style={s.remark}>备注</SText>
					<KeyboardAvoidingView behavior={this.state.behavior}>
					  <TextInput style={s.textInputM} multiline={true} onChangeText={(text) => {this.changeState({
						  remark: text
					  })}}/>
					</KeyboardAvoidingView>  
				</View>
			</View>
			</TouchableWithoutFeedback>
		)
	}

	//显示供应商列表
	_renderSuppliers = () => {
		Keyboard.dismiss();
    if(this.state.supplierList.length !== 0) {
      this.setRouteData({
          dataList: this.state.supplierList,
          multiply: false,
          selectedData: this.state.selectedCatId,
          onChange: (selectedValue) => {
            if(!selectedValue){
              return;
            }
            this.changeState({
              selectedCatId: selectedValue,
              selectedSupplierName: this.state.supplierList.filter((cat) => cat.value === selectedValue)[0].name,
              selectedSupplierId: this.state.supplierList.filter((cat) => cat.value === selectedValue)[0].value,
            },() => {
              this.supplierList._refresh();
            });
          },
      }).push({
          type: 'modal',
          name: 'Select',
          component: Select
      })
    }
  }
  render(){
    return (
      <Page 
        pageName='原料询价'
        title='询价' 
        pageLoading={this.state.pageLoading} 
        back={ ()=>{
          this.navigator().pop();
          this.props.route.callback();
        }}
        rightContent={this._renderRightBtn()}
        rightEvent={this._getSubmitData}
      >
      
        {this._renderSkuView()}
        {this._renderDetail()}

      </Page>
    )
  }
}
