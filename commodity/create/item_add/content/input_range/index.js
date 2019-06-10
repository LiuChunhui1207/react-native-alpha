'use strict'

import React from 'react';
import ReactNative, {View, Image, TouchableOpacity, TextInput} from 'react-native';
import {SComponent, SText} from 'sxc-rn';
import s from '../label.style';
import {str} from 'tools';

module.exports = class SelectLabel extends SComponent {
    constructor(props){
        super(props);
        console.log('dodod in constructor:', props)
        this.state = {
            startValue: '',
            endValue: '',
        }
        if(props.edit && props.data.valueData){
            let index = -1, startValue = '', endValue = '', valueData = props.data.valueData;
            console.log('0000000:', valueData)
            index = valueData.indexOf('~');
            if(index != -1){
                startValue = valueData.slice(0,index);
                endValue = valueData.slice(index + 1);
            }
            else{
                index = valueData.indexOf('>');
                if(index != -1){
                    startValue = valueData.slice(index + 2);
                }
                else{
                    index = valueData.indexOf('<');
                    if(index != -1){
                        endValue = valueData.slice(index + 2);
                    }
                }
            }
            props.data['startValue'] = startValue;
            props.data['endValue'] = endValue;
            this.state = {
                startValue,
                endValue
            }
        }
    }
    /**
     * 校验是否是必填，除了自身设置为是否必填还有一种情况。拼接属性中存在必填则它的父亲也是要必填的
     * @type {[type]}
     */
    _isRequired(nodeData: Object){
      console.log("属性名：",nodeData.propertyName,nodeData);
      if(nodeData.required){
        return true;
      }else if(nodeData.mosaic === 1){
        //找出拼接属性需要拼接的叶子属性
        let leafs = nodeData.childrenPropertyList.filter((child) => {
          return child.childrenPropertyList.length === 0;
        });
        return leafs.map((leaf) => leaf.required)
                .reduce((prev,next) => prev + next) === leafs.length;
      }
    }

    render(){
        if (this.props.small) {
            return (
                <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                    <TextInput
                        style={s.tinyInput}
                        keyboardType='numeric'
                        defaultValue={this.props.data.startValue}
                        onChangeText={(res) => this._onTextChange('start', res)}
                    ></TextInput>
                    <SText fontSize='body' color='333'> - </SText>
                    <TextInput
                        style={s.tinyInput}
                        keyboardType='numeric'
                        defaultValue={this.props.data.endValue}
                        onChangeText={(res) => this._onTextChange('end', res)}
                    ></TextInput>
                </View>
            )
        } else return (
            <View style={s.inputRow}>
                <SText fontSize='body' color='999'>{this.props.labelName? this.props.labelName : this.props.data.propertyName}<SText fontSize='body' color='red'>{this._isRequired(this.props.data)? '*' : ''}</SText></SText>
                <View style={s.right} onPress={this._showSelect}>
                    <TextInput
                        style={s.smallInput}
                        placeholder='请输入'
                        keyboardType='numeric'
                        defaultValue={this.props.data.startValue}
                        onChangeText={(res) => this._onTextChange('start', res)}
                    ></TextInput>
                    <SText fontSize='body' color='333'> - </SText>
                    <TextInput
                        style={s.smallInput}
                        placeholder='请输入'
                        keyboardType='numeric'
                        defaultValue={this.props.data.endValue}
                        onChangeText={(res) => this._onTextChange('end', res)}
                    ></TextInput>
                </View>
            </View>
        )
    }

    _onTextChange(type, value){
        if (type=='start') {
            this.state.startValue = value;
            if (value) {
                this.props.data.startValue = value;
            }
        } else {
            this.state.endValue = value;
            if (value) {
                this.props.data.endValue = value;
            }
        }
        if (this.state.startValue && this.state.endValue) {
            this.props.data['valueData'] = this.state.startValue + '~' + this.state.endValue;
        } else if (this.state.startValue && !this.state.endValue) {
            this.props.data['valueData'] = '>='+this.state.startValue;
        } else if (!this.state.startValue && this.state.endValue) {
            this.props.data['valueData'] = '<='+this.state.endValue;
        }
    }
};
