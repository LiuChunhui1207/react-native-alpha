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
import {Page, Button, Row,Camera, GalleryList} from 'components';
import {str} from 'tools';


var s = SStyle({

    row: {
        flexDirection: 'row',
        marginTop:5,
        marginBottom:10,
        marginLeft:15,
        marginRight:15,

    },
    info:{
        flexDirection: 'row',
        marginBottom:5,
        marginLeft:15,
        marginRight:15,
    },
    column:{
        flexDirection: 'column',
    },
    item: {
        borderBottomWidth: 'slimLine',
        borderColor: 'f0',
        borderWidth:1,
        backgroundColor:'#fff',
        padding:10,
        marginTop:10

    },
    row_item: {
        flexDirection: 'column',
        backgroundColor: 'fff',
        borderColor: 'f0',
        marginBottom: 10
    },
    stock_image: {
        height: 70,
        width: 70,
        marginLeft: 8,
    },

})


module.exports = class refundDetails extends  SComponent{
    constructor(props){
        super(props);
        this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        //查询入参
        // let currentPage;
        // if(this.state.currentPage == null){
        //     currentPage = 1
        // }else {
        //     currentPage:this.state.currentPage
        // }
        this._queryObj = {
            skuId:props.route.data.skuId,
            timeType:props.route.data.timeType,
        }
        this.state = {
            skuId: props.route.data.skuId,
            skuTitle: props.route.data.skuTitle,
            timeType: props.route.data.timeType,
            refreshing: true,
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
            apiKey: 'queryRefundWeightListKey',
            objectName: 'performanceQueryDO',
            params: this._queryObj
        }).then( (res) => {
            let data = res.data;
            console.log('返回数据',data),
            this.changeState({
                refreshing: false,
                dataSource: data.refundWeightItems,
                currentPage: data.currentPage,

            });
        }).catch( err => {
            console.log('err:', err),
                this.changeState({
                    refreshing: false,
                    dataSource:[]
                })
        })
    }

    render(){
        return (
            <View style={{flex: 1}}>
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
            </View>
        )
    }
    /**
     * 小仓耗损-列渲染方法
     * @param  {[type]} rowData   [description]
     * @param  {[type]} sectionID [description]
     * @param  {[type]} rowID     [description]
     * @return {[type]}           [description]
     */
    _renderRow(rowData, sectionID, rowID){
        return (
           <Refund rowData={rowData}></Refund>
        )
    }








};


class  Refund extends  SComponent{
    constructor(props) {
        super(props);

        if(props.rowData.refundWeightDetails == null){
            props.rowData.refundWeightDetails = []
        }
        let urllistP = [];
        if (!str.arrIsEmpty(props.rowData.refundWeightImgs)) {
            urllistP = props.rowData.refundWeightImgs.map(item => item.img);
        }

        this.state = {
            rowData:props.rowData,
            urllistP:urllistP ,
        }
    }


    render(){
        return (
        <View >
            <View style={s.row_item}>
                <View style={s.row}>
                    <SText  fontSize="caption" color="333">{this.state.rowData.buyerName}</SText>
                    <SText style={{marginLeft:10,flex: 1}} fontSize="caption" color="333" >{this.state.rowData.pickhouseName}</SText>
                    <SText style={{textAlign:'right'}} fontSize="caption" color="999">{this.state.rowData.refundWeightTime}</SText>
                </View>
                <View style={{marginBottom:5}}>
                    {
                        this.props.rowData.refundWeightDetails.map(item =>{
                            return (
                                <View style={s.info}>
                                    <View style={[s.column,{marginRight:5}]}>
                                        <SText  fontSize="caption" color="999">{item.name}</SText>
                                    </View>
                                    <View style={[s.column,{marginRight:20}]}>
                                        <SText  fontSize="caption" color="333">{item.value}</SText>
                                    </View>

                                </View>
                            )
                        })
                    }
                </View>
                {this._renderImages()}
            </View>
        </View>
        )
    }


    _renderImages = () => {
        if (!str.arrIsEmpty(this.state.urllistP)) {
            return  (
                <View>
                    <View style={{paddingLeft: 15,marginBottom:5}}>
                        <GalleryList
                            imageList={this.state.urllistP || []}
                            horizontal={true}
                            imageStyle={s.stock_image}
                        />
                    </View>
                </View>
            )
        }
    }
}