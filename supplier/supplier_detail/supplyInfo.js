/**供货商信息-供应信息
 * @author: chengfy@songxiaocai.com
 * @description:
 * @Date: 17/3/30 10:13
 */
import React from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    Text,
    TextInput,
    LayoutAnimation,
    InteractionManager,
    ListView,
    RefreshControl

} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, SXCRadio, Row, SInput, CommonSelect, Camera, GalleryList,    Button} from 'components';
import {UtilsAction} from 'actions';
import {str} from 'tools';
import { ICON_ADD} from 'config';
import  SupplyGoodsList from './supplyGoodsList';
import  CreateSupplier from '../createSupplier';
//选择品类页面
import SelectCategory from '../../commodity/create/select_category';
let s = SStyle({
    head: {
        height: 40,
        backgroundColor: 'f0',
        paddingLeft: 15,
        flexDirection: 'row',
        alignItems:'center',
    },
    item_head: {
        height: 30,
        backgroundColor: 'e5',
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: 'row',
        alignItems:'center',
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
        textAlign: 'right'
    },
    flex_right: {
        flex: 1,
        height: 45,
        flexDirection: 'row',
        alignItems:'center',
    },
    icon_add: {
        width: 20,
        height: 20,
        marginRight: 10
    }
});
/**
 * 供货商信息 供应信息
 * @type {SupplyInfo}
 */
module.exports=class SupplyInfo extends SComponent{
    constructor(props) {
        super(props);
        this.state={
            //类目信息列表
            supplyCats:[]
        }
        this._ds = new ListView.DataSource({
            sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this._renderRow=this._renderRow.bind(this);
        this._catItemClick=this._catItemClick.bind(this);
    }
    componentDidMount() {
        this._getData();
    }
    _getData = () => {
        this.changeState({
            refreshing: true
        }, ()=> {
            commonRequest({
                apiKey: 'querySupplierSupplyInfoKey',
                withLoading: true,
                objectName: 'supplySpuQueryDO',
                params: {
                    supplierId: this.props.route.data.supplierId
                }
            }).then( (res) => {
                let pageData = res.data;
                this.changeState({
                    refreshing: false,
                    supplyCats:pageData.supplyCats,
                });
            }).catch( err => {})
        })
    }
    render(){
        return(
            <View style={s.flex1}>
                <TouchableOpacity onPress={()=>this._addSupplyGoods()} style={s.head}>
                    <Image source={ICON_ADD} style={s.icon_add}/>
                    <SText fontSize="caption" color="999">添加供应信息</SText>
                </TouchableOpacity>
                <View style={s.item_head}>
                    <SText fontSize="caption" color="999" style={{flex:1}}>品类</SText>
                    <SText fontSize="caption" color="999" style={{flex:1,textAlign:'center'}}>供货商品</SText>
                    <SText fontSize="caption" color="999" style={{flex:1,textAlign:'right'}}>每日供应量</SText>
                </View>
                <ListView
                    style={{flex:1}}
                    refreshControl={
                        <RefreshControl
                            style={{backgroundColor:'transparent'}}
                            refreshing={this.state.refreshing}
                            onRefresh={this._getData.bind(this)}
                            tintColor="#54bb40"
                            title="加载中..."
                            titleColor="#999"
                            colors={['#2296f3']}
                            progressBackgroundColor="#fff"
                        />
                    }
                    initialListSize={10}
                    enableEmptySections={true}
                    dataSource={this._ds.cloneWithRows(this.state.supplyCats)}
                    renderRow={this._renderRow}
                />
            </View>
        )
    }


    _renderRow(rowData,sectionID,rowID) {
        return(
            <TouchableOpacity style={[s.head,s.item, s.border_bottom]} onPress={()=>this._catItemClick(rowData)}>
                <SText fontSize="body" color="666" style={{flex:1}}>{rowData.catName}</SText>
                <SText fontSize="body" color="666" style={{flex:1,textAlign:'center'}}>{rowData.amountOfSpu}</SText>
                <SText fontSize="body" color="666" style={{flex:1,textAlign:'right'}}>{rowData.dailySupply}</SText>
            </TouchableOpacity>
        )
    }

    /**
     * 品类item点击
     * @param itemData 类目信息数据
     * catId  catName
     * @private
     */
    _catItemClick(itemData){
        this.navigator().push({
            component: SupplyGoodsList,
            name: 'SupplyGoodsList',
            data: {
                supplierId:this.props.route.data.supplierId,
                catId:itemData.catId,
                catName:itemData.catName,
                supplierName:this.props.route.data.supplierName
            },
        })

    }

    /**
     * 添加商品信息
     * @private
     */
    _addSupplyGoods(){
        this.navigator().push({
            component: SelectCategory,
            from: 'SupplyInfo',
            name: 'SelectCategory',
            data: {
                supplierId: this.props.route.data.supplierId,
            },
            callback: this._getData
        })
    }
}