'use strict';
import React from 'react';
import {
  View,
  ScrollView,
  InteractionManager
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Row} from 'components';
import {str} from 'tools';

let s = SStyle({
  scroll_box: {
    flex: 1
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 10
  },
  row: {
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 45,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  }
});

module.exports = class DeliverOrderDetail extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      pageLoading: true,
      spuList: [], //发货列表
      fee: 0
    }
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }
  _getData(){
    commonRequest({
      apiKey: 'getDeliveryOrderDetailKey', 
      objectName: 'deliveryQueryDO',
      params: {
        id: this.props.route.id
      }
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        pageLoading: false,
        spuList: data.list || [],
        driverName: data.driverName,
        carId: data.carId,
        fee: data.fee,
        centerhouseName: data.centerhouseName,
        deliveryTime: data.deliveryTime,
        exportTime: data.exportTime
      })
    }).catch( err => {
      console.log(err)
    })
  }

  render(){
    return (
      <Page title='物流单详情' pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        <ScrollView style={s.scroll_box}>
          <View style={s.card}>
            {
              this.state.spuList.map( item => {
                return (
                  <Row key={item.id} style={s.row}>
                    <SText fontSize="body" color="333">{item.spuName}</SText>
                    <Row>
                      <SText fontSize="body" color="333">{item.num}</SText>
                      <SText fontSize="body" color="666">件</SText>
                    </Row>
                  </Row>
                )
              })
            }
          </View>
          <View style={s.card}>
            <Row style={s.row}>
              <SText fontSize="body" color="333">司机姓名</SText>
              <SText fontSize="body" color="666">{this.state.driverName}</SText>
            </Row>
            <Row style={s.row}>
              <SText fontSize="body" color="333">车辆信息</SText>
              <SText fontSize="body" color="666">{this.state.carId}</SText>
            </Row>
          </View>
          <View style={s.card}>
            <Row style={s.row}>
              <SText fontSize="body" color="333">运费</SText>
              <SText fontSize="body" color="666">{str.toYuan(this.state.fee)}元</SText>
            </Row>
            <Row style={s.row}>
              <SText fontSize="body" color="333">目的地</SText>
              <SText fontSize="body" color="666">{this.state.centerhouseName}</SText>
            </Row>
          </View>
          <View style={s.card}>
            <Row style={s.row}>
              <SText fontSize="body" color="333">发货时间</SText>
              <SText fontSize="body" color="666">{this.state.deliveryTime}</SText>
            </Row>
            <Row style={s.row}>
              <SText fontSize="body" color="333">预计到达时间</SText>
              <SText fontSize="body" color="666">{this.state.exportTime}</SText>
            </Row>
          </View>
        </ScrollView>
      </Page>
    )
  }
}
