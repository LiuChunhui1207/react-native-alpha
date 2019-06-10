'use strict'

import React from 'react';
import ReactNative, {View, Image, ScrollView} from 'react-native';
import {SComponent, SText, SToast} from 'sxc-rn';
import {Select} from 'components';
import s from './content.style';
import SelectLabel from './select_label';
import InputLabel from './input';
import InputRangeLabel from './input_range';
import Label from './label';
import {str} from 'tools';
import AreaChoose from '../area_choose';

module.exports = class Content extends SComponent {
    constructor(props){
        super(props);
    }

    render() {
        let propertyList = this.props.data.childrenPropertyList;
        // let  propertHeight=propertyList.length*50;

        return (
            <ScrollView scrollEnabled={false}>
                <View 
                    onLayout={(event)=>{
                        console.log('onLayout',event.nativeEvent.layout.height)
                        this.props.setHeight(event.nativeEvent.layout.height)
                        {/*this.props.setHeight(propertHeight)*/}
                    }}
                    style={s.container}>
                    {this._renderProperty(propertyList)}
                </View>
            </ScrollView>
        )
    }

    _renderProperty = (list: Array) => {
        let deep = 1;
        if (!str.arrIsEmpty(list)) {
            let contents = list.map((item, key) => {
                return this._renderPropertyDetail(item, key, deep)
            });
            return contents;
        }

    }

    _renderPropertyDetail(data, key, deep){
        if (data.propertyId == 2008) {
            return (
                <AreaChoose
                    {...this.props}
                    key={key}
                    data={data}
                    onChange={this._onChangeValue}
                ></AreaChoose>
            )
        } else switch (data.entryType) {
            case 1://列表选择
                return (
                    <SelectLabel
                        {...this.props}
                        data={data}
                        key={key}
                        deep={deep + 1}
                    ></SelectLabel>
                )
                break;
            case 2: //区间
                return (
                    <InputLabel
                        {...this.props}
                        data={data}
                        key={key}
                        deep={deep+1}
                    ></InputLabel>
                );
                break;
            case 3://手工录入
                return (
                    <InputRangeLabel
                        {...this.props}
                        data={data}
                        key={key}
                        deep={deep+1}
                    ></InputRangeLabel>
                );
                break;
            case 4: //标签
                return (
                    <Label
                        {...this.props}
                        data={data}
                        key={key}
                        deep={deep+1}
                    ></Label>
                )
                break;
        }
    }



    _onChangeValue = (treeId, value) => {
        // console.log('_onChangeValue')
        // console.log('treeId',treeId)
        // console.log('value',value)
        // console.log('childrenPropertyList',this.props.data.childrenPropertyList)
        console.log(this.props)

    }
};
