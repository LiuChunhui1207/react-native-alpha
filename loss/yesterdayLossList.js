'use strict';
import React from 'react';
import {
    View,
    InteractionManager,
    TouchableOpacity,
    RefreshControl,
    Image,
    ListView
} from 'react-native';
import {SStyle, SComponent, SText, SRefreshScroll} from 'sxc-rn';
import {Page, Button, Row} from 'components';
import {str} from 'tools';
import  ManceLossDetails from './manceLossDetails'

import { ICON_TRIANGEL_UP,ICON_TRIANGEL_DOWN} from 'config';



var s = SStyle({
    butom:{
        flexDirection: 'row',
        height: 30,
        backgroundColor: 'fff',
        alignItems:'center',
    },
    buttomText:{
        textAlign: 'center',
        marginLeft: 15

    },
    row_item: {
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'fff',
        borderBottomWidth: 'slimLine',
        borderColor: 'f0'
    },

    header: {
        backgroundColor: 'f0',
        alignItems: 'center',
        height: 30
    },
    marginL15: {

        marginLeft: 15
    },
    flex25: {
        flex: 25,
        textAlign: 'center'
    },
    flex1:{
        flex: 1,
        marginLeft:10
    },
    row: {
        flexDirection: 'row'
    },
    width70: {
        width: 70,
        textAlign: 'center'
    },
    column:{
        width: 70,
        flexDirection:'column',
    },
    iconSort: {
        height: 6,
        width: 10
    },
    headerCell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    lossNum:{
        flexDirection: 'row',
        alignItems:'center',
        backgroundColor: 'fff',
        height: 30,
        marginTop:10,
    },
    txtR:{
        flex: 1,
        textAlign: 'right'
    }
});

module.exports = class yesterdayLossList extends SComponent{
    static propTypes = {
        route: React.PropTypes.object.isRequired,
        navigator: React.PropTypes.object.isRequired,
    };

    constructor(props){
        super(props);
        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            refreshing: false,
            cloumn1TypeDESC: false,
            cloumn2TypeDESC: false,
            dataSource: []
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
            apiKey: 'queryPerformanceLossListKey',
            objectName: 'performanceQueryDO',
            params: {timeType:0}
        }).then( (res) => {
            let data = res.data;
            this.changeState({
                refreshing: false,
                dataSource: data.performanceSkuLoss,
                centerhouseLossNum:data.centerhouseLossNum,
                refundWeight:data.refundWeight,
                totalLossRate:data.totalLossRate
            });
        }).catch( err => {
            console.log('err:', err)
            this.changeState({
                refreshing: false,
                dataSource:[]
            })
        })
    }

    _renderRow(rowData, sectionID, rowID){
        return (
            <TouchableOpacity
                onPress={()=>{
                    this.navigator().push({
                        component: ManceLossDetails,
                        name: 'ManceLossDetails',
                        data:{
                            skuId:rowData.skuId,
                            timeType:0,
                            skuTitle:rowData.skuTitle,
                        }
                    })
                }}
            >
                <View style={s.row_item}>
                    <Row>
                        <SText style={s.flex1} fontSize="body" color="333">{rowData.skuTitle}</SText>
                        <SText style={[s.width70, {marginRight: 5,marginLeft:10},]} fontSize="body" color="333" >{rowData.centerhouseLossRate}</SText>
                        <SText style={s.width70} fontSize="body" color="333">{rowData.refundRate}</SText>
                    </Row>
                </View>
            </TouchableOpacity>
        )
    }

    render(){
        return (
            <View style={{flex: 1}}>
                <View style={s.lossNum} >
                    <SText style={[s.txtR,{marginRight:15}]} color="999"  fontSize="mini">中心仓损耗{this.state.centerhouseLossNum||0}</SText>
                    <SText style={{marginRight:15}} color="999" fontSize="mini">赔款数{this.state.refundWeight||0}</SText>
                </View>
                <View  style={[s.row, s.header]}>
                    <SText style={s.flex1} fontSize="mini" color="999">名称</SText>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        this.state.cloumn2TypeDESC = !this.state.cloumn2TypeDESC;
                        if (this.state.cloumn2TypeDESC) {
                            this._sortDataDESC('salesNumIndex');
                        } else {
                            this._sortDataASC('salesNumIndex');
                        }
                        this.changeState({
                            cloumn2TypeDESC: this.state.cloumn2TypeDESC
                        });
                    }}>
                        <View style={s.headerCell}>
                            <View style={s.column}>
                                <SText style={[s.row, {textAlign: 'center'}]} fontSize="mini" color="999">中心仓</SText>
                                <SText style={[s.row, {textAlign: 'center'}]} fontSize="mini" color="999">耗损率</SText>
                            </View>
                            {this._renderSortIcon(this.state.cloumn2TypeDESC)}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        this.state.cloumn1TypeDESC = !this.state.cloumn1TypeDESC;
                        if (this.state.cloumn1TypeDESC) {
                            this._sortDataDESC('salesFeeIndex');
                        } else {
                            this._sortDataASC('salesFeeIndex');
                        }
                        this.changeState({
                            cloumn1TypeDESC: this.state.cloumn1TypeDESC
                        });
                    }}>
                        <View style={s.headerCell}>
                            <SText style={s.width70} fontSize="mini" color="999">赔款率</SText>
                            {this._renderSortIcon(this.state.cloumn1TypeDESC)}
                        </View>
                    </TouchableOpacity>
                </View>
                <ListView
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
                    dataSource={this._ds.cloneWithRows(this.state.dataSource)}
                    renderRow={this._renderRow.bind(this)} />
                <View style={s.butom}>
                    <SText style={{flex:1 ,marginLeft:10}} fontSize="mini" color="999">赔款损耗率</SText>
                    <SText style={{marginRight:15}} fontSize="mini" color="blue">{this.state.totalLossRate?this.state.totalLossRate:0}</SText>
                </View>
            </View>
        )
    }

    //noinspection JSAnnotator
    _renderSortIcon = (up: Boolean) => {
        if (up) {
            return (
                <Image source={ICON_TRIANGEL_DOWN} style={s.iconSort}></Image>
            )
        } else {
            return (
                <Image source={ICON_TRIANGEL_UP} style={s.iconSort}></Image>
            )
        }

    }

    _sortDataDESC = (cloumnType) => {
        this.state.dataSource.sort((a, b) => {
            return b[cloumnType] - a[cloumnType];
        });
    }

    _sortDataASC = (cloumnType) => {
        this.state.dataSource.sort((a, b) => {
            return a[cloumnType] - b[cloumnType];
        });
    }
}
