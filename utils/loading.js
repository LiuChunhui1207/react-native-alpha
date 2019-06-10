'use strict';
import React from 'react';
import {
    View, 
    StyleSheet,
    Image
} from 'react-native';
import {connect} from 'react-redux';
import {IMAGE_GIF} from 'config';

class Loading extends React.Component{
    constructor(props){
        super(props);
        this.TIMEOUT = -1;
        //200毫秒内的请求只产生透明遮罩，防止重复点击，但是不显示loading效果。超过200毫秒才显示
        this.DELAY_TIME = 200;
        this.state = {
            overDelayTime: false,
            show: false
        };
    }
    
    componentWillUnmount() {
        clearTimeout(this.TIMEOUT);
    }

    componentWillReceiveProps(nextProps) {
    	if(nextProps.loading !== this.props.loading){
            this._toggle(nextProps.loading);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
    	if( nextState.overDelayTime !== this.state.overDelayTime 
    		|| nextState.show !== this.state.show ) {
    		return true;
    	}
    	return false;
    }

    _toggle(flag){
    	if(flag) {
    		this.setState({
    			show: true
    		})
    		this.TIMEOUT = setTimeout(()=>{
               	this.setState({
               		overDelayTime: true
               	})
            }, this.DELAY_TIME);
    	}
    	else {
    		clearTimeout(this.TIMEOUT);
    		this.setState({
    			show: false,
    			overDelayTime: false
    		})
    	}
    }

    render(){
        if(this.state.show){
            return (
                <View 
                	pointerEvents={'auto'}
                	style={s.viewContainer} 
                >
                    {this.renderContent()}
                </View>
            )
        }
        else return null
    }
    /**
     * DELAY_TIME 时间内不显示loading图
     *
     * @return     {<type>}  { description_of_the_return_value }
     */
    renderContent(){
        if(this.state.overDelayTime){
            return (
                <View style={s.imageContainer}>
                    <Image source={IMAGE_GIF} style={s.image} />
                </View>
            )
        }
        else return null
    }
}

let s = StyleSheet.create({
    viewContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0
    },
    imageContainer: {
        width : 100,
        height : 60,
        paddingTop : 3,
        backgroundColor : '#333',
        borderRadius : 4,
        alignItems : 'center',
    },
    image: {
        width : 82,
        height : 54
    }
});

let setState = (state) => {
    return {
    	loading: state.loading
    }
};

module.exports = connect(setState)(Loading);

