import React from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import  PaymentYesterdayList from './paymentYesterdayList';
import  PaymentdailyList from './paymentdailyList'

var s = SStyle({
    row: {
        flexDirection: 'row'
    },
    header: {
        backgroundColor: 'f0',
        alignItems: 'center',
        height: 30
    },
    marginL15: {
        marginLeft: 15
    },
    marginR15: {
        marginRight: 15
    },

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



module.exports = class paymentDay extends SComponent{
    constructor(props){
        super(props);
    }


    _onChangeTab = (obj) => {
        if(obj.i == 0){
            this.getRef('yesterday')('_getData')();
        }
        else{
            this.getRef('daily')('_getData')();
        }

    }

    render(){
        return (
            <Page title='账期' pageLoading={false} back={()=>this.navigator().pop()}>

                <ScrollableTabView
                    initialPage={this.props.route.data.timeType == 0 ? 0 : 1}
                    scrollWithoutAnimation={true}
                    onChangeTab={this._onChangeTab}
                    tabBarBackgroundColor={'#fff'}
                    tabBarTextStyle={{fontSize: 16}}
                    tabBarActiveTextColor={'#4E92DF'}
                    tabBarInactiveTextColor={'#333'}
                    tabBarUnderlineColor={'#4E92DF'}
                    ref='ScrollableTabView'
                    style={s.scrolltabview} >
                    <PaymentYesterdayList ref="yesterday" tabLabel="昨日" route={this.props.route} navigator={this.props.navigator} />
                    <PaymentdailyList ref="daily" tabLabel="本月日均" route={this.props.route} navigator={this.props.navigator} />


                </ScrollableTabView>


            </Page>
        )
    }
}
