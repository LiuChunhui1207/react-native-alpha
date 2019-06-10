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
    iconSort: {
        height: 6,
        width: 10
    },
    headerCell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
});


module.exports = class profitRateYeterdayList extends SComponent{
    static propTypes = {
        route: React.PropTypes.object.isRequired,
        navigator: React.PropTypes.object.isRequired,
    };

    constructor(props){
        super(props);
        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            refreshing: true,
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
            apiKey: 'queryPerformanceProfitListKey',
            objectName: 'performanceQueryDO',
            params: {timeType:0}
        }).then( (res) => {
            let data = res.data;
            this.changeState({
                refreshing: false,
                dataSource: data.performanceSkuProfits,
                totalProfitFee:data.totalProfitFee,
                totalProfitRate:data.totalProfitRate,
            });
        }).catch( err => {
            console.log('err:', err),
                this.changeState({
                    refreshing: false,
                    dataSource:[]
                })
        })
    }

    _renderRow(rowData, sectionID, rowID){
        return (
            <View style={s.row_item}>
                <Row>
                    <SText style={s.flex1} fontSize="body" color="333">{rowData.skuTitle}</SText>
                    <SText style={[s.width70, {marginRight: 5,marginLeft:10},]} fontSize="mini" color="333" >{rowData.profitFee}</SText>
                    <SText style={s.width70} fontSize="mini" color="333">{rowData.profitRate}</SText>
                </Row>
            </View>
        )
    }

    render(){
        return (
            <View style={{flex: 1}}>
                <View  style={[s.row, s.header]}>
                    <SText style={s.flex1} fontSize="mini" color="999">名称</SText>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        this.state.cloumn2TypeDESC = !this.state.cloumn2TypeDESC;
                        if (this.state.cloumn2TypeDESC) {
                            this._sortDataDESC('profitFeeIndex');
                        } else {
                            this._sortDataASC('profitFeeIndex');
                        }
                        this.changeState({
                            cloumn2TypeDESC: this.state.cloumn2TypeDESC
                        });
                    }}>

                        <View style={s.headerCell}>
                            <SText style={[s.width70,{textAlign:'center'}]} fontSize="mini" color="999">毛利额(元)</SText>
                            {this._renderSortIcon(this.state.cloumn2TypeDESC)}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        this.state.cloumn1TypeDESC = !this.state.cloumn1TypeDESC;
                        if (this.state.cloumn1TypeDESC) {
                            this._sortDataDESC('profitRateIndex');
                        } else {
                            this._sortDataASC('profitRateIndex');
                        }
                        this.changeState({
                            cloumn1TypeDESC: this.state.cloumn1TypeDESC
                        });
                    }}>
                        <View style={s.headerCell}>
                            <SText style={s.width70} fontSize="mini" color="999">一毛净率</SText>
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
                    renderRow={this._renderRow} />
                <View style={s.butom}>
                    <SText style={s.flex1} fontSize="mini" color="999">总计</SText>
                    <SText style={s.buttomText} fontSize="mini" color="999">{this.state.totalProfitFee?this.state.totalProfitFee:0}</SText>
                    <SText style={s.buttomText} fontSize="mini" color="999">{this.state.totalProfitRate?this.state.totalProfitRate:0}</SText>
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
