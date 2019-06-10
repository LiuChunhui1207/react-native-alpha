'use strict';
import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  InteractionManager,
  StyleSheet
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button} from 'components';
import {ICON_MAP, ICON_WARNING, ICON_COMPLETED} from 'config';
import DirectLogisticsDetail from './directLogisticsDetail';
import {str} from 'tools';
import {UtilsAction} from 'actions';

const s = SStyle({
  container: {
    paddingLeft:15,
    paddingRight:15,
    paddingTop:10,
  },
  item: {
    backgroundColor:'#fff',
    marginBottom:10,
    paddingLeft:15,
    paddingRight:15,
    paddingBottom:5,
    borderWidth:0.5,
    borderRadius:3,
    borderColor:'#e7e7e7',
  },
  lineItem: {
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    paddingTop:10,
    paddingBottom:10,
    borderBottomWidth:1,
    borderColor:'#eeeeee',
    marginBottom:5,
  },
});
module.exports = class DirectLogisticsTrack extends SComponent{
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,

      directLogisticsTracks: [],
    };
  }
  componentDidMount(){
    let called = false;
    let timeout = setTimeout( () => {
      called = true;
      this._getData();
    }, 1000);

    InteractionManager.runAfterInteractions(() => {
      if (called) {
        return;
      }
      clearTimeout(timeout);
      this._getData();
    })
  }

  _getData() {
    const directPlanId = this.getRouteData('data').directPlanId;
    commonRequest({
      apiKey: 'queryDirectLogisticsTrackKey', 
      objectName: 'directBaseQueryDO',
      params: {
        directPlanId: directPlanId,
      }
    }).then((data) => {
      data = data.data;
      this.changeState({
        pageLoading: false,
        ...data,
      });
    }).catch((err)=>{
      this.changeState({
          pageLoading: false,
      });
      __STORE.dispatch(UtilsAction.toast(err.errorMessage, 1000));
    });
  }

  _goLogisticsDetail = (schedulingId, locationId) => {
    const directPlanId = this.getRouteData('data').directPlanId;
    this.setRouteData({
      data:{
        directPlanId: directPlanId,
        locationId: locationId || -2,
        schedulingId: schedulingId,
      }
    }).push({
      name: 'DirectLogisticsDetail',
      component: DirectLogisticsDetail,
    });
  }

  render(){
    const { pageLoading, directLogisticsTracks } = this.state;
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.pageLoading}
            onRefresh={this._getData.bind(this)}
          />
        }
      >
        {
          pageLoading
          ?
          null
          :
          <View style={s.container}>
            {
              directLogisticsTracks && directLogisticsTracks.length
              ?
              directLogisticsTracks.map((item, i) =>
                <TrackItem key={i} goLogisticsDetail={this._goLogisticsDetail} {...item} />
              )
              :
              null
            }
          </View>
        }
      </ScrollView>
    )
  }
}

class TrackItem extends SComponent{
  render(){
    const { goLogisticsDetail, schedulingId, carNo, driverId, driverName, driverPhone, directLogisticsRoutes } = this.props;
    return (
      <View style={s.item}>
        <View style={[s.lineItem,{flexDirection:'column',alignItems:'flex-start',marginBottom:10}]}>
          <View style={{flexDirection:'row',alignItems:'center'}}> 
            <SText style={{fontWeight:'500'}} fontSize={19} color='#000'>{carNo}</SText>
          </View>
          <SText fontSize={13} color='rgba(2,29,51,0.54)'>{`${driverName}  ${driverPhone}`}</SText>
        </View>
        {
          directLogisticsRoutes && directLogisticsRoutes.map((route, i) =>
            <RouteItem
              key={i} 
              goLogisticsDetail={(locationId) => {
                goLogisticsDetail && goLogisticsDetail(schedulingId, locationId);
              }}
              {...route}
              hasDash={i!==directLogisticsRoutes.length-1}
            />
          )
        }
      </View>
    )
  }
}

class RouteItem extends SComponent{
  renderDash() {
    return (
      <View style={{flex:1,marginLeft:11,marginTop:3,marginBottom:3,width:4,borderWidth:1,borderStyle:'dashed',borderColor:'#1394F6',overflow:'hidden'}}>
        <View style={{height:999,width:1,backgroundColor:'#fff',position:'absolute',top:0,right:0}} />
        <View style={{height:1,width:999,backgroundColor:'#fff',position:'absolute',top:-1,left:0}} />
        <View style={{height:1,width:999,backgroundColor:'#fff',position:'absolute',bottom:0,left:0}} />
      </View>
    )
  }
  render(){
    const { goLogisticsDetail, hasDash, loadLocationFlag, locationId, locationName, logisticsTimes, passedLocationFlag, routeSequence, showMapButton, showWarningFlag } = this.props;
    return (
      <View style={{flexDirection:'row'}}>
        <View>
          <RouteIcon showWarningFlag={showWarningFlag} passedLocationFlag={passedLocationFlag} routeSequence={routeSequence} />
          {hasDash?this.renderDash():null}
        </View>
        <View style={{flex:1}}>
          <View style={[s.lineItem,{paddingTop:0}]}>
            <SText style={{fontWeight:'500'}} fontSize={15} color='#000'>{locationName}</SText>
            <View style={{flex:1}}>
            {
              showMapButton
              ?
              <TouchableOpacity style={{marginLeft:10}} onPress={() => {
                goLogisticsDetail && goLogisticsDetail(locationId);
              }}>
                <Image style={{width:16,height:16}} source={ICON_MAP} />
              </TouchableOpacity>
              :
              null
            }
            </View>
            {
              showWarningFlag?
              <SText style={{marginRight:10}} fontSize={13} color='#FF7043'>物流预警</SText>
              :null
            }
          </View>
          <View style={{marginBottom:10}}>
          {
            logisticsTimes && logisticsTimes.length
            ?
            logisticsTimes.map((item, i) =>
              <LogisticsTime key={i} {...item} />
            )
            :
            null
          }
          </View>
        </View>
      </View>
    )
  }
}

class RouteIcon extends SComponent {
  render() {
    const { showWarningFlag, passedLocationFlag, routeSequence } = this.props;
    if (showWarningFlag)
      return <Image style={{width:22,height:22,marginRight:10}} source={ICON_WARNING} />
    if (passedLocationFlag)
      return <Image style={{width:22,height:22,marginRight:10}} source={ICON_COMPLETED} />
    else
      return (
        <View style={{
          width:22,height:22,justifyContent:'center',alignItems:'center',
          borderWidth:1,borderRadius:11,borderColor:'#1394F6',
          backgroundColor:'#fff',marginRight:10,
        }}>
          <SText fontSize={13} color='#1394F6'>{routeSequence}</SText>
        </View>
      )
  }
}

class LogisticsTime extends SComponent {
  render() {
    const { logisticsTimeDesc, logisticsStartTime, logisticsEndTime, showWarningFlag } = this.props;
    let day = '', time = '', endDay = '';
    if (logisticsStartTime) {
      day = str.date(logisticsStartTime).format('m-d');
      time = str.date(logisticsStartTime).format('h:i');
    }
    if (logisticsEndTime) {
      time += ` - ${str.date(logisticsEndTime).format('h:i')}`;
      endDay = str.date(logisticsEndTime).format('m-d');
    }
    if (logisticsStartTime && logisticsEndTime && endDay != day) {
      time += `(${endDay})`;
    }
    return (
      <View>
        <View style={{flexDirection:'row',marginBottom:5}}>
          <SText fontSize={13} color='rgba(2,29,51,0.54)'>{logisticsTimeDesc}</SText>
          <SText fontSize={13} color={showWarningFlag?'#FF7043':'rgba(2,29,51,0.3)'}>{`     ${day}     ${time}`}</SText>
        </View>
      </View>
    )
  }
}