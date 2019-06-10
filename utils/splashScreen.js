'use strict';

import React from 'react';
import {
    Image,
    StyleSheet,
    StatusBar,
    Text,
    View,
    Dimensions,
} from 'react-native';

const {width, height} = Dimensions.get('window');

module.exports = class SplashScreen extends React.Component{

    render() {
        let source = require('../../image/splash_screen.jpg')
        return (
            <View style={{flex: 1}}>
                <StatusBar
                    barStyle="light-content"
                    translucent={true}
                    backgroundColor="transparent" 
                />
                <Image
                    source={source}
                    style={{
                        flex: 1,
                        width: width,
                        height: height
                    }}
                />
            </View>
        )
    }
}