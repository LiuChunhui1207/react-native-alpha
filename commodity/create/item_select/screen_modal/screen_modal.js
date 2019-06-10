'use strict';
/**
 * 多选筛选框
 * @param
 * @author wzt
 * @exports Array,选择的数据Obj
 */

import React from 'react';
import {
  View, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions, 
  InteractionManager
} from 'react-native';
import {SComponent, SStyle, SText} from 'sxc-rn';
import {Button, Radio} from 'components';
import {str} from 'tools';

let s = SStyle({
  modal: {
    position:'absolute',
    top:0,
    bottom: 0,
    left:'@window.width',//动画需要修改这个
    width:'@window.width',
    // height:'@window.height',
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent:'flex-end',
    backgroundColor:'rgba(0, 0, 0, 0.65)'
  },
  pad:{
    flex:1,
    backgroundColor:'white',
  },
  row:{
    padding:10,
    paddingBottom:0,
    borderBottomWidth:'slimLine',
    borderColor:'f0',
  },
  tabHeader:{
    padding:10,
    paddingTop:5,
  },
  btn: {
      width: '@window.width*0.75/2'
  }
});
let windowWidth = Dimensions.get('window').width;
module.exports = class Example extends SComponent{
  static propTypes = {
      dataList: React.PropTypes.array,
      onChange: React.PropTypes.func,
      hide: React.PropTypes.func,
      reset: React.PropTypes.func,
  };

  constructor(props) {
      super(props);

      this.width = windowWidth<350?65:75
      this.state = {
          left: new Animated.Value(windowWidth),
          dataList: this.props.dataList? this.props.dataList : [],
      }
  }

  componentWillReceiveProps(nextProps){
      if (nextProps != this.props) {
          if (str.arrIsEmpty(this.state.dataList)) {
              this.changeState({
                dataList:JSON.parse(JSON.stringify(nextProps.dataList))//制作一个副本
              })
          }

      }

  }

  shouldComponentUpdate(nextProps, nextState) {
      return this.state != nextState
  }

  show(){
    Animated.timing(this.state.left, {
       toValue: 0, // 目标值
       duration: 200, // 动画时间
    }).start();
  }
  hide(){
    Animated.timing(this.state.left, {
         toValue: windowWidth, // 目标值
         duration: 200, // 动画时间
    }).start();
  }
  reset(){
      this.hide();
      this.props.showLoading();

    InteractionManager.runAfterInteractions(() => {
        this.props.reset();
        this.state.dataList.map((value,key)=>{
          value.selectedValue='';
        })
        this.changeState({
            dataList: this.state.dataList
        })
    });
  }
  render(){
    return (
        <Animated.View
          transparent={true}
          style={[s.modal,{left:this.state.left}]}
        >
          <TouchableOpacity style={{flex:1}}
            onLongPress={()=>{this.hide();}}
            onPress={()=>{this.hide();}}
          />
          <View style={{flex:3,alignItems:'stretch'}}>
            <ScrollView style={s.pad} bounces={false}>
              {this._renderSelect()}
            </ScrollView>
            <View style={{flexDirection:'row'}}>
              <Button 
                size='large'
                type='blue'
                style={[s.btn, {borderWidth: 0, backgroundColor: '#E5E5E5'}]}
                onPress={()=>{this.hide();this.reset();}}
              >
                重置
              </Button>
              <Button 
                size='large' 
                type='green'
                style={s.btn}
                onPress={()=>{this.hide();}}
              >
                确定
              </Button>
            </View>
          </View>
        </Animated.View>
    );
  }
  //_搞到一个最大的
  _getLarge(valueDataDetailList){
    let height = 25;
    valueDataDetailList.map((value)=>{
      if(value.valueData&&value.valueData.length>5){
        height=40;
      }
    })
    return height;
  }
  _renderSelect(){
      let dom = [];
      this.state.dataList.map((value,key)=>{
        let height = this._getLarge(value.valueDataDetailList)
        dom.push(
          <View key={key} style={s.row}>
            <SText fontSize='caption' color='999' style={s.tabHeader}>{value.propertyName}</SText>
            <Radio selectedValue={value.selectedValue||-1}
              onChange={(v)=>{
                  if (value.selectedValue == v) {
                      value.selectedValue = false;
                      this.changeState({
                          dataList: this.state.dataList
                      })
                      this.props.showLoading();

                      InteractionManager.runAfterInteractions(() => {
                          this.props.onChange(false,key);
                      });
                  } else {
                      value.selectedValue = v;
                      this.changeState({
                          dataList: this.state.dataList
                      })
                      this.props.showLoading();

                      InteractionManager.runAfterInteractions(() => {
                          this.props.onChange(value.selectedValue, key)
                      });
                  }
            }}
            itemStyle={{height: 25, marginBottom: 5}}
            itemActiveStyle={{height: 25, marginBottom: 5}}
            >
                {
                    !str.arrIsEmpty(value.valueDataDetailList)?
                    value.valueDataDetailList.map((item, key) => {
                        return (
                            <Radio.Item
                              key={key}
                              label={item.valueData}
                              value={item.spuIds}
                            />
                        )
                    }):null
                }
            </Radio>
          </View>
        )
      })
      return dom;
  }
  _renderRadio(listData:Array){
    let dom=[];
    for(let i in listData){
      dom.push(
        <Radio.Item
          key={i}
          label={listData[i].valueData}
          value={listData[i].spuIds}
        />)
    }
    return dom;
  }
};
