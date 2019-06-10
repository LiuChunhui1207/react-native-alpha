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
        height: 40,
        alignItems: 'center',
        backgroundColor: 'fff',
    },
    buttomText:{
        textAlign: 'center',
        marginLeft: 15

    },
    header: {
        backgroundColor: 'f0',
        alignItems: 'center',
        height: 30
    },
    row: {
        flexDirection: 'row'
    },
    marginL15: {
        marginLeft: 15
    },
    marginR15: {
        marginRight: 15,
        flex: 25
    },
    row_item: {
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: 'fff',
        borderBottomWidth: 'slimLine',
        borderColor: 'f0'
    },
    flex1: {
        flex: 1,


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


module.exports = class paymentdailyList extends SComponent{
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
            apiKey: 'queryPerformancePaymentDaysListKey',
            objectName: 'performanceQueryDO',
            params: {timeType:1}
        }).then( (res) => {
            let data = res.data;
            this.changeState({
                refreshing: false,
                dataSource: data.performanceSkuPaymentDays,
                averagePaymentDays:data.averagePaymentDays,
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
            <Row >
                <SText style={s.flex1} fontSize="body" color="333">{rowData.skuTitle}</SText>
                <SText style={[s.width70,{paddingLeft:10}]} fontSize="body" color="333">{rowData.paymentDays}</SText>
            </Row>
        </View>
        )
    }

    render(){
        return (
            <View style={{flex: 1}}>
                <View  style={[s.row, s.header]}>
                    <SText style={[s.flex1,{marginLeft:10}]} fontSize="mini" color="999">名称</SText>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        this.state.cloumn2TypeDESC = ! this.state.cloumn2TypeDESC;
                        if (this.state.cloumn2TypeDESC) {
                            this._sortDataDESC('paymentDaysIndex');
                        } else {
                            this._sortDataASC('paymentDaysIndex');
                        }
                        this.changeState({
                            cloumn2TypeDESC: this.state.cloumn2TypeDESC
                        });
                    }}>
                        <View  style={[s.headerCell,{marginRight:20}]}>
                            <SText style={[s.width70, {textAlign:'right',marginRight:5 }]} fontSize="mini" color="999">账期</SText>
                            {this._renderSortIcon(this.state.cloumn2TypeDESC)}
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
                    <SText style={s.marginL15} fontSize="mini" color="999">平均账期</SText>
                    <SText style={[s.marginR15,{textAlign:'right'}]} fontSize="mini" color="blue">{this.state.averagePaymentDays?this.state.averagePaymentDays:0}天</SText>
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

