/**
 *
 * 项目名称：caimi-rn
 * 文件描述：创建巡场日志
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/5/24 10:27
 * 修改人：cfy
 * 修改时间：17/5/24 10:27
 * 修改备注：
 * @version
 */
import React from 'react';
import {
    View,
    InteractionManager,
    TouchableOpacity,
    Image,
    ListView,
    StyleSheet,
    ScrollView,
    TextInput,
    Text,
    TouchableHighlight
} from 'react-native';
import {SComponent, SStyle, SText,SItem} from 'sxc-rn';
import {Row,Page, Button,SXCRadio,Camera,CommonSelect,SXCModal,SInput} from 'components';
import {str} from 'tools';
import {
    ICON_RIGHT,
    ICON_LEFT,
    ICON_CAL,
    IconLocationBlue,
    IC_LAUNCHER,
    ICON_DOWN_L,
    IconForward
} from 'config';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import KeyboardSpacer from 'react-native-keyboard-spacer';
//供货商列表
import  SupplierList from '../supplier/supplierList';
import  EditSupplierGoods from './editSupplierGoods';
import {UtilsAction} from 'actions';
var Dimensions = require('Dimensions');
var {width} = Dimensions.get('window');
import DeepCopy from 'lodash'
let s = SStyle({
    tab:{
        height:45,
        backgroundColor:'#fff',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        flex:1
    },
    iconLocation:{
        width:11,
        height:15
    },
    itemTitle:{
        height:40,
        width:width,
        backgroundColor:'#FFFBF0',
        alignItems:'center',
        paddingLeft:15,
        marginTop:10
    },
    item:{
        height:45,
        width:width,
        backgroundColor:'#fff',
        alignItems:'center',
        paddingLeft:15,
        paddingRight:15
    },
    input:{
        padding:15,
        backgroundColor:'#fff',
        fontSize:15,
        color:'#333',

        minHeight:60,
        flex:1
    },
    input2:{
        backgroundColor:'#fff',
        fontSize:15,
        color:'#333',
        height:44,
        textAlign:'right',
        minWidth:80,
        paddingRight:15
    },
    borderBottom:{
        borderBottomWidth:1,
        borderColor:'#F4F4F4'
    },
    rowItem:{
        flexDirection:'row',
        height:45,
        alignItems:'center',
        backgroundColor:'#fff'
    },
    iconDown:{
        width:12,
        height:7,
        marginLeft:10
    },
    radio_group: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    box:{
        height:24,
        paddingLeft:10,
        paddingRight:10,
        borderWidth:1,
        borderRadius:3,
        justifyContent:'center',
        alignItems:'center',
        minWidth:44,
        backgroundColor:'#fff',
        marginLeft:10
    },
    boxNor:{
        borderColor:'#999',
    },
    boxChk:{
        borderColor:'#2999F4',
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomColor: '#EBEBEB',
        borderBottomWidth: 1,
        height: 45,
        flexDirection:'row',
        paddingLeft:15,
        paddingRight:15
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0
    },

    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 65
    },
    backRightBtnLeft: {
        backgroundColor: 'blue',
        right: 65
    },
    backTextWhite: {
        color: '#FFF'
    },
    btnDel: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 65,
        backgroundColor:'#F43400',

    },
    borderBottomWhite:{
        borderBottomWidth:1,
        borderColor:'#fff'
    },
    btn_dialog:{
        flex:1,
        height:40,
        justifyContent:'center',
        alignItems:'center'
    },
});
module.exports = class CreatePatorlLog extends SComponent{
    constructor(props){
        super(props)
        //巡场日记市场详情创建DO
        this._marketDetailCreateDO={};
        //巡场日记供应商详情创建DO列表
        // this._supplierDetailCreateList=[];
        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state={
            pageLoading:true,
            //当前tab id 0表示市场行情 1表示供货商行情
            curTabId:0,

        }
    }
    _initData(data){
        //当前总体质量
        this._marketDetailCreateDO.goodsQuality=data.selectGoodsQuality?data.selectGoodsQuality.key:null;
        //今日销货速度
        this._marketDetailCreateDO.goodsSaleSpeed=data.selectSaleSpeed?data.selectSaleSpeed.key:null;
        //预估库存
        this._marketDetailCreateDO.estimateStockTendency=data.selectPriceTendency?data.selectPriceTendency.key:null;
        //到货量货品质量备注
        this._marketDetailCreateDO.saleSpeedRemark=data.saleSpeedRemark;
        //明日预计走势
        this._marketDetailCreateDO.estimatePriceTendency=data.selectPriceTendency?data.selectPriceTendency.key:null;
        //价格波动原因备注
        this._marketDetailCreateDO.fluctuateRemark=data.fluctuateRemark;
        //货品质量备注原因
        this._marketDetailCreateDO.goodsQualityRemark=data.goodsQualityRemark;

        if(!str.isEmpty(data.suppliers)){
            data.suppliers.map((item,index)=>{
                let imgs=[];
                if(!str.isEmpty(item.goodsImages)){
                    item.goodsImages.map((item1,index1)=>{
                        imgs.push(item1.img)
                    })
                }
                item.imgs=imgs;
            })
        }


    }
    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this._getWebData();
        })
    }
    _getWebData(){

        commonRequest({
            apiKey: 'editPatrolDiaryInitKey',
            objectName: 'patrolDiaryInitQueryDO',
            params: {
                catId: this.props.route.data.catId,
                patrolDiaryId: this.props.route.data.patrolDiaryId,
            }
        }).then( (res) => {
            let {data} = res;
            this._initData(data);
            this.changeState({
                pageLoading:false,
                ...data
            });
        }).catch( err => {
            this.changeState({
                pageLoading:false,
            });
        })
    }
    // /**
    //  * @Description: 导航tab
    //  * @param
    //  * @return
    //  * @throws
    //  * @author       chengfy@songxiaocai.com
    //  * @date         17/5/23 11:45
    //  */
    // _renderTabs=()=>{
    //     return(
    //         <Row style={s.borderBottom}>
    //             <TouchableOpacity
    //                 style={s.tab}
    //                 onPress={()=>{
    //                     this.curTabId=0;
    //                     this.getRef('scrollView')('scrollTo')({x: 0, y: 0, animated: true});

    //                 }}>
    //                 {this.state.curTabId==0?<Image source={IconLocationBlue} style={s.iconLocation}/>:null}
    //                 <SText fontSize='body' color={this.state.curTabId==0?'#4A90E2':'#5F646E'} style={{marginLeft:3}}>市场行情</SText>
    //             </TouchableOpacity>
    //             <TouchableOpacity
    //                 style={s.tab}
    //                 onPress={()=>{
    //                     this.state.curTabId=1;
    //                     this.getRef('scrollView')('scrollTo')({x: 0, y: this.state.moduleBazaarHeight, animated: true});

    //                 }}>
    //                 {this.state.curTabId==1?<Image source={IconLocationBlue} style={s.iconLocation}/>:null}
    //                 <SText fontSize='body' color={this.state.curTabId==1?'#4A90E2':'#5F646E'} style={{marginLeft:3}}>供货商行情</SText>
    //             </TouchableOpacity>
    //         </Row>
    //     )
    // }
    /**
     * @Description:  头部右边按钮
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/19 11:52
     */
    _renderRightBtn=()=>{
        return(
            <SText fontSize='caption' color='fff'>发布</SText>
        )
    }
    /**
     * @Description: 右边按钮点击事件
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/19 11:54
     */
    _rightEvent=()=>{

        if (str.isEmpty(this.state.saleSuggestions)){
            return this._showMsg('请输入售卖建议！');
        }else {
            this._marketDetailCreateDO.saleSuggestions=this.state.saleSuggestions;
        }
        if (str.isEmpty(this.state.carUnitNum)){
            return this._showMsg('请输入每车装货量！');
        }else {
            this._marketDetailCreateDO.carUnitNum=this.state.carUnitNum;
        }
        if (str.isEmpty(this.state.selectMarketCarNumUnit)){
            return this._showMsg('请选择每车装货量单位！');
        }else {
            this._marketDetailCreateDO.carNumUnit=this.state.selectMarketCarNumUnit.key;
        }
        if (str.isEmpty(this.state.newGoodsNum)){
            return this._showMsg('请输入新到货数量！');
        }else {
            this._marketDetailCreateDO.newGoodsNum=this.state.newGoodsNum;
        }

        if (str.isEmpty(this.state.wholeStockNum)){
            return this._showMsg('请输入整体库存数量！');
        }else {
            this._marketDetailCreateDO.wholeStockNum=this.state.wholeStockNum;
        }
        //到货行情图片
        if (!str.isEmpty(this._camera1._submit())){
            this._marketDetailCreateDO.newGoodsImages=this._camera1._submit();
        }
        //明日预计走势
        if (str.isEmpty(this._marketDetailCreateDO.estimatePriceTendency)){
            return this._showMsg('请选择明日预计走势！');
        }
        //明日每斤波动
        if (str.isEmpty(this.state.priceFluctuate)&&this._marketDetailCreateDO.estimatePriceTendency!=2){
            return this._showMsg('请输入每斤波动！');
        }else {
            this._marketDetailCreateDO.priceFluctuate=this.state.priceFluctuate;
        }
        //当前总体质量
        if (str.isEmpty(this._marketDetailCreateDO.goodsQuality)){
            return this._showMsg('请选择当前总体质量！');
        }
        //当前总体质量不稳定(残次定义)
        if(this._marketDetailCreateDO.goodsQuality==2){
            let imperfectExpressions=[];
            this.state.itemPropertyTypeVOs.map((item,index)=>{
                let imperfectExpression={};
                imperfectExpression.propertyName=item.propertyTypeDes;
                let propertyValueList=[];
                if(!str.isEmpty(item.itemProperties)){
                    item.itemProperties.map((childItem,childIndex)=>{
                        if (childItem.checked){
                            propertyValueList.push(childItem.propertyName)
                        }
                    })
                }
                imperfectExpression.propertyValueList=propertyValueList;
                imperfectExpressions.push(imperfectExpression)
            })
            this._marketDetailCreateDO.imperfectExpressions=imperfectExpressions;
        }
        //货品质量图片
        if (str.isEmpty(this._camera2._submit())){
            return this._showMsg('请至少上传一张到货量行情图片！');
        }else {
            this._marketDetailCreateDO.goodsQualityImages=this._camera2._submit();
        }
        let supplierInfoComplete=true;
        //供货商信息
        let supplierDetailCreateDOs=[];
        // if (str.isEmpty(this.state.suppliers)){
        //     supplierInfoComplete=false;
        //     return this._showMsg('请至少添加一个供货商！');
        // }
        this.state.suppliers.map((item,index)=>{
            let  supplierDetail={};
            // //每车装货量单位
            // supplierDetail.carNumUnit=item.selectSupplierCarNumUnit?item.selectSupplierCarNumUnit.key:null;
            // //每车装货量
            // supplierDetail.carUnitNum=item.carUnitNum;
            //日均销售量
            supplierDetail.avgSaleNum=item.avgSaleNum;
            //新到货数量
            supplierDetail.newGoodsNum=item.newGoodsNum;
            //到货周期
            supplierDetail.purchaseCycle=item.purchaseCycle;
            //备注原因
            supplierDetail.remark=item.remark;
            //供应商id
            supplierDetail.supplierId=item.supplierId;
            //供应商名称
            supplierDetail.supplierName=item.supplierName;
            //供应商商品图片
            supplierDetail.supplierGoodsImages=item.imgs;
            //供应商巡场spu列表
            if(str.isEmpty(item.supplierSpuDetailCreateDOs)){
                supplierInfoComplete=false;
                return this._showMsg('请为'+item.supplierName+'至少添加一件商品');
            }
            let supplierSpuList=[];
            item.supplierSpuDetailCreateDOs.map((item1,index1)=>{
                let spu={};
                //大户拿货价
                spu.coreUserPrice=item1.coreUserPrice;
                //大户拿货价单位
                spu.coreUserPriceUnit=item1.selectCoreUserPriceUnit?item1.selectCoreUserPriceUnit.key:null;
                //小户拿货价
                spu.normalUserPrice=item1.normalUserPrice;
                //小户拿货价单位
                spu.normalUserPriceUnit=item1.selectNormalUserPriceUnit?item1.selectNormalUserPriceUnit.key:null;
                //	新到货量
                spu.newGoodsNum=item1.newGoodsNum;
                //新到货量单位
                spu.newGoodsNumUnit=item1.selectSpuNewGoodsNumUnit?item1.selectSpuNewGoodsNumUnit.key:null;
                //	库存量
                spu.oldGoodsNum=item1.oldGoodsNum;
                //新到货量单位
                spu.oldGoodsNumUnit=item1.selectOldGoodsNumUnit?item1.selectOldGoodsNumUnit.key:null;
                //spuId
                spu.spuId=item1.spuId;
                //spuName
                spu.spuName=item1.spuName;
                supplierSpuList.push(spu)
            })
            supplierDetail.supplierSpuDetailCreateDOs=supplierSpuList;
            supplierDetailCreateDOs.push(supplierDetail);
        })
        if (!supplierInfoComplete){
            return
        }
        console.log(this._marketDetailCreateDO);
        console.log(supplierDetailCreateDOs);
        if(str.isEmpty(this.props.route.data.patrolDiaryId)){
            commonRequest({
                apiKey: 'createPatrolDiaryKey',
                objectName: 'patrolDiaryCreateDO',
                withLoading:true,
                params: {
                    catId: this.props.route.data.catId,
                    marketDetailCreateDO:this._marketDetailCreateDO,
                    //supplierDetailCreateDOs:supplierDetailCreateDOs,
                }

            }).then( (res) => {
                this._showMsg('发布成功');
                this.props.route.refresh && this.props.route.refresh();
                this.navigator().pop();
            }).catch( err => {
            })
        }else {
            commonRequest({
                apiKey: 'editPatrolDiaryKey',
                objectName: 'patrolDiaryEditDO',
                withLoading:true,
                params: {
                    patrolDiaryId:this.props.route.data.patrolDiaryId,
                    catId: this.props.route.data.catId,
                    marketDetailCreateDO:this._marketDetailCreateDO,
                    //supplierDetailCreateDOs:supplierDetailCreateDOs,
                }

            }).then( (res) => {
                this._showMsg('发布成功');
                this.props.route.refresh && this.props.route.refresh();
                this.navigator().pop();
            }).catch( err => {
            })
        }


    }
    render(){
        return(
            <Page
                pageName='创建更新巡场日志'
                back={()=>this.navigator().pop()}
                pageLoading={this.state.pageLoading}
                rightEvent={()=>this._rightEvent()}
                rightContent={this._renderRightBtn()}
                title={this.state.pageTitle?this.state.pageTitle:'巡场日志'}
            >
                {/* {this._renderTabs()} */}
                <ScrollView
                    ref="scrollView"
                    onScroll={this._onScroll}
                >
                    {this._renderBazaar()}
                    {/* {this._renderSupplier()} */}
                </ScrollView>
                <CommonSelect
                    keyName={'value'}
                    ref={ view => this._commonSelect = view}
                    selectCallback={this._commonSelectCallback}
                    dataSource={this.state.currentDataSource?this.state.currentDataSource:[]}
                    selected={this.state.currentSelected}
                    multiple={false}
                />
                <SXCModal
                    style={{justifyContent: 'center', alignItems: 'center'}}
                    animated="slide"
                    ref={view => this._sxcmodal = view}>
                    <ModalContent
                        btnAffirm={this._deleteSupplier}
                        fatherState={this.state}
                        sxcmodal={this._sxcmodal}
                        currentRow={this.state.currentRow}
                    />
                </SXCModal>
                <KeyboardSpacer />
            </Page>
        )
    }
    /**
     * @Description: 市场行情
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/24 10:55
     */
    _renderBazaar(){
        return(
            <View
                ref="bazaar"
                onLayout={(event)=>{
                    this.state.moduleBazaarHeight=event.nativeEvent.layout.height
                }}
            >
                {this._renderBazaarModule1()}
                {this._renderBazaarModule2()}
                {this._renderBazaarModule3()}
                {this._renderBazaarModule4()}
            </View>
        )
    }
    //市场行情-售卖建议
    _renderBazaarModule1(){
        return(
            <View>
                <Row style={s.itemTitle}>
                    <SText fontSize='mini_p' color='666'>售卖建议</SText>
                    <SText fontSize='mini_p' color='#FE0000'>*</SText>
                </Row>
                <SInput
                    multiline={true}
                    onChangeText={this._onChangeText.bind(this, 'saleSuggestions')}
                    style={[s.input,{minHeight:80}]}
                    value={this.state.saleSuggestions?this.state.saleSuggestions:''}
                    placeholder='重点说明市场不同产品，新老货品质量、价格的差异，突出说明公司所卖货品的优势' />
            </View>
        )
    }
    //市场行情-到货量行情
    _renderBazaarModule2(){
        return(
            <View>
                <Row style={s.itemTitle}>
                    <SText fontSize='mini_p' color='666'>到货量行情</SText>
                </Row>
                <Row style={[s.item,s.borderBottom]}>
                    <SText fontSize='caption_p' color='333'>每车装货量</SText>
                    <SText fontSize='caption_p' color='#FE0000'>*</SText>
                    <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                        <SInput
                            onChangeText={this._onChangeText.bind(this, 'carUnitNum')}
                            style={s.input2}
                            keyboardType="numeric"
                            value={this.state.carUnitNum?this.state.carUnitNum+'':''}
                            placeholder="请输入" />
                        <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                        <TouchableOpacity
                            onPress={()=>this._showCommonSelect(this.state.marketCarNumUnitEnum?this.state.marketCarNumUnitEnum:[],this.state.selectMarketCarNumUnit)}
                            style={[s.rowItem,{paddingLeft:15}]}>
                            <SText fontSize='mini_p' color='333'>{this.state.selectMarketCarNumUnit?this.state.selectMarketCarNumUnit.value:''}</SText>
                            <Image source={ICON_DOWN_L} style={[s.iconDown]}/>
                        </TouchableOpacity>
                    </Row>
                </Row>

                <Row style={[s.item,s.borderBottom]}>
                    <SText fontSize='caption_p' color='333'>新到货</SText>
                    <SText fontSize='caption_p' color='#FE0000'>*</SText>
                    <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                        <SInput
                            onChangeText={this._onChangeText.bind(this, 'newGoodsNum')}
                            style={s.input2}
                            keyboardType="numeric"
                            value={this.state.newGoodsNum?this.state.newGoodsNum+'':''}
                            placeholder="请输入" />
                        <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                        <SText fontSize='mini_p' color='999' style={{paddingLeft:15,marginRight:22}}>车</SText>
                    </Row>
                </Row>

                <Row style={[s.item,s.borderBottom]}>
                    <SText fontSize='caption_p' color='333'>整体库存</SText>
                    <SText fontSize='caption_p' color='#FE0000'>*</SText>
                    <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                        <SInput
                            onChangeText={this._onChangeText.bind(this, 'wholeStockNum')}
                            style={s.input2}
                            keyboardType="numeric"
                            value={this.state.wholeStockNum?this.state.wholeStockNum+'':''}
                            placeholder="请输入" />
                        <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                        <SText fontSize='mini_p' color='999' style={{paddingLeft:15,marginRight:22}}>车</SText>
                    </Row>
                </Row>
                <Row style={[s.item, s.borderBottom]}>
                    <SText fontSize="caption_p" color="333">今日销货速度</SText>
                    {this._renderRadioGroup('goodsSaleSpeed',this.state.saleSpeedEnum,'flex-end')}
                </Row>
                <Row style={[s.item, s.borderBottom]}>
                    <SText fontSize="caption_p" color="333">预估库存</SText>
                    {this._renderRadioGroup('estimateStockTendency',this.state.stockTendencyEnum,'flex-end')}
                </Row>
                {this._renderCamera1()}
                <SInput
                    multiline={true}
                    onChangeText={this._onChangeText.bind(this, 'saleSpeedRemark')}
                    style={s.input}
                    value={this.state.saleSpeedRemark?this.state.saleSpeedRemark:''}
                    placeholder="说明下走货速度变化程度，以及了解到的原因" />
            </View>
        )
    }
    //市场行情-价格行情
    _renderBazaarModule3(){
        return(
            <View>
                <Row style={s.itemTitle}>
                    <SText fontSize='mini_p' color='666'>价格行情</SText>

                </Row>
                <Row style={[s.item, s.borderBottom]}>
                    <SText fontSize="caption_p" color="333">明日预计走势</SText>
                    <SText fontSize='caption_p' color='#FE0000'>*</SText>
                    {this._renderRadioGroup('estimatePriceTendency',this.state.priceTendencyEnum,'flex-end')}
                </Row>
                {this._marketDetailCreateDO.estimatePriceTendency==2? null :
                    <Row style={[s.item,s.borderBottom]}>
                        <SText fontSize='caption_p' color='333'>明日每斤波动</SText>
                        <SText fontSize='caption_p' color='#FE0000'>*</SText>
                        <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                            <SInput
                                onChangeText={this._onChangeText.bind(this, 'priceFluctuate')}
                                value={this.state.priceFluctuate?this.state.priceFluctuate+'':''}
                                style={s.input2}
                                keyboardType="numeric"
                                placeholder="请输入" />
                            <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                            <SText fontSize='mini_p' color='999' style={{paddingLeft:15}}>元/斤</SText>
                        </Row>
                    </Row>
                }

                <SInput
                    multiline={true}
                    onChangeText={this._onChangeText.bind(this, 'fluctuateRemark')}
                    style={s.input}
                    value={this.state.fluctuateRemark?this.state.fluctuateRemark+'':''}
                    placeholder="详细说明具体上升下跌了解到的原因，以及后期预判" />
            </View>
        )
    }
    //市场行情-质量行情
    _renderBazaarModule4(){
        return(
            <View>
                <Row style={s.itemTitle}>
                    <SText fontSize='mini_p' color='666'>质量行情</SText>
                </Row>
                <Row style={[s.item, s.borderBottom]}>
                    <SText fontSize="caption_p" color="333">当前总体质量</SText>
                    <SText fontSize='caption_p' color='#FE0000'>*</SText>
                    {this._renderRadioGroup('goodsQuality',this.state.goodsQualityEnum,'flex-end')}
                </Row>
                {this._marketDetailCreateDO.goodsQuality==2? this._renderQuality():null}
                {this._renderCamera2()}
                <SInput
                    multiline={true}
                    onChangeText={this._onChangeText.bind(this, 'goodsQualityRemark')}
                    style={s.input}
                    value={this.state.goodsQualityRemark?this.state.goodsQualityRemark:''}
                    placeholder="详细说明质量变化特点以及了解到的原因" />
            </View>
        )
    }
    /**
     * @Description: 残次定义
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/27 14:21
     */
    _renderQuality(){
        if(str.isEmpty(this.state.itemPropertyTypeVOs)){
            return null;
        }
        return(
            this.state.itemPropertyTypeVOs.map((item,index)=>{
                return(
                    <View style={{backgroundColor:'#FAFAFA',paddingLeft:15,paddingRight:15}}>
                        <Row style={[s.borderBottom,{paddingTop:10}]} >
                            <SText fontSize="caption_p" color="333" style={{marginTop:5}}>{item.propertyTypeDes}</SText>
                            <Row style={{flex:1,flexWrap:'wrap'}}>
                                {
                                    item.itemProperties.map((childItem,childIndex)=>{
                                        return(
                                            <TouchableOpacity
                                                style={[s.box,childItem.checked?s.boxChk:s.boxNor,{marginBottom:10}]}
                                                onPress={()=>{

                                                    childItem.checked=!childItem.checked;
                                                    this.changeState({});
                                                }}>
                                                <SText fontSize="mini_p" color={childItem.checked?'#2999F4':'#999'}>{childItem.propertyName}</SText>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </Row>
                        </Row>
                    </View>

                )
            })
        )
    }
    /**
     * @Description: radioGroup
     * @param type 记录选择的当前id 提交入参
     * @param list 数据源
     * @param justifyContent 布局排版
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/24 15:06
     */
    _renderRadioGroup(type,list,justifyContent){
        if(!str.isEmpty(list)){
            return(
                <Row style={{justifyContent:justifyContent,flex:1}}>
                    {
                        list.map((item,index)=>{
                            return(
                                <TouchableOpacity
                                    style={[s.box,item.checked?s.boxChk:s.boxNor]}
                                    onPress={()=>{
                                        this._onRadioChange(type,item.key)
                                        list.map(item=>{
                                            item.checked=false;
                                        })
                                        item.checked=true;
                                        this.changeState({});
                                    }}
                                >
                                    <SText fontSize="mini_p" color={item.checked?'#2999F4':'#999'}>{item.value}</SText>
                                </TouchableOpacity>
                            )
                        })
                    }
                </Row>
            )
        }else {
            return null
        }
    }
    /**
     * @Description: 到货量行情 图片
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/24 19:31
     */
    _renderCamera1(){
        if(this.state.pageLoading)
            return null;
        let picArray =[];
        if (!str.isEmpty(this.state.newGoodsImages)){
            this.state.newGoodsImages.map((item,index)=>{
                picArray.push(item.img)
            })
        }
        return(
           <View style={{backgroundColor:'#fff',padding:15}}>
               <Row>
                   <SText fontSize='caption_p' color='333' >上传到货量照片(最多4张)</SText>
                   {/*<SText fontSize='caption_p' color='#FE0000'>*</SText>*/}
               </Row>
               <Camera
                   ref={v=> this._camera1 = v}
                   style={{marginTop: 10}}
                   showErrorMsg={this._showMsg}
                   maxNum={4}
                   picArray={picArray}
               />

           </View>
        )
    }
    _renderCamera2(){
        //存在初始化数据 当编辑初始化数据的时候 会因为内外数据组不一致 导致bug
        //解决方案  要么写删除方法回调 保存内外数据源一致
        //要么只执行一次数据塞入，同时注释掉componentWillReceiveProps方法
        if(this.state.pageLoading)
            return null;
        let picArray =[];
        if (!str.isEmpty(this.state.goodsQualityImages)){
            this.state.goodsQualityImages.map((item,index)=>{
                picArray.push(item.img)
            })
        }
        return(
            <View style={{backgroundColor:'#fff',padding:15}}>
                <Row>
                    <SText fontSize='caption_p' color='333' >上传到货量照片(最多5张)</SText>
                    <SText fontSize='caption_p' color='#FE0000'>*</SText>
                </Row>
                <Camera
                    ref={v=> this._camera2 = v}
                    style={{marginTop: 10}}
                    showErrorMsg={this._showMsg}
                    maxNum={5}
                    picArray={picArray}
                />
            </View>
        )
    }
    /**
     * @Description: 供货商行情
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/24 10:56
     */
    _renderSupplier(){
        return(
            <View
                ref="supplier"
                onLayout={(event)=>{
                    this.state.moduleSupplierHeight=event.nativeEvent.layout.height
                }}>
                <Row style={{alignItems:'center',justifyContent:'center',height:40,backgroundColor:'#E5E5E5'}}>
                    <View style={{height:1,width:40,borderColor:'#CDD0D2',borderTopWidth:1}}/>
                    <SText fontSize='caption_p' color='#6A7883' style={[{marginLeft:3,marginRight:3}]}>供货商行情</SText>
                    <View style={{height:1,width:40,borderColor:'#CDD0D2',borderTopWidth:1}}/>
                </Row>

                {this._renderSupplierList()}
                <TouchableOpacity
                    style={[s.item,{marginTop:10,justifyContent:'center'}]}
                    onPress={()=>{
                        this.navigator().push({
                            component: SupplierList,
                            name: 'SupplierList',
                            from:'CreatePatorlLog',
                            callback:this._addSupplierBack,
                            existSuppliers:this.state.suppliers?this.state.suppliers:[]
                        })
                    }}
                    disabled={this.state.edit}
                >
                    <SText color='#2296F3' fontSize='caption_p'>+ 添加供货商行情</SText>
                </TouchableOpacity>
            </View>
        )
    }
    _(){
        //滑动删除代码
        {/*<SwipeListView*/}
        {/*dataSource={this._ds.cloneWithRows(this.state.suppliers?this.state.suppliers:[])}*/}
        {/*renderRow={ data => (*/}
        {/*<SItem*/}
        {/*onPress={ _ => console.log(data) }*/}
        {/*content={data.supplierName}*/}
        {/*contentStyle={{fontSize:15,color:'#333',marginLeft:5}}*/}
        {/*rightIconShow={true}*/}
        {/*label={data.supplierDesc}*/}
        {/*labelStyle={{fontSize:13,color:'#999',marginRight:5}}*/}
        {/*rightIcon={IconForward}*/}
        {/*/>*/}
        {/*)}*/}
        {/*renderHiddenRow={ (data, secId, rowId, rowMap) => (*/}
        {/*<View style={s.rowBack}>*/}
        {/*/!*<Text>Left</Text>*!/*/}
        {/*/!*<View style={[s.backRightBtn, s.backRightBtnLeft]}>*!/*/}
        {/*/!*<Text style={s.backTextWhite}>Right</Text>*!/*/}
        {/*/!*</View>*!/*/}
        {/*<TouchableOpacity style={[s.backRightBtn, s.backRightBtnRight]} onPress={ _ => this.deleteRow(secId, rowId, rowMap) }>*/}
        {/*<Text style={s.backTextWhite}>删除</Text>*/}
        {/*</TouchableOpacity>*/}
        {/*</View>*/}
        {/*)}*/}
        {/*// leftOpenValue={75}*/}
        {/*rightOpenValue={-65}*/}
        {/*/>*/}
    }
    /**
     * @Description: 供货商列表
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/25 16:34
     */
    _renderSupplierList(){
        if (!str.isEmpty(this.state.suppliers)){
            return(
                <View>
                    <Row style={{backgroundColor:'#FAFAFA',paddingLeft:15,paddingRight:15,alignItems:'center'}}>
                        <SText fontSize='mini_p' color='999' style={{flex:1}}>供货商</SText>
                        <TouchableOpacity
                            onPress={()=>{
                                this.changeState({
                                    edit:this.state.edit?false:true
                                })
                            }}
                            style={{height:45,width:100,justifyContent:'center',alignItems:'flex-end'}}
                        >
                            <SText fontSize='mini_p' color='#2296F3' >{this.state.edit?'完成':'编辑'}</SText>
                        </TouchableOpacity>
                    </Row>
                    {
                        this.state.suppliers.map((item,index)=>{
                            return(
                                <Row >
                                    <SItem
                                        onPress={()=>this._addSupplierSpu(index,item)}
                                        content={item.supplierName}
                                        contentStyle={{fontSize:15,color:'#333',marginLeft:5}}
                                        rightIconShow={true}
                                        label={item.supplierDesc?item.supplierDesc:'添加商品'}
                                        labelStyle={[{fontSize:13,marginRight:5},item.supplierDesc?{color:'#999'}:{color:'#2296F3'}]}
                                        rightIcon={IconForward}
                                        style={{flex:1}}
                                        disabled={this.state.edit}
                                    />
                                    {this.state.edit?
                                        <TouchableOpacity style={[s.btnDel,index==this.state.suppliers.length-1?{}:s.borderBottomWhite]} onPress={ _ => this._btnDeleteClick(index) }>
                                            <SText fontSize='mini_p' color='white'>删除</SText>
                                        </TouchableOpacity>
                                        :null}
                                </Row>
                            )
                        })
                    }
                </View>

            )
        }
    }
    _addSupplierSpu=(index,item)=>{
        this.navigator().push({
            component: EditSupplierGoods,
            name: 'EditSupplierGoods',
            callback:this._editSupplierGoodsBack,
            data:{
                index:index,
                catId:this.props.route.data.catId,
                //这个地方要深拷贝数据
                supplierDetailCreateDO:DeepCopy.cloneDeep(item),
                supplierCarNumUnitEnum:this.state.supplierCarNumUnitEnum,
                coreUserPriceUnitEnum:this.state.coreUserPriceUnitEnum,
                normalUserPriceUnitEnum:this.state.normalUserPriceUnitEnum,
                oldGoodsNumUnitEnum:this.state.oldGoodsNumUnitEnum,
                spuNewGoodsNumUnitEnum:this.state.spuNewGoodsNumUnitEnum,
            }
        })
    }
    /**
     * @Description: 添加供货商
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/25 17:05
     */
    _addSupplierBack=(supplier)=>{
        console.log('supplier')
        console.log(supplier)
        if (str.isEmpty(this.state.suppliers)){
            this.state.suppliers=[];
        }
        this.state.suppliers.push(supplier);
        this.changeState()
        InteractionManager.runAfterInteractions( () => {
            this._addSupplierSpu(this.state.suppliers.length-1,supplier)
        })

    }
    /**
     * 删除商品按钮
     * @param rowData 商品信息
     * @private
     */
    _btnDeleteClick(index) {
        this.changeState({
            currentRow: {
                index
            }
        }, ()=> {
            this._sxcmodal._toggle();
        })
    }
    /**
     * @Description: 删除供货商
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/25 17:05
     */
    _deleteSupplier=(index)=>{
        this.state.suppliers.splice(index, 1);
        this.changeState()
    }
    /**
     * @Description: 添加/跟新供货商商品
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/26 19:21
     */
    _editSupplierGoodsBack=(item,index)=>{
        console.log('item');
        console.log(item);
        this.state.suppliers[index]=item;
    }
    /**
     * 输入框内容变化回调
     * @return {[type]} [description]
     */
    _onChangeText(type, value){
        this._marketDetailCreateDO[type] = value;
        this.changeState({
            [type]:value
        });
    }
    /**
     * radio box 切换的时候
     * @return {[type]} [description]
     */
    _onRadioChange(type, value){
        this._marketDetailCreateDO[type] = value;
        this.changeState();

    }
    _showMsg(str){
        __STORE.dispatch(UtilsAction.toast(str, 1000));
    }


    /**
     * @Description: 显示spinner对话框
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/26 15:49
     */
    _showCommonSelect(currentDataSource,currentSelected){
        if (!currentSelected){
            currentSelected={}
        }
        let currentObj = {
            currentSelected: [currentSelected] || [],
            currentDataSource: currentDataSource || []
        }
        this.changeState(currentObj, ()=>{
            this._commonSelect._toggle()
        })
    }
    /**
     * spinner对话框回调
     * @param data
     * @private
     */
    _commonSelectCallback = (data)=>{
        this._marketDetailCreateDO.carNumUnit=data[0].key;
        this.changeState({
            selectMarketCarNumUnit:data[0]
        })
    }

    /**
     * @Description:  滚动导航tab切换
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/23 14:19
     */
    _onScroll=(e)=>{
        if (e.nativeEvent.contentOffset.y<this.state.moduleBazaarHeight-1&&this.state.curTabId!=0){
            this.changeState({
                curTabId:0
            })
        }else if (e.nativeEvent.contentOffset.y>=this.state.moduleBazaarHeight-1&&this.state.curTabId!=1){
            this.changeState({
                curTabId:1
            })
        }
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
    _affirm(index) {
        console.log('_affirm')
        this.props.btnAffirm(index);
        this.props.sxcmodal._toggle();
    }
    render() {
        return (
            <View style={{backgroundColor:'#fff',borderRadius:5,paddingLeft:15,paddingRight:15}}>
                <SText style={{ textAlign: 'center', marginTop: 30, marginLeft: 10, marginRight: 10,marginBottom:30}} fontSize="title" color="333">确认要删除这个供货商吗？</SText>
                <Row style={{borderTopWidth:1,borderColor:'#F8F8F8',alignItems:'center'}}>
                    <TouchableOpacity onPress={()=>this.props.sxcmodal._toggle()}  style={[s.btn_dialog]}>
                        <SText fontSize="body" color="666" style={{color:"#5F646D"}} >取消</SText>
                    </TouchableOpacity>
                    <View style={{borderLeftWidth:1,borderColor:'#F8F8F8',width:1,height:20}}/>
                    <TouchableOpacity onPress={()=>this._affirm(this.props.currentRow.index)} underlayColor='#0a568e' style={[s.btn_dialog]}>
                        <SText fontSize="body" color="666" style={{color:"#329EF4"}} >确认</SText>
                    </TouchableOpacity>
                </Row>
            </View>
        );
    }
}