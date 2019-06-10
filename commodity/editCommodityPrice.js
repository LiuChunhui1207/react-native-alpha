/**
 *
 * 项目名称：caimi-rn
 * 文件描述：编辑商品售价页面
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/5/12 14:40
 * 修改人：cfy
 * 修改时间：17/5/12 14:40
 * 修改备注：
 * @version
 */
import React from 'react';
import {
    View,
    TouchableOpacity,
    Platform,
    Image,
    ScrollView
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Row, Button, SInput} from 'components';
import  CityCommodityPrice from './cityCommodityPrice'
var Dimensions = require('Dimensions');
var {width} = Dimensions.get('window');
let s = SStyle({
    baseInfo:{
        backgroundColor:'#ffffff',
        padding:15,
    },
    borderRight:{
        borderColor:'#f2f4f5',
        borderRightWidth:2
    },
    tab:{
        backgroundColor:'#fff',
    },
    tab_item_check:{
        borderColor:'#007BFF',
        borderBottomWidth:2,
        paddingTop:10,
        paddingBottom:10
    },
    tab_item:{
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center',
        width:width/5,
        paddingLeft:10,
        paddingRight:10
    },
});
module.exports = class EditCommodityPrice extends SComponent{
    constructor(props){
        super(props)
        this.state={
            currentTab:{
                name:'杭州',
                id:1
            },
            pageLoading:false,
            cityList:[
                {
                    name:'杭州',
                    id:1
                },
                {
                    name:'上海',
                    id:2
                },
                {
                    name:'武汉',
                    id:3
                }
            ]
        }
    }
    _renderBaseInfo(){
        return(
            <View style={s.baseInfo}>
                <Row >
                    <SText fontSize='title' color='333' style={{flex:1}}>基地精品土豆</SText>
                    <SText fontSize='caption' color='#768591'>0067</SText>
                </Row>
                <Row style={{marginTop:5,alignItems:'center'}}>
                    <SText fontSize='caption' color='#768591' >泡面箱装</SText>
                    <SText fontSize='caption' color='#F2F4F5' >|</SText>
                    <SText fontSize='caption' color='#768591'>43斤装</SText>
                    <SText fontSize='caption' color='#F2F4F5' >|</SText>
                    <SText fontSize='caption' color='#768591'>剩余99件</SText>
                </Row>
            </View>
        )
    }
    /**
     * @Description: 城市tab
     * @param
     * @return
     * @throws
     * @author       chengfy@songxiaocai.com
     * @date         17/5/15 15:28
     */
    _renderCityTabs(){
        return (
            <View>
                <View style={s.tab}>
                    <ScrollView
                        horizontal
                        contentContainerStyle={{alignItems: 'flex-end'}}
                        showsHorizontalScrollIndicator={false}
                    >
                        {
                            this.state.cityList.map((status, index) =>{
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={()=>{
                                            this.changeState({
                                                currentTab: status
                                            })
                                        }}
                                        style={s.tab_item}
                                    >
                                        <View
                                            style={[{paddingTop:10, paddingBottom:10,width:width/5-20,justifyContent:'center',arguments:'center'},this.state.currentTab.id == status.id ? s.tab_item_check  : {}]}
                                        >
                                            <SText fontSize="body" color={this.state.currentTab.id == status.id ? '#007BFF' : '333'} style={{textAlign:'center'}}>{status.name}</SText>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </View>
        )
    }
    render(){
        return(
            <Page
                title={'编辑商品售价'}
                pageLoading={this.state.pageLoading}
                back={() => this.navigator().jumpBack()}>
                {this._renderBaseInfo()}
                {this._renderCityTabs()}
                <CityCommodityPrice
                    {...this.props}
                />
            </Page>
        )
    }
}