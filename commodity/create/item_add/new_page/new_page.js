'use strict'

import React from 'react';
import ReactNative, {View, Image, ScrollView} from 'react-native';
import {Page, Button} from 'components';
import InputLabel from '../content/input';
import InputRangeLabel from '../content/input_range';
import SelectLabel from '../content/select_label';
import {str} from 'tools';
import AreaChoose from '../area_choose';
import s from './new_page.style';
import {SComponent, SText} from 'sxc-rn';

module.exports = class NewPage extends SComponent {
    constructor(props){
        super(props);
        console.log('dododo in NewPageL', props)
        this.state = {
            pageLoading: false,
            edit: this.getRouteData('edit')
        }
        this.Label = require('../content/label');
        this.data = this.getRouteData('data');
    }

    render(){
        return (
            <Page
                title={this.data.propertyName}
                pageLoading={this.state.pageLoading}
                loading={false}
                back={() => this.navigator().jumpBack()}
            >
                <ScrollView style={{marginTop: 15}}>
                    {this._renderProperty()}
                </ScrollView>
                <View style={{alignItems: 'flex-end'}}>
                    <Button type='green' size='large' onPress={() => this.navigator().jumpBack()}>确定</Button>
                </View>
            </Page>
        )
    }


    _renderProperty() {
        let properties = this.data.childrenPropertyList;
        if (!str.arrIsEmpty(properties)) {
            if (this.data.entryType == 1) {
                return (<SelectLabel
                        {...this.props}
                        edit={this.state.edit}
                        data={this.data}
                        key={0}
                        deep={1}
                    ></SelectLabel>
                )
            } else {
                let elements = properties.map((data, key) => {
                    if (data.propertyId == 2008) {
                        return (
                            <AreaChoose
                                {...this.props}
                                edit={this.state.edit}
                                key={key}
                                data={data}
                                onChange={this._onChangeValue}
                                deep={1}
                            ></AreaChoose>
                        )
                    } else switch (data.entryType) {
                        case 1://列表选择
                            return (
                                <SelectLabel
                                    {...this.props}
                                    edit={this.state.edit}
                                    data={data}
                                    key={key}
                                    deep={1}
                                ></SelectLabel>
                            )
                            break;
                        case 2: //区间
                            return (
                                <InputLabel
                                    {...this.props}
                                    edit={this.state.edit}
                                    data={data}
                                    key={key}
                                    deep={1}
                                ></InputLabel>
                            );
                            break;
                        case 3://手工录入
                            return (
                                <InputRangeLabel
                                    {...this.props}
                                    edit={this.state.edit}
                                    data={data}
                                    key={key}
                                    deep={1}
                                ></InputRangeLabel>
                            );
                            break;
                        case 4: //标签
                            return (
                                <this.Label
                                    {...this.props}
                                    edit={this.state.edit}
                                    data={data}
                                    key={key}
                                    deep={1}
                                ></this.Label>
                            )
                            break;
                        }
                });
                return elements;
            }


        }
    }
};
