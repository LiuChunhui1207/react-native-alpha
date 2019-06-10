'use strict'

import React from 'react';
import ReactNative, {View, Image} from 'react-native';
import {SComponent, SText, SToast} from 'sxc-rn';
import {GalleryList} from 'components';
import s from './item_detail.style';
import {str} from 'tools';

module.exports = class ItemDetail extends SComponent {
    constructor(props){
        super(props);

    }

    render() {
        let imageList = this.props.data.images;

        let imageUrls = imageList && imageList.length > 0 ? imageList.map((v, k) => {
            return v.img;
        }):[];

        return (
            <View style={s.container}>
                {this._renderProperty(this.props.data.propertyValuesList)}
                <View style={s.bottom}>
                    <GalleryList
                        horizontal={true}
                        imageStyle={s.image}
                        containerStyle={s.containerStyle}
                        imageList={imageUrls}
                    ></GalleryList>
                </View>
            </View>
        )
    }

    _renderProperty = (list: Array) => {
        if (str.arrIsEmpty(list)) {
            return null;
        } else {
            let elements = [];

            let length = list.length;

            list.map((item, key) => {
                if (key % 2 == 1) {
                    let rowDom = [];

                    rowDom.push(
                        <View style={s.cell} key={1}>
                            <SText fontSize='caption' color='999'>{item.propertyName} <SText fontSize='caption' color='333'>{item.valueData}</SText></SText>
                        </View>
                    );

                    if (key <= length - 2) {
                        rowDom.push(
                            <View style={s.cell} key={2}>
                                <SText fontSize='caption' color='999'>{list[key + 1].propertyName} <SText fontSize='caption' color='333'>{list[key + 1].valueData}</SText></SText>
                            </View>
                        );
                    }

                    let row = (<View style={s.row} key ={key}>
                                    {rowDom}
                                </View>);

                    elements.push(row);
                }

            });
            return (
                <View style={s.top}>
                    {elements}
                </View>
            )
        }

    }
};
