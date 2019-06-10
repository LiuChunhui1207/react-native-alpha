import React from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import  YesterdayLossList from './yesterdayLossList';
import  CurrentLossList from './currentLossList'


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


module.exports = class manceLoss extends SComponent{
    constructor(props){
        super(props);
    }


    _onChangeTab = (obj) => {
        if(obj.i == 0){
            this.getRef('yesterday')('_getData')();
        }
        else{
            this.getRef('current')('_getData')();
        }

    }

    render(){
        return (
            <Page
                pageName='昨日/本月赔款损耗率'
                title='赔款损耗率' pageLoading={false} back={()=>this.navigator().pop()}>

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
                    <YesterdayLossList ref="yesterday" tabLabel="昨日" route={this.props.route} navigator={this.props.navigator} />
                    <CurrentLossList ref="current" tabLabel="本月" route={this.props.route} navigator={this.props.navigator} />

                </ScrollableTabView>



            </Page>
        )
    }
}