'use strict'

import React from 'react';
import ReactNative, {View, Image, TouchableOpacity, TextInput} from 'react-native';
import {SComponent, SText} from 'sxc-rn';
import s from '../label.style';
import {str} from 'tools';

module.exports = class SelectLabel extends SComponent {
    constructor(props){
        super(props);
        this.state = {
            value: '',
        }
    }

    timeout = 0;

    /**
     * 校验是否是必填，除了自身设置为是否必填还有一种情况。拼接属性中存在必填则它的父亲也是要必填的
     * @type {[type]}
     */
    _isRequired(nodeData: Object){
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
                <TextInput
                    style={s.tinyInput}
                    keyboardType='numeric'
                    defaultValue={this.props.data.valueData}
                    onChangeText={(res) => this._onTextChange(res)}
                ></TextInput>
            )
        } else return (
            <View style={s.inputRow}>
                <SText fontSize='body' color='999'>{this.props.labelName? this.props.labelName : this.props.data.propertyName}<SText fontSize='body' color='red'>{this._isRequired(this.props.data)? '*' : ''}</SText></SText>
                <View style={s.right}>
                    <TextInput
                        style={s.smallInput}
                        keyboardType='numeric'
                        placeholder='请输入'
                        defaultValue={this.props.data.valueData}
                        onChangeText={(res) => this._onTextChange(res)}
                    ></TextInput>
                </View>
            </View>
        )
    }

    _onTextChange(value){
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (value) {
                this.props.data['valueData'] = value;
            }
        }, 500);

    }
};
