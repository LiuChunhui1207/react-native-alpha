'use strict';
import React from 'react';
import {
  View,TouchableOpacity,Image,
    ScrollView
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {str} from 'tools';
import {Page} from 'components';
import VisitRecordList from '../visit/visit_record_list';
import {
    IconForward
} from 'config';
var s = SStyle({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'fff',
    height: 45,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  flex1: {
    flex: 1
  },
  exitBtn: {
    marginTop: 20
  },
  imgArrow: {
      width: 6.75,
      height: 12,
  },
    skuItemRight: {
        flexDirection:'row',
        alignItems:'center'
    },
});

module.exports = class CatList extends SComponent{
  constructor(props){
    super(props);
      this.state = {
          catList: []
      }
  }
  componentDidMount() {
      this._getData();
  }

  _getData(){
      commonRequest({
          apiKey: 'queryMyCatListKey',
          objectName: 'performanceQueryDO',
          params: {}
      }).then( (res) => {
          let data = res.data;

          this.changeState({
              catListSize: data.catListSize,
              catList:     data.catList
          });
      }).catch( err => {})
  }

  render(){
    // let userState = this.props.userState;
    return (
      <Page title='我的品类' pageLoading={false} back={()=>this.navigator().pop()}>
        <ScrollView>
            {
                this.state.catList.map((item, index) => {
                    return (
                        <TouchableOpacity
                            onPress={()=>{
                                this.navigator().push({
                                    component: VisitRecordList,
                                    name: 'VisitRecordList',
                                    data: {
                                        catId:item.key
                                    }
                                })
                            }}
                            key={index} style={s.item}
                        >
                          <SText fontSize="body" color="666" style={s.flex1}>{item.value}</SText>
                          <View style={s.skuItemRight}>
                              {
                                  item.countNum>0?
                                      <View style={{width:16,height:16,borderRadius:8,backgroundColor:'#ff5700',marginRight:5,justifyContent:'center',alignItems:'center'}}>
                                        <SText fontSize='caption' color='#fff' style={{fontSize:9}}>{item.countNum}</SText>
                                      </View>
                                      :
                                      null
                              }
                            <Image source={IconForward} style={s.imgArrow}></Image>
                          </View>
                        </TouchableOpacity>
                    )
                })
            }
        </ScrollView>

      </Page>
    )
  }
}
