/**
 * 拜访客户列表
 * 项目名称：caimi-rn
 * 文件描述：
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/4/25 17:25
 * 修改人：cfy
 * 修改时间：17/4/25 17:25
 * 修改备注：
 * @version
 */
import React from 'react';
import {View,Text,Image,TouchableOpacity, InteractionManager,ListView,RefreshControl} from 'react-native';
import {SComponent, SText, SStyle} from 'sxc-rn';
import {Page} from 'components';
import Dimensions from 'Dimensions';
import VisitRecordDetails from './visit_record_details.js';

const {HEIGHT, WIDTH} = Dimensions.get('window');
const PURPLE = '#8B5DAD';
const BORDER_BOTTOM = '#E5E5E5'
const s = SStyle({
    container: {
        flex:1,
    },
    listView: {
        // backgroundColor: '#fff',
    },
    rowData:{
        marginBottom: 10
    },
    totalCaption: {
        flex: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingLeft: 20,
        height: 40,
        backgroundColor: '#EEEEEE',
    },
    caption: {
        flex: 0,
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingLeft: 20,
        paddingVertical: 10,
        backgroundColor: '#FFFCF2',
    },
    skuList: {
        paddingHorizontal: 20,
        backgroundColor: '#fff'
    },
    skuItem: {
        flex:0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        height: 50,
        borderBottomWidth: 'slimLine',
        borderColor: BORDER_BOTTOM,
        paddingVertical: 10,
    },
    skuItemLeft: {
        justifyContent: 'space-between',
    },
    visitDesc: {
        flexDirection: 'row',
        backgroundColor:'#fff',
        paddingLeft: 20,
        borderTopWidth:1,
        borderColor:'#e5e5e5',
        height:30,
        alignItems:'center'
    },
    skuItemRight: {
        flexDirection:'row',
        alignItems:'center'
    },
    imgArea: {
        flex:0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: 30,
        height: 30,
    },
    imgArrow: {
        width: 6.75,
        height: 12,
    },
});
import {
    IconForward
} from 'config';


module.exports=class VisitRecordList extends SComponent{
    constructor(props){
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            pageLoading: true,
            enableBottomRefresh: false,//历史数据分页
            currentPage: 0,
            visitRecordList: [],
        };
        /** event **/
        this._renderRow = this._renderRow.bind(this);
        this._renderSkuLine=this._renderSkuLine.bind(this);
        this._renderWatchDetails=this._renderWatchDetails.bind(this);
        this._goDemandInfoDetailPage=this._goDemandInfoDetailPage.bind(this);
        this._getWebData = this._getWebData.bind(this);
        // this._loadNextPage = this._loadNextPage.bind(this);
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this._getWebData();
        })
    }
    _getWebData(){
        this.changeState({
            pageLoading:true,
        });
        commonRequest({
            apiKey: 'buyerResearchSkuPageListKey',
            objectName: 'visitResearchQueryDO',
            params: {
                catId: this.props.route.data.catId,
                // catId: 61,
                appFlag:1//2 为宋小福，1 采蜜
            }
        }).then( (res) => {
            let {data} = res;
            let {historyVisitResearchReasonSkuInitVOs}=data;
            let visitRecordList=historyVisitResearchReasonSkuInitVOs.result;
            console.log('visitRecordList',visitRecordList);
            this.changeState({
                pageLoading:false,
                visitRecordList
            });
        }).catch( err => {
            this.changeState({
                pageLoading:false,
            });
        })
    }
    render(){
        return(
            <Page
                title={'拜访记录'}
                pageLoading={this.state.pageLoading}
                loading={false}
                back={() => this.navigator().jumpBack()}>
                <ListView
                    renderRow={(rowData,sectionId,rowId) => this._renderRow(rowData,sectionId,rowId)}
                    dataSource={this.ds.cloneWithRows(this.state.visitRecordList)}
                    enableEmptySections={true}
                    removeClippedSubviews={false}
                    style={[s.listView,{marginTop:10}]}
                    initialListSize={5}
                    pageSize={2}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.pageLoading}
                            style={{backgroundColor:'transparent'}}
                            onRefresh={this._getWebData.bind(this)}
                            tintColor="#54bb40"
                            title="加载中..."
                            titleColor="#999"
                            colors={['#2296f3']}
                            progressBackgroundColor="#fff"
                        />
                    }
                > </ListView>
            </Page>
        )
    }
    _renderRemarkReason(remarkReason){
        if(remarkReason) {
            return(
                <View style={{backgroundColor:'#fafafa',paddingLeft:20,paddingRight:20,paddingTop:10,paddingBottom:10}}>
                    <SText fontSize='caption' color='#333' style={{flex: 1}}>{remarkReason}</SText>
                </View>
            )
        }else {
            return null
        }
    }
    _renderRow(rowData,sectionId,rowId){
        let isLast = rowId == this.state.visitRecordList.length - 1;
        return (
            <View style={[s.rowData,{marginBottom: isLast ? 0 : 10 }]}>
                <View style={[s.caption,{flexDirection:'row'}]}>
                    <SText fontSize='caption' color='333'>原因:</SText>
                    <SText fontSize='caption' color='#333' style={{flex: 1,marginLeft:5}}>{rowData.notOrderReason}</SText>
                </View>
                {this._renderRemarkReason(rowData.remarkReason)}
                {
                    rowData.haveSkuVisitInfo
                        ?
                        null
                        :
                        this._renderWatchDetails(rowData)
                }
                <View style={s.skuList}>
                    {rowData.visitResearchSkuInitVOs.map( (skuItem,index)=>{
                        let isLast = index === rowData.visitResearchSkuInitVOs.length - 1;
                        return this._renderSkuLine(skuItem,isLast);
                    })}
                </View>
                <View style={s.visitDesc}>
                    <SText fontSize='mini' color='#C4C6CF' style={{marginRight: 10}}>{rowData.salesName + ' 拜访于 ' + rowData.visitTime}</SText>
                </View>
            </View>
        )
    }
    _renderSkuLine(skuItem,isLast){
        let {visitSkuName,visitDesc,salesName} = skuItem;
        return (
            <TouchableOpacity
                key={skuItem.skuId + '' + skuItem.researchId}
                activeOpacity={0.7}
                onPress={()=>{
                    this._goDemandInfoDetailPage({
                        skuId: skuItem.skuId,
                        visitSKUType: skuItem.visitSKUType,
                        researchId: skuItem.researchId,
                        haveSkuVisitInfo: true,
                        interactionId:skuItem.interactionId
                    })
                }}
            >
                <View style={[s.skuItem,!isLast ? {} : {borderBottomWidth: 0}]}>
                    <View style={s.skuItemLeft}>
                        <SText fontSize='caption' color='#333'>{skuItem.visitSkuName}</SText>
                        {/*<View style={s.visitDesc}>*/}
                        {/*<SText fontSize='mini' color='#C4C6CF' style={{marginRight: 10}}>{salesName + ' 拜访于 ' + visitDesc}</SText>*/}
                        {/*</View>*/}
                        <SText fontSize='mini' color='#b3b3b3' style={{marginTop: 3}}>{skuItem.skuShowName}</SText>
                    </View>
                    <View style={s.skuItemRight}>
                        {
                            skuItem.unreadMessages>0?
                                <View style={{width:16,height:16,borderRadius:8,backgroundColor:'#ff5700',marginRight:5,justifyContent:'center',alignItems:'center'}}>
                                    <SText fontSize='caption' color='#fff' style={{fontSize:9}}>{skuItem.unreadMessages}</SText>
                                </View>
                                :
                                null
                        }
                        <Image source={IconForward} style={s.imgArrow}></Image>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    _renderWatchDetails(rowData){
        return(
            <TouchableOpacity
                onPress={()=>{
                    this._goDemandInfoDetailPage({
                        researchId: rowData.researchId,
                        haveSkuVisitInfo: rowData.haveSkuVisitInfo,
                        interactionId:rowData.interactionId
                    })
                }}
                style={{backgroundColor:'#fff',height:45,flexDirection:'row',alignItems:'center',paddingRight:20}}>
                <SText fontSize='caption' color='#666' style={{flex:1,marginLeft:20}}>查看详情</SText>
                <View style={s.skuItemRight}>
                    {
                        rowData.unreadMessages>0?
                            <View style={{width:16,height:16,borderRadius:8,backgroundColor:'#ff5700',marginRight:5,justifyContent:'center',alignItems:'center'}}>
                                <SText fontSize='caption' color='#fff' style={{fontSize:9}}>{rowData.unreadMessages}</SText>
                            </View>
                            :
                            null
                    }
                    <Image source={Icon.IconForward} style={s.imgArrow}></Image>
                </View>
            </TouchableOpacity>
        )
    }
    _goDemandInfoDetailPage({skuId,visitSKUType,researchId,haveSkuVisitInfo,interactionId}){
        this.navigator().push({
            component: VisitRecordDetails,
            name: 'VisitRecordDetails',
            data: {
                skuId: skuId,
                visitSKUType: visitSKUType,
                researchId: researchId,
                haveSkuVisitInfo: haveSkuVisitInfo,
                interactionId: interactionId,
            },
        })
    }
}