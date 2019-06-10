/**
 *
 * 项目名称：caimi-rn
 * 文件描述：填写供货商的商品行情页面
 * 传入参数 ：
 * supplierName
 *
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/5/25 17:33
 * 修改人：cfy
 * 修改时间：17/5/25 17:33
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
    TouchableHighlight,
} from 'react-native';
import {SComponent, SStyle, SText,SItem} from 'sxc-rn';
import {Row,Page ,SXCRadio,Camera,CommonSelect,SInput} from 'components';
import {str} from 'tools';
import {
    ICON_DOWN_L,
} from 'config';
var Dimensions = require('Dimensions');
var {width} = Dimensions.get('window');
import {UtilsAction} from 'actions';
import DeepCopy from 'lodash'
//选择商品
import  ItemSelect from '../commodity/create/item_select/item_select'
import KeyboardSpacer from 'react-native-keyboard-spacer';
let s = SStyle({
    item1:{
        height:45,
        backgroundColor:'#fff',
        alignItems:'center',
        flexDirection:'row',
        paddingLeft:15,
        paddingRight:15
    },
    borderBottom:{
        borderBottomWidth:1,
        borderColor:'#F0F2F3'
    },
    input1:{
        backgroundColor:'#fff',
        fontSize:15,
        color:'#333',
        height:44,
        textAlign:'right',
        minWidth:80,
        paddingRight:15
    },
    input:{
        padding:15,
        backgroundColor:'#fff',
        fontSize:15,
        color:'#333',
        width:width,
        minHeight:60
    },
    btnSpinner:{
        backgroundColor:'#fff',
        fontSize:15,
        color:'#333',
        height:44,
        minWidth:80,
    },
    iconDown:{
        width:12,
        height:7,
        marginLeft:10
    },
    rowItem:{
        flexDirection:'row',
        height:44,
        alignItems:'center',
        backgroundColor:'#fff',
        justifyContent:'flex-end',
        width:65
    },
    btn:{
        height:45,
        backgroundColor:'#54BB40',
        width:width,
        justifyContent:'center',
        alignItems:'center'

    }
});
module.exports = class EditSupplierGoods extends SComponent{
    constructor(props){
        super(props)
        //品类id
        this.catId=props.route.data&&props.route.data.catId?props.route.data.catId:{};
        //供货商供货信息
        this.supplierDetailCreateDO=props.route.data&&props.route.data.supplierDetailCreateDO?props.route.data.supplierDetailCreateDO:{};
        //供应商每车装货量单位枚
        this.supplierCarNumUnitEnum=props.route.data&&props.route.data.supplierCarNumUnitEnum?props.route.data.supplierCarNumUnitEnum:[];
        //大户拿货价 单位枚举
        this.coreUserPriceUnitEnum=props.route.data&&props.route.data.coreUserPriceUnitEnum?props.route.data.coreUserPriceUnitEnum:[];
        //小户拿货价 单位枚举
        this.normalUserPriceUnitEnum=props.route.data&&props.route.data.normalUserPriceUnitEnum?props.route.data.normalUserPriceUnitEnum:[];
        //spu存货量单位枚举
        this.oldGoodsNumUnitEnum=props.route.data&&props.route.data.oldGoodsNumUnitEnum?props.route.data.oldGoodsNumUnitEnum:[];
        //spu到货量单位枚举
        this.spuNewGoodsNumUnitEnum=props.route.data&&props.route.data.spuNewGoodsNumUnitEnum?props.route.data.spuNewGoodsNumUnitEnum:[];
        
        this.state={
        }
        console.log('data');
        console.log(props.route.data);
        this.initData();
    }
    /**
     * @Description: 初始化数据 单位枚举添加到各个item数据对象中
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/26 14:52
     */
    initData(){
        // if(str.isEmpty(this.supplierDetailCreateDO.supplierSpuDetailCreateDOs)){
        //     this.supplierDetailCreateDO.supplierSpuDetailCreateDOs=[];
        // }else {
        //     this.supplierDetailCreateDO.supplierSpuDetailCreateDOs.map((item,index)=>{
        //         //大户拿货单位枚举
        //         item.coreUserPriceUnitEnum=DeepCopy.cloneDeep(this.coreUserPriceUnitEnum);
        //         //小户拿货单位枚举
        //         item.normalUserPriceUnitEnum=DeepCopy.cloneDeep(this.normalUserPriceUnitEnum);
        //         //新到货单位枚举
        //         item.newGoodsNumUnitEnum=DeepCopy.cloneDeep(this.spuNewGoodsNumUnitEnum);
        //         //存货量单位枚举
        //         item.oldGoodsNumUnitEnum=DeepCopy.cloneDeep(this.oldGoodsNumUnitEnum);
        //     })
        // }
        // if(str.isEmpty(this.supplierDetailCreateDO.selectSupplierCarNumUnit&&this.supplierCarNumUnitEnum.length>0)){
        //     this.supplierDetailCreateDO.selectSupplierCarNumUnit= this.supplierCarNumUnitEnum[0]
        // }
    }
    render(){
        return(
            <Page
                pageName='巡场日志-填写商品行情'
                back={()=>this.navigator().pop()}
                pageLoading={false}
                title={'填写'+this.supplierDetailCreateDO.supplierName+'的行情'}
            >
                <ScrollView style={{flex:1}}>
                    {this._renderBase()}
                    {this._renderGoods()}
                    <TouchableOpacity
                        style={[s.item1,{marginTop:10,justifyContent:'center'}]}
                        onPress={()=>{
                            this.navigator().push({
                                component: ItemSelect,
                                name: 'ItemSelect',
                                from:'EditSupplierGoods',
                                callback:this._addGoodsBack,
                                data:{
                                    catId:this.props.route.data.catId
                                }
                            })
                        }}
                    >
                        <SText color='#2296F3' fontSize='caption_p'>+ 添加商品</SText>
                    </TouchableOpacity>
                </ScrollView>

                <TouchableOpacity
                    style={s.btn}
                    onPress={()=>this._submit()}
                >
                    <SText fontSize='body' color='white'>确定</SText>
                </TouchableOpacity>
                <CommonSelect
                    keyName={'value'}
                    ref={ view => this._commonSelect = view}
                    selectCallback={this._commonSelectCallback}
                    dataSource={this.state.currentDataSource?this.state.currentDataSource:[]}
                    name={this.state.currentName}
                    index={this.state.currentIndex}
                    selected={this.state.currentSelected}
                    multiple={false}
                />
                <KeyboardSpacer/>
            </Page>
        )
    }
    /**
     * @Description: 基本行情信息
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/25 18:17
     */
    _renderBase(){
        return(
            <View>
                {/*<View style={[s.item1,s.borderBottom]}>*/}
                    {/*<Row>*/}
                        {/*<SText fontSize='caption_p' color='#5F646E'>每车装货量</SText>*/}
                        {/*<SText fontSize='caption_p' color='#FE0000'>*</SText>*/}
                    {/*</Row>*/}

                    {/*<Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>*/}
                        {/*<SInput*/}
                            {/*onChangeText={this._onChangeText.bind(this, 'carUnitNum')}*/}
                            {/*style={s.input1}*/}
                            {/*value={this.supplierDetailCreateDO.carUnitNum ? this.supplierDetailCreateDO.carUnitNum + '' : ''}*/}
                            {/*keyboardType="numeric"*/}
                            {/*placeholder="请输入" />*/}
                        {/*<View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>*/}
                        {/*<TouchableOpacity*/}
                            {/*onPress={()=>{*/}
                                {/*this._showCommonSelect(-1,'',*/}
                                    {/*this.supplierCarNumUnitEnum,*/}
                                    {/*this.supplierDetailCreateDO.selectSupplierCarNumUnit*/}
                                {/*)*/}
                            {/*}}*/}
                            {/*style={[s.rowItem,{paddingLeft:15}]}>*/}
                            {/*<SText fontSize='mini_p' color='333'>{this.supplierDetailCreateDO.selectSupplierCarNumUnit?this.supplierDetailCreateDO.selectSupplierCarNumUnit.value:''}</SText>*/}
                            {/*<Image source={ICON_DOWN_L} style={[s.iconDown]}/>*/}
                        {/*</TouchableOpacity>*/}
                    {/*</Row>*/}
                {/*</View>*/}
                <View style={[s.item1,s.borderBottom]}>
                    <Row>
                        <SText fontSize='caption_p' color='#5F646E'>新到货</SText>
                        <SText fontSize='caption_p' color='#FE0000'>*</SText>
                    </Row>
                    <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                        <SInput
                            onChangeText={this._onChangeText.bind(this, 'newGoodsNum')}
                            style={s.input1}
                            keyboardType="numeric"
                            value={this.supplierDetailCreateDO.newGoodsNum ? this.supplierDetailCreateDO.newGoodsNum + '' : ''}
                            placeholder="请输入" />
                        <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                        <SText fontSize='mini_p' color='999' style={{width:43,marginRight:22,textAlign:'right'}}>车</SText>
                    </Row>
                </View>
                <View style={[s.item1,s.borderBottom]}>
                    <Row>
                        <SText fontSize='caption_p' color='#5F646E'>日均销货</SText>
                        <SText fontSize='caption_p' color='#FE0000'>*</SText>
                    </Row>
                    <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                        <SInput
                            onChangeText={this._onChangeText.bind(this, 'avgSaleNum')}
                            style={s.input1}
                            keyboardType="numeric"
                            value={this.supplierDetailCreateDO.avgSaleNum ? this.supplierDetailCreateDO.avgSaleNum + '' : ''}
                            placeholder="请输入" />
                        <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                        <SText fontSize='mini_p' color='999' style={{width:43,marginRight:22,textAlign:'right'}}>车</SText>
                    </Row>
                </View>
                <View style={[s.item1,s.borderBottom]}>
                    <Row>
                        <SText fontSize='caption_p' color='#5F646E'>到货周期</SText>
                        <SText fontSize='caption_p' color='#FE0000'>*</SText>
                    </Row>
                    <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                        <SInput
                            onChangeText={this._onChangeText.bind(this, 'purchaseCycle')}
                            style={s.input1}
                            keyboardType="numeric"
                            value={this.supplierDetailCreateDO.purchaseCycle ? this.supplierDetailCreateDO.purchaseCycle + '' : ''}
                            placeholder="请输入" />
                        <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                        <SText fontSize='mini_p' color='999' style={{width:43,marginRight:22,textAlign:'right'}}>天/车</SText>
                    </Row>
                </View>
                {this._renderCamera()}
                <SInput
                    multiline={true}
                    onChangeText={this._onChangeText.bind(this, 'remark')}
                    style={s.input}
                    value={this.supplierDetailCreateDO.remark ? this.supplierDetailCreateDO.remark : ''}
                    placeholder="档口到货走货速度，人流，价格，质量情况，已经了解到的原因" />
            </View>
        )
    }
    _renderCamera(){
        console.log('img');
        console.log(this.supplierDetailCreateDO.imgs);
        return(
            <View style={{paddingTop: 10,backgroundColor:'#fff',paddingLeft:15}}>

                <Camera
                    ref={v=> this._camera = v}
                    showErrorMsg={this._showErrorMsg}
                    maxNum={5}
                    picArray={this.supplierDetailCreateDO.imgs?this.supplierDetailCreateDO.imgs:[]}
                />
            </View>
        )
    }
    /**
     * @Description: 商品列表
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/25 19:27
     */
    _renderGoods(){
        if (!str.isEmpty(this.supplierDetailCreateDO.supplierSpuDetailCreateDOs)){
            return(
                this.supplierDetailCreateDO.supplierSpuDetailCreateDOs.map((item,index)=>{
                    return(
                        <View style={{marginTop:10}}>
                           <Row style={[s.item1,s.borderBottom]} >
                               <SText fontSize='caption_p' color='#333' style={{flex:1}}>{item.spuName}</SText>
                               <TouchableOpacity
                                   style={{width:60,alignItems:'flex-end'}}
                                   onPress={()=>this._deleteItem(index)}>
                                   <SText fontSize='mini_p' color='#6F7F8B' >删除</SText>
                               </TouchableOpacity>
                           </Row>

                            <View style={[s.item1,s.borderBottom]}>
                                <Row>
                                    <SText fontSize='caption_p' color='#5F646E'>大户拿货价</SText>
                                    <SText fontSize='caption_p' color='#FE0000'>*</SText>
                                </Row>
                                <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                                    <SInput
                                        onChangeText={this._onItemChangeText.bind(this, index, 'coreUserPrice')}
                                        style={s.input1}
                                        keyboardType="numeric"
                                        value={item.coreUserPrice ? item.coreUserPrice + '' : ''}
                                        placeholder="请输入" />
                                    <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            this._showCommonSelect(index,'coreUserPrice',
                                                this.coreUserPriceUnitEnum,
                                                item.selectCoreUserPriceUnit,
                                            )
                                        }}
                                        style={[s.rowItem,{paddingLeft:15}]}>
                                        <SText fontSize='mini_p' color='333'>{item.selectCoreUserPriceUnit?item.selectCoreUserPriceUnit.value:''}</SText>
                                        <Image source={ICON_DOWN_L} style={[s.iconDown]}/>
                                    </TouchableOpacity>
                                </Row>
                            </View>

                            <View style={[s.item1,s.borderBottom]}>
                                <Row>
                                    <SText fontSize='caption_p' color='#5F646E'>小户拿货价</SText>
                                    <SText fontSize='caption_p' color='#FE0000'>*</SText>
                                </Row>
                                <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                                    <SInput
                                        onChangeText={this._onItemChangeText.bind(this,index, 'normalUserPrice')}
                                        style={s.input1}
                                        keyboardType="numeric"
                                        value={item.normalUserPrice ? item.normalUserPrice + '' : ''}
                                        placeholder="请输入" />
                                    <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            this._showCommonSelect(index,'normalUserPrice',
                                                this.normalUserPriceUnitEnum,
                                                item.selectNormalUserPriceUnit,
                                            )
                                        }}
                                        style={[s.rowItem,{paddingLeft:15}]}>
                                        <SText fontSize='mini_p' color='333'>{item.selectNormalUserPriceUnit?item.selectNormalUserPriceUnit.value:''}</SText>
                                        <Image source={ICON_DOWN_L} style={[s.iconDown]}/>
                                    </TouchableOpacity>
                                </Row>
                            </View>

                            <View style={[s.item1,s.borderBottom]}>
                                <SText fontSize='caption_p' color='#5F646E'>新到货</SText>
                                <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                                    <SInput
                                        onChangeText={this._onItemChangeText.bind(this,index, 'newGoodsNum')}
                                        style={s.input1}
                                        keyboardType="numeric"
                                        value={item.newGoodsNum ? item.newGoodsNum + '' : ''}
                                        placeholder="请输入" />
                                    <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            this._showCommonSelect(index,'newGoodsNum',
                                                this.spuNewGoodsNumUnitEnum,
                                                item.selectSpuNewGoodsNumUnit,
                                            )
                                        }}
                                        style={[s.rowItem,{paddingLeft:15}]}>
                                        <SText fontSize='mini_p' color='333'>{item.selectSpuNewGoodsNumUnit?item.selectSpuNewGoodsNumUnit.value:''}</SText>
                                        <Image source={ICON_DOWN_L} style={[s.iconDown]}/>
                                    </TouchableOpacity>
                                </Row>
                            </View>

                            <View style={[s.item1,s.borderBottom]}>
                                <SText fontSize='caption_p' color='#5F646E'>存货量</SText>
                                <Row style={{flex:1,marginLeft:15,justifyContent:'flex-end',alignItems:'center'}}>
                                    <SInput
                                        onChangeText={this._onItemChangeText.bind(this,index, 'oldGoodsNum')}
                                        style={s.input1}
                                        keyboardType="numeric"
                                        value={item.oldGoodsNum ? item.oldGoodsNum + '' : ''}
                                        placeholder="请输入" />
                                    <View style={{height:30,borderColor:'#E5E5E5',borderLeftWidth:1,width:1}}/>
                                    <TouchableOpacity
                                        onPress={()=>{
                                            this._showCommonSelect(index,'oldGoodsNum',
                                                this.oldGoodsNumUnitEnum,
                                                item.selectOldGoodsNumUnit,
                                            )
                                        }}
                                        style={[s.rowItem,{paddingLeft:15}]}>
                                        <SText fontSize='mini_p' color='333'>{item.selectOldGoodsNumUnit?item.selectOldGoodsNumUnit.value:''}</SText>
                                        <Image source={ICON_DOWN_L} style={[s.iconDown]}/>
                                    </TouchableOpacity>
                                </Row>
                            </View>
                        </View>
                    )
                })
            )
        }
    }
    /**
     * 输入框内容变化回调
     * @return {[type]} [description]
     */
    _onChangeText(type, value){
        this.supplierDetailCreateDO[type] = value;
        this.changeState();
    }
    /**
     * 列表item中的输入框内容变化
     * @return {[type]} [description]
     */
    _onItemChangeText(index,type, value){
        this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index][type] = value;
        this.changeState();
    }
    /**
     * @Description: 添加商品
     * @param list 添加的商品列表
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/26 10:53
     */
    _addGoodsBack=(list)=>{
        if(str.isEmpty(this.supplierDetailCreateDO.supplierSpuDetailCreateDOs)){
            this.supplierDetailCreateDO.supplierSpuDetailCreateDOs=[];
        }
        let spuList=[];
        for (let i=0;i<list.length;i++){
            //判断是否存在
            if(this.supplierDetailCreateDO.supplierSpuDetailCreateDOs.filter(item=>{ return item.spuId==list[i].spuId}).length===0){
                let spu={};
                spu.spuId=list[i].spuId;
                spu.spuName=list[i].spuName;
                //大户拿货单位枚举 默认选中第一个单位
                // spu.coreUserPriceUnitEnum=DeepCopy.cloneDeep(this.coreUserPriceUnitEnum);
                spu.selectCoreUserPriceUnit=this.coreUserPriceUnitEnum.length>0?this.coreUserPriceUnitEnum[0]:{};
                // spu.coreUserPriceUnitDes=spu.coreUserPriceUnitEnum.length>0?spu.coreUserPriceUnitEnum[0].value:'';
                //小户拿货单位枚举 默认选中第一个单位
                // spu.normalUserPriceUnitEnum=DeepCopy.cloneDeep(this.normalUserPriceUnitEnum);
                spu.selectNormalUserPriceUnit=this.normalUserPriceUnitEnum.length>0?this.normalUserPriceUnitEnum[0]:{};
                // spu.normalUserPriceUnitDes=spu.normalUserPriceUnitEnum.length>0?spu.normalUserPriceUnitEnum[0].value:'';
                //新到货单位枚举 默认选中第一个单位
                // spu.newGoodsNumUnitEnum=DeepCopy.cloneDeep(this.spuNewGoodsNumUnitEnum);
                spu.selectSpuNewGoodsNumUnit=this.spuNewGoodsNumUnitEnum.length>0?this.spuNewGoodsNumUnitEnum[0]:{};
                // spu.newGoodsNumUnitDes=spu.newGoodsNumUnitEnum.length>0?spu.newGoodsNumUnitEnum[0].value:'';
                //存货量单位枚举 默认选中第一个单位
                // spu.oldGoodsNumUnitEnum=DeepCopy.cloneDeep(this.oldGoodsNumUnitEnum);
                spu.selectOldGoodsNumUnit=this.oldGoodsNumUnitEnum.length>0?this.oldGoodsNumUnitEnum[0]:{};
                // spu.oldGoodsNumUnitDes=spu.oldGoodsNumUnitEnum.length>0?spu.oldGoodsNumUnitEnum[0].value:'';

                spuList.push(spu);
            }
        }
        if(spuList.length>0){
            let newList=[];
            newList=this.supplierDetailCreateDO.supplierSpuDetailCreateDOs.concat(spuList);
            this.supplierDetailCreateDO.supplierSpuDetailCreateDOs=newList;
            this.changeState();
        }
    }
    /**
     * @Description: 删除商品
     * @param  index 要删除商品的数组坐标
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/26 12:57
     */
    _deleteItem(index){
        this.supplierDetailCreateDO.supplierSpuDetailCreateDOs.splice(index, 1);
        this.changeState()
    }


    /**
     * @Description: 显示spinner对话框
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/26 15:49
     */
    _showCommonSelect(index,name,currentDataSource,currentSelected){
        if (!currentSelected){
            currentSelected={}
        }
        let currentObj = {
            currentIndex:index,
            currentName: name,
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
     * @param name
     * @param index 下标 因为这里存在list 中的item弹出选择，所以要这个字段来标示
     * @private
     */
    _commonSelectCallback = (data, name,index)=>{
        //index作为name标记 如果是-1 则为新车装货量
        switch (index){
            case -1:
                this.supplierDetailCreateDO.selectSupplierCarNumUnit=data[0]
                break
            default:
                if (name==='coreUserPrice'){//大户
                    this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index].selectCoreUserPriceUnit=data[0];
                    // this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index].coreUserPriceUnitDes=data[0].value;
                }else if (name==='normalUserPrice'){//小户
                    this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index].selectNormalUserPriceUnit=data[0];
                    // this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index].normalUserPriceUnitDes=data[0].value;
                }else if (name==='newGoodsNum'){//新到货
                    this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index].selectSpuNewGoodsNumUnit=data[0];
                    // this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index].newGoodsNumUnitDes=data[0].value;
                }else if (name==='oldGoodsNum'){//存活量
                    this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index].selectOldGoodsNumUnit=data[0];
                    // this.supplierDetailCreateDO.supplierSpuDetailCreateDOs[index].oldGoodsNumUnitDes=data[0].value;
                }
                break
        }
        this.changeState()
    }

    /**
     * @Description: 提交供货商信息
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/1 10:55
     */
    _submit(){
        // if(str.isEmpty(this.supplierDetailCreateDO.carUnitNum)){
        //     return this._showMsg('请填写每车装货量！');
        // }
        // if(str.isEmpty(this.supplierDetailCreateDO.selectSupplierCarNumUnit)){
        //     return this._showMsg('请选择每车装货量单位！');
        // }
        if(str.isEmpty(this.supplierDetailCreateDO.newGoodsNum)){
            return this._showMsg('请填写新到货量！');
        }
        if(str.isEmpty(this.supplierDetailCreateDO.avgSaleNum)){
            return this._showMsg('请填日均销货量！');
        }
        if(str.isEmpty(this.supplierDetailCreateDO.purchaseCycle)){
            return this._showMsg('请填写到货周期！');
        }
        if(str.isEmpty(this.supplierDetailCreateDO.supplierSpuDetailCreateDOs)){
            return this._showMsg('请添加至少一个spu商品信息！');
        }
        let supInfoComplete=true;
        this.supplierDetailCreateDO.supplierSpuDetailCreateDOs.map((item,index)=>{
            if(str.isEmpty(item.coreUserPrice)){
                supInfoComplete=false;
                return this._showMsg('请填写大户拿货价！');
            }
            if(str.isEmpty(item.selectCoreUserPriceUnit)){
                supInfoComplete=false;
                return this._showMsg('请选择大户拿货价单位！');
            }
            if(str.isEmpty(item.normalUserPrice)){
                supInfoComplete=false;
                return this._showMsg('请填写小户拿货价！');
            }
            if(str.isEmpty(item.selectNormalUserPriceUnit)){
                supInfoComplete=false;
                return this._showMsg('请选择小户拿货价单位！');
            }
        })
        if (!supInfoComplete){
            return;
        }
        this.navigator().pop();
        this.supplierDetailCreateDO.supplierDesc='刚刚更新';
        this.supplierDetailCreateDO.imgs=this._camera._submit();
        this.props.route.callback && this.props.route.callback(this.supplierDetailCreateDO,this.props.route.data.index);
    }
    _showMsg(str){
        __STORE.dispatch(UtilsAction.toast(str, 1000));
    }
}