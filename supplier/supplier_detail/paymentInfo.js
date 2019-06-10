/**
 * 供货商信息-结款信息
 * @author: chengfy@songxiaocai.com
 * @description:
 * @Date: 17/3/28 16:35
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
import {Page, SXCRadio, Row, SInput, CommonSelect, Camera, GalleryList,    Button} from 'components';
import {UtilsAction} from 'actions';
import {str} from 'tools';
import { ICON_DOWN_L} from 'config';
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
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems:'center',
    },
    radio_group: {
        flex: 1,
        justifyContent: 'flex-end',
        flexDirection: 'row'
    },
    brand_img: {
        marginTop: 8,
        width: 70,
        height: 70,
        marginRight: 16
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
        color: '999'
    },
    icon_add_box: {
        flex: 1,
        alignItems: 'flex-end'
    },
    icon_add: {
        width: 14,
        height: 15
    },
    idCard_box: {
        paddingTop: 15,
        paddingLeft: 15,
        paddingBottom: 11,
        backgroundColor: 'fff'
    },
    iconDown: {
        width: 17,
        height: 10,
        marginLeft: 10
    }
});
/**
 * 供货商结款信息
 */
module.exports=class PaymentInfo extends SComponent{
    constructor(props) {
        super(props);
        this.state={
            edit: false,
            //页面数据 服务端返回
            pageData:{},
            //spinner对话框选中项
            currentSelected:[],
            //spinner对话框数据源
            currentDataSource:[],
            //当前结款账期
            paymentDaysUnit:{},
            //当前结款账期描述
            paymentDaysDes:{},
            //当前是否可以开票
            billsKindUnit:{},
            //当前是否可以开票描述
            billKindDes:{},

        }
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this._getData();
        })
    }

    /**
     * 获取编辑供应商结款信息初始化数据
     * @return {[type]} [description]
     */
    _getData(){
        commonRequest({
            apiKey: 'querySupplierPayInfoUpdateInitKey',
            withLoading: true,
            objectName: 'supplyUserQueryDO',
            params: {
                supplierId: this.props.route.data.supplierId
            }
        }).then( (res) => {
            let pageData = res.data;
            this.changeState({
                pageData:pageData,
                paymentDaysUnit:pageData.paymentDaysUnit,
                paymentDaysDes:pageData.paymentDaysDes,
                billsKindUnit:pageData.billsKindUnit,
                billKindDes:pageData.billKindDes,
              ...pageData


            });
            console.log("pageData",this.state.pageData)
        }).catch( err => {})
    }

    render(){
        return(
            <View style={s.flex1}>
                <ScrollView style={s.flex1}>
                    <View style={s.head}>
                        <SText fontSize="caption" color="999">基础信息</SText>
                    </View>
                    <Row style={[s.item, s.border_bottom]}>
                        <SText fontSize="body" color="666">结款信息</SText>
                        <TouchableOpacity  disabled ={!this.state.edit} onPress={()=>this._showCommonSelect('paymentDays','value',this.state.pageData.paymentDays,this.state.paymentDaysUnit,this.state.paymentDaysDes)} style={s.flex_right}>
                            <SInput
                                style={[s.input,{color:'#333333'}]}
                                editable={false}
                                placeholder="请选择"
                                value={this.state.paymentDaysDes==null?'':this.state.paymentDaysDes}/>
                            {
                                this.state.edit ?
                                    <Image source={ICON_DOWN_L} style={s.iconDown}/>
                                    :
                                    null
                            }
                        </TouchableOpacity>
                    </Row>
                    <Row style={[s.item, s.border_bottom]}>
                        <SText fontSize="body" color="666">增值税发票</SText>
                        <TouchableOpacity  disabled ={!this.state.edit} onPress={()=>this._showCommonSelect('billKind','value',this.state.pageData.billsKinds,this.state.billsKindUnit,this.state.billKindDes)} style={s.flex_right}>
                            <SInput
                                style={[s.input,{color:'#333333'}]}
                                editable={false}
                                placeholder="请选择"
                                value={this.state.billKindDes==null?'':this.state.billKindDes}/>
                            {
                                this.state.edit ?
                                    <Image source={ICON_DOWN_L} style={s.iconDown}/>
                                    :
                                    null
                            }
                        </TouchableOpacity>
                    </Row>
                    <View style={s.head}>
                        <SText fontSize="caption" color="999">打款信息</SText>
                    </View>
                    <Row style={[s.item, s.border_bottom]}>
                        <SText fontSize="body" color="666">收款人姓名</SText>
                        <SInput
                            onChangeText={text=>{
                                this._onChangeText(text, 'payeeName')
                            }}
                            placeholder={this.state.edit ? '请输入':''}
                            editable={this.state.edit}
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
                            placeholder={this.state.edit ? '请输入':''}
                            editable={this.state.edit}
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
                            placeholder={this.state.edit ? '请输入':''}
                            editable={this.state.edit}
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
                            placeholder={this.state.edit ? '请输入':''}
                            editable={this.state.edit}
                            value={this.state.payeeMobilePhone}
                            style={s.input}
                        />
                    </Row>
                </ScrollView>
                <Button onPress={this._btnClick} type='green' size='large'>{this.state.edit ? '保存' : '编辑'}</Button>
                <CommonSelect
                    keyName={this.state.keyName}
                    ref={ view => this._commonSelect = view}
                    selectCallback={this._commonSelectCallback}
                    dataSource={this.state.currentDataSource}
                    name={this.state.currentName}
                    selected={this.state.currentSelected}
                    multiple={false}
                />
            </View>
        )
    }
    /**
     * 显示modal框
     * @return {[type]} [description]
     */
    _showCommonSelect(name, keyName,currentDataSource,currentSelectedKey,currentSelectedValue){
        if (this.state.edit) {
            let currentSelected ={};
            currentSelected['key']=currentSelectedKey;
            currentSelected['value']=currentSelectedValue;
            let currentObj = {
                keyName: keyName,
                currentName: name,
                currentSelected: [currentSelected] || [],
                currentDataSource: currentDataSource || []
            }
            this.changeState(currentObj, ()=>{
                this._commonSelect._toggle()
            })
        }
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
                paymentDaysDes :data[0].value,
                paymentDaysUnit :data[0].key,
            })
        } else if (name === 'billKind'){
            this.changeState({
                billKindDes :data[0].value,
                billsKindUnit :data[0].key,
            })
        }
    }
    _onChangeText(text, name){
        this.changeState({
            [name]: text
        })
    }
    _showErrorMsg(str){
        __STORE.dispatch(UtilsAction.toast(str, 1000));
    }
    _btnClick=()=> {
        //提交数据
        if (this.state.edit) {
            if(this.state.paymentDaysUnit==null) {
                return this._showErrorMsg('请选择结款信息！');
            }
            if(this.state.billsKindUnit==null) {
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
            let bizParam={
                //供货商id
                supplierId:this.props.route.data.supplierId,
                //结款账期
                paymentDays:this.state.paymentDaysUnit,
                //发票形式
                billKind:this.state.billsKindUnit,
                //收款银行
                payeeBankName:this.state.payeeBankName,
                //银行卡号
                payeeCardNumber:this.state.payeeCardNumber,
                //预留手机号
                payeeMobilePhone:this.state.payeeMobilePhone,
                //收款人姓名
                payeeName:this.state.payeeName
            }
            commonRequest({
                apiKey: 'updateSupplierPayInfoKey',
                withLoading: true,
                objectName: 'payInfoEditDO',
                params: bizParam
            }).then( (res) => {
                let data = res.data;
                if(res.data){
                    this.changeState({
                        edit: false
                    })
                }
            }).catch( err => {})
        }else {
            this.changeState({
                edit: true
            })
        }
    }

}
