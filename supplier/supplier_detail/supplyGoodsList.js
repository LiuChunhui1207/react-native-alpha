/**
 * 供应商品列表
 * * 此页面 要求传入参数
 * supplierId 供货商Id
 * @author: chengfy@songxiaocai.com
 * @description:
 * @Date: 17/3/30 14:53
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
import {Page, SXCRadio, Row, SInput, CommonSelect, Camera, GalleryList,Button,SXCModal} from 'components';
import {UtilsAction} from 'actions';
import { ICON_TRIANGEL_UP,ICON_TRIANGEL_DOWN} from 'config';
import ItemSelect from '../../commodity/create/item_select/item_select';
import {str} from 'tools';
var Dimensions = require('Dimensions');
var {width} = Dimensions.get('window');
var {height} = Dimensions.get('window');
let s = SStyle({
    content: {
     flex:1
    },
    item_title: {
        backgroundColor: 'fff',
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop:15,
        paddingBottom:15,
        flexDirection: 'row',
        alignItems:'center',
        marginTop:10,
    },
    item: {
        height: 45,
        backgroundColor: 'fff',
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
        flexDirection: 'row',
    },
    border_bottom: {
        borderBottomWidth: 'slimLine',
        borderColor: 'f0'
    },
    border_bottom_paddingLeft: {
        borderBottomWidth: 'slimLine',
        borderColor: 'f0',
        paddingLeft: 15
    },
    icon_img: {
        width: 14,
        height: 8,
        marginLeft: 5
    },
    text_right: {
        flex: 1,
        textAlign: 'right'
    },
    gridStyle:{
        flexDirection:'row', //改变ListView的主轴方向
        flexWrap:'wrap', //换行
        paddingLeft:15,
        paddingRight:5,
        backgroundColor:'fff'
    },
    gridItemViewStyle:{
        alignItems:'center',
        height:30,
        flexDirection:'row',
        marginRight:10,

    },
    itemButton:{
        borderColor:'#2296f3',
        borderWidth:1,
        borderRadius:5,
        width:60,
        height:40,
        backgroundColor:'fff',
        justifyContent:'center',
        alignItems:'center'

    },
    modal_content: {
        backgroundColor: '#fff',
    },
    btn_dialog:{
        flex:1,
        height:40,
        backgroundColor:'#f0f0f0',
        justifyContent:'center',
        alignItems:'center'
    },
});
/**
 * 供货商商品列表
 * @type {SupplyGoodsList}
 */
module.exports=class SupplyGoodsList extends SComponent{
    constructor(props) {
        super(props);
        this.state={
            refreshing:true,
            //供应商供应spu列表
            supplierSpus:[],
            // supplierId:this.props.route.data.supplierId
        }
        this._ds = new ListView.DataSource({
            sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        this._renderRow=this._renderRow.bind(this);
        this._itemClick=this._itemClick.bind(this);
        this._btnDeleteClick=this._btnDeleteClick.bind(this);
        this._btnDetailsClick=this._btnDetailsClick.bind(this);
        this._itemSpreadClick=this._itemSpreadClick.bind(this);
        this._btnAffirm=this._btnAffirm.bind(this);
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this._getData();
        })
    }
    _getData = () =>{
        this.changeState({
            pullDownRefreshing:true,
        });
        commonRequest({
            apiKey: 'querySupplierSpuListKey',
            withLoading: true,
            objectName: 'supplyUserQueryDO',
            params: {
                supplierId: this.props.route.data.supplierId,
                catId: this.props.route.data.catId
            }
        }).then( (res) => {
            let pageData = res.data;
            this.changeState({
                refreshing:false,
                pullDownRefreshing:false,
                supplierSpus:pageData.supplierSpus,
            });
        }).catch( err => {})
    }
    render(){
        return(
            <Page
                pageName='供货商商品列表'
                title={this.props.route.data.supplierName+'-'+this.props.route.data.catName}
                back={()=>this.navigator().pop()}
                pageLoading={this.state.refreshing}>
                <ListView
                    style={{flex:1}}
                    refreshControl={
                        <RefreshControl
                            style={{backgroundColor:'transparent'}}
                            refreshing={this.state.pullDownRefreshing}
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
                    dataSource={this._ds.cloneWithRows(this.state.supplierSpus)}
                    renderRow={this._renderRow}
                />
                <Button 
                    type='green' 
                    size='large' 
                    onPress={()=>{
                        this.navigator().push({
                            component: ItemSelect,
                            from: 'SupplyInfo',
                            callback: this._getData,
                            name: 'ItemSelect',
                            data: {
                              supplierId: this.props.route.data.supplierId,
                              catId: this.props.route.data.catId,
                              catName: this.props.route.data.catName
                            }
                        })
                    }} 
                >
                    添加新品
                </Button>
                <SXCModal
                    style={{justifyContent: 'center', alignItems: 'center'}}
                    animated="slide"
                    ref={view => this._sxcmodal = view}>
                    <ModalContent
                        btnAffirm={this._btnAffirm}
                        fatherState={this.state}
                        currentRow={this.state.currentRow}
                        sxcmodal={this._sxcmodal}
                    />
                </SXCModal>
            </Page>
        )
    }

    /**
     * 商品信息itemVew
     * @param rowData
     * @param sectionID
     * @param rowID
     * @returns {XML}
     * @private
     */
    _renderRow(rowData,sectionID,rowID) {
        return(
            // <TouchableOpacity style={[s.head,s.item, s.border_bottom]} onPress={()=>this._catItemClick(rowData)}>
            //     <SText fontSize="body" color="666" style={{flex:1}}>{rowData.catName}</SText>
            //     <SText fontSize="body" color="666" style={{flex:1,textAlign:'center'}}>{rowData.amountOfSpu}</SText>
            //     <SText fontSize="body" color="666" style={{flex:1,textAlign:'right'}}>{rowData.dailySupply}</SText>
            // </TouchableOpacity>
            <View>
                <View style={[s.item_title, s.border_bottom]}>
                    <SText  fontSize="body" color="333" style={{flex:1,marginRight:15}}>{rowData.spuName}</SText>
                    <TouchableOpacity  style={{width:60,flexDirection:'row',alignItems:'center',justifyContent:'flex-end'}} onPress={()=>this._itemSpreadClick(rowData)} >
                        <SText fontSize="caption" color="999">属性</SText>
                        <Image source={rowData.spread?ICON_TRIANGEL_UP:ICON_TRIANGEL_DOWN} style={s.icon_img}/>
                    </TouchableOpacity>
                </View>
                {
                    rowData.spread ?
                        <ListView
                            dataSource={this._ds.cloneWithRows(rowData.attributeList)}
                            renderRow={this._attributeRenderRow}
                            contentContainerStyle={s.gridStyle}
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            style={s.border_bottom}
                        />
                        :
                        null
                }
                <View style={[s.item, s.border_bottom]}>
                    <SText fontSize="caption" color="999">每日供货量</SText>
                    <SText fontSize="caption" color="333" style={s.text_right} >{rowData.dailySupplyDes}</SText>
                </View>
                <View style={[s.item, s.border_bottom]}>
                    <SText fontSize="caption" color="999">当前供货价</SText>
                    <SText fontSize="caption" color="333" style={s.text_right} >{rowData.currentPriceDes}</SText>
                </View>
                <View style={{flexDirection:'row',justifyContent:'flex-end',height:60,backgroundColor:'#fafafa',alignItems:'center',paddingRight:15}}>
                    <TouchableOpacity onPress={()=>this._btnDeleteClick(rowData,sectionID,rowID)}  style={s.itemButton}>
                        <SText fontSize="body" color="666" style={{color:"#2296f3"}}>删除</SText>
                    </TouchableOpacity>
                    {
                        // <TouchableOpacity onPress={()=>this._btnDetailsClick(rowData)}  style={[s.itemButton,{marginLeft:15}]}>
                        //     <SText fontSize="body" color="666" style={{color:"#2296f3"}} >详情</SText>
                        // </TouchableOpacity>
                    }
                </View>
            </View>

        )
    }

    /**
     * spu属性itemView
     * @param rowData
     * @param sectionID
     * @param rowID
     * @returns {XML}
     * @private
     */
    _attributeRenderRow(rowData,sectionID,rowID) {
        return(
            <View style={s.gridItemViewStyle}>
                <SText fontSize="caption" color="999">{rowData.name}</SText>
                <SText fontSize="caption" color="orange" style={{marginLeft:3}}>{rowData.value}</SText>
            </View>
        )

    }

    /**
     * 商品属性 展开隐藏事件
     * @param rowData
     * @private
     */
    _itemSpreadClick(rowData) {
        if (rowData.spread) {
            rowData.spread=false;
        }else {
            rowData.spread=true;
        }
        this.changeState(
        )
    }

    /**
     * 删除商品按钮
     * @param rowData 商品信息
     * @private
     */
    _btnDeleteClick(rowData,sectionID,rowID) {
        this.changeState({
            currentRow: {
                rowData,
                rowID,
                sectionID
            }
        }, ()=> {
            this._sxcmodal._toggle();
        })
    }

    /**
     * 查看商品详情信息按钮
     * @param rowData
     * @private
     */
    _btnDetailsClick(rowData) {
        __STORE.dispatch(UtilsAction.toast('功能开发中', 1500));
        // console.log("dododo in _btnDetailsClick");
        // console.log(rowData);
        // this.navigator().push({

        // })
    }
    /**
     * 品类item点击
     * @param itemData 类目信息数据
     * catId  catName
     * @private
     */
    _itemClick(itemData){

    }

    _btnAffirm(rowData) {
        console.log('rowData',rowData);
        commonRequest({
            apiKey: 'deleteSupplierSpuKey',
            withLoading: true,
            objectName: 'supplySpuQueryDO',
            params: {
                supplierId: this.props.route.data.supplierId,
                spuId: rowData.spuId,
            }
        }).then( (res) => {
            let pageData = res.data;
            this.changeState({
            });
            this._getData();
        }).catch( err => {})
    }

}

/**
 * modal层内容组件
 */
class ModalContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }
    _affirm(rowData) {
        this.props.btnAffirm(rowData);
        this.props.sxcmodal._toggle();
    }
    render() {
        return (
            <View style={[s.modal_content]}>
                <View style={{backgroundColor:'#2296f3',height:45,justifyContent:'center',alignItems:'center'}}>
                    <SText fontSize="headline" color="fff" style={{textAlign: 'center'}}>提醒</SText>
                </View>
                <SText style={{ textAlign: 'center', marginTop: 20, marginLeft: 30, marginRight: 30,marginBottom:20}} fontSize="title" color="333">确认删除商品？</SText>
                <Row>
                    <TouchableOpacity onPress={()=>this.props.sxcmodal._toggle()}  style={[s.btn_dialog]}>
                        <SText fontSize="body" color="666" style={{color:"#2296f3"}} >取消</SText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this._affirm(this.props.currentRow.rowData)} underlayColor='#0a568e' style={[s.btn_dialog,{backgroundColor:'#2296f3'}]}>
                        <SText fontSize="body" color="666" style={{color:"#ffffff"}} >确认</SText>
                    </TouchableOpacity>
                </Row>
            </View>
        );
    }
}