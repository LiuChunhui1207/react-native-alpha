'use strict';
import React from 'react';
import {
    Text,
    StyleSheet,
    Dimensions,
    UIManager,
    Platform,
    View,
    LayoutAnimation
} from 'react-native';

import {connect} from 'react-redux';

const { height, width } = Dimensions.get('window');
const toastWidth = width * 0.7;

class UtilToast extends React.Component {

    constructor(props){
        super(props);
        this.state = {
          show: false,
          text: 'Toast',
          opacity: 0.4
        };
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true)
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.toast.id !== nextProps.toast.id) {
            this.show(nextProps.toast);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if( nextState.show !== this.state.show) {
            return true;
        }
        return false;
    }

    show({text, timeout}) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        this.setState({
            opacity: 1,
            show: true,
            text: text
        });
        this.timeout = setTimeout(()=> {
            this.setState({
                show: false,
                opacity: 0.4
            });
        }, timeout);
    }

    render(){
        if (!this.state.show) return null;
        return (
            <View style={styles.container}>
                <View style={[styles.textWrap, this.props.style, {opacity: this.state.opacity}]}>
                    <Text style={styles.text}>
                        {this.state.text}
                    </Text>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
       position: 'absolute',
       top: 0,
       left: 0,
       right: 0,
       bottom: 0 
    },
    textWrap: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: toastWidth,
        left: (width - toastWidth) / 2,
        top: (height - 60) / 2,
        padding: 20
    },
    text: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        textAlign: 'center'
    }
});


let setState = (state) => {
    return {
    	toast: state.toast
    }
};

module.exports = connect(setState)(UtilToast);

