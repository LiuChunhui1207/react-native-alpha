'use strict'

import React from 'react';
import ReactNative, {View, Image, TouchableOpacity} from 'react-native';
import {SComponent, SText} from 'sxc-rn';
import InputLabel from '../input';
import InputRangeLabel from '../input_range';
import {str} from 'tools';
import s from '../label.style';
import {Page} from 'components';
import NewPage from '../../new_page/new_page';
import {ICON_NEXT} from 'config';

module.exports = class Label extends SComponent {
    constructor(props){
        super(props);

        // this.state = {

        // }
        this.SelectLabel = require('../select_label');
    }

    /**
     * 这里的结构让人不太好理解，打破之前的规则了，这设计也是没谁了
     * @method render
     * @return {[type]} [description]
     * @author jimmy
     */
    render(){
        let list = this.props.data.childrenPropertyList;
        if (this.props.deep <= 3) {
            return (
                <View style={s.labelContainer}>
                    {this._renderProperty()}
                </View>
            )
        } else {
            return (
                <View style={s.row}>
                    <SText fontSize='body' color='999'>{this.props.data.propertyName}</SText>
                    <TouchableOpacity
                        style={s.right}
                        onPress={() => this._goNewPage()}
                    >
                        <SText fontSize='body' color='999'>{this.props.data.valueData? this.props.data.valueData : '去选择'}<SText fontSize='body' color='red'>{ this._isRequired(this.props.data) ? '*' : '' }</SText></SText>
                        <Image source={ICON_NEXT} style={s.forwardImg}></Image>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    _isLeafProperty(item: Object){
        return str.arrIsEmpty(item.childrenPropertyList)
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
    _goNewPage(){
        this.setRouteData({
            data: this.props.data,
            edit: this.props.edit
        }).push({
            name: 'newPage',
            component: NewPage
        });
    }

    _renderProperty(){
        let list = this.props.data.childrenPropertyList;
        if (!str.arrIsEmpty(list)) {
            if (this.props.data.mosaic) {
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
                        <SText fontSize='body' color='999'>{this.props.data.propertyName}<SText fontSize='body' color='red'>{this._isRequired(this.props.data) ? '*' : ''}</SText></SText>
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
    }

    _renderPropertyDetail(item: Object, key: Number, small: Boolean){
        switch (item.entryType) {
            case 1:
                return (
                    <this.SelectLabel
                        {...this.props}
                        data={item}
                        key={key}
                        small={small}
                        deep={this.props.deep+1}
                    ></this.SelectLabel>
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
                if (item.mosaic) {
                    let list = item.childrenPropertyList;
                    let leaf = [];
                    let noLeaf = [];
                    list.map((val, key) => {
                        if (this._isLeafProperty(val)) {
                            leaf.push(val);
                        } else {
                            noLeaf.push(val);
                        }
                    });

                    let elements = [];
                    elements.push(
                        <View style={s.inputRow} key={-1}>
                            <SText fontSize='body' color='999'>{item.propertyName}<SText fontSize='body' color='red'>{this._isRequired(item) ? '*' : ''}</SText></SText>
                            <View style={s.right}>
                                {
                                    leaf.map((val, key) => {
                                        return this._renderPropertyDetail(val, key, true);
                                    })
                                }
                            </View>
                        </View>
                    )

                    noLeaf.map((val, key) => {
                        elements.push(this._renderPropertyDetail(val, key, false));
                    })

                    return elements;
                } else {
                    return (
                        <Label
                            {...this.props}
                            data={item}
                            key={key}
                            deep={this.props.deep+1}
                        ></Label>
                    );
                }

                break;
        }
    }
};
