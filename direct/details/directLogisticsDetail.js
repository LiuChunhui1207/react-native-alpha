import React from 'react';
import ReactNative,{InteractionManager,Linking,Alert,View, WebView, Image, TouchableOpacity, Dimensions} from 'react-native';
import {SComponent, SText, SToast} from 'sxc-rn';
import {Page, Button, Select, RefreshList, Refresh} from 'components';
import {ICON_LOCATION_BLUE, ICON_CALL_BLUE} from 'config';
import {str} from 'tools';
import {UtilsAction} from 'actions';

module.exports = class DirectLogisticsDetail extends SComponent {
  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
      data: {
        directCarLocations: null,
        directLoadLocation: null,
        directLogisticsUnlocations: [],
      },
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

  _getData = () => {
    const data = this.getRouteData('data');
    if (!data || !data.schedulingId) return;
    commonRequest({
      apiKey: 'queryDirectLogisticsDetailKey', 
      objectName: 'directLogisticsQueryDO',
      params: {
        directPlanId: data.directPlanId,
        locationId: data.locationId,
        schedulingId: data.schedulingId,
      }
    }).then((data) => {
      data = data.data;
      this.changeState({
        data: data,
        pageLoading: false,
      });
    }).catch((err)=>{
      this.changeState({
          pageLoading: false,
      });
      __STORE.dispatch(UtilsAction.toast(err.errorMessage, 1000));
    });
  }

  _getJS = (data) => {
    let { directCarLocations, directLoadLocation, directLogisticsUnlocations } = data;
    if (!directCarLocations) return;
    if (!directLoadLocation) directLoadLocation = {};
    if (!directLogisticsUnlocations) directLoadLocation = [];
    const allPoints = [directCarLocations, directLoadLocation].concat(directLogisticsUnlocations).filter(item=>item&&item.longitude&&item.latitude);
    const selectedPoint = allPoints.find(loc => loc&&loc.selectFlag);
    if (!selectedPoint) return;
    const selectedPointStr = `new BMap.Point(${selectedPoint.longitude}, ${selectedPoint.latitude})`;
    let carPointStr = 'undefined', loadPointStr = 'undefined';
    if (directCarLocations.longitude&&directCarLocations.latitude)
      carPointStr = `new BMap.Point(${directCarLocations.longitude}, ${directCarLocations.latitude})`;
    if (directLoadLocation.longitude&&directLoadLocation.latitude)  
      loadPointStr = `new BMap.Point(${directLoadLocation.longitude}, ${directLoadLocation.latitude})`;
    let unloadPointsStr = "";
    directLogisticsUnlocations.forEach(loc => {
      if (unloadPointsStr) unloadPointsStr += ',';
      unloadPointsStr += `new BMap.Point(${loc.longitude}, ${loc.latitude})`;
    });
    let allPointsStr4Zoom = "";
    allPoints.forEach((point, i) => {
      if (allPointsStr4Zoom) allPointsStr4Zoom += ',';
      allPointsStr4Zoom += `{"lng":${point.longitude}, "lat":${point.latitude}}`;
    });
    return `
      function loadJS() {
        var map = new BMap.Map("allmap");
        var selectedPoint = ${selectedPointStr};
        var carPoint = ${carPointStr};
        var loadPoint = ${loadPointStr};
        var unloadPoints = [${unloadPointsStr}];

        function getZoom (maxLng, minLng, maxLat, minLat) {  
            var zoom = ["50","100","200","500","1000","2000","5000","10000","20000","25000","50000","100000","200000","500000","1000000","2000000"];  
            var pointA = new BMap.Point(maxLng,maxLat);
            var pointB = new BMap.Point(minLng,minLat);
            var distance = map.getDistance(pointA,pointB).toFixed(1);
            for (var i = 0,zoomLen = zoom.length; i < zoomLen; i++) {  
                if(zoom[i] - distance > 0){  
                    return 18-i+3;
                }  
            };  
        }
        
        function setZoom(points){
            if(points.length>0){
                var maxLng = points[0].lng;
                var minLng = points[0].lng;
                var maxLat = points[0].lat;
                var minLat = points[0].lat;
                var res;
                for (var i = points.length - 1; i >= 0; i--) {
                    res = points[i];
                    if(res.lng > maxLng) maxLng =res.lng;
                    if(res.lng < minLng) minLng =res.lng;
                    if(res.lat > maxLat) maxLat =res.lat;
                    if(res.lat < minLat) minLat =res.lat;
                };
                var cenLng =(parseFloat(maxLng)+parseFloat(minLng))/2;
                var cenLat = (parseFloat(maxLat)+parseFloat(minLat))/2;
                var zoom = getZoom(maxLng, minLng, maxLat, minLat);
                var centerPoint = new BMap.Point(cenLng,cenLat);
                map.centerAndZoom(selectedPoint, zoom-1>0?zoom-1:11);
            }else{
                map.centerAndZoom(selectedPoint, 11);
            }
        }

        var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});
        var top_left_navigation = new BMap.NavigationControl();
        map.addControl(top_left_control);
        map.addControl(top_left_navigation);

        if (carPoint) {
          var carIconUri = "http://sxc-item.oss-cn-hangzhou.aliyuncs.com/app/warehouse/icons/car1.png";
          var myIcon = new BMap.Icon(carIconUri, new BMap.Size(48,48));
          var marker = new BMap.Marker(carPoint,{icon:myIcon});
          map.addOverlay(marker);
        }

        var labelBaseStyle = {
          width: "25px",
          height: "25px",
          fontSize: "15px",
          borderRadius: "15px",
          fontWeight: "bold",
          color: "white",
          textAlign: "center"
        };
        var loadLabelStyle = Object.assign({}, labelBaseStyle, {
          borderColor: "green",
          backgroundColor: "green"
        });
        var unloadLabelStyle = Object.assign({}, labelBaseStyle, {
          borderColor: "blue",
          backgroundColor: "blue"
        });
        var loadLabel = new BMap.Label("装", { position: loadPoint });
        loadLabel.setStyle(loadLabelStyle);
        map.addOverlay(loadLabel);
        unloadPoints.forEach(function(point){
          var label = new BMap.Label("卸", { position: point });
          label.setStyle(unloadLabelStyle);
          map.addOverlay(label);
        });

        setZoom([${allPointsStr4Zoom}]);
      }

      setTimeout(loadJS, 200);
    `;
  }

  render() {
    const { data } = this.state;
    const JS = this._getJS(data);
    let selectedPoint, locationInfo, driverInfo, phoneInfo, isUnloadLocation, driverPhone;
    if (JS) {
      const { directCarLocations, directLoadLocation, directLogisticsUnlocations } = data;
      const allPoints = [directCarLocations, directLoadLocation].concat(directLogisticsUnlocations);
      selectedPoint = allPoints.find(loc => loc&&loc.selectFlag);
      if (!selectedPoint) {
        Alert.alert(null, `无选中地点！`);
        return;
      }
      isUnloadLocation = directLogisticsUnlocations && directLogisticsUnlocations.includes(selectedPoint);
      const { carLocationName, loadLocationName, unLocationName } = selectedPoint;
      const { carNo, driverName } = directCarLocations;
      driverPhone = directCarLocations.driverPhone;
      locationInfo = carLocationName || loadLocationName || unLocationName;
      driverInfo = `司机： ${driverName} ${carNo}`;
      phoneInfo = `电话： ${driverPhone}`;
    }
    const alittleHigher = selectedPoint&&selectedPoint.directLogisticsTimes||locationInfo&&locationInfo.length>12;
    return (
      <Page
        title='物流详情'
        pageName={'线路详情-地图'}
        pageLoading={this.state.pageLoading}
        loading={false}
        back={() => this.navigator().pop()}
      >
        <WebView
          style={{ flex: 1 }}
          ref={(webView) => { this.webView = webView; }}
          injectedJavaScript={JS}
          source={{ uri: 'https://static.songxiaocai.com/sxf/schedulingCarMap/index.html' }}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
        />
        <View style={{height:alittleHigher?116:104,padding:15,flexDirection:'row',backgroundColor:'#fff'}}>
          <Image style={{width:13,height:18}} source={ICON_LOCATION_BLUE} />
          {
            isUnloadLocation && selectedPoint.directLogisticsTimes && selectedPoint.directLogisticsTimes.length
            ?
            <View style={{marginLeft:12,marginBottom:10}}>
              <SText style={{fontWeight:'400',width:250}} fontSize={15} color='#021D33'>{locationInfo}</SText>
            {
              selectedPoint.directLogisticsTimes.map((item, i) =>
                <LogisticsTime key={i} {...item} />
              )
            }
            </View>
            :
            <View style={{marginLeft:12}}>
              <SText style={{fontWeight:'400',width:250,marginTop:2}} fontSize={15} color='#021D33'>{locationInfo}</SText>
              <SText style={{marginTop:2}} fontSize={13} color='rgba(2,29,51,0.54)'>{driverInfo}</SText>
              <SText style={{marginTop:2}}  fontSize={13} color='rgba(2,29,51,0.54)'>{phoneInfo}</SText>
            </View>
          }
          {
            isUnloadLocation && selectedPoint && selectedPoint.showWarningFlag
            ?
            <View style={{
              paddingLeft:7,paddingRight:7,paddingTop:1.5,paddingBottom:1.5,
              position:'absolute',top:15,right:15,
            }}>
              <SText fontSize={12} color='#fff'>物流预警</SText>
            </View>
            :
            null
          }
        </View>
        {
          !isUnloadLocation
          ?
          <TouchableOpacity
            style={{position:'absolute',right:20,bottom:alittleHigher?90:78}}
            onPress={() => {
              Linking.openURL('tel:'+driverPhone);
            }}
          >
            <Image style={{width:52,height:52,borderRadius:26}} source={ICON_CALL_BLUE} />
          </TouchableOpacity>
          :
          null
        }
      </Page>
    );
  }
}

class LogisticsTime extends SComponent {
  render() {
    const { logisticsTimeDesc, logisticsStartTime, logisticsEndTime } = this.props;
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
          <SText fontSize={13} color='rgba(2,29,51,0.3)'>{`     ${day}     ${time}`}</SText>
        </View>
      </View>
    )
  }
}
