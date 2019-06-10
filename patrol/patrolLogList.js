/**
 *
 * 项目名称：caimi-rn
 * 文件描述： 巡场日志列表
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/5/19 10:44
 * 修改人：cfy
 * 修改时间：17/5/19 10:44
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
    InteractionManager
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page,Row,CommonSelect} from 'components';
import Echarts from 'native-echarts';
import DeepCopy from 'lodash'
var Dimensions = require('Dimensions');
var {width} = Dimensions.get('window');
import {IC_LAUNCHER, IconWatch, IconLikeCheck, IconZanGray, IconSaw, IconZanBlue} from 'config'
import  PatrolLogDetails from './patrolLogDetails'
import  CreatePatorlLog from './createPatorlLog'
import {str} from 'tools';
//图表样式
let mOption = {
    backgroundColor:'#F8FAFC',
    title: {
        text: '',
        left:'center',
        textStyle:{
            color:'#444A4E',
            fontSize:14
        },
        show:false
    },
    legend: {
        show:false,
    },
    tooltip:{
        //是否显示提示框组件，包括提示框浮层
        show:false
    },
    xAxis: {
        // data: [],

        //坐标轴
        axisLine:{
            show:false
        },
        //坐标轴刻度
        axisTick:{
            show:false,
        },
        //刻度标签
        axisLabel:{
            textStyle:{
                fontSize:10,
                color:'#D4D8DC'
            }
        }
    },
    yAxis: {
        show:false,
        min:0
    },
    grid:{
        left:0,
        top:20,
        rigth:0,
        bottom:30,
        width:width-(15+48+10+15)

    },
    series: [{
        type: 'line',
        data: [],
        itemStyle:{//曲线线条色
            normal:{
                color:(params)=>{
                    if (params.dataIndex==6) {
                        return '#F6BC54'
                    }else {
                        return '#78C3FB'
                    }
                }
            }
        },
        lineStyle:{
            normal:{
                color:'#5AB5F9'
            }
        },
        smooth:true,//曲线是否圆滑
        areaStyle:{ //填充色
            normal:{
                color:'#E8F3FC',
            }
        },
        symbolSize:10,//标记大小
        label:{
            normal:{
                show:true,
                textStyle:{
                    color:'#374C5C',
                    fontSize:10,
                }
            }
        }
    }]
};
let s = SStyle({
    item:{
        backgroundColor:'#fff',
        padding:15,
        marginBottom:10
    },
    gird:{
        flexDirection:'row',
        flexWrap:'wrap',
    },
    charts:{
      backgroundColor:'#F8FAFC',
      marginTop:10,
      borderRadius:3,
      paddingTop:10
    },
    iconLogo:{
        width:48,
        height:48,
        borderRadius:5,
        borderColor:'#D8D8DB',
        borderWidth:1
    },
    img:{
        width:80,
        height:80
    },
    iconWatch:{
        width:16,
        height:11
    },
    iconLike:{
        width:16,
        height:16
    },
    listStyle: {
        flex: 0,
        backgroundColor: '#FFF',
        width: '@window.width',
        marginBottom: 45
    },
    zanRow: {
        paddingLeft: 15,
        paddingRight: 15,
    },
    iconView: {
        width: 15,
        height: 15,
        marginRight: 10,
    },
    manSaw: {
        width: '@window.width-130'
    },
    interTime: {
        fontSize: 'mini_plus',
        letterSpacing: 0.37,
        color: '#021D33',
        lineHeight: 16
    },
});
let xData=[
    ["05-10","05-11","05-12","05-13","05-14","05-15","05-16"],
    ["04-10","04-11","04-12","04-13","04-14","04-15","04-16"]
];
let yData=[
    [5.6, 5.3, 5.5, 5.2, 5.6, 5.7,5.8],
    [4.6, 4.3, 4.5, 4.2, 4.6, 4.7,4.8],
]

module.exports = class PatrolLogList extends SComponent{
    constructor(props){
        super(props);
        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state={
            refreshing:false,
            wholeMarketOverviewDTOS:[],
            spinnerData:[]
        }
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this._getWebData();
        })
    }

    /**
     * @Description: 获取页面数据
     * 日志列表跟发布日志弹出的spinner数据列表
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/23 18:20
     */
    _getWebData=()=>{
      this._getLogListWebData();
      this._getSpinnerWebData();
    }

    /**
     * @Description: 获取日志列表
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/2 16:05
     */
    _getLogListWebData=()=>{
        this.changeState({
            refreshing:true,
        });
        commonRequest({
            apiKey: 'queryPatrolDiaryOverviewKey',
            objectName: 'patrolDiaryQueryDO',
            params: {
            }
        }).then( (res) => {
            let {data} = res;
            this.changeState({
                refreshing:false,
                ...data
            });
        }).catch( err => {
            this.changeState({
                refreshing:false,
            });
        })
    }
    /**
     * @Description: 获取发布日志品类筛选列表
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/6/2 16:05
     */
    _getSpinnerWebData=()=>{
        commonRequest({
            apiKey: 'queryPurchaserPatrolCatListKey',
            objectName: 'patrolDiaryInitQueryDO',
            params: {
            }
        }).then( (res) => {
            let {data} = res;
            let purchasePatrolCatDTOs=data.purchasePatrolCatDTOs;
            this.state.spinnerData=purchasePatrolCatDTOs;
        }).catch( err => {

        })
    }

    //点赞
    _getDzData = (rowData: Object) => {
        commonRequest({
            apiKey: 'dzKey',
            objectName: 'patrolDiaryQueryDO',
            params: {
                patrolDiaryId: rowData.patrolDiaryId
            }
        }).then( (res) => {
            this.like = res.data
        }).catch( err => {
            Toast.show(err.errorMessage);
        })
    }
    
    //取消点赞
    _getCancelDzData = (rowData: Object) => {
        commonRequest({
            apiKey: 'cancelDzKey',
            objectName: 'patrolDiaryQueryDO',
            params: {
                patrolDiaryId: rowData.patrolDiaryId
            }
        }).then( (res) => {
            this.like = res.data
        }).catch( err => {
            Toast.show(err.errorMessage);
        })
    }

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
            <SText fontSize='caption' color='fff'>发表日志</SText>
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
        if (this.state.spinnerData==null||this.state.spinnerData.length<=0){
            this._getSpinnerWebData();
        }else {
            this._commonSelect._toggle();
        }

    }
    render(){
       return(
           <Page
               title='巡场日志'
               pageLoading={false}
               rightEvent={this._rightEvent}
               rightContent={this._renderRightBtn()}
               back={()=>this.navigator().pop()}>
               <ListView
                   refreshControl={
                       <RefreshControl
                           refreshing={this.state.refreshing}
                           onRefresh={this._getWebData.bind(this)}
                           tintColor="#54bb40"
                           title="加载中..."
                           titleColor="#999"
                           colors={['#2296f3']}
                           progressBackgroundColor="#fff"
                       />
                   }
                   initialListSize={10}
                   enableEmptySections={true}
                   dataSource={this._ds.cloneWithRows(this.state.wholeMarketOverviewDTOS)}
                   renderRow={this._renderRow} />
               <CommonSelect
                   keyName='patrolCatDesc'
                   ref={ view => this._commonSelect = view}
                   selectCallback={this._commonSelectCallback}
                   dataSource={this.state.spinnerData?this.state.spinnerData:[]}
                   multiple={false}
                   renderRow={this.renderSpinnerRow}
               />
           </Page>
       )
    }
    /**
     * @Description:  spinner弹出款布局
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/22 12:01
     */
    renderSpinnerRow(rowData, sectionID, rowID){
        return(
            <Row style={{height:45,alignItems:'center',justifyContent:'center'}}>
                <SText fontSize='body' color='333'>{rowData.patrolCatDesc}</SText>
                {rowData.showUpdateIcon?
                    <View style={{backgroundColor:'#2289f3',borderRadius:5,padding:3,marginLeft:5}}>
                        <SText fontSize='mini' color='fff'>更新</SText>
                    </View>
                    :null
                }
            </Row>
        )
    }
    /**
     * @Description: 日志item
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/19 12:00
     */
    _renderRow=(rowData, sectionID, rowID)=>{
        return(
            <Row style={s.item}>
               <Image style={s.iconLogo} source={{uri:rowData.catImage.img?rowData.catImage.img:''}}/>
               <View style={{flex:1,marginLeft:10}}>
                   <SText fontSize='body' color='#1486CC'>{rowData.catName}</SText>
                   <SText fontSize='body' color='333' style={{marginTop:10}}>{rowData.saleSuggestions}</SText>
                   <ListView
                       contentContainerStyle={s.gird}
                       dataSource={this._ds.cloneWithRows(rowData.goodsQualityImages)}
                       renderRow={this._renderImg}
                       showsVerticalScrollIndicator={false}
                       showsHorizontalScrollIndicator={false}
                       initialListSize={9}
                   />
                   <TouchableOpacity
                       onPress={()=>{
                           this.navigator().push({
                               component: PatrolLogDetails,
                               name: 'PatrolLogDetails',
                               data: {
                                   catId: rowData.catId,
                                   patrolDiaryId:rowData.patrolDiaryId
                               },
                           })
                       }}
                       style={s.charts}>
                       <SText fontSize='caption' color='#22394C' style={{flex:1,textAlign:'center'}} >{rowData.wholeMarketChartEntity.chartTopic}</SText>
                       <Echarts option={this._getOption(rowData.wholeMarketChartEntity)} height={130}  style={{backgroundColor:'#F8FAFC'}} />

                       {str.isEmpty(rowData.estimateTendencyDesc)?null:
                           <Row style={{marginLeft:10,marginRight:10}}>
                               <SText fontSize='caption' color='333' >趋势:</SText>
                               <SText fontSize='caption' color='#647583' style={{marginLeft:5,flex:1}}>{rowData.estimateTendencyDesc}</SText>
                           </Row>
                       }
                       {str.isEmpty(rowData.wholeStockNumDesc)&&str.isEmpty(rowData.shortageDesc)?null:
                           <Row style={{marginLeft:10,marginTop:5,marginRight:10}}>
                               <SText fontSize='caption' color='333' >库存:</SText>
                               <SText fontSize='caption' color='#647583' style={{marginLeft:5}}>{rowData.wholeStockNumDesc}</SText>
                               <SText fontSize='caption' color='#FD8B1E' style={{marginLeft:5}}>{rowData.shortageDesc}</SText>
                           </Row>
                       }
                       {str.isEmpty(rowData.imperfectProperties)?null:
                           <Row style={{marginLeft:10, marginTop:5, marginRight:10, paddingBottom: 15}}>
                               <SText fontSize='caption' color='333' >质量:</SText>
                               <SText fontSize='caption' color='#647583' style={{marginLeft:5,flex:1}} >{rowData.imperfectProperties}</SText>
                           </Row>
                       }
                       {str.isEmpty(rowData.avgPriceSection)?null:
                           <Row style={{marginLeft:10,marginTop:5,marginBottom:10,marginRight:10}}>
                               <SText fontSize='caption' color='333' >价格:</SText>
                               <SText fontSize='caption' color='#647583' style={{marginLeft:5,flex:1}}>{rowData.avgPriceSection}</SText>
                           </Row>
                       }

                   </TouchableOpacity>
                   <TouchableOpacity style={{paddingTop:10}}
                       onPress={()=>{
                           this.navigator().push({
                               component: PatrolLogDetails,
                               name: 'PatrolLogDetails',
                               data: {
                                   catId: rowData.catId,
                                   patrolDiaryId:rowData.patrolDiaryId
                               },
                           })
                       }}
                   >
                       <SText fontSize='body' color='#1B89CF' >查看详情</SText>
                   </TouchableOpacity>
                   <Row style={{alignItems:'center',marginTop:10}}>
                       <SText fontSize='caption' color='999'  style={{flex:1}}>{rowData.purchaserName+'  '+rowData.updateTimeDesc}</SText>
                       <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => {
                            rowData.like ? this._getCancelDzData(rowData) : this._getDzData(rowData);
                            this._getWebData();
                        }}>
                        {
                            rowData.like
                            ? <Image source={IconZanBlue} style={[s.iconLike,{marginLeft:10}]}/> 
                            : <Image source={IconZanGray} style={[s.iconLike,{marginLeft:10}]}/>
                        }
                        {
                            rowData.like
                            ? <SText fontSize='mini' color='#1485CE' style={{marginLeft: 6}}>赞</SText>
                            : <SText fontSize='mini' color='333' style={{marginLeft: 6}}>赞</SText>
                        }
                        </TouchableOpacity>
                   </Row>
                   <View style={{backgroundColor: '#FAFAFA', marginTop: 11}}>
                        {
                           rowData.fwList ? 
                           <Row style={[s.zanRow,{paddingTop: 11,paddingBottom: 12}]}>
                                <Image source={IconSaw} style={s.iconView} />
                                <View style={s.manSaw}>
                                    <SText style={[s.interTime,{opacity: 0.54}]} numberOfLines={10}>{rowData.fwList}</SText>
                                </View>
                            </Row> : null
                        }
                        
                        {
                            rowData.dzList ? 
                            <Row style={[s.zanRow,{paddingBottom: 12}]}>
                                <Image source={IconZanBlue} style={s.iconView} />
                                <View style={s.manSaw}>
                                    <SText style={[s.interTime,{opacity: 0.54}]} numberOfLines={10}>{rowData.dzList}</SText>
                                </View>
                            </Row> : null
                        }
                    </View>
               </View>
            </Row>
        )
    }
    /**
     * @Description: 图片item
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/19 15:06
     */
    _renderImg=(rowData, sectionID, rowID)=>{
        return(
            <Image style={[s.img,{marginTop:10,marginRight:10}]} source={{uri:rowData.img}}/>
        )
    }
    /**
     * @Description: 获取图标数据
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/19 15:10
     */
    _getOption(wholeMarketChartEntity){
        let  option= DeepCopy.cloneDeep(mOption);
        // option.title.text='土豆均价走势'
        option.xAxis.data=wholeMarketChartEntity.chartDates;
        option.yAxis.min=wholeMarketChartEntity.minHign;
        option.series[0].data=wholeMarketChartEntity.chartNums;

        return option
    }

    _commonSelectCallback = (data)=>{
        this.navigator().push({
            component: CreatePatorlLog,
            name: 'CreatePatorlLog',
            refresh:this._getWebData,
            data: {
                catId: data[0].catId,
                patrolDiaryId: data[0].patrolDiaryId,
            },
        })
    }
}
