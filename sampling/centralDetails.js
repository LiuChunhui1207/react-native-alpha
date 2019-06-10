'use strict';
import React from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    UIManager,
    Platform,
    Dimensions,
    Text,
    TextInput,
    ListView,
    RefreshControl,
    LayoutAnimation,
    InteractionManager,
    TouchableWithoutFeedback
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, SXCRadio, Row,Item, SInput, CommonSelect, Camera, GalleryList} from 'components';
import {UtilsAction} from 'actions';
import {str} from 'tools';
import {
    ICON_CHECKED,
    ARROW_DOWN_S,
    ICON_NOT_CHECK,
    ICON_TRIANGEL_DOWN,
    ICON_TRIANGEL_UP,
} from 'config';


let s = SStyle({
    flex1: {
    },

    scrView:{
        backgroundColor: '#ffffff'
    },
    topBag:{
        height:150,
        backgroundColor: '#2296f3'
    },
    topBagT:{
        backgroundColor: '#0884E7',
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    item: {
        borderBottomWidth: 'slimLine',
        borderColor: 'f0',
        borderWidth:1,
        marginLeft:15,
        marginRight:15,
        backgroundColor:'#fff',
        borderRadius:3,
        padding:10,
        marginTop:10

    },

    fontF:{
        fontFamily:'DINPro-Regular'
    },

    border_bottom: {
        borderBottomWidth: 'slimLine',
        borderColor: 'f0',

    },
    centraInfo:{
        marginTop:5,
        flexDirection: 'row',
        marginLeft:15

    },
    stock_image: {
        height: 70,
        width: 70,
        marginLeft: 8,
    },
    font:{
        fontSize:14,
    },

    more_property: {
        justifyContent: 'center',
        alignItems: 'center'
    },

    arrow_down: {
        width: 16,
        height: 8
    },
    bigNum: {
        flexDirection: 'row',
        alignItems:'flex-end',
        justifyContent: 'flex-end',

    },
    centerNum: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerText: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    padBt:{
        paddingBottom:7,
    },
    ViewLine:{
        height:15,
        backgroundColor:'#EFEFF4',
        paddingTop:20,
    },



});

module.exports = class centralDetails extends  SComponent{
    constructor(props){
        super(props);
        //查询入参
        this._queryObj = {
            skuId:props.route.data.skuId,
            batchNo:props.route.data.batchNo,
            samplingTime:props.route.data.samplingTime,
            sourceType:props.route.data.sourceType,
            type:props.route.data.type,
        }
        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            showMoreProperty: false,
            refreshing: true,
            urllist: [],
            dataSource: [],
        }
    }


    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
             this._getData();
        })
    }

    _getData(){
        this.changeState({
            refreshing: true
        })
        commonRequest({
            apiKey: 'getCaiMiSamplingReportKey',
            objectName: 'caimiSamplingQueryDO',
            params: this._queryObj
        }).then( (res) => {
            let data = res.data;
            let urllist = [];
            if (!str.arrIsEmpty(data.goodsPicUrlList)) {
                urllist = data.goodsPicUrlList.map(item => item.img);
            }
            console.log('返回数据',data);

            this.changeState({
                refreshing: false,
                dataSource: data.samplingReportDetailDTOs,
                imperfectExpressionRate:data.imperfectExpressionRate,//残次率
                imperfectExpressionWeightAll:data.imperfectExpressionWeightAll,//残次率（斤）
                failureRate:data.failureRate,//不合格率
                gradeDiscrepancyWeight:data.gradeDiscrepancyWeight,//不合格率（斤）
                damagedNum:data.damagedNum,//货品破损件数
                samplingNum:data.samplingNum,//抽检件数
                netWeightAve:data.netWeightAve,//平均净重
                getWeightAve:data.getWeightAve,//平均毛重
                singletonWeightAve:data.singletonWeightAve,//单个平均重量
                weightAll:data.weightAll,//总毛重
                netWeightAll:data.netWeightAll,//总净重
                tareAll:data.tareAll,//总皮重
                carriageTemperatureStr:data.carriageTemperatureStr,//车厢温度
                goodsTemperatureStr:data.goodsTemperatureStr,//货品温度
                singletonNumAveStr:data. singletonNumAveStr,//单件平均个数
                imperfectExpression:data.imperfectExpression,//残次表现
                damagedRemark:data.damagedRemark,//货品破损备注
                remark:data. remark,//抽检备注
                 urllist: urllist,//抽检照片

            });
        }).catch( err => {
            console.log('err:', err),
                this.changeState({
                    refreshing: false,
                    dataSource:[]
                })
        })
    }




    _renderRow(rowData, sectionID, rowID) {
        return (
           <RowMore rowData={rowData}>

           </RowMore>
            )
        }


    render(){
        return (
            <Page title="抽检报告" pageLoading={false} back={()=>this.navigator().pop()}>
                <ScrollView ref={v=>{this._scrollResponder = v;}} style={s.scrView}>
                    <View style={[s.topBag,{alignItems:'center'}]}>
                        <View  style={{flexDirection: 'row',marginTop:20}} >
                            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center',}}>
                                <View style={s.bigNum}>
                                    <SText style={s.fontF} fontSize={40} color="#fff">{this.state.imperfectExpressionRate ||0}</SText>
                                    <SText style={s.padBt} fontSize="mini" color="#fff">%</SText>
                                </View>
                                <SText style={{textAlign:'center'}} fontSize="mini" color="#95c6ff">残次率({this.state.imperfectExpressionWeightAll||0}斤)</SText>
                            </View>
                            <View style={{flexDirection: 'column',marginLeft:20, justifyContent: 'center', alignItems: 'center',}}>
                                <View style={s.bigNum}>
                                    <SText style={s.fontF} fontSize={40} color="#fff">{this.state.failureRate}</SText>
                                    <SText style={s.padBt} fontSize="mini" color="#fff">%</SText>
                                </View>
                                <SText style={{textAlign:'center'}} fontSize="mini" color="#95c6ff">不合格率({this.state.gradeDiscrepancyWeight||0}斤)</SText>
                            </View>
                        </View>
                        <View style={{flexDirection: 'row',alignItems:'center',marginTop:25}}>
                            {
                                this.state.damagedNum?
                                    <View style={{flexDirection: 'row'}}>
                                        <SText style={{textAlign:'center'}} fontSize="mini" color="#95c6ff">货品破损</SText>
                                        <SText style={{textAlign:'center',marginLeft:3,marginRight:3}} fontSize="mini" color="#fff">{this.state.damagedNum||0}</SText>
                                        <SText style={{textAlign:'center'}} fontSize="mini" color="#95c6ff">件</SText>
                                    </View>
                                    :null
                            }
                            <SText style={{textAlign:'center',marginLeft:5}} fontSize="mini" color="#95c6ff">抽取</SText>
                            <SText style={{textAlign:'center',marginLeft:3,marginRight:3}} fontSize="mini" color="#fff">{this.state.samplingNum||0}</SText>
                            <SText style={{textAlign:'center'}} fontSize="mini" color="#95c6ff">件</SText>
                        </View>
                    </View>
                    <View style={s.topBagT}>
                        <View style={s.centerNum}>
                            <View style={s.bigNum}>
                                <SText  style={s.fontF} fontSize={25} color="#fff">{this.state.getWeightAve}</SText>
                                <SText  fontSize="mini" color="#fff" >斤</SText>
                            </View>
                            <SText style={{textAlign:'center'}} fontSize="mini" color="#95c6ff">平均毛重</SText>
                        </View>
                        <View style={s.centerNum}>
                            <View style={s.bigNum}>
                                <SText style={s.fontF} fontSize={25} color="#fff">{this.state.netWeightAve}</SText>
                                <SText  fontSize="mini" color="#fff">斤</SText>
                            </View>
                            <SText style={{textAlign:'center'}} fontSize="mini" color="#95c6ff">平均净重</SText>
                        </View>
                        <View style={s.centerNum}>
                            <View style={s.bigNum}>
                                <SText style={s.fontF} fontSize={25} color="#fff">{this.state.singletonWeightAve||0}</SText>
                                <SText   fontSize="mini" color="#fff">斤</SText>
                            </View>
                            <SText style={{textAlign:'center'}} fontSize="mini" color="#95c6ff">单个平均重量</SText>
                        </View>
                    </View>
                    <Row style={[s.border_bottom,{flexDirection: 'column', paddingBottom: 15, paddingTop: 15}]}>
                        <View style={[s.centraInfo, {marginTop: 0}]}>
                            <SText  fontSize="mini" color="999">总毛重:{this.state.weightAll}斤  </SText>
                            <SText  fontSize="mini" color="999">总净重:{this.state.netWeightAll}斤  </SText>
                            <SText  fontSize="mini" color="999">总皮重:{this.state.tareAll}斤</SText>
                        </View>
                        <View style={s.centraInfo}>
                            <SText  fontSize="mini" color="999">{this.state.carriageTemperatureStr}</SText>
                            <SText  fontSize="mini" color="999">{this.state.carriageTemperatureStr? ' ' : ''}{this.state.goodsTemperatureStr}</SText>
                            <SText  fontSize="mini" color="999">{this.state.goodsTemperatureStr? ' ' : ''}{this.state.singletonNumAveStr}</SText>
                        </View>
                        {
                            this.state.imperfectExpression?
                                <View style={s.centraInfo}>
                                    <SText style={{textAlign:'center'}} fontSize="mini" color="999">{this.state.imperfectExpression}</SText>
                                </View>
                                :null
                        }

                    </Row>

                    {this._renderImages()}
                    {this._renderDamagedReMark()}
                    {this._renderFuckText()}
                    <View style={s.ViewLine}></View>
                    <SText style={[s.flex1,{marginLeft:15,paddingTop:20}]} fontSize="mini" color="999">货品抽检详细信息</SText>
                    <ListView
                        style={{flex:1,paddingBottom:15}}
                        refreshControl={
                            <RefreshControl
                                style={{backgroundColor:'transparent'}}
                                refreshing={this.state.refreshing}
                                onRefresh={this._getData.bind(this)}
                                tintColor="#54bb40"
                                title="加载中..."
                                titleColor="#999"
                                colors={['#2296f3']}
                                progressBackgroundColor="#fff"
                            />
                        }
                        initialListSize={10}
                        enableEmptySections={true}
                        dataSource={this._ds.cloneWithRows(this.state.dataSource)}
                        renderRow={this._renderRow}/>

                </ScrollView>
            </Page>

        )
    }
    _renderFuckText = () => {
        if (this.state.remark) {
            return (
                <View>
                    <View style={{marginLeft:15,marginTop:15,marginBottom:20,marginRight:15}}>
                        <SText style={[s.flex1,{}]} fontSize="mini" color="999">抽检备注</SText>
                        <SText style={[,{marginTop:8}]} fontSize={12} color="#333333">{this.state.remark}</SText>
                    </View>
                </View>
            )
        }

    }

    _renderDamagedReMark = () => {
        if (this.state.damagedRemark) {
            return (
                <View>
                    <View style={{marginLeft:15,marginTop:15,marginBottom:20,marginRight:15}}>
                        <SText style={[s.flex1,{}]} fontSize="mini" color="999">货品破损备注</SText>
                        <SText style={[,{marginTop:8}]} fontSize={12} color="#333333">{this.state.damagedRemark}</SText>
                    </View>
                </View>
            )
        }

    }

    _renderImages = () => {
        if (!str.arrIsEmpty(this.state.urllist)) {
            return  (
                <View>
                    <SText style={[{marginLeft:15,marginTop:20,marginBottom: 10}]} fontSize="mini" color="999">抽检照片</SText>
                    <View style={{paddingLeft: 15,marginBottom:5}}>
                        <GalleryList
                            imageList={this.state.urllist || []}
                            horizontal={true}
                            imageStyle={s.stock_image}
                        />
                    </View>
                </View>
            )
        }
    }
};



class RowMore extends SComponent {
    constructor(props){
        super(props);

        if(props.rowData.goodsPictureUrls == null){
            props.rowData.goodsPictureUrls =[]
        }
        let urllistP = props.rowData.goodsPictureUrls.map(item => item.img);
        this.state = {
            showAll: false,
            rowData:props.rowData,
            showMoreProperty:false,
            urllistP:urllistP ,
        }

    }

    _renderMoreProperty(){
        if(this.state.showMoreProperty){
            return (
                <View style={[s.flex1,{flexDirection: 'column'}]}>
                    <SText style={{marginTop:5}} fontSize="caption" color="#333333">毛重:{this.state.rowData.weight||0}斤</SText>
                    <SText style={{marginTop:5}} fontSize="caption" color="#333333">皮重:{this.state.rowData.tare||0}斤</SText>
                    <SText style={{marginTop:5}} fontSize="caption" color="#333333">净重:{this.state.rowData.netWeight||0}斤</SText>
                    {
                        this.state.rowData.singletonNum?
                            <SText style={{marginTop:5}} fontSize="caption" color="#333333">单件个数:{this.state.rowData.singletonNum||0}个</SText>
                            :null

                    }
                    <View style={{marginTop:5}}>
                        <GalleryList
                            imageList={this.state.urllistP|| []}
                            horizontal={true}
                            imageStyle={s.stock_image}
                            containerStyle={{paddingRight: 10}}
                        />
                    </View>
                </View>
            )
        }
    }

    render(){
        return (
            <View style={s.item}>
                <View style={{flexDirection: 'row',marginBottom:5}}>
                    <SText style={{flex: 1}} fontSize="mini" color="#333333">{this.state.rowData.num||''}</SText>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            this.changeState({
                                showMoreProperty: !this.state.showMoreProperty
                            })
                        }}
                    >
                        <SText  fontSize="mini" color="blue" >{this.state.showMoreProperty? '收起' : '查看全部'}</SText>

                    </TouchableWithoutFeedback>
                </View>
                <View style={s.border_bottom}></View>
                <View style={{flexDirection: 'column',marginTop:5}}>
                    <SText style={[s.flex1,{marginTop:5}]} fontSize="caption" color="#333333">残次率:{this.state.rowData.imperfectExpressionRate||0+'%'}({this.state.rowData.imperfectExpressionWeight||0}斤)</SText>
                    <SText style={[s.flex1,{marginTop:5}]} fontSize="caption" color="#333333">不合格率:{this.state.rowData.unqualifiedRate||0 +'%'}({this.state.rowData.gradeWeight||0}斤)</SText>
                    {
                        this.state.rowData.singletonWeight?
                            <SText style={[s.flex1,{marginTop:5}]} fontSize="caption" color="#333333">单个重量:{this.state.rowData.singletonWeight||0}斤</SText>
                            :null

                    }

                </View>
                {this._renderMoreProperty()}
            </View>
        )
    }

}