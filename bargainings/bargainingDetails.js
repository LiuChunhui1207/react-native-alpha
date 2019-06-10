/**
 *
 * 项目名称：caimi-rn
 * 文件描述： 议价申请详情
 *
 * NO_AUDIT(0, "待处理"),
 AUDIT_SUCCESS(1, "已通过"),
 AUDIT_FAIL(2,"被拒绝");
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/6/19 16:26
 * 修改人：cfy
 * 修改时间：17/6/19 16:26
 * 修改备注：
 * @version
 */
import React from 'react';
import {
    View,
    StyleSheet,
    ListView,
    RefreshControl,
    Image,
    TouchableOpacity,
    InteractionManager,
    ScrollView
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page,Row,CommonSelect,SInput,SXCModal,GalleryList} from 'components';
import {UtilsAction} from 'actions';
import KeyboardSpacer from 'react-native-keyboard-spacer';
var Dimensions = require('Dimensions');
var {width} = Dimensions.get('window');
import {str} from 'tools';
import {IC_LAUNCHER,ARROW_LEFT,IconArrowDownGreen,IconArrowUpRed,IconBellYellow,IconHistoryBlue,IconPencilBlue} from 'config'
let s = SStyle({
    itemBase:{
        backgroundColor:'#fff',
        alignItems:'center',
        paddingTop:20,
        paddingBottom:30,
        marginTop:10
    },
    frame:{
        borderRadius:3,
        height:18,
        borderWidth:1,
        alignItems:'center',
        paddingRight:10,
        marginTop:15

    },
    frameBule:{
        borderColor:'#0C90FF',
    },
    frameGreen:{
        borderColor:'#4FD7A2',
    },
    frameOrange:{
        borderColor:'#FF7043',
    },
    status:{
        borderTopLeftRadius:3,
        borderBottomLeftRadius:3,
        alignItems:'center',
        justifyContent:'center',
        height:18,
        paddingLeft:10,
        paddingRight:10
    },
    cardWhite:{
        borderRadius:5,
        borderWidth:1,
        borderColor:'#EEE',
        backgroundColor:'#fff',
        paddingLeft:10,
        paddingRight:10
    },
    iconArrow:{
        width:7,
        height:12,
        marginRight:5
    },
    iconBell:{
        width:15,
        height:18,
        marginRight:5
    },
    iconHistory:{
        width:17,
        height:17,
        marginRight:5
    },
    iconPencil:{
        width:16,
        height:16,
        marginRight:5
    },
    iconImg:{
        width:75,
        height:75,
        marginRight:10
    },
    borderBottom:{
        borderBottomWidth:1,
        borderColor:'#F1F1F6'
    },
    btn:{
        borderRadius:5,
        justifyContent:'center',
        alignItems:'center',
        height:45
    },
    btn_dialog:{
        flex:1,
        height:40,
        justifyContent:'center',
        alignItems:'center'
    },
});
module.exports = class BargainingDetails extends SComponent{
    constructor(props){
        super(props)
        this.state={
            pageLoading:true
        }
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this._getWebData();
        })
    }
    _getWebData=()=>{
        const bargainingId = this.getRouteData('bargainingId');
        commonRequest({
            apiKey: 'queryBargainingOrderDetailKey',
            objectName: 'bargainingQueryDO',
            params: {
                bargainingId: bargainingId,
            }
        }).then( (res) => {
            let {data} = res;

            this.changeState({
                pageLoading:false,
                ...data,
            });
        }).catch( err => {
            this.changeState({
                pageLoading:false,
            });
        })
    }
    _renderLeft(){
        <View >
            <Image source={ARROW_LEFT} style={s.backIcon} />
        </View>
    }
    render(){
        return(
            <Page
                title='议价申请详情'
                pageLoading={this.state.pageLoading}
                back={()=>this.navigator().pop()}
            >
                <ScrollView >
                    {this._renderBell()}
                    {this._renderBaseInfo()}
                    {this._renderPersonInfo()}
                    {this._renderGoodsInfo()}
                    {this._renderSupplierInfo()}
                    {this._renderAction()}
                </ScrollView>
                <SXCModal
                    style={{justifyContent: 'center', alignItems: 'center'}}
                    animated="slide"
                    ref={view => this._sxcmodal = view}>
                    <ModalContent
                        btnAffirm={this._btnAffirm}
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
     * @Description: 消息提醒
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/19 18:11
     */
    _renderBell(){
        if(str.isEmpty(this.state.warnTitle)){
            return null
        }
        return(
            <Row style={{backgroundColor:'#FFFCF1',height:38,alignItems:'center',paddingLeft:10}}>
                <Image style={s.iconBell} source={IconBellYellow}/>
                <SText fontSize='mini' color='#F6A624' >{this.state.warnTitle}</SText>
            </Row>
        )
    }
    _getGoodsNumDes=()=>{
        if (str.isEmpty(this.state.bargainingItemDTOs)){
            return ''
        }else {
            return '共'+this.state.bargainingItemDTOs.length+'件商品'
        }
    }
    _getFrameColor=()=>{
        if (this.state.auditStatus==0){
            return s.frameBule;
        }else  if (this.state.auditStatus==1){
            return s.frameGreen;
        }else {
            return s.frameOrange;
        }
    }
    _getFrameBg=()=>{
        if (this.state.auditStatus==0){
            return {backgroundColor:'#1E93FB'};
        }else  if (this.state.auditStatus==1){
            return {backgroundColor:'#00C478'};
        }else {
            return {backgroundColor:'#FF7043'};
        }
    }
    _getFrameFontColor=()=>{
        if (this.state.auditStatus==0){
            return '#1E93FB';
        }else  if (this.state.auditStatus==1){
            return '#00C478';
        }else {
            return '#FF7043';
        }
    }
    /**
     * @Description: 基础议价信息
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/19 18:11
     */
    _renderBaseInfo(){
        return(
            <View style={s.itemBase}>
                <SText fontSize='body' color='#021D33'>{this.state.catName}</SText>
                <SText fontSize='mini' color='#768591' style={{marginTop:5}}>{this._getGoodsNumDes()}</SText>
                <Row style={[s.frame,this._getFrameColor()]}>
                    <View style={[s.status,this._getFrameBg()]}>
                        <SText fontSize='mini' color='white' >{this.state.auditStatusDesc}</SText>
                    </View>
                    <SText fontSize='mini' color={this._getFrameFontColor()}  style={{marginLeft:10}}>{this.state.auditStatusDetailDesc}</SText>
                </Row>
                <Row style={{marginTop:25}}>
                    <View style={{flex:1,borderColor:'#F9F9FB',borderRightWidth:1,alignItems:'center'}}>
                        <SText fontSize='mini' color='#7D8C97' >拿货量</SText>
                        <Row style={{marginTop:5,alignItems:'flex-end'}}>
                            <SText fontSize='body' color='#021D33' >{this.state.grossProfitDTO?this.state.grossProfitDTO.totalItemNum:''}</SText>
                            <SText fontSize='mini' color='#021D33'  style={{marginBottom:2,marginLeft: 1}}>件</SText>
                        </Row>
                    </View>
                    <View style={{flex:1,borderColor:'#F9F9FB',borderRightWidth:1,alignItems:'center'}}>
                        <SText fontSize='mini' color='#7D8C97' >议价后一毛净额</SText>
                        <Row style={{marginTop:5,alignItems:'flex-end'}}>
                            <SText fontSize='body' color='#021D33' >{this.state.grossProfitDTO?this.state.grossProfitDTO.bargainingOneGrossProfit:''}</SText>
                            <SText fontSize='mini' color='#021D33'  style={{marginBottom:2,marginLeft: 1}}>元</SText>
                        </Row>
                        {
                            this.state.grossProfitDTO&&this.state.grossProfitDTO.trend!=0?
                                <Row style={{marginTop:3}}>
                                    <Image style={s.iconArrow} source={this.state.grossProfitDTO.trend==1?IconArrowUpRed:IconArrowDownGreen}/>
                                    <SText fontSize='mini' color='#021D33'  >{this.state.grossProfitDTO?this.state.grossProfitDTO.trendNum:''}</SText>
                                </Row>
                            :null
                        }

                    </View>
                    <View style={{flex:1,borderColor:'#F9F9FB',borderRightWidth:1,alignItems:'center'}}>
                        <SText fontSize='mini' color='#7D8C97' >本月一毛净额</SText>
                        <Row style={{marginTop:5,alignItems:'flex-end'}}>
                            <SText fontSize='body' color='#021D33' >{this.state.grossProfitDTO?this.state.grossProfitDTO.monthOneGrossProfit:''}</SText>
                            <SText fontSize='mini' color='#021D33'  style={{marginBottom:2,marginLeft: 1}}>元</SText>
                        </Row>
                    </View>
                </Row>
            </View>
        )
    }
    /**
     * @Description:  议价人信息
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/19 18:11
     */
    _renderPersonInfo(){
        return(
            <View style={{paddingLeft:15,paddingRight:15,paddingTop:10}}>
                <View style={s.cardWhite}>
                    <Row style={[s.borderBottom,{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}]}>
                        <SText fontSize='caption_p' color='#768591' style={{flex:1}}>申请人</SText>
                        <Row style={{alignItems:'center'}}>
                            <SText fontSize='caption_p' color='#051B28'>{this.state.applyUserName}</SText>
                            {/*<View style={{width:1,height:15,backgroundColor:'#F3F3F8',marginLeft:10,marginRight:10}}/>*/}
                            {/*<TouchableOpacity style={{flexDirection:'row',alignItems:'center'}}>*/}
                                {/*<Image style={s.iconHistory} source={IconHistoryBlue}/>*/}
                                {/*<SText fontSize='caption_p' color='#0C90FF'>历史</SText>*/}
                            {/*</TouchableOpacity>*/}
                        </Row>
                    </Row>
                    <Row style={[s.borderBottom,{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}]}>
                        <SText fontSize='caption_p' color='#768591' style={{flex:1}}>申请时间</SText>
                        <SText fontSize='caption_p' color='#051B28'>{this.state.applyBargainingDate}</SText>
                    </Row>
                    <Row style={[s.borderBottom,{backgroundColor:'#fff',paddingTop:7,paddingBottom:7,alignItems:'center'}]}>
                        <SText fontSize='caption_p' color='#768591' style={{flex:1}}>议价客户</SText>
                        <View style={{alignItems:'flex-end'}}>
                            <SText fontSize='caption_p' color='#051B28'>{this.state.buyerName}</SText>
                            <SText fontSize='mini_p' color='#7E8A90' style={{marginTop:3}}>{this.state.storehouseName}</SText>
                        </View>
                    </Row>
                    <Row style={[s.borderBottom,{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}]}>
                        <SText fontSize='caption_p' color='#768591' style={{flex:1}}>议价原因</SText>
                        <SText fontSize='caption_p' color='#051B28'>{this.state.bargainType}</SText>
                    </Row>
                    {this.state.additionReason?
                        <View style={{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}}>
                            <SText fontSize='caption_p' color='#768591' >补充其他原因</SText>
                            <SText fontSize='caption_p' color='#051B28' style={{marginTop:10}}>{this.state.additionReason}</SText>
                        </View>
                        :null}

                </View>
            </View>
        )
    }
    /**
     * @Description: 商品信息
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/20 10:03
     */
    _renderGoodsInfo=()=> {
        if (str.isEmpty(this.state.bargainingItemDTOs)){
            return null
        }
        console.log('bargainingItemDTOs');
        console.log(this.state.bargainingItemDTOs);
        return (
            <View style={{paddingLeft:15,paddingRight:15}}>
                {
                    this.state.bargainingItemDTOs.map((item,index)=>{
                        return(
                            <View style={[s.cardWhite,{marginTop:10}]}>
                                <Row style={[s.borderBottom,{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}]}>
                                    <View style={{flex:1}}>
                                        <SText fontSize='caption_p' color='#051B28' >{item.spuName}</SText>
                                        <SText fontSize='mini_p' color='#7E8A90' style={{marginTop:5}} >{item.itemSpecies}</SText>
                                    </View>
                                    <View style={{}}>
                                        <SText fontSize='caption_p' color='#051B28' >{item.applyPrice+'元'}</SText>
                                        <SText fontSize='mini_p' color='#7E8A90' style={{marginTop:5}} >申请价格</SText>
                                    </View>
                                    <View style={{marginLeft:5,alignItems:'flex-end'}}>
                                        <SText fontSize='caption_p' color='#051B28' >{item.itemNum+'件'}</SText>
                                        <SText fontSize='mini_p' color='#7E8A90' style={{marginTop:5}} >拿货量</SText>
                                    </View>
                                </Row>
                                {
                                    str.isEmpty(item.showEntries)?null:
                                        item.showEntries.map((childItem,childIndex)=>{
                                            return(
                                                <Row style={[s.borderBottom,{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}]}>
                                                    <SText fontSize='caption_p' color='#768591' style={{flex:1}}>{childItem.key}</SText>
                                                    <SText fontSize='caption_p' color='#051B28'>{childItem.value}</SText>
                                                </Row>
                                            )
                                        })
                                }
                                <Row style={[{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}]}>
                                    <SText fontSize='caption_p' color='#768591' style={{flex:1}}>购买上限</SText>
                                    <Row style={{alignItems:'center'}}>
                                        <SInput
                                            style={{minWidth:120,fontSize:13,textAlign:'right'}}
                                            value={item.edit?
                                                item.limitBuyNum?item.limitBuyNum+'':item.itemNum+''
                                                :item.limitItemNumDesc}
                                            editable={item.edit?item.edit:false}
                                            onChangeText={this._onChangeText.bind(this, index)}
                                            placeholder='请输入购买上限' />

                                        {
                                            item.edit||this.state.auditStatus!=0?null:
                                                <Row>
                                                    <View style={{width:1,height:15,backgroundColor:'#F3F3F8',marginLeft:10,marginRight:10}}/>
                                                    <TouchableOpacity
                                                        onPress={()=>{
                                                            item.edit=true;
                                                            this.changeState();
                                                        }}
                                                        style={{flexDirection:'row',alignItems:'center'}}>
                                                        <Image style={s.iconPencil} source={IconPencilBlue}/>
                                                        <SText fontSize='mini_p' color='#0C90FF'>设置</SText>
                                                    </TouchableOpacity>
                                                </Row>

                                        }

                                    </Row>
                                </Row>
                                {/*<Row style={[{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}]}>*/}
                                    {/*<SText fontSize='caption_p' color='#768591' style={{flex:1}}>客户拿货价</SText>*/}
                                    {/*<SText fontSize='caption_p' color='#051B28'>42.00元/件</SText>*/}
                                {/*</Row>*/}
                            </View>
                        )
                    })
                }
            </View>
        )
    }
    /**
     * @Description: 供货商信息
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/20 11:18
     */
    _renderSupplierInfo(){
        return(
            <View style={{paddingLeft:15,paddingRight:15,marginTop:10,marginBottom:15}}>
                <View style={s.cardWhite}>
                    {str.isEmpty(this.state.supplierName)?null:
                        <Row style={[s.borderBottom,{backgroundColor:'#fff',paddingTop:10,paddingBottom:10}]}>
                            <SText fontSize='caption_p' color='#768591' style={{flex:1}}>拿货供应商</SText>
                            <SText fontSize='caption_p' color='#051B28'>{this.state.supplierName}</SText>
                        </Row>
                    }

                    {/*<ScrollView*/}
                        {/*horizontal={true}*/}
                        {/*style={{marginBottom:10,flex:1}}>*/}
                        {/*{*/}
                            {/*str.isEmpty(this.state.bargainingImages)?null:*/}
                                {/*this.state.bargainingImages.map((item,index)=>{*/}
                                    {/*return(*/}
                                        {/*<Image style={s.iconImg} source={IC_LAUNCHER}/>*/}
                                    {/*)})*/}
                        {/*}*/}
                    {/*</ScrollView>*/}
                    {this._rendermgs()}
                </View>
            </View>
        )
    }
    _rendermgs(){
        if(str.isEmpty(this.state.bargainingImages)){
            return
        }
        let urls = this.state.bargainingImages.map(i=>i.img + '?md5=' + i.md5);
        console.log('urls',urls);
        return (
            <View style={{marginBottom:10}}>
                <SText fontSize='caption_p' color='#768591'  style={{marginTop:10,marginBottom:10}}>补充图片</SText>
                <GalleryList
                    ref={v => this._gallery = v}
                    imageList={urls}
                    component={this._renderImagesView(urls )}
                >
                </GalleryList>
            </View>
        )
    }
    _renderImagesView = (urls) =>{
        console.log('do in renderImageVIew:', this);
        // console.log(ref);
        return (
            <View>
                {
                    urls.map((v, k) => {
                        return (
                            <TouchableOpacity
                                onPress={() => this._gallery._showReview(k)} key={k}>
                                <Image source={{uri: v}}  resizeMode='contain' style={s.iconImg}></Image>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }
    /**
     * @Description: 按钮
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/20 11:52
     */
    _renderAction(){
        if (this.state.showButton){
            return(
                <Row style={{marginLeft:15,marginRight:15,marginBottom:15}}>
                    <TouchableOpacity
                        onPress={()=>{
                            this.changeState({}, ()=> {
                                this._sxcmodal._toggle();
                            })
                        }}
                        style={[s.btn,{backgroundColor:'#E7E7EE',flex:1}]}>
                        <SText fontSize='body' color='#021D33'>不通过</SText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={()=>this._passApply()}
                        style={[s.btn,{backgroundColor:'#00CBC1',marginLeft:10,flex:1}]}>
                        <SText fontSize='body' color='white'>通过</SText>
                    </TouchableOpacity>
                </Row>
            )
        }
    }
    /**
     * 输入框内容变化回调
     * @return {[type]} [description]
     */
    _onChangeText(index, value){
        if(str.isEmpty(this.state.bargainingItemDTOs)||this.state.bargainingItemDTOs.length<=index){
            return
        }
        this.state.bargainingItemDTOs[index].limitBuyNum=value;
        this.changeState();
    }
    /**
     * @Description:  不通过对话框确定回调
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/20 18:37
     */
    _btnAffirm=(reason)=>{
        console.log(reason)
        this._unpassApply(reason);
    }
    /**
     * @Description: 通过申请
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/20 18:38
     */
    _passApply(){
        let limitBuyNums=[];
        if (str.isEmpty(this.state.bargainingItemDTOs)){
            return
        }
        this.state.bargainingItemDTOs.map((item,index)=>{
            let goods={};
            goods.key =item.itemId;
            goods.value=item.limitBuyNum;
            limitBuyNums.push(goods)
        })
        const bargainingId = this.getRouteData('bargainingId');
        commonRequest({
            apiKey: 'agreeBargainingKey',
            objectName: 'bargainingOperateDO',
            params: {
                bargainingId: bargainingId,
                limitBuyNums:limitBuyNums
            },
            withLoading:true
        }).then( (res) => {
            __STORE.dispatch(UtilsAction.toast('操作成功', 1000));
            this.props.route.refresh && this.props.route.refresh();
            this.navigator().pop();
        }).catch( err => {
            this.changeState({
            });
        })
    }
    /**
     * @Description: 申请拒绝
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/20 18:46
     */
    _unpassApply(reason){
        let limitBuyNums=[];
        if (str.isEmpty(this.state.bargainingItemDTOs)){
            return
        }
        if(str.isEmpty(reason)){
            __STORE.dispatch(UtilsAction.toast('请填写拒绝原因', 1000));
            return;
        }
        this.state.bargainingItemDTOs.map((item,index)=>{
            let goods={};
            goods.key =item.itemId;
            goods.value=item.limitBuyNum;
            limitBuyNums.push(goods)
        })
        const bargainingId = this.getRouteData('bargainingId');
        commonRequest({
            apiKey: 'refuseBargainingKey',
            objectName: 'bargainingOperateDO',
            params: {
                bargainingId: bargainingId,
                operateReason:reason
            },
            withLoading:true
        }).then( (res) => {
            __STORE.dispatch(UtilsAction.toast('操作成功', 1000));
            this.props.route.refresh && this.props.route.refresh();
            this.navigator().pop();
        }).catch( err => {
            this.changeState({
            });
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
    _affirm() {
        console.log('_affirm')
        this.props.btnAffirm(this.state.reason);
        this.props.sxcmodal._toggle();
    }
    render() {
        return (
            <View style={{backgroundColor:'#fff',borderRadius:3,paddingLeft:15,paddingRight:15}}>
                <SText style={{ textAlign: 'center', marginTop: 15, marginLeft: 15, marginRight: 10,marginBottom:10}} fontSize="body" color="#021D33">请填写拒绝原因</SText>
                <View style={{borderRadius:5,borderColor:'#EEE',borderWidth:1}}>
                    <SInput
                        style={{fontSize:15,height:100,width:250,padding:10}}
                        value={this.state.reason}
                        onChangeText={(value)=>{
                            this.setState({
                                reason:value
                            })
                        }}
                        multiline={true}
                    />
                </View>

                <Row style={{borderTopWidth:1,borderColor:'#F8F8F8',alignItems:'center',marginTop:15}}>
                    <TouchableOpacity onPress={()=>this.props.sxcmodal._toggle()}  style={[s.btn_dialog]}>
                        <SText fontSize="body" color="666" style={{color:"#5F646D"}} >取消</SText>
                    </TouchableOpacity>
                    <View style={{borderLeftWidth:1,borderColor:'#F8F8F8',width:1,height:20}}/>
                    <TouchableOpacity onPress={()=>this._affirm()} underlayColor='#0a568e' style={[s.btn_dialog]}>
                        <SText fontSize="body" color="666" style={{color:"#329EF4"}} >确认</SText>
                    </TouchableOpacity>
                </Row>
            </View>
        );
    }

}