'use strict';
import React from 'react';
import {
    View,
    TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Row, Col, Button} from 'components';
import {UtilsAction} from 'actions';
import ScrollableTabView from 'react-native-scrollable-tab-view';

//中心仓抽检列表
import CentralList from './centralList';

let s = SStyle({
});

/**
 * 商品列表页面
 * @type {[type]}
 */
module.exports = class sampling extends SComponent{
    constructor(props){
        super(props);
    }

    _goToPage = (i)=>{
        if(i === 1){
            __STORE.dispatch(UtilsAction.toast('功能开发中', 1000));
        }
    }

    render(){
        return (
            <Page title='抽检报告'
                  pageLoading={false}
                  back={()=>this.navigator().pop()}
            >
                <ScrollableTabView
                    goToPage={this._goToPage}
                    tabBarTextStyle={{
                        fontSize: 18,
                    }}
                    initialPage={1}
                    tabBarBackgroundColor="#fff"
                    tabBarActiveTextColor="#2296F3"
                    tabBarInactiveTextColor="#999"
                    tabBarUnderlineColor="#2296F3"
                >

                    <View onPress={()=>{console.log('ssssssss')}} tabLabel="供应商抽检">
                        <SText fontSize="body" color="666">功能开发中</SText>
                    </View>
                    <CentralList {...this.props} tabLabel="中心仓抽检" />
                </ScrollableTabView>
            </Page>
        )
    }
}
