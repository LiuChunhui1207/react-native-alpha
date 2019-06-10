'use strict'

import React from 'react';
import ReactNative, {View, ListView, Image, Animated, PanResponder, TouchableOpacity, ScrollView} from 'react-native';
import {SComponent, SText, SToast} from 'sxc-rn';
import {Page, GalleryList, Select} from 'components';
// import {WCSpuQueryDO} from 'sxc-do';
import {inquiryAction} from 'actions';
import s from '../item_add.style';

module.exports = class AreaSelect extends SComponent {
    constructor(props){
        super(props);
        this.state = {
            selectedprin: '',
            selectedcity: '',
            selectedarea: '',
            cityData: [],
            areaData: [],
        }
        if(props.edit && props.data.valueList && props.data.valueList.length > 0){
            for(let i = 0, len = props.data.valueList.length; i < len; i++){
                if(props.data.valueList[i].isCheck){
                    let selectedcity = '',
                        selectedarea = '',
                        arr = props.data.valueData.split(';'),
                        nameArr = arr[0].split('-'),
                        codeArr = arr[1].split('-');
                    //市
                    if(nameArr[1]){
                        selectedcity = {
                            code: +codeArr[1],
                            upCode: +props.data.valueList[i].cityCode,
                            name: nameArr[1]
                        }
                        //区
                        if(nameArr[2]){
                            selectedarea = {
                                code: +codeArr[2],
                                upCode: +selectedcity.code,
                                name: nameArr[2]
                            }
                        }
                    }
                    this.state = {
                        selectedprin: props.data.valueList[i],
                        selectedcity,
                        selectedarea,
                        cityData: [],
                        areaData: [],

                    }
                    break;
                }
            }
        }
    }


    componentDidMount() {
        //编辑状态下 需要获取市、区的下拉列表
        if(this.props.edit){
            if(this.state.selectedprin){
                this._getAreaData('prin');
            }
            if(this.state.selectedcity){
                this._getAreaData('city')
            }
        }
    }

    _getAreaData = (type) => {
        if (this.props.isDisableFetch) return;
        commonRequest({
          apiKey: 'queryDownObjByUpCodeKey',
          withLoading: true,
          objectName: 'wcSpuQueryDO',
          params: {
            code: this.state['selected'+type].cityCode? this.state['selected'+type].cityCode : this.state['selected'+type].code
          }
        }).then( (res) => {
          let data = res.data;
          if (type == 'prin') {
              this.state['cityData'] = data;
          } else {
              this.state['areaData'] = data;
          }
          this.forceUpdate();
        }).catch(err => {
          console.log("do in err:", err)
        })
    }

    render() {
        return (
            <View>
                <View style={s.row}>
                    <View style={s.left}>
                        <SText color='999' fontSize='body'>{this.props.isDisableFetch ? '产地' : this.props.data.propertyName + '(省份)'}<SText color='red' fontSize='body'>*</SText></SText>
                    </View>
                    <TouchableOpacity style={s.right} onPress={() => this._renderSelect('prin', this.props.data.valueList)}>
                        <SText fontSize='body' color={this.state.selectedprin? '333' : '999'}>{this.state.selectedprin? this.state.selectedprin.valueData : '请选择'}</SText>
                        <Image source={require('image!icon_dropdown')} style={s.img}></Image>
                    </TouchableOpacity>
                </View>
                {
                    this.state.selectedprin && !this.props.isDisableFetch ?
                    <View style={s.row}>
                        <View style={s.left}>
                            <SText color='999' fontSize='body'>产地(城市)</SText>
                        </View>
                        <TouchableOpacity style={s.right} onPress={() => this._renderSelect('city', this.state.cityData)}>
                            <SText fontSize='body' color={this.state.selectedcity? '333' : '999'}>{this.state.selectedcity? this.state.selectedcity.name : '请选择'}</SText>
                            <Image source={require('image!icon_dropdown')} style={s.img}></Image>
                        </TouchableOpacity>
                    </View>
                    :null
                }
                {
                    this.state.selectedprin && this.state.selectedcity?
                    <View style={s.row}>
                        <View style={s.left}>
                            <SText color='999' fontSize='body'>产地(地区)</SText>
                        </View>
                        <TouchableOpacity style={s.right} onPress={() => this._renderSelect('area', this.state.areaData)}>
                            <SText fontSize='body' color={this.state.selectedarea? '333' : '999'}>{this.state.selectedarea? this.state.selectedarea.name : '请选择'}</SText>
                            <Image source={require('image!icon_dropdown')} style={s.img}></Image>
                        </TouchableOpacity>
                    </View>
                    :null
                }
            </View>
        )
    }

    _renderSelect = (type, dataList) => {
        let list = [];
        dataList.map((item) => {
            list.push({
                name: item.valueData? item.valueData : item.name,
                value: item
            });
        })
        this.setRouteData({
            dataList: list,
            selectedData: this.state['selected'+type],
            onChange: this._onSelectChange.bind(this, type),
        }).push({
            type: 'modal',
            name: 'Select',
            component: Select
        });
    }

    _onSelectChange = (type, value) => {
        if (value) {
            if (type == 'prin') {
                if (this.state.selectedprin != value) {
                    this.state.selectedcity = '';
                }
                this.state.selectedprin = value;
                this._getAreaData('prin');
            } else if (type == 'city') {
                if (this.state.selectedcity != value) {
                    this.state.selectedarea = '';
                }
                this.state.selectedcity = value;
                this._getAreaData('city');
            } else {
                this.state.selectedarea = value;
            }
        }
        this.changeState({})
        let code = '';
        let name = '';
        let nameStr = '';
        let codeStr = '';
        if (this.state.selectedarea) {
            nameStr=this.state.selectedprin.valueData+'-'+this.state.selectedcity.name+'-'+this.state.selectedarea.name;
            codeStr=this.state.selectedprin.cityCode+'-'+this.state.selectedcity.code+'-'+this.state.selectedarea.code;
            name = this.state.selectedarea.name;
            code = this.state.selectedarea.code;
        } else if (this.state.selectedcity) {
            nameStr=this.state.selectedprin.valueData+'-'+this.state.selectedcity.name;
            codeStr=this.state.selectedprin.cityCode+'-'+this.state.selectedcity.code;
            name = this.state.selectedcity.name;
            code = this.state.selectedcity.code;
        } else {
            nameStr=this.state.selectedprin.valueData;
            codeStr=this.state.selectedprin.cityCode;
            name = this.state.selectedprin.valueData;
            code = this.state.selectedprin.cityCode;
        }
        this.props.data['valueData'] = nameStr+';'+codeStr;
        if (this.props.onChange) {
            this.props.data['valueData'] = nameStr+';'+codeStr;
            this.props.onChange(this.props.data.treeId, {valueId: code, valueData: name})
        }
    }
};
