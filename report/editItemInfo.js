'use strict';
import React from 'react';
import {
  View,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, GalleryList} from 'components';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {
  ICON_NEXT,
  ICON_LOCATION
} from 'config';

let s = SStyle({
  content: {
    flex: 1
  },
  title: {
    paddingLeft: 15,
    height: 40,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: 'fff',
    marginBottom: 5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  item_title: {
    paddingLeft: 15,
    height: 42,
    justifyContent: 'center',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
    backgroundColor: 'fa'
  },
  item: {
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    height: 45,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 'slimLine',
    borderColor: 'f0',
  },
  item_input: {
    textAlign: 'right',
    paddingRight: 10,
    marginRight: 5,
    height: 35,
    width: 90,
    borderWidth: 'slimLine',
    borderColor: 'e5'
  },
  marginL15: {
    marginLeft: 15
  },
  save: {
    marginTop: 30
  }
});

/**
 * 修改商品信息-今日订单报表跳入
 * @type {[type]}
 */
module.exports = class EditItemInfo extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      refreshing: false,
    }
  }

  _getData(){

  }

  _submit(){

  }

  render(){
    return (
      <Page
          pageName='今日订单报表-修改商品信息' title='编辑信息' pageLoading={false} back={()=>this.navigator().pop()}>
        <ScrollView keyboardShouldPersistTaps={true} style={s.content}>
          <View style={s.title}>
            <SText fontSize="body" color="greenFont">山东荷兰15土豆52斤纸箱</SText>
          </View>
          <View style={s.card}>
            <View style={s.item_title}>
              <SText fontSize="body" color="333">成品标准</SText>
            </View>
            <View style={s.item}>
              <SText fontSize="body" color="666">成品率</SText>
              <View style={s.row}>
                <TextInput keyboardType="number-pad" style={s.item_input} />
                <SText fontSize="body" color="666">% - </SText>
                <TextInput keyboardType="number-pad" style={s.item_input} />
                <SText fontSize="body" color="666">%</SText>
              </View>
            </View>
          </View>
          <View style={s.card}>
            <View style={s.item_title}>
              <SText fontSize="body" color="333">退赔标准</SText>
            </View>
            <View style={s.item}>
              <SText fontSize="body" color="666">验收要求比例</SText>
              <View style={s.row}>
                <SText fontSize="body" color="666"> ≤ </SText>
                <TextInput keyboardType="number-pad" style={s.item_input} />
                <SText fontSize="body" color="666">%</SText>
              </View>
            </View>
            <View style={s.item}>
              <SText fontSize="body" color="666">退赔要求比例</SText>
            </View>
            <View style={{paddingLeft: 15}}>
              <View style={[s.item, {paddingLeft: 0}]}>
                <SText fontSize="body" color="666">严重残次</SText>
                <View style={s.row}>
                  <SText fontSize="body" color="666"> ≥ </SText>
                  <TextInput keyboardType="number-pad" style={s.item_input} />
                  <SText fontSize="body" color="666">%</SText>
                </View>
              </View>
              <View style={[s.item, {paddingLeft: 0}]}>
                <SText fontSize="body" color="666">中等残次</SText>
                <View style={s.row}>
                  <SText fontSize="body" color="666"> ≥ </SText>
                  <TextInput keyboardType="number-pad" style={s.item_input} />
                  <SText fontSize="body" color="666">%</SText>
                </View>
              </View>
              <View style={[s.item, {paddingLeft: 0}]}>
                <SText fontSize="body" color="666">轻微残次</SText>
                <View style={s.row}>
                  <SText fontSize="body" color="666"> ≥ </SText>
                  <TextInput keyboardType="number-pad" style={s.item_input} />
                  <SText fontSize="body" color="666">%</SText>
                </View>
              </View>
            </View>
          </View>
          <View style={s.card}>
            <View style={s.item_title}>
              <SText fontSize="body" color="333">
                商品特别注意
                <SText fontSize="caption" color="999">  将推送给服务站销售</SText>
              </SText>
            </View>
            <View style={s.item}>
              <TextInput style={{flex: 1}} />
            </View>
          </View>
          <Button style={s.save} type='green' size='middle' onPress={this._submit.bind(this)}>保存</Button>
        </ScrollView>
        <KeyboardSpacer/>
      </Page>
    )
  }
}
