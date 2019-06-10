/**
 *
 * 项目名称：caimi-rn
 * 文件描述：拜访详情页面
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/4/25 17:25
 * 修改人：cfy
 * 修改时间：17/4/25 17:25
 * 修改备注：
 * @version
 */
import React from 'react';
import ReactNative,{View,Text,ListView,Image,ScrollView,TouchableOpacity,TextInput,Keyboard,InteractionManager,Platform} from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {SComponent, SText, SToast, SStyle} from 'sxc-rn';
import {Page,RefreshList,GalleryList} from 'components';
import Dimensions from 'Dimensions';
import {UtilsAction} from 'actions';

const {height, width} = Dimensions.get('window');
const PURPLE = '#8B5DAD';

const TEXT_GREY = '#5F646E';
const BORDER_GREY = '#EDEFF0';
const CONTENT_WHITE = '#FEFEFE';
import {
    IconPen
} from 'config';

const s = SStyle({
    container: {
        flex:1,
    },
    basicInfo: {

    },
    caption: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        height: 44,
        backgroundColor: '#FFFCF1',
        borderBottomWidth: 'slimLine',
        borderColor: '#EDEDED',
    },
    skuInfo: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 44,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 'slimLine',
        borderColor: '#EDEDED',
    },
    salesInfo: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        height: 44,
        backgroundColor: '#fff',
        borderBottomWidth: 'slimLine',
        borderColor: '#B2B2B2',
    },
    reason: {
        marginTop: 10
    },
    channel: {
        marginTop: 10
    },
    channelItem: {
        marginBottom: 5
    },
    channelHeader: {
        flex: 0,
        paddingLeft: 20,
        paddingTop: 20,
        height: 78,
        backgroundColor: '#FCFCFC',
        borderBottomWidth: 'slimLine',
        borderColor: '#EDEDED',
    },
    channelBody: {
        backgroundColor: '#fff',
        paddingLeft: 20,
        paddingTop: 25,
    },
    importPriceInfo:{
        flex: 0,
        flexDirection: 'row',
    },
    imgList: {
        flex: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginTop: 20
    },
    uploadImg: {
        width: '@68*window.width/375',
        height: '@68*window.width/375',
        borderColor: 'e5',
        borderWidth: 'slimLine',
        marginRight: 10,
        marginBottom: 10
    },
    channelFooter: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        height: 32,
        backgroundColor: '#FCFCFC',
    },
    comment: {
        paddingLeft:20,
        paddingRight:20,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:'#fff'
    },
    borderTop:{
        borderTopWidth:1,
        borderColor:'#ddd'
    },
    borderBottom:{
        borderBottomWidth:1,
        borderColor:'#ddd'
    },
    comment_item: {
        flexDirection:'row',
        marginTop:10
    },
    input: {
        height: 40,
        flex: 1,
        textAlign: 'left',
        backgroundColor:'#fff',
        borderRadius:5,
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:5
    }
});
module.exports=class VisitRecordDetails extends SComponent {
    ds = new ListView.DataSource({rowHasChanged: (r1, r2) =>  r1 !== r2 });
    constructor(props){
        super(props);
        this.state = {
            pageLoading: true,
            loading: false,
            daySales: null,
            daySalesUnitStr: '',
            skuEvalStr: '',
            skuEvalTagStrs: [],
            notBuyReasonEnumStrs: [],
            skuResearchChannels: [],
            keyboardHeight:0,
            enableBottomRefresh: false,//历史数据分页
            //评论列表
            commentList:[],
            haveReadMessages:'',
            haveReadUserNames:'',
            pickHouseInfo:'',
            interactionId:'',
            totalCommentNum:'',
            evaSwitch:'',//1：开启评论功能， 2： 关闭
        };
        // this.researchId = 3;
        this.researchId = this.props.route.data.researchId ? this.props.route.data.researchId : null;
        // this.skuId = 4474;
        this.skuId = this.props.route.data.skuId ? this.props.route.data.skuId : null;
        // this.skuId = this.getRouteData('skuId') ? this.getRouteData('skuId') : null; //1->已经存在的 2->新增的货品
        // this.visitSKUType = 1;
        this.visitSKUType = this.props.route.data.visitSKUType ? this.props.route.data.visitSKUType : null;
        // this.visitSKUType = this.getRouteData('visitSKUType') ? this.getRouteData('visitSKUType') : null;
        this.haveSkuVisitInfo = this.props.route.data.haveSkuVisitInfo ? this.props.route.data.haveSkuVisitInfo : null;
        this.interactionId = this.props.route.data.interactionId ? this.props.route.data.interactionId : null;
        //分页页码
        this.currentPage=0;

        this.skuName = '';
        this.ofSXCSPUPrice = '';//售价
        this.notBuyReasonEnums = [];//不买的原因，多选
        this.allSkuEvalTags = [];//所有的 sku评价的二级
        this.daySalesUnitEnums = [];//销量单位
        /** event **/
        this._getWebData = this._getWebData.bind(this);
        this._getCommentWebData=this._getCommentWebData.bind(this);
        this._onChangeText=this._onChangeText.bind(this);
        this._keyboardDidShow=this._keyboardDidShow.bind(this);
        this._keyboardDidHide=this._keyboardDidHide.bind(this);
        this._loadNextPage = this._loadNextPage.bind(this);
        this._renderHeader=this._renderHeader.bind(this);
        this._renderImagesView=this._renderImagesView.bind(this);
    }
    componentDidMount(){
        InteractionManager.runAfterInteractions( () => {
            this._getWebData();
            this._getCommentWebData();
        })
    }
    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }
    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }
    /**
     * @Title:
     * @Description: 获取网络数据
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/4/25 18:15
     */
    _getWebData(){
        this.changeState({
            pageLoading:true,
        });
        commonRequest({
            apiKey: 'addOrUpdateSkuResearchPageKey',
            objectName: 'skuResearchQueryDO',
            params: {
                researchId: this.researchId,
                skuId: this.skuId,
                visitSKUType: this.visitSKUType
            }
        }).then( (res) => {
            let pageData = res.data;
            let { daySales, skuName, ofSXCSPUPrice , daySalesUnitEnums, notBuyReasonEnums, skuEvalEnums, skuEvalTags,skuResearchChannelVOList,skuResearchId} = pageData;
            notBuyReasonEnums = notBuyReasonEnums === null ? [] : notBuyReasonEnums;
            skuEvalEnums = skuEvalEnums === null ? [] : skuEvalEnums;
            skuEvalTags = skuEvalTags === null ? [] : skuEvalTags;
            skuResearchChannels = !skuResearchChannelVOList ? [] : skuResearchChannelVOList;
            //格式化数据 设置选中
            daySalesUnitEnums = daySalesUnitEnums.map( i=>({id: i.key,name: i.value,checked: i.checked}) );
            skuResearchChannels.map(channel=>{
                channel.purchaseUnit = channel.purchaseUnitEnums.filter(i=>i.checked)[0].key ;
                channel.imgs = channel.imgs || [];
                channel.recordChannelId = channel.recordChannelVO.recordChannelId
            });
            let daySalesUnit = null,skuEval = null,skuEvalStr = '',skuEvalTagIds = [],skuEvalTagStrs = [],curSkuEvalTags = [],allSkuEvalTags=[],
                notBuyReasonEnumStrs = [],selectedSkuEvalObj = null,selectedSkuEvalTagObj = null,selectedDaySalesUnitObj = null;
            selectedDaySalesUnitObj = daySalesUnitEnums.filter(i=>i.checked)[0];
            daySalesUnit = selectedDaySalesUnitObj ? selectedDaySalesUnitObj.id : daySalesUnitEnums[0].id;
            if(this.visitSKUType === 1){//已存在的货品
                skuEvalEnums = skuEvalEnums.map( i=>({id: i.key,name: i.value,checked: i.checked}) );
                allSkuEvalTags = skuEvalTags.map( i=>({id: i.tagId,name: i.tagText,checked: i.checked,parentId: i.skuEvalCode }) );

                selectedSkuEvalObj = skuEvalEnums.filter( i=>i.checked )[0];
                skuEval = selectedSkuEvalObj ? selectedSkuEvalObj.id : skuEvalEnums[0].id;
                skuEvalStr = selectedSkuEvalObj ? selectedSkuEvalObj.name : skuEvalEnums[0].name;

                curSkuEvalTags = allSkuEvalTags.filter( i=>i.parentId == skuEval );
                skuEvalTagIds = curSkuEvalTags.filter( i=>i.checked ).map( i=>i.id );
                skuEvalTagStrs = curSkuEvalTags.filter( i=>i.checked ).map( i=>i.name );
            }else if(this.visitSKUType === 2){//新增的货品
                //筛选出选中的
                notBuyReasonEnumStrs = notBuyReasonEnums.map( i=>{
                    if(i.checked){
                        return i.value;
                    }
                });
            }

            Object.assign(this,{skuName,ofSXCSPUPrice,daySalesUnitEnums,notBuyReasonEnums, skuEvalEnums, allSkuEvalTags,skuResearchId});
            this.changeState({
                pageLoading: false,
                daySales: daySales,
                daySalesUnitStr: selectedDaySalesUnitObj ? selectedDaySalesUnitObj.name : daySalesUnitEnums[0].name,
                skuEvalStr,
                skuEvalTagStrs,
                skuResearchChannels,
                notBuyReasonEnumStrs,

            });
        }).catch( err => {
            this.changeState({
                pageLoading: false,
            });
        })
    }
    _renderImagesView = (urls, ref) =>{
        console.log('do in renderImageVIew:', this);
        console.log(ref);
        return (
            <View>
                {
                    urls.map((v, k) => {
                        return (
                            <TouchableOpacity onPress={() => this._gallery._showReview(k)} key={k}>
                                <Image source={{uri: v}}  resizeMode='contain' style={s.uploadImg}></Image>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
        )
    }
    _renderSales(){
        return(
            <View style={s.basicInfo}>
                <View style={s.skuInfo}>
                    <SText fontSize='caption' color='#051B28'>{this.skuName}</SText>
                </View>
                <View style={s.salesInfo}>
                    <SText fontSize='caption' color='#5F646E' >每日销量：</SText>
                    <SText fontSize='caption' color='#051B28' >{this.state.daySales + '' + this.state.daySalesUnitStr}</SText>
                </View>
            </View>
        )
    }
    _renderReason(){
        return (
            <View>
                {this.visitSKUType === 2 ?
                    <View style={s.reason}>
                        <View style={s.caption}>
                            <SText fontSize='caption' color='#999'>补充我们不能满足客户要求的原因</SText>
                        </View>
                        <View style={{flexWrap: 'wrap',flexDirection: 'row',paddingVertical: 15,paddingLeft: 20,backgroundColor: '#fff'}}>
                            {this.state.notBuyReasonEnumStrs.map((reason,index)=>{
                                return <SText key={index} fontSize='caption' color='#5F646E'>{reason}</SText>
                            })}
                        </View>
                    </View>
                    :
                    <View style={s.reason}>
                        <View style={s.caption}>
                            <SText fontSize='caption' color='#999'>我们货品的原因</SText>
                        </View>
                        <View style={{flexWrap: 'wrap',flexDirection: 'row',paddingVertical: 15,paddingLeft: 20,backgroundColor: '#fff'}}>
                            <SText fontSize='caption' color='#5F646E'>{this.state.skuEvalStr}</SText>
                            {this.state.skuEvalTagStrs.length !== 0 ? <SText>：</SText> : null}
                            {this.state.skuEvalTagStrs.map((reason,index)=>{
                                return <SText key={index} fontSize='caption' color='#5F646E'>{reason}</SText>
                            })}
                        </View>
                    </View>
                }
            </View>
        )
    }
    _renderSkuResearchChannels(){
        // console.log('skuResearchChannels',this.state.skuResearchChannels);
        return (
            <View>
                {this.state.skuResearchChannels.length !== 0 ?
                    <View style={s.channel}>
                        <View style={s.caption}>
                            <SText fontSize='caption' color='#999'>主要进货渠道信息</SText>
                        </View>
                        {this._renderSkuResearchChannelsDetail()}
                    </View>
                    : null
                }
            </View>
        )
    }
    _renderSkuResearchChannelsDetail(){
        return (
            <View>
                {this.state.skuResearchChannels.map((channel,channelIndex)=>{
                    let purchaseUnitObj = channel.purchaseUnitEnums.filter(i=>i.checked)[0],
                        purchaseUnit = purchaseUnitObj ? purchaseUnitObj.key : null,
                        purchaseUnitStr = purchaseUnitObj ? purchaseUnitObj.value : '';
                    return (
                        <View key={channel.recordChannelId} style={s.channelItem}>
                            <View style={s.channelHeader}>
                                <SText fontSize='caption' color={PURPLE}>{channel.recordChannelVO.marketName + (channel.recordChannelVO.stallNo == null ? '' : ' - ' + channel.recordChannelVO.stallNo) + (channel.recordChannelVO.brand == null ? '' : ' - ' + channel.recordChannelVO.brand) }</SText>
                                <SText fontSize='caption' color={PURPLE} style={{marginTop: 10 }}>{channel.recordChannelVO.stallBossName + '' + (channel.recordChannelVO.suppliersMobileNo == null ? '' : channel.recordChannelVO.suppliersMobileNo)}</SText>
                            </View>
                            <View style={s.channelBody}>
                                <View style={s.importPriceInfo}>
                                    <SText fontSize='caption' color='#5F646E' >进货价：</SText>
                                    <SText fontSize='caption' color='#051B28'>{channel.purchaseUnitPrice + '/' + purchaseUnitStr}</SText>
                                </View>
                                {this._renderUploadImgs(channel.imgs,channelIndex)}
                            </View>
                            {/* <View style={s.channelFooter}>
                             <SText fontSize='mini' color='#C4C6CF'>{'更新时间： ' + channel.gmtModified}</SText>
                             </View> */}
                        </View>
                    )
                })}
            </View>
        )
    }
    _renderUploadImgs(imgs,channelIndex){
        let urls = imgs.map(i=>i.img + '?md5=' + i.md5);
        console.log('urls',urls);
        return (
            <View style={s.imgList}>
                <GalleryList
                    // ref={'gallery'}
                    ref={v => this._gallery = v}
                    imageList={urls}
                    component={this._renderImagesView(urls, 'gallery')}
                >
                </GalleryList>
                {/* {imgs.map((imgObj,n)=>{
                 //     return <Image key={n} source={{uri: imgObj.img}} style={s.uploadImg}></Image>
                 // })} */}
            </View>
        )
    }
    /**
     * 评论列表
     * @author №7
     * @private
     */
    _renderComment(){
        if (this.state.totalCommentNum<=0&&this.state.evaSwitch==2){
            return null
        }else {
            return(
                <View>
                    <View style={[s.caption,{marginTop:10}]}>
                        <SText fontSize='caption' color='#999'>评论</SText>
                    </View>
                    {
                        this.state.haveReadUserNames==null||this.state.haveReadUserNames==''?
                            null
                            :
                            <View style={s.comment}>
                                <SText fontSize='caption' color='#999' style={{fontSize:12}}>已读({this.state.haveReadMessages?this.state.haveReadMessages:0})</SText>
                                <SText fontSize='caption' color='#999' style={{marginTop:5,fontSize:14}}>{this.state.haveReadUserNames}</SText>
                            </View>
                    }
                    <View
                        style={[s.comment,s.borderTop,{overflow:'hidden'}]}>
                        <SText fontSize='caption' color='#999' style={{fontSize:this.state.totalCommentNum>0?12:14}}>{this.state.totalCommentNum>0?'评论('+this.state.totalCommentNum+')':'沙发还空着，快来发言吧！'}</SText>
                    </View>
                </View>
            )
        }
    }

    /**
     * 评论列表item布局
     * @param rowData
     * @param rowId
     * @param sectionId
     * @returns {XML}
     * @author №7
     * @private
     */
    _renderCommentItem(rowData, rowId, sectionId){
        console.log('rowId',rowId);
        console.log('sectionId',sectionId);
        return(
            <View style={{backgroundColor:'#fafafa',marginLeft:10,marginRight:10,paddingLeft:10,paddingRight:10}}>
                <View style={s.comment_item}>
                    <SText fontSize='caption' color='#999' style={{fontSize:12,color:rowData.creatorFlag?'#8B5DAD':'#999'}}>{rowData.userName}</SText>
                    <SText fontSize='caption' color='#999' style={{fontSize:12,flex:1,textAlign:'right'}}>{rowData.interactTime}  {+sectionId+1}楼</SText>
                </View>
                <View style={[s.borderBottom,{marginTop:10,paddingBottom:10}]}>
                    <SText fontSize='caption' color='#333' style={{}}>{rowData.interactContent}</SText>
                </View>
            </View>
        )
    }
    /**
     * 提交品论按钮
     * @private
     * @author №7
     */
    _renderCommentAction(){
        return(
            <View style={{padding:10,backgroundColor:'#f0f0f0',flexDirection:'row',alignItems:'center',bottom:this.state.keyboardHeight,position:'absolute'}}>
                <View   style={s.input}>
                    {
                        this.state.hideCommentIcon?
                            null
                            :
                            <Image source={IconPen}   style={{height:19,width:14,marginRight:5}}></Image>
                    }
                    <TextInput
                        ref={v => this._textInput = v}
                        onChangeText={text=>{
                            this._onChangeText(text, 'comment')
                        }}
                        placeholder="评论"
                        value={this.state.comment }
                        returnKeyType='send'
                        style={{flex:1,height:40}}
                        onFocus= {this._onCommentFocus.bind(this)}
                        onEndEditing={this._onPressSend.bind(this)}
                        onSubmitEditing={()=>this._btnSubmitComment()}
                    />
                </View>
            </View>
        )
    }
    /**
     * @Title:
     * @Description: 基础信息
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/4/26 18:04
     */
    _renderBaseInfo(){
        return(
            <View style={{flex: 0,backgroundColor:'#fffcf1',  paddingLeft: 20,paddingTop:10,paddingRight:20,paddingBottom:10,borderBottomWidth: 1,
                borderColor: '#EDEDED',}}>
                <SText fontSize='caption' color='#8b5dad' >{this.state.pickHouseAndBuyerInfo}</SText>
                <SText fontSize='caption' color='333' style={{marginTop:5}}>{this.state.notOrderReason}</SText>
            </View>
        )
    }
    _renderHeader = () =>{
        if (this.haveSkuVisitInfo) {
            return(
                <View style={s.container}>
                    {this._renderBaseInfo()}
                    {this._renderSales()}
                    {this._renderReason()}
                    {this._renderSkuResearchChannels()}
                    {this._renderComment()}
                </View>
            )
        }else {
            return(
                <View style={s.container}>
                    {this._renderBaseInfo()}
                    {this._renderComment()}
                </View>
            )
        }

    }

    render(){
        return (
            <Page
                pageName='拜访记录详情'
                title={'需求信息'}
                pageLoading={this.state.pageLoading}
                loading={false}
                headerColor={PURPLE}
                back={() => this.navigator().jumpBack()}
            >
                <ListView
                    onEndReachedThreshold={60}
                    initialListSize={10}
                    onEndReached={this.state.enableBottomRefresh ? this._loadNextPage() : null}
                    enableEmptySections={true}
                    dataSource={this.ds.cloneWithRows(this.state.commentList)}
                    renderRow={(rowData, rowId, sectionId) => this._renderCommentItem(rowData, rowId, sectionId)}
                    renderHeader={this._renderHeader}
                    style={{marginBottom:this.state.evaSwitch==1?60:0,flex:1,backgroundColor:'#fff'}}
                />
                {
                    this.state.evaSwitch==1
                        ?
                        this._renderCommentAction()
                        :
                        null
                }
                <KeyboardSpacer />
            </Page>
        )
    }
    _onChangeText(text, name){
        this.changeState({
            [name]: text
        })
    }
    _onCommentFocus(e){
        this.changeState({
            hideCommentIcon:true
        })
    }
    /**
     * @Title: 键盘弹出
     * @Description:
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/4/27 14:30
     */
    _keyboardDidShow (e) {
        if(Platform.OS == 'ios'){
            let  height=e.endCoordinates.height;
            this.changeState({
                keyboardHeight:height
            })
        }
    }
    /**
     * @Title:   键盘隐藏
     * @Description:
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/4/27 14:30
     */
    _keyboardDidHide (e) {
        if(Platform.OS == 'ios'){
            this.changeState({
                keyboardHeight:0
            })
        }
    }
    _loadNextPage(){
        this._getCommentWebData();
    }

    /**
     * 获取评论数据列表 分页
     * @param endRefresh
     * @author №7
     * @private
     */
    _getCommentWebData(){
        commonRequest({
            apiKey: 'getInteractionContentsKey',
            objectName: 'visitResearchQueryDO',
            params: {
                currentPage:this.currentPage+1,
                researchId:this.researchId,
                interactionId:this.interactionId
            }
        }).then( (res) => {
            let pageData = res.data;
            let {haveReadMessages,haveReadUserNames,interactionBaseVOPages,interactionId,pickHouseInfo,evaSwitch,pickHouseAndBuyerInfo,notOrderReason}=pageData;
            let nextPage=false;
            let commentList=[];
            let totalCommentNum=0;
            if (interactionBaseVOPages) {
                nextPage=interactionBaseVOPages.nextPage;
                let currentPage = this.currentPage;
                // commentList = this.state.commentList.concat(interactionBaseVOPages.result);
                commentList = interactionBaseVOPages.result;
                totalCommentNum=interactionBaseVOPages.records;
                this.currentPage=interactionBaseVOPages.pageNum;
            }
            this.changeState({
                enableBottomRefresh: nextPage,
                commentList,
                haveReadMessages,
                haveReadUserNames,
                pickHouseInfo,
                interactionId,
                evaSwitch,
                totalCommentNum,
                notOrderReason,
                pickHouseAndBuyerInfo
            })

        }).catch( err => {
        })

    }
    _onPressSend=()=>{
        if (this.state.sending){
            commonRequest({
                apiKey: 'saveInteractionContentKey',
                objectName: 'interactionQueryDO',
                withLoading: true,
                params: {
                    content:this.state.comment,
                    interactionId:this.state.interactionId
                }
            }).then( (res) => {
                this.changeState({
                    comment:'',
                    sending:false,
                });
                this.currentPage=0;
                this._getCommentWebData();
                __STORE.dispatch(UtilsAction.toast('评论成功', 1000));

            }).catch( err => {
                this.changeState({
                    sending:false,
                });
            })
        }

    }
    /**
     * @Title: 提交评论
     * @Description: onSubmitEditing在android上会被执行两次甚至多次，所以直接在这里写网络请求会导致重复
     * 暂时解决方案，在onSubmitEditing 里执行失去焦点，触发onEndEditing
     * 贼不要脸
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/4/27 15:30
     */
    _btnSubmitComment=()=>{
        this._textInput.blur();
        this.state.sending=true;
    }
}