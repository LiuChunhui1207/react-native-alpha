/**
 * 创建供应商
 * 此页面 要求传入参数
 * idType 供货商类型
 * supplierId 供货商Id
 * @author: chengfy@songxiaocai.com
 * @description:
 * @Date: 17/3/31 11:32
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

} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, SXCRadio, Row, SInput, CommonSelect, Camera, GalleryList,Button} from 'components';
import {UtilsAction} from 'actions';
import {str} from 'tools';
import { ICON_DOWN_L,ICON_ADD2} from 'config';
let s = SStyle({
    head: {
        height: 30,
        backgroundColor: 'f0',
        justifyContent: 'center',
        paddingLeft: 15
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
    input: {
        flex: 1,
        textAlign: 'right'
    },
    flex_right: {
        flex: 1,
        height: 45,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems:'center',
    },
    icon_down: {
        width: 17,
        height: 10,
        marginLeft: 10
    },
    radio_group: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    brand_box: {
        height: 116,
        backgroundColor: 'fff',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 14,
        paddingRight: 18
    },
    input_mul: {
        flex: 1,
        height: 96,
        fontSize: 16,
        color: '#333',
        marginLeft:10
    },
    idCard_box: {
        paddingTop: 15,
        paddingLeft: 15,
        paddingBottom: 11,
        backgroundColor: 'fff'
    },
    icon_add: {
        width: 14,
        height: 15
    },
    flex1: {
        flex: 1
    },
    btn_actin:{
        flex:1,
        height:45,
        backgroundColor:'#f0f0f0',
        justifyContent:'center',
        alignItems:'center'
    },
});
/**
 * 创建供货商
 * @type {PaymentInfo}
 */
module.exports=class CreateSupplier extends SComponent {
    constructor(props) {
        super(props);
        this.state={
            pageLoading: true,
            //供货商类型 0个人 1企业
            idType: this.props.route.data.idType,
            supplierId: this.props.route.data.supplierId,
            //页面数据 服务端返回
            pageData:{},
            //spinner对话框选中项
            currentSelected:[],
            //spinner对话框数据源
            currentDataSource:[],
            //当前结款账期对象 key-value
            paymentDay:{},
            //当前是开票类型对象key-value
            billKind:{},
            brandPicUrls: [],
            supplierImgs:[],
            wholesaleMarketChoice: [],  //选中的批发市场
            wholesaleMarkets: [],      //所有批发市场

        }
        this._renderShowBrand=this._renderShowBrand.bind(this);
        this._renderBrandPic=this._renderBrandPic.bind(this);
        this._onChangeText=this._onChangeText.bind(this);
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this._getData();
        })
    }
    /**
     * 获取创建供货商数据信息
     * @return {[type]} [description]
     */
    _getData(){
        commonRequest({
            apiKey: 'queryDetailInfoCreateInitKey',
            withLoading: true,
            objectName: 'supplyUserQueryDO',
            params: {
            }
        }).then( (res) => {
            let data = res.data;
            this.changeState({
                pageLoading: false,
                pageData:data,
                ...data,
            });
        }).catch( err => {})
    }

    render(){
        return(
            <Page
                title='创建供货商'
                back={()=>this.navigator().pop()}
                pageLoading={this.state.pageLoading}>
                <ScrollView
                    ref={v=>{
                        this._scrollResponder = v;
                    }}
                    style={{flex:1}}>
                    <View style={s.head}>
                        <SText fontSize="caption" color="999">基础信息</SText>
                    </View>
                    <Row style={[s.item, s.border_bottom]}>
                        <SText fontSize="body" color="666">结款信息</SText>
                        <TouchableOpacity  onPress={()=>this._showCommonSelect('paymentDays','value',this.state.pageData.paymentDays,[this.state.paymentDay],false)} style={s.flex_right}>
                            <SInput
                                style={[s.input,{color:'#333333'}]}
                                editable={false}
                                placeholder="请选择"
                                value={this.state.paymentDay.value==null?'':this.state.paymentDay.value}/>
                            <Image source={ICON_DOWN_L} style={s.icon_down}/>
                        </TouchableOpacity>
                    </Row>
                    <Row style={[s.item, s.border_bottom]}>
                        <SText fontSize="body" color="666">增值税发票</SText>
                        <TouchableOpacity onPress={()=>this._showCommonSelect('billKind','value',this.state.pageData.billsKinds,[this.state.billKind])} style={s.flex_right}>
                            <SInput
                                style={[s.input,{color:'#333333'}]}
                                editable={false}
                                placeholder="请选择"
                                value={this.state.billKind.value==null?'':this.state.billKind.value}/>
                            <Image source={ICON_DOWN_L} style={s.icon_down}/>
                        </TouchableOpacity>
                    </Row>

                    {this._renderPayment()}
                    <View style={s.head}>
                        <SText fontSize="caption" color="999">品牌信息</SText>
                    </View>
                    <Row style={[s.item, s.border_bottom]}>
                        <SText fontSize="body" color="666">品牌信息</SText>
                        <SInput
                            onChangeText={text=>{
                                this._onChangeText(text, 'supplierBrand')
                            }}
                            placeholder="-"
                            editable={this.state.edit}
                            value={this.state.supplierBrand ? this.state.supplierBrand : ''}
                            style={s.input}
                        />
                    </Row>
                    {this._renderShowBrand()}
                    {this._renderBrandPic()}
                    <View style={s.head}>
                        <SText fontSize="caption" color="999">所在批发市场</SText>
                    </View>
                    <Row
                        onPress={()=>this._showCommonSelect('wholesaleMarket','name',this.state.wholesaleMarkets,this.state.wholesaleMarketChoice,true)}
                        style={[s.item, s.border_bottom, {backgroundColor: '#FAFAFA'}]}
                    >
                        <SText style={{flex:1}} fontSize="body" color="666">添加批发市场</SText>
                        <Image source={ICON_ADD2} style={s.icon_add} />
                    </Row>
                    {this._renderWholesaleMarket()}
                    {this._renderAutonym()}
                </ScrollView>
                <Row>
                    <TouchableOpacity onPress={this._toSupplierList}  style={[s.btn_actin]}>
                        <SText fontSize="body" color="666" style={{color:"#2296f3"}} >下次再填</SText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this._btnSubmit()} underlayColor='#0a568e' style={[s.btn_actin,{backgroundColor:'#cccccc'}]}>
                        <SText fontSize="body" color="666" style={{color:"#ffffff"}} >提交</SText>
                    </TouchableOpacity>
                </Row>
                <CommonSelect
                    keyName={this.state.keyName}
                    ref={ view => this._commonSelect = view}
                    selectCallback={this._commonSelectCallback}
                    dataSource={this.state.currentDataSource}
                    selected={this.state.currentSelected}
                    multiple={this.state.multiple}
                    name={this.state.currentName}
                />
            </Page>
        )
    }

    /**
     * 下次再填
     * @return {[type]} [description]
     */
    _toSupplierList = () =>{
        let route = this.navigator().getRoute('name', 'SupplierList');
        this.navigator().popToRoute(route);
        this.props.route.callback && this.props.route.callback();
    }

    /**
     * 显示modal框
     * @return {[type]} [description]
     */
    _showCommonSelect(name, keyName,currentDataSource,currentSelected,multiple){
        console.log('currentSelected',currentSelected);
        let currentObj = {
            keyName: keyName,
            currentName: name,
            currentSelected: currentSelected || [],
            currentDataSource: currentDataSource || [],
            multiple:multiple
        }
        this.changeState(currentObj, ()=>{
            this._commonSelect._toggle()
        })
    }

    /**
     * 打款信息
     * @returns {XML}
     * @private
     */
    _renderPayment() {
        return(
            <View>
                <View style={s.head}>
                    <SText fontSize="caption" color="999">打款信息</SText>
                </View>
                <Row style={[s.item, s.border_bottom]}>
                    <SText fontSize="body" color="666">收款人姓名</SText>
                    <SInput
                        onChangeText={text=>{
                            this._onChangeText(text, 'payeeName')
                        }}
                        placeholder="请输入"
                        editable={true}
                        value={this.state.payeeName}
                        style={s.input}
                    />
                </Row>
                <Row style={[s.item, s.border_bottom]}>
                    <SText fontSize="body" color="666">收款银行</SText>
                    <SInput
                        onChangeText={text=>{
                            this._onChangeText(text, 'payeeBankName')
                        }}
                        placeholder="请输入"
                        editable={true}
                        value={this.state.payeeBankName }
                        style={s.input}
                    />
                </Row>
                <Row style={[s.item, s.border_bottom]}>
                    <SText fontSize="body" color="666">银行卡号</SText>
                    <SInput
                        onChangeText={text=>{
                            this._onChangeText(text, 'payeeCardNumber')
                        }}
                        placeholder="请输入"
                        keyboardType="numeric"
                        editable={true}
                        value={this.state.payeeCardNumber }
                        style={s.input}
                    />
                </Row>
                <Row style={[s.item, s.border_bottom]}>
                    <SText fontSize="body" color="666">预留手机号</SText>
                    <SInput
                        onChangeText={text=>{
                            this._onChangeText(text, 'payeeMobilePhone')
                        }}
                        placeholder="请输入"
                        keyboardType="numeric"
                        editable={true}
                        value={this.state.payeeMobilePhone}
                        style={s.input}
                    />
                </Row>
            </View>
        )
    }
    /**
     * 渲染APP是否展示
     * @return {[type]} [description]
     */
    _renderShowBrand(){
        //品牌名称存在时 显示是否在宋小菜APP展示
        if(this.state.supplierBrand){
            return (
                <Row style={[s.item, s.border_bottom]}>
                    <SText fontSize="body" color="666">宋小菜APP是否展示</SText>
                    <SXCRadio.SXCRadioGroup style={s.radio_group} onChange={text =>this._onChangeText(text, 'showBrand')}>
                        <SXCRadio.Option checked={this.state.showBrand === 0} value={0} style={{marginRight: 5}}>
                            <SText fontSize="body" color="333">不展示</SText>
                        </SXCRadio.Option>
                        <SXCRadio.Option checked={this.state.showBrand === 1} value={1}>
                            <SText fontSize="body" color="333">展示</SText>
                        </SXCRadio.Option>
                    </SXCRadio.SXCRadioGroup>
                </Row>
            )
        }
        return null;
    }

    /**
     * 品牌图片
     * @return {[type]} [description]
     */
    _renderBrandPic(){
        //品牌名称存在时 显示品牌图片和介绍
        if(this.state.supplierBrand){
            let picArray = this.state.brandPicUrls[0] ? [this.state.brandPicUrls[0].img] : []
            return (
                <Row style={s.brand_box}>
                    <Camera
                        ref={v=> this._brand = v}
                        style={{marginTop: 6}}
                        single
                        showErrorMsg={this._showErrorMsg}
                        picArray={picArray}
                    />
                    <SInput
                        onChangeText={text=>{
                            this._onChangeText(text, 'brandIntroduce')
                        }}
                        onFocus={(event)=>{
                            this._scrollResponder.scrollResponderScrollNativeHandleToKeyboard(event.target,120,true)
                        }}
                        placeholder="请输入描述，最多100个字"
                        editable={true}
                        value={this.state.brandIntroduce}
                        style={s.input_mul}
                        multiline
                    />
                </Row>
            )
            return null
        }
        return null;
    }

    /**
     * 批发市场
     * @return {[type]} [description]
     */
    _renderWholesaleMarket(){
        //编辑状态
        return this.state.wholesaleMarketChoice.map((market, index) => {
            if(market.name === null || market.name === null){
                market.name = '';
            }
            return (
                <Row key={index} style={[s.item, s.border_bottom]}>
                    <SText fontSize="body" color="666">{market.name}</SText>
                    <SText fontSize="body" color="666" style={{marginLeft: 10}}>{market.value}</SText>
                    <SInput
                        style={[s.flex1, {marginLeft: 10}]}
                        onChangeText={text=>{
                            market.wholesaleMarketAddress = text;
                            this.forceUpdate();
                        }}
                        value={market.wholesaleMarketAddress}
                        placeholder="请填写档口号" />
                    <TouchableOpacity
                        onPress={()=>{
                            let s = this.state.wholesaleMarketChoice.splice(index, 1);
                            this.forceUpdate();
                        }}
                    >
                        <SText fontSize="caption" color="red" >删除</SText>
                    </TouchableOpacity>
                </Row>
            )
        })
        //查看状态
        return this.state.wholesaleMarketChoice.map((market, index) => {
            return (
                <Row key={index} style={[s.item, s.border_bottom]}>
                    <SText fontSize="body" color="666">{`${market.name}  ${market.value}`}</SText>
                </Row>
            )
        })
    }

    /**
     * 实名区域
     * 查看状态如果证件号码为空 则整块不显示
     * @return {[type]} [description]
     */
    _renderAutonym(){
        let picArray = this.state.supplierImgs.map(item => item.img);
        return (
            <View>
                <View style={s.head}>
                    <SText fontSize="caption" color="999">实名认证</SText>
                </View>
                {
                    this.state.idType === 0 ? null
                        :
                        <Row style={[s.item, s.border_bottom]}>
                            <SText fontSize="body" color="666">企业名称</SText>
                            <SInput
                                placeholder="企业名称"
                                onChangeText={text=>{
                                    this._onChangeText(text, 'companyName')
                                }}
                                onFocus={(event)=>{
                                    this._scrollResponder.scrollResponderScrollNativeHandleToKeyboard(event.target,120,true)
                                }}
                                editable={this.state.edit}
                                value={this.state.companyName}
                                    style={s.input}
                            />
                        </Row>
                }
                <Row style={[s.item, s.border_bottom]}>
                    <SText fontSize="body" color="666">{this.state.idType === 0 ? '身份证号码' : '营业执照注册号'}</SText>
                    <SInput
                        onFocus={(event)=>{
                            this._scrollResponder.scrollResponderScrollNativeHandleToKeyboard(event.target,120,true)
                        }}
                        onChangeText={text=>{
                            this._onChangeText(text, 'idCard')
                        }}
                        editable={this.state.edit}
                        value={this.state.idCard}
                        style={s.input}
                        placeholder={this.state.idType === 0 ? '请输入身份证号' : '请输入营业执照注册号'}
                    />
                </Row>
                <View style={s.idCard_box}>
                    <SText style={{marginBottom: 6}} fontSize="mini" color="666">{this.state.idType === 0 ? '身份证照片' : '营业执照照片'}</SText>
                    <Camera
                        ref={v=> this._autonym = v}
                        showErrorMsg={this._showErrorMsg}
                        picArray={picArray}
                    />
                </View>
            </View>
        )
    }
    /**
     * textinput内容变化回调
     * @param  {[type]} text [description]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    _onChangeText(text, name){
        this.changeState({
            [name]: text
        })
    }

    /**
     * spinner对话框回调
     * @param data
     * @param name
     * @private
     */
    _commonSelectCallback = (data, name)=>{
        console.log('data',data);
        console.log('name',name);
        if(name === 'paymentDays'){
            this.changeState({
                paymentDay:data[0]
            })
        } else if (name === 'billKind'){
            this.changeState({
                billKind:data[0]
            })
        }
    }
    _showErrorMsg(str){
        __STORE.dispatch(UtilsAction.toast(str, 1000));
    }
    /**
     * 创建提交供货商信息
     * @private
     */
    _btnSubmit() {
        console.log('billKind',this.state.billKind);
        if(this.state.paymentDay.key==null) {
            return this._showErrorMsg('请选择结款信息！');
        }
        if(this.state.billKind.key==null) {
            return this._showErrorMsg('请选择增值税发票！');
        }
        if(str.isEmpty(this.state.payeeName)){
            return this._showErrorMsg('收款人姓名不能为空！');
        }
        if(str.isEmpty(this.state.payeeBankName)){
            return this._showErrorMsg('收款人银行不能为空！');
        }
        if(str.isEmpty(this.state.payeeCardNumber)){
            return this._showErrorMsg('银行卡号不能为空！');
        }
        if(str.isEmpty(this.state.payeeMobilePhone)){
            return this._showErrorMsg('预留手机号不能为空！');
        }
        if(this.state.wholesaleMarketChoice.length<=0) {
            return this._showErrorMsg('请选择批发市场！');
        }
        if(str.isEmpty(this.state.idCard)){
            return this.state.idType === 1?this._showErrorMsg('请输入营业执！'):this._showErrorMsg('请输入身份证号码！');
        }
        if (this._autonym._submit()==null||this._autonym._submit().length<=0) {
            return this.state.idType === 1?this._showErrorMsg('请上传营业执照照片！'):this._showErrorMsg('请上身份证图片！');
        }
        let param = {
            // showBrand: this.state.showBrand,
            //开发票形式
            billKind: this.state.billKind.key,
            //营业执照照片
            companyImgs: this.state.idType === 1 ? this._autonym._submit() : [],
            //企业名称
            companyName: this.state.companyName,
            //	身份证号码或者营业执照
            idCard: this.state.idCard,
            //	收款银行
            payeeBankName:this.state.payeeBankName,
            //银行卡号
            payeeCardNumber:this.state.payeeCardNumber,
            //预留手机号
            payeeMobilePhone:this.state.payeeMobilePhone,
            //收款人
            payeeName:this.state.payeeName,
            //账期
            paymentDays:this.state.paymentDay.key,
            //供货商品牌
            supplierBrand: this.state.supplierBrand,
            //供应商id
            supplierId: this.state.supplierId,
            //身份证图片
            supplierImgs: this.state.idType === 0 ? this._autonym._submit() : [],
            //批发市场所在地
            wholesaleMarkets: this.state.wholesaleMarketChoice.map( item => {return {
                cityName: item.value,
                wholesaleMarketAddress: item.wholesaleMarketAddress,
                wholesaleMarketName: item.name
            }})
        }
        //品牌信息不为空时 图片和介绍必填 --目前后端未添加品牌信息 所以不传
        // if(!str.isEmpty(this.state.supplierBrand)){
        //     let brandPicUrls = this._brand._submit();
        //     if(brandPicUrls.length === 0||str.isEmpty(this.state.brandIntroduce)){
        //         return this._showErrorMsg('请完善品牌信息！');
        //     }
        //     else{
        //         // param['brandPicUrls'] = brandPicUrls;
        //         // param['brandIntroduce'] = this.state.brandIntroduce;
        //     }
        // }
        commonRequest({
            apiKey: 'createSupplierDetailInfoKey',
            withLoading: true,
            objectName: 'detailInfoCreateDO',
            params: param
        }).then( (res) => {
            let data = res.data;
            if(res.data){
                this._toSupplierList()
                // this.changeState({
                // })
                // this.navigator().pop();
            }
        }).catch( err => {})

    }
}