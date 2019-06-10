/**
 *
 * 项目名称：caimi-rn
 * 文件描述：直发看板
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/7/25 10:58
 * 修改人：cfy
 * 修改时间：17/7/25 10:58
 * 修改备注：
 * @version
 */
import {
    View,
    Image,
    TouchableOpacity,
    InteractionManager,
    ScrollView,
    ListView,
    RefreshControl
} from 'react-native';
import React from 'react';
import { SComponent, SStyle, SText } from 'sxc-rn';
import { Page,Row } from 'components';
import { str } from 'tools';
import Dimensions from 'Dimensions';
import {
    IconEditBlue,
} from 'config';
import {UtilsAction} from 'actions';
// import ChoiceStorehouseList from './choice_storehouse_list'
import DirectPlanInfoDetails from './details/directPlanInfoDetails'
var {height, width}= Dimensions.get('window');
const BLUE = '#2296F3'
let s = SStyle({
    container: {
        flex:1,
    },
    circle_white:{
        width:30,
        height:30,
        borderRadius:15,
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center'
    },
    day_uncheck:{
        width:30,
        height:30,
        justifyContent:'center',
        alignItems:'center'
    },
    day:{
        width:(width-20)/7,
        backgroundColor:BLUE,
        alignItems:'center',
        height:72
    },
    dot_white:{
        width:6,
        height:6,
        borderRadius:3,
        backgroundColor:'#fff',
    },
    direct_item:{
        backgroundColor:'#fff',
        borderColor:'#E7E7E7',
        borderWidth:1,
        borderRadius:3,
        padding:15,
        marginLeft:15,
        marginRight:15,
        marginBottom:10
    },
    btn_create:{
        flexDirection:'row',
        backgroundColor:BLUE,
        height:40,
        width:114,
        borderRadius:20,
        alignItems:'center',
        justifyContent:'center',
        position:'absolute',
        bottom:25,
        right:15
    },
    icon_create:{
        height:18,
        width:19,
    },
    dialog: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dialog_item: {
        justifyContent: 'center',
        backgroundColor: 'fff',
        width:width,
        height:45,
        borderBottomWidth:1,
        borderColor:'#E7E7E8',
        paddingLeft:15
    },
});
module.exports = class DirectInfoList extends SComponent {
    constructor(props){
        super(props)
        this.state = {
            pageLoading:true
        };
        this._ds = new ListView.DataSource({
            sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
            rowHasChanged: (r1, r2) => r1 !== r2,
        });
        //埋点数据
        this.buryVO={};
        this.feature=[];
        this.firstReqCatList=true;
    }
    componentDidMount(){
        InteractionManager.runAfterInteractions(() => {
            // if(_Bury){
            //     this.buryVO={
            //         viewShowName:'直发看板',
            //         entryTime:new Date().getTime()
            //     }
            // }
            this.buryVO= this.getRef('page')('_getBuryVO')();
            this._getWebData();
        })
    }
    /**
     * @Description: 获取品类
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/7/17 17:06
     */
    _getWebCat=()=>{
        commonRequest({
            apiKey: 'queryDirectInitCatInfoKey',
            objectName: 'directPlanListQueryDO',
            params: {
                directTime:this.state.directTime?this.state.directTime:undefined,
            }
        }).then( (res) => {
            let {data}=res;
            let selectedCat=this.state.selectedCat
            if (selectedCat&&data.catBaseVOList){
                data.catBaseVOList.map((item)=>{
                    if (item.catId==selectedCat.catId){
                        item.checked=true;
                        selectedCat=item;
                    }else {
                        item.checked=false;
                    }
                })
            }
            this.changeState({
                ...data,
                selectedCat
            })
        }).catch( err => {
        })
    }

    /**
     * @Description: 获取时间列表
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/7/17 17:06
     */
    _getWebWeek=()=>{
        commonRequest({
            apiKey: 'queryDirectInitTimeInfoKey',
            objectName: 'directPlanListQueryDO',
            params: {
                catId:this.state.selectedCat?this.state.selectedCat.catId:undefined,
                directTime:this.state.directTime?this.state.directTime:undefined,
            }
        }).then( (res) => {
            let {data}=res;
            data.directListTimeInitLists.map((time,index)=>{
                if(time.checked){
                    this.state.directTime=time.directArriveTime;
                }
            })
            this.changeState({
                ...data,
            })
            if (this.firstReqCatList){
                this.firstReqCatList=false
                setTimeout(()=>{
                    this._scrollToCheckedDay()
                },1000)
            }
        }).catch( err => {
        })
    }
    /**
     * @Description: 获取直发列表
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/7/25 12:00
     */
    _getWebDirectList=()=>{
        this.changeState({
            refreshing:true
        })
        let params=JSON.stringify({
            catId:this.state.selectedCat?this.state.selectedCat.catId:-1,
            directTime:this.state.directTime?this.state.directTime:undefined,
        })
        this.feature.push(params)
        //业务埋点
        this.buryVO.feature=this.feature;
        commonRequest({
            apiKey: 'queryDirectInfoListKey',
            objectName: 'directPlanListQueryDO',
            params: {
                catId:this.state.selectedCat?this.state.selectedCat.catId:undefined,
                directTime:this.state.directTime?this.state.directTime:undefined,
            }
        }).then( (res) => {
            let {data}=res;
            this.changeState({
                ...data,
                pageLoading: false,
                refreshing:false
            })

        }).catch( err => {
            this._showMsg(err.errorMessage)
            this.changeState({
                pageLoading: false,
                refreshing:false
            });
        })
    }
    _getWebData=()=>{
        this._getWebWeek();
        this._getWebCat();
        this._getWebDirectList();
    }

    render(){
        return(
            <Page
                ref="page"
                title={'直发看板'}
                rightContent={this._renderHeadRight()}
                rightEvent={()=>{
                    if (this.state.catBaseVOList&&this.state.catBaseVOList.length>0){
                        this.changeState({
                            showCatDialog: !this.state.showCatDialog,
                        })
                    }else {
                        this._showMsg('品类列表为空')
                    }
                }}
                pageLoading={this.state.pageLoading}
                back={()=>this.navigator().pop()}
            >
                <View style={{height:72}}>
                    <ScrollView
                        ref='scrollView'
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        style={{backgroundColor:BLUE, height:72,flex:0,paddingLeft:10, paddingRight:10}}>
                        {this._renderWeekDay()}
                    </ScrollView>
                </View>

                {this._renderDay()}
                <ListView
                    style={{flex:1}}
                    initialListSize={15}
                    dataSource={this._ds.cloneWithRows(this.state.directPlanList?this.state.directPlanList:[])}
                    renderRow={this._renderRow.bind(this)}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            style={{backgroundColor:'transparent'}}
                            onRefresh={this._getWebData.bind(this)}
                            tintColor="#54bb40"
                            title="加载中..."
                            titleColor="#999"
                            colors={['#2296f3']}
                            progressBackgroundColor="#fff"
                        />
                    }
                />
                {/*{*/}
                    {/*this.state.canCreateDirectPlan?*/}
                        {/*<TouchableOpacity*/}
                            {/*onPress={()=>this._gotoCreateDirectPlan()}*/}
                            {/*style={[s.btn_create]}>*/}
                            {/*<Image style={s.icon_create} source={IconEditBlue}/>*/}
                            {/*<SText fontSize='body' color='white' style={{marginLeft:5}}>创建路线</SText>*/}
                        {/*</TouchableOpacity>*/}
                        {/*:null*/}
                {/*}*/}

                {this._renderCatDialog()}
            </Page>
        )
    }
    /**
     * @Description: 品类选择按钮
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/7/17 17:07
     */
    _renderHeadRight(){
        return(
            <Row style={{alignItems:'center'}}>
                <SText fontSize='caption' color='white'>{this.state.selectedCat?this.state.selectedCat.catName:'全部'}</SText>
                <SText fontSize='caption' color='white' style={{fontSize:8,marginLeft:5}}>▼</SText>
            </Row>
        )
    }
    /**
     * @Description: 日期筛选
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/7/17 11:55
     */
    _renderWeekDay(){
        if (!this.state.directListTimeInitLists){
            return
        }
        return(
            this.state.directListTimeInitLists.map((item,index)=>{
                return(
                    <TouchableOpacity
                        onPress={()=>this._btnWeekDay(item)}
                        style={s.day}>
                        <SText fontSize='caption' color='#BEDFFB'>{item.weekDay}</SText>
                        <View style={[item.checked?s.circle_white:s.day_uncheck,{marginTop:5}]}>
                            <SText fontSize='caption' color={item.checked?BLUE:'#fff'}>{item.monthDay}</SText>
                        </View>
                        {item.weatherDirected?<View style={[s.dot_white,{marginTop:5}]}/>:null}
                    </TouchableOpacity>
                )
            })

        )
    }

    /**
     * @Description: 日期
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/7/17 13:46
     */
    _renderDay(){
        return(
            <SText fontSize='mini' color='#72818E' style={{paddingLeft:15,paddingTop:10,paddingBottom:10}}>{this.state.directPlanTime}</SText>
        )
    }

    _renderRow=(rowData, sectionID, rowID)=>{
        return(
            <TouchableOpacity
                onPress={()=>{
                    this.setRouteData({
                        data:{
                            directPlanId: rowData.directPlanId,
                        },
                        refresh: this._refresh,
                    }).push({
                        name: 'DirectPlanInfoDetails',
                        component: DirectPlanInfoDetails,
                    });
                }}
                style={s.direct_item}>
                <Row>
                    <SText fontSize='body' color='#021D33'  style={{fontWeight:'500',flex:1}}>{rowData.directPlanName}</SText>
                  {
                    rowData.warnInfo ?
                      <View style={{backgroundColor:'#FE7044',paddingLeft:3,paddingRight:3,paddingBottom:2,paddingTop:2,borderRadius:2}}>
                          <SText fontSize='caption' color='white'  >{rowData.warnInfo}</SText>
                      </View>
                      : null
                  }
                </Row>
                <SText fontSize='caption' color='#768591' style={{marginTop:5}} >{rowData.directRouteLocationDesc}</SText>
            </TouchableOpacity>
        )
    }
    //选择日期
    _btnWeekDay=(item)=>{
        if(item.checked){
            return
        }
        this.state.directListTimeInitLists.map((time)=>{
            if (time.directArriveTime==item.directArriveTime){
                time.checked=true;
            }else {
                time.checked=false;
            }
        })
        this.state.selectedCat={
            catId:-1
        };
        this.state.directTime=item.directArriveTime;
        this._getWebData();
    }
    //第一次进入页面 默认选中的日期 滚动到第三个
    _scrollToCheckedDay=()=>{
        if(!this.state.directListTimeInitLists){
            return
        }
        this.state.directListTimeInitLists.map((item,index)=>{
            if (item.checked&&index>2){
                let scrollToX=(index-2)*((width-20)/7);
                this.getRef('scrollView')('scrollTo')({x: scrollToX, y: 0, animated: true});
                return
            }
        })
    }
    /**
     * @Description: 品类对话框
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/7/17 17:04
     */
    _renderCatDialog = () => {
        if (this.state.showCatDialog&&this.state.catBaseVOList) {
            let dialogHeight=0;
            if (this.state.catBaseVOList.length>=5){
                dialogHeight=250;
            }else {
                dialogHeight=this.state.catBaseVOList.length*45;
            }
            return (
                <TouchableOpacity
                    style={s.dialog}
                    onPress={() => {
                        if (this)
                            this.changeState({
                                showCatDialog: !this.state.showCatDialog,
                            })
                    }}
                >
                    <View
                        style={{backgroundColor:'#fff',flex:0,height:dialogHeight}}>
                        <ScrollView >
                            {this.state.catBaseVOList.map((item, index)=>{
                                return(
                                    <TouchableOpacity
                                        onPress={()=>{
                                            //如果点了当前已选中的品类 则不请求数据
                                            if (item.checked){
                                                this.changeState({
                                                    showCatDialog: false,
                                                    selectedCat:item
                                                })
                                            }else {
                                                this.state.catBaseVOList.map((cat)=>{
                                                    if (cat.catId==item.catId){
                                                        cat.checked=true;
                                                    }else {
                                                        cat.checked=false;
                                                    }
                                                })
                                                this.state.selectedCat=item;
                                                this.changeState({
                                                    showCatDialog: false,
                                                })
                                                this._getWebData();
                                            }

                                        }}
                                        style={s.dialog_item}>
                                        <SText fontSize='body' color={item.checked?BLUE:'#021D33'} >{item.catName}</SText>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            );
        }
    }
    _showMsg(str){
        __STORE.dispatch(UtilsAction.toast(str, 1000));
    }
}

