import React from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import ScrollableTabView from 'react-native-scrollable-tab-view';
//小仓耗损
import  RefundDetails from './refundDetails';
//中心仓耗损
import  CenterhouseDetails from './centerhouseDetails';


var s = SStyle({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'fff',
        height: 45,
        paddingLeft: 15,
        paddingRight: 15,
        borderBottomWidth: 'slimLine',
        borderColor: 'f0'
    },
    flex1: {
        flex: 1
    },
    exitBtn: {
        marginTop: 20
    }
});


module.exports = class manceLossDetails extends SComponent{
    constructor(props){
        super(props);
        this.state = {
            skuTitle:props.route.data.skuTitle
        }
    }


    _onChangeTab = (obj) => {
        if(obj.i == 0){
            this.getRef('refund')('_getData')();
        }
        else{
            this.getRef('centerhouse')('_getData')();
        }

    }

    render(){
        return (
            <Page
                pageName='耗损详情'
                title={this.state.skuTitle} pageLoading={false} back={()=>this.navigator().pop()}>

                <ScrollableTabView
                    initialPage={0}
                    scrollWithoutAnimation={true}
                    onChangeTab={this._onChangeTab}
                    tabBarBackgroundColor={'#fff'}
                    tabBarTextStyle={{fontSize: 16}}
                    tabBarActiveTextColor={'#4E92DF'}
                    tabBarInactiveTextColor={'#333'}
                    tabBarUnderlineColor={'#4E92DF'}
                    ref='ScrollableTabView'
                    style={s.scrolltabview} >
                    <RefundDetails ref="refund" tabLabel="小仓耗损" route={this.props.route} navigator={this.props.navigator} />
                    <CenterhouseDetails ref="centerhouse" tabLabel="中心仓耗损" route={this.props.route} navigator={this.props.navigator} />

                </ScrollableTabView>



            </Page>
        )
    }
}
