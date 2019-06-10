'use strict';
import React from 'react';
import {
  View,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  ListView,
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {UtilsAction} from 'actions';
import {Page, Row, Col, Button} from 'components';
import {
    ICON_TRIANGEL_UP, ICON_TRIANGEL_DOWN, 
} from 'config';

let s = SStyle({
  flex1: {
    flex: 1,
    backgroundColor: 'fff'
  },
  btn_box: {
    height: 50,
    paddingLeft: 15,
    alignItems: 'center',
    paddingRight: 15,
    backgroundColor: 'fff',
  },
  btn: {
    flex: 1,
    height: 30,
    backgroundColor: 'fff',
    justifyContent: 'center',
    borderColor: '#2296F3',
    alignItems: 'center'
  },
  btn_0: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4
  },
  btn_1: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  btn_2: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  btn_3: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4
  },
  btn_active: {
    borderWidth: 0,
    backgroundColor: '#2296F3'
  },
  head_box: {
    height: 25,
    flexDirection: 'row',
    alignItems: 'center'
  },
  head_item: {
    flex: 1,
    paddingLeft: 15
  },
  width100: {
    width: 100,
    textAlign: 'center'
  },
  width80: {
    width: 80,
    textAlign: 'center'
  },
  title: {
    backgroundColor: '#F9F9F9'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 'slimLine',
    borderColor: 'e5'
  }
});

module.exports = class PickHouseList extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      selectedBtn: 'orderFee',
      dataSource: props.data || [],
    }
    this._showProps = {
      orderFee: {
        titleName: ['今日金额', '目标', '同比昨日'],
        keyName:['todayOrderFee', 'targetOrderFee', 'orderFeeRate']
      },   //下单金额
      orderNum: {
        titleName: ['下单件数', '日均', '同比昨日'],
        keyName:['todayOrderNum', 'targetOrderNum', 'orderNumRate']
      },   //下单件数
      orderPersons: {
        titleName: ['下单人数', '7日日均', '同比昨日'],
        keyName:['todayOrderPersons', 'averageOrderPersons', 'orderPersonsRate']
      },   //下单人数
      refund: {
        titleName: ['退赔人数', '退赔金额', '退赔率'],
        keyName:['refundPersons', 'refundBalance', 'refundRate']
      },   //退赔
    }
  }

  componentWillReceiveProps(nextProps) {
    this.changeState({
      dataSource: nextProps.data
    })
  }

  _renderRow = (rowData, sectionID, rowID)=>{
    return (
      <View style={s.item}>
          <SText style={s.head_item} fontSize='caption' color="333">{rowData.pickHouseName}</SText>
          <SText style={s.width100} fontSize="caption" color="333">{rowData[this._showProps[this.state.selectedBtn].keyName[0]]}</SText>
          <SText style={s.width80} fontSize="caption" color="999">{rowData[this._showProps[this.state.selectedBtn].keyName[1]]}</SText>
          <SText style={s.width80} fontSize="caption" color={rowData[this._showProps[this.state.selectedBtn].keyName[2]] > 0 ? 'red' : 'greenFont'}>{rowData[this._showProps[this.state.selectedBtn].keyName[2]]}</SText>
      </View>
    )
  }

  _tabClick(name){
    this.changeState({
      selectedBtn: name
    })
  }

  render(){
    return (
      <ScrollView scrollEnabled={false}>
        <View 
          style={s.flex1}
          onLayout={(event)=>{
            this.props.setHeight(event.nativeEvent.layout.height)
          }}

        >
          <Row style={s.btn_box}>
              <TouchableOpacity 
                style={[s.btn, s.btn_0, this.state.selectedBtn === 'orderFee' ? s.btn_active : {}]}
                onPress={()=>{
                  this._tabClick('orderFee');
                }}
              >
                <SText fontSize="caption" color={this.state.selectedBtn === 'orderFee' ? 'white' : 'blue'}>下单金额</SText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={()=>{
                  this._tabClick('orderNum');
                }}
                style={[s.btn, s.btn_1, this.state.selectedBtn === 'orderNum' ? s.btn_active : {}]}
              >
                <SText fontSize="caption" color={this.state.selectedBtn === 'orderNum' ? 'white' : 'blue'}>下单件数</SText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={()=>{
                  this._tabClick('orderPersons');
                }}
                style={[s.btn, s.btn_2, this.state.selectedBtn === 'orderPersons' ? s.btn_active : {}]}
              >
                <SText fontSize="caption" color={this.state.selectedBtn === 'orderPersons' ? 'white' : 'blue'}>下单人数</SText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={()=>{
                  this._tabClick('refund');
                }}
                style={[s.btn, s.btn_3, this.state.selectedBtn === 'refund' ? s.btn_active : {}]}
              >
                <SText fontSize="caption" color={this.state.selectedBtn === 'refund' ? 'white' : 'blue'}>退赔</SText>
              </TouchableOpacity>
          </Row>
          <View style={[s.head_box, s.title]}>
              <SText style={s.head_item} fontSize='mini' color="999">服务站</SText>
              <SText style={s.width100} fontSize="mini" color="999">{this._showProps[this.state.selectedBtn].titleName[0]}</SText>
              <SText style={s.width80} fontSize="mini" color="999">{this._showProps[this.state.selectedBtn].titleName[1]}</SText>
              <SText style={s.width80} fontSize="mini" color="999">{this._showProps[this.state.selectedBtn].titleName[2]}</SText>
          </View>
          <ListView
            scrollEnabled={false}
            // style={{height: 300}}
            initialListSize={10000}
            enableEmptySections={true}
            dataSource={this._ds.cloneWithRows(this.state.dataSource)}
            renderRow={this._renderRow} 
          />
        </View>
      </ScrollView>
    )
  }
}
