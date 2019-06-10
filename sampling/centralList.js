'use strict';
import React from 'react';
import {
    InteractionManager,
    Navigator,
    Image,
    ListView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    View,
} from 'react-native';
import {SStyle, SComponent, SText,SRefreshScroll} from 'sxc-rn';
import {UtilsAction} from 'actions';
import {Page, Row, Col, Button} from 'components';


//抽取详情界面
import  CentralDetails from './centralDetails';
//选择日期页面
import SelectDate from '../delivery/selectDate';
import {
    ICON_RIGHT,
    ICON_LEFT,
    ICON_CAL
} from 'config';

let s = SStyle({
    flex1: {
        flex: 1
    },
    width70: {
        width: 70,
    },
    width50: {
        width: 50,
    },
    list_header: {
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        height: 30,
    },
    header: {
        height: 42,
        // justifyContent: 'center',
        backgroundColor: '#0884E7'
    },
    left_btn: {
        flex: 1,
        width: 70,
        alignItems: 'center'
    },
    right_btn: {
        flex: 1,
        width: 70,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    mid_btn: {
        marginTop: 6,
        alignItems: 'center',
        justifyContent: 'center',
        width: 148,
        backgroundColor: '#fff',
        height: 30,
        borderRadius: 2
    },
    icon_left: {
        marginLeft: 13,
        marginRight: 6,
        width: 7,
        height: 12
    },
    icon_right: {
        marginRight: 13,
        marginLeft: 6,
        width: 7,
        height: 12
    },
    icon_cal: {
        marginLeft: 6,
        width: 16,
        height: 16
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
        marginTop:10,

    },
    num_box: {
        marginLeft: 2,
        marginTop: -1,
        paddingLeft: 4,
        paddingRight: 4,
        borderWidth: 'slimLine',
        borderColor: '#fff',
        borderRadius: 8
    },
    border_bottom: {
        borderBottomWidth: 'slimLine',
        borderColor: 'f0',

    },
});

/**
 * 抽检报告
 */
module.exports = class centralList extends SComponent{
    constructor(props){
        super(props);
        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        //计算当前月份前后一个月
        let startDate = new Date(),
            endDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 2);
        endDate.setDate(0);
        this.state = {
            pageLoading: true,
            refreshing: true,
            startDate,
            endDate,
            storeHouseIds: [],   //已选择服务站ids
            marketDtoList: [],   //服务站列表
            presellOrderList: [] //预售商品列表
        }
    }
    componentDidMount() {
        InteractionManager.runAfterInteractions( () => {
            this._getData();
        })
    }
    /**
     * 前一天或者后一天
     * 前一天时num为-1  后天num为1
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    _getNextOrLastDay(num){
        let date = new Date(this.state.samplingTime), selectDate;
        date.setDate(date.getDate() + num);
        selectDate = date.getMonth() + 1 > 9 ? `${date.getFullYear()}${date.getMonth() + 1}${date.Date()}` : `${date.getFullYear()}0${date.getMonth() + 1}${date.getDate()}`;
        this.changeState({
            selectDate,
            pickTimeDes: `${date.getMonth() + 1}月${date.getDate()}日`,
            samplingTime: date.getTime()
        }, ()=> {
            this._getData();
        })
    }
    /**
     * 获取库存列表
     * @return {[type]} [description]
     */
    _getData = () =>{
        if(!this.state.pageLoading){
            this.changeState({
                refreshing: true
            })
        }
        let params = {
            queryAllPickhosue: true
        };
        if(this.state.storeHouseIds.length > 0){
            params['pickhouseIds'] = this.state.storeHouseIds;
            params['queryAllPickhosue'] = false;
        }
        if(this.state.samplingTime){
            params['pickTime'] = this.state.samplingTime
        }
        commonRequest({
            apiKey: 'getCaiMiSamplingListKey',
            objectName: 'caimiSamplingQueryDO',
            params: {samplingTime:this.state.samplingTime}
        }).then( (res) => {
            let data = res.data;
            console.log('dododdodood', data);
            let date = new Date(data.samplingTime);
            let day =date.getDay();
            if(day == 0){
                day='日'
            }
            if(day == 1){
                day = '一'
            }
            if(day == 2){
                day = '二'
            }
            if(day == 3){
                day = '三'
            }
            if(day == 4){
                day = '四'
            }
            if(day == 5){
                day = '五'
            }
            if(day == 6){
                day = '六'
            }
            this.changeState({
                pageLoading: false,
                refreshing: false,
                presellOrderList: data.samplingListDetailDTOs,
                marketDtoList: data.marketDtoList,
                pickTimeDes: `${date.getMonth() + 1}月${date.getDate()}日周${day}`,
                samplingTime: data.samplingTime
            });
        }).catch( err => {
            this.changeState({
                refreshing: false
            })
        })
    }
    _selectDate = ()=> {
        this.navigator().push({
            callback: this._selectDateCallback,
            component: SelectDate,
            name: 'SelectDate',
            selectDate: this.state.selectDate,
            startDate: this.state.startDate,
            endDate: this.state.endDate
        })
    }

    /**
     * 选择时间-回调方法
     * @param  {[type]} date [description]
     * @return {[type]}      [description]
     */
    _selectDateCallback = (date) => {
        let dateArr = date.split('-'),
            year = dateArr[0],
            month = dateArr[1],
            day = dateArr[2];
        let selectDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        this.changeState({
            selectDate: date.replace('-', '').replace('-', ''),
            pickTimeDes: `${selectDate.getMonth() + 1}月${selectDate.getDate()}日`,
            samplingTime: selectDate.getTime()
        }, ()=> {
            this._getData()
        })
    }

    /**
     * 抽取报告-列渲染方法
     * @param  {[type]} rowData   [description]
     * @param  {[type]} sectionID [description]
     * @param  {[type]} rowID     [description]
     * @return {[type]}           [description]
     */
    _renderRow(rowData, sectionID, rowID){
        return (
            <TouchableOpacity
                onPress={()=>{
                    this.navigator().push({
                        component: CentralDetails,
                        name: 'CentralDetails',
                        data:{
                            skuId:rowData.skuId,
                            batchNo:rowData.batchNo,
                            samplingTime:rowData.samplingTime,
                            sourceType:rowData.sourceType,
                            type:rowData.type,
                        }
                    })
                }}
                style={s.item}
            >
                <View style={{flexDirection: 'row',marginBottom:5}}>
                    <View style={[s.flex1,{flexDirection: 'column'}]}>
                        <SText fontSize={12} color='#333333'>{rowData.spuName}</SText>
                        <SText style={{marginTop:5}} fontSize="mini" color="999">{rowData.itemSpecies}</SText>
                    </View>
                    <View style={[s.width50,{flexDirection: 'column',marginLeft:10,marginRight:5}]}>
                        <SText style={{textAlign:'center'}} fontSize="caption" color='#333333'>{rowData.imperfectExpressionRate}%</SText>
                        <SText style={{textAlign:'center'}} fontSize="mini" color="999">残次率</SText>
                    </View>
                    <View style={[s.width50,{flexDirection: 'column',}]}>
                        <SText style={{textAlign:'center'}} fontSize="caption" color='#333333'>{rowData.failureRate}%</SText>
                        <SText style={{textAlign:'center'}} fontSize="mini" color="999">不合格率</SText>
                    </View>
                </View>
                <View style={s.border_bottom}></View>
                <View style={{flexDirection: 'row',marginTop:10}}>
                    <SText style={[s.flex1,]} fontSize="mini" color="999">{rowData.skuId}</SText>
                    <SText style={[s.width70,{textAlign:'center'}]} fontSize="mini" color="999">{rowData.days}</SText>
                    <SText style={[s.width50,{textAlign:'center',marginLeft:5}]} fontSize="mini" color="999">{rowData.typeStr}</SText>
                    <SText style={{textAlign:'right',marginLeft:10}} fontSize="mini" color="999">{rowData.samplingTimeStr}</SText>
                </View>
        </TouchableOpacity>
        )
    }
    render(){
        return (
            <Page
                title='抽检报告'
                pageLoading={this.state.pageLoading}
                back={()=>this.navigator().pop()}
            >
                <Row style={s.header}>
                    <Row
                        style={s.left_btn}
                        onPress={()=>this._getNextOrLastDay(-1)}
                    >
                        <Image style={s.icon_left} source={ICON_LEFT} />
                        <SText fontSize="mini" color="white">前一天</SText>
                    </Row>
                    <Row
                        onPress={this._selectDate}
                        style={s.mid_btn}
                    >
                        <SText fontSize="mini" color="blue"> {this.state.pickTimeDes}</SText>
                        <Image style={s.icon_cal} source={ICON_CAL} />
                    </Row>
                    <Row
                        onPress={()=>this._getNextOrLastDay(1)}
                        style={s.right_btn}
                    >
                        <SText fontSize="mini" color="white">后一天</SText>
                        <Image style={s.icon_right} source={ICON_RIGHT} />
                    </Row>
                </Row>

                <ListView
                    style={{flex: 1, backgroundColor: '#e5e5e5',marginBottom:15}}
                    refreshControl={
                        <RefreshControl
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
                    dataSource={this._ds.cloneWithRows(this.state.presellOrderList)}
                    renderRow={this._renderRow.bind(this)}
                />
            </Page>
        )
    }
}
