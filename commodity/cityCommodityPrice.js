/**
 *
 * 项目名称：caimi-rn
 * 文件描述： 商品价格编辑 城市维度
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/5/12 16:29
 * 修改人：cfy
 * 修改时间：17/5/12 16:29
 * 修改备注：
 * @version
 */
import React from 'react';
import {
    View,
    TouchableOpacity,
    Platform,
    Image,
    ScrollView,
    TextInput
} from 'react-native';
import {SStyle, SComponent, SText,SItem} from 'sxc-rn';
import {Page, Row, Button, SInput,SXCModal} from 'components';
import {IconPenBlue,IconDelete} from 'config'
var Dimensions = require('Dimensions');
var {width} = Dimensions.get('window');
let s = SStyle({
    price: {
        backgroundColor: '#1588FE',
        width: '@window.width',
        padding:15
    },
    iconPen:{
        width:24,
        height:24
    },
    btnPen:{
        width:46,
        height:46,
        borderRadius:23,
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center'
    },
    priceItem: {
        backgroundColor: '#fff',
        borderRightWidth:1,
        borderColor:'#FCFCFD',
        flex:1,
    },
    recordTitle:{
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:'#fff',
        borderBottomWidth:1,
        borderColor:'#F7F7FA'
    },
    recordItem:{
        paddingLeft:15,
        paddingRight:15,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:'#fff',
        borderBottomWidth:1,
        borderColor:'#EAEAEA'
    } ,
    modal_content: {
        backgroundColor: '#fff',
        borderRadius:5,
        alignItems:'center',
        marginLeft:30,
        marginRight:30,

    },
    btn_dialog:{
        flex:1,
        height:40,
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center',
    },
    iconClear:{
        width:20,
        height:20
    },
    input:{
        flex:1,
        marginLeft:20,
        textAlign:'center',
        marginBottom:10,
        height:40,
        color:'#333',
        fontSize:16
    }
});
module.exports = class CityCommodityPrice extends SComponent{
    constructor(props){
        super(props)
        this.state={
            recordList:[{},{},{}]
        }
    }
    /**
     * @Description:  基础定价 UI
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/12 18:12
     */
    _renderBasePrice(){
        return(
            <View style={{marginTop:10}}>
                <View style={s.price}>
                    <SText fontSize='body' color='white'>基准定价</SText>
                    <Row style={{marginTop:10}}>
                        <View style={{flex:1}}>
                            <Row>
                                <SText fontSize='num' color='white'>基准定价</SText>
                                <SText fontSize='body' color='white' style={{marginTop:7}}>元</SText>
                            </Row>
                            <SText fontSize='caption' color='#8ac3fd'  style={{marginTop:5}}>56.24元/斤</SText>
                            <SText fontSize='caption' color='#fff'  style={{marginTop:10}}>张元武 25 分钟前</SText>
                        </View>
                        <TouchableOpacity
                            style={[s.btnPen]}
                            onPress={()=>this._btnEditPrice()}
                        >
                            <Image source={IconPenBlue} style={s.iconPen}/>
                        </TouchableOpacity>
                    </Row>
                    <Row style={{marginTop:10,borderTopWidth:1,borderColor:'#2C8EFC',paddingTop:10,alignItems:'center'}}>
                        <View style={{height:20,borderRadius:10,justifyContent:'center',paddingRight:7,paddingLeft:7,backgroundColor:'#1675EA'}}>
                            <SText fontSize='mini' color='#fff'>预估利润</SText>
                        </View>
                        <SText fontSize='mini' color='#fff' style={{marginLeft:5}}>一毛净额：2017元</SText>
                        <SText fontSize='mini' color='#fff' style={{marginLeft:5}}>一毛率：2017元</SText>
                    </Row>
                </View>
                <View style={{padding:15,backgroundColor:'#fff'}}>
                    <Row>
                        <View style={s.priceItem}>
                            <SText fontSize='caption' color='#8D99A3' >最近一天采价</SText>
                            <SText fontSize='body' color='333' style={{marginTop:10}}>250.8元</SText>
                            <SText fontSize='caption' color='999' style={{marginTop:3}}>250.8元</SText>
                            <SText fontSize='caption' color='999' style={{marginTop:15}}>昨天</SText>
                        </View>
                        <View style={[s.priceItem,{marginLeft:15}]}>
                            <SText fontSize='caption' color='#8D99A3' >最近一天采价</SText>
                            <SText fontSize='body' color='333' style={{marginTop:10}}>250.8元</SText>
                            <SText fontSize='caption' color='999' style={{marginTop:3}}>250.8元</SText>
                            <SText fontSize='caption' color='999' style={{marginTop:15}}>昨天</SText>
                        </View>
                        <View style={[s.priceItem,{marginLeft:15,borderRightWidth:0}]}>
                            <SText fontSize='caption' color='#8D99A3' >最近一天采价</SText>
                            <SText fontSize='body' color='333' style={{marginTop:10}}>250.8元</SText>
                            <SText fontSize='caption' color='999' style={{marginTop:3}}>250.8元</SText>
                            <SText fontSize='caption' color='999' style={{marginTop:15}}>昨天</SText>
                        </View>
                    </Row>
                </View>
            </View>
        )
    }
    /**
     * @Description: 价格预览
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/12 19:07
     */
    _renderPricePreview(){
        return(
            <View style={{marginTop:10}}>
                <SItem
                    disabled={true}
                    content='价格预览'
                    contentStyle={{fontSize:16,color:'#333'}}
                    label='在erp后台修改定价规则'
                    labelStyle={{fontSize:14,color:'#999'}}
                />
            </View>
        )
    }
    /**
     * @Description: 价格记录
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/12 19:08
     */
    _renderPriceRecord(){
        return(
            <View style={{marginTop:10}}>
                <SItem
                    disabled={true}
                    content='定价记录'
                    contentStyle={{fontSize:16,color:'#333'}}
                />
                <Row style={s.recordTitle}>
                    <SText fontSize='caption' color='#ACB5BC' style={{flex:2}}>定价人</SText>
                    <SText fontSize='caption' color='#ACB5BC' style={{flex:1}}>调价前</SText>
                    <SText fontSize='caption' color='#ACB5BC' style={{flex:1}}>调价后</SText>
                    <SText fontSize='caption' color='#ACB5BC' style={{flex:1}}>规则改动</SText>
                </Row>
                {
                    this.state.recordList.map((item, key)=>{
                        return(
                            <Row style={s.recordItem}>
                                <View style={{flex:2}}>
                                    <SText fontSize='body' color='333' >定价人</SText>
                                    <SText fontSize='caption' color='#ACB5BC' style={{marginTop:3}}>05-15 10:11:11</SText>
                                </View>
                                <SText fontSize='body' color='666' style={{flex:1}}>65.00</SText>
                                <SText fontSize='body' color='#ACB5BC' style={{flex:1}}>66.00</SText>
                                <SText fontSize='body' color='333' style={{flex:1}}>是</SText>
                            </Row>
                        )
                    })
                }
            </View>
        )
    }

    render(){
        return(
            <ScrollView style={{flex:1}}>
                {this._renderBasePrice()}
                {this._renderPricePreview()}
                {this._renderPriceRecord()}
                <SXCModal
                    style={{justifyContent: 'center', alignItems: 'center'}}
                    animated="slide"
                    ref={view => this._sxcmodal = view}>
                    <ModalContent
                        btnAffirm={this._btnAffirm}
                        sxcmodal={this._sxcmodal}
                    />
                </SXCModal>
            </ScrollView>
        )
    }
    _btnAffirm=()=> {

    }
   /**
    * @Description:  编辑报价
    * @param
    * @return
    * @throws
    * @author       chengfy@songxiaocai.com
    * @date         17/5/17 14:28
    */
    _btnEditPrice=()=> {
        this.changeState({
        }, ()=> {
            this._sxcmodal._toggle();
        })
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
                <SText fontSize="caption" color="666" style={{marginTop:10}}>基准定价(元/件)</SText>

                <Row style={{paddingLeft:10,paddingRight:10,alignItems:'center'}}>
                    <TextInput
                        style={s.input}
                        placeholder="请填写定价"
                    />
                    <Image source={IconDelete} style={s.iconClear}/>
                </Row>
                <View style={{borderBottomWidth:1,borderColor:'#e5e5e5',marginLeft:10,marginRight:10,width:width-90,alignItems:'center',paddingBottom:10}}>
                    <SText  fontSize="mini" color="666">55.55元/斤</SText>
                </View>
                <Row style={{paddingBottom:15,paddingRight:15,paddingLeft:15,paddingTop:15}}>
                    <Row style={{flex:1,alignItems:'center'}}>
                        <SText  fontSize="mini" color="666">预估一毛净额(元)：</SText>
                        <SText  fontSize="caption" color="333">88.88</SText>
                    </Row>
                    <Row style={{flex:1,justifyContent:'flex-end',alignItems:'center'}}>
                        <SText  fontSize="mini" color="666">预估一毛率：</SText>
                        <SText  fontSize="caption" color="333">88.88</SText>
                    </Row>
                </Row>
                <Row style={{alignItems:'center',borderTopWidth:1,borderColor:'#e5e5e5'}}>
                    <TouchableOpacity onPress={()=>this.props.sxcmodal._toggle()}  style={[s.btn_dialog,{borderBottomLeftRadius:5}]}>
                        <SText fontSize="body" color="666" style={{color:"#636871"}} >取消</SText>
                    </TouchableOpacity>
                    <SText fontSize="body" color="#e5e5e5" >|</SText>
                    <TouchableOpacity onPress={()=>this._affirm(this.props.currentRow.rowData)} style={[s.btn_dialog,{borderBottomRightRadius:5}]}>
                        <SText fontSize="body" color="666" style={{color:"#009AF4"}} >确认</SText>
                    </TouchableOpacity>
                </Row>
            </View>
        );
    }
}