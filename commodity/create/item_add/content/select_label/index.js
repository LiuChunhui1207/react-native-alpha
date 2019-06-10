'use strict'

import React from 'react';
import ReactNative, {View, Image, TouchableOpacity} from 'react-native';
import {SComponent, SText} from 'sxc-rn';
import {Select} from 'components';
import s from '../label.style';
import {str} from 'tools'
import InputLabel from '../input';
import InputRangeLabel from '../input_range';

module.exports = class SelectLabel extends SComponent {
    constructor(props){
        super(props);
        this.state = {
            selectValue: this.props.data['selectValue'],
        }
        if(props.edit && props.data.valueList && props.data.valueList.length > 0){
            if(this.props.data.multiSelected){
                this.state = {
                   selectValue:  []
                }
                for(let i = 0, len = props.data.valueList.length; i < len; i++){
                    if(props.data.valueList[i].isCheck){
                        // props.data.valueData = props.data.valueList[i].valueData;
                        this.state.selectValue.push(props.data.valueList[i]);
                    }
                }
                let arrStr = [];
                this.state.selectValue.map((item) => {
                    arrStr.push(item.valueData);
                });
                props.data['valueData'] = arrStr.join(',');
            }
            else{
                for(let i = 0, len = props.data.valueList.length; i < len; i++){
                    if(props.data.valueList[i].isCheck){
                        props.data.valueData = props.data.valueList[i].valueData;
                        this.state = {
                           selectValue:  props.data.valueList[i]
                        }
                        break;
                    }
                }
            }
        }
        this.options = this.props.data.valueList.map((item) => {
            return (
                {value: item,
                name: item.valueData,}
            );
        });
        this.propOptions = this.props.data.childrenPropertyList.map((item) => {
            return (
                {value: item,
                name: item.propertyName,}
            );
        });
        this.Label = require('../label');
        this.NewPage = require('../../new_page/new_page');
    }

    render(){
        if (this.props.data.valueList.length == 1 && !this.props.data.multiSelected) {
            this.state.selectValue = this.props.data.valueList[0];
            this.props.data['valueData'] = this.props.data.valueList[0].valueData;
        }
        if (!str.arrIsEmpty(this.props.data.childrenPropertyList)) {
            if (this.props.deep < 3) {
                return (
                    <View>
                        <View style={s.row}>
                            <SText fontSize='body' color='999'>{this.props.data.propertyName}<SText fontSize='body' color='red'>{this._isRequired(this.props.data)? '*' : ''}</SText></SText>
                            <TouchableOpacity style={s.right} onPress={() => this._showSelectProp()}>
                                <SText fontSize='body' color={this.state.selectValue? '333' : '999'}>{this._renderSelectPropValue()}</SText>
                                {
                                    this.props.data.valueList.length == 1 && !this.props.data.multiSelected?
                                    null:
                                    <Image source={require('image!icon_dropdown')} style={s.img}></Image>
                                }
                            </TouchableOpacity>
                        </View>
                        {this._renderSelectProperty()}
                    </View>
                )
            } else {
                return (
                    <View style={s.row}>
                        <SText fontSize='body' color='666'>{this.props.data.propertyName}<SText fontSize='body' color='red'>{this._isRequired(this.props.data)? '*' : ''}</SText></SText>
                        <TouchableOpacity
                            style={s.right}
                            onPress={() => this._goNewPage()}
                        >
                            <SText fontSize='body' color={this.state.selectValue? '333' : '999'}>{this.props.data.valueData? this.props.data.valueData : '去选择'}</SText>
                            <Image source={require('image!icon_forward')} style={s.forwardImg}></Image>
                        </TouchableOpacity>
                    </View>
                )
            }

        } else if (this.props.small) {
            return (
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}} onPress={() => this._showSelect()}>
                    <SText fontSize='body' color={this.state.selectValue? '333' : '999'}>{this._renderSelectValue()}</SText>
                        {
                            this.props.data.valueList.length == 1 && !this.props.data.multiSelected?
                            null:
                            <Image source={require('image!icon_dropdown')} style={s.img}></Image>
                        }
                </TouchableOpacity>
            )
        } else return (
            <View style={s.row}>
                <SText fontSize='body' color='999'>{this.props.data.propertyName}<SText fontSize='body' color='red'>{this._isRequired(this.props.data)? '*' : ''}</SText></SText>
                <TouchableOpacity style={s.right} onPress={() => this._showSelect()}>
                    <SText fontSize='body' color={this.state.selectValue? '333' : '999'}>{this._renderSelectValue()}</SText>
                    {
                        this.props.data.valueList.length == 1 && !this.props.data.multiSelected?
                        null:
                        <Image source={require('image!icon_dropdown')} style={s.img}></Image>
                    }
                </TouchableOpacity>
            </View>
        )
    }

    _goNewPage(){
        this.setRouteData({
            data: this.props.data,
        }).push({
            name: 'newPage',
            component: this.NewPage
        });
    }

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

    _showSelectProp(){
        this.setRouteData({
            dataList: this.propOptions,
            multiply: this.props.data.multiSelected,
            selectedData: this.state.selectValue,
            onChange: this._onChangeProp.bind(this),
        }).push({
            type: 'modal',
            name: 'select',
            component: Select
        })
    }

    _renderSelectPropValue(){
        if (this.state.selectValue) {
            return this.state.selectValue.propertyName;
        } else {
            return '请选择';
        }
    }

    _onChangeProp(value){
        this.changeState({
            selectValue: value
        });
        this.props.data['selectValue'] = value;
    }


    _isLeafProperty(item: Object){
        return str.arrIsEmpty(item.childrenPropertyList)
    }

    _renderSelectProperty(){
        if (this.state.selectValue){
            if (!str.arrIsEmpty(this.state.selectValue.childrenPropertyList)) {
                let list = this.state.selectValue.childrenPropertyList;
                if (!str.arrIsEmpty(list)) {
                    if (this.state.selectValue.mosaic) {
                        let leaf = [];
                        let noLeaf = [];
                        list.map((item, key) => {
                            if (this._isLeafProperty(item)) {
                                leaf.push(item);
                            } else {
                                noLeaf.push(item);
                            }
                        });

                        let elements = [];
                        elements.push(
                            <View style={s.inputRow} key={-1}>
                                <SText fontSize='body' color='999'>{this.state.selectValue.propertyName}<SText fontSize='body' color='red'>{this.state.selectValue.required? '*' : ''}</SText></SText>
                                <View style={s.right}>
                                    {
                                        leaf.map((item, key) => {
                                            return this._renderPropertyDetail(item, key, true);
                                        })
                                    }
                                </View>
                            </View>
                        )

                        noLeaf.map((item, key) => {
                            elements.push(this._renderPropertyDetail(item, key, false));
                        })

                        return elements;
                    } else {
                        let elements = list.map((item, key) => {
                            return this._renderPropertyDetail(item, key, false);
                        });
                        return elements;
                    }

                }
            } else {
                return this._renderPropertyDetail(this.state.selectValue, 1, false);
            }

        }

    }

    _renderPropertyDetail(item: Object, key: Number, small: Boolean){
        switch (item.entryType) {
            case 1:
                return (
                    <SelectLabel
                        {...this.props}
                        data={item}
                        key={key}
                        small={small}
                        deep={this.props.deep+1}
                    ></SelectLabel>
                )
                break;
            case 2:
                return (
                    <InputLabel
                        {...this.props}
                        data={item}
                        key={key}
                        small={small}
                        deep={this.props.deep+1}
                    ></InputLabel>
                );
                break;
            case 3:
                return (
                    <InputRangeLabel
                        {...this.props}
                        data={item}
                        key={key}
                        small={small}
                        deep={this.props.deep+1}
                    ></InputRangeLabel>
                );
                break;
            case 4:
                return (
                    <this.Label
                        {...this.props}
                        data={item}
                        key={key}
                        deep={this.props.deep+1}
                    ></this.Label>
                );
                break;
        }
    }

    _renderSelectValue() {
        let selectedStr = '';
        if (this.props.data.multiSelected) {
            if (!str.arrIsEmpty(this.state.selectValue)) {
                this.state.selectValue.map((item) => {
                    selectedStr += item.valueData + ' ';
                });
            } else {
                selectedStr = '请选择'
            }
        } else {
            if (this.state.selectValue) {
                selectedStr = this.state.selectValue.valueData;
            } else {
                selectedStr = '请选择'
            }
        }
        return selectedStr;
    }

    _showSelect(){
        this.setRouteData({
            dataList: this.options,
            multiply: this.props.data.multiSelected,
            selectedData: this.state.selectValue,
            onChange: this._onChange.bind(this),
        }).push({
            type: 'modal',
            name: 'select',
            component: Select
        });
    }

    _onChange(value){
        this.changeState({
            selectValue: value
        });
        if (this.props.data.multiSelected) {
            if (!str.arrIsEmpty(value)) {
                let arrStr = [];
                value.map((item) => {
                    arrStr.push(item.valueData);
                });
                this.props.data['valueData'] = arrStr.join(',');
            } else {
                this.props.data['valueData'] = '';
            }
        } else {
            if (value && value.valueData) {
                this.props.data['valueData'] = value.valueData;
            } else {
                this.props.data['valueData'] = '';
            }
        }
        this.props.data['selectValue'] = value;
        this.props.onChange? this.props.onChange(this.props.data.treeId, value) : null;
    }
};
