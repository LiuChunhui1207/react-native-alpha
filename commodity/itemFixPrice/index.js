'use strict';
import React from 'react';
import { View, TouchableOpacity, Dimensions, Text, InteractionManager } from 'react-native';
import { SStyle, SComponent, SText, DeviceInfo, SRefreshScroll } from 'sxc-rn';
import { Page, Header, Popover } from 'components';
import { UtilsAction } from 'actions';
import Svg, { G, RadialGradient, Rect, Defs, Stop, Polygon, Path } from 'react-native-svg';
import EditInquiry from '../../inquiry/editInquiry';
import CalcModal from './CalcModal';
import SkuInquiryEdit from '../../inquiry/skuInquiryEdit';
const windowWidth = Dimensions.get('window').width;
const s = SStyle({
  title: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  titleWrap: {
    flex: 0,
    minWidth: 57,
    height: 28,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff'
  },
  titleItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeTitleItem: {
    backgroundColor: '#fff'
  },
  itemInfoTop: {
    paddingHorizontal: 15,
    marginTop: 15
  },
  itemPredictionInfo: {
    marginTop: 35,
    height: 40,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  itemOprationArea: {
    alignItems: 'center',
    marginTop: 12
  },
  itemHistoryTip: {
    alignItems: 'center',
    marginTop: 20
  },
  itemInfoBottom: {
    paddingHorizontal: 15,
    height: 64,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  previewPriceWrap: {
    backgroundColor: '#fff'
  },
  previewPriceHeader: {
    height: 40,
    justifyContent: 'center',
    paddingLeft: 15
  },
  previewPriceHeaderFont: {
    color: '#65768E',
    fontSize: 15
  },
  marketPreviewItemName: {
    height: 40,
    justifyContent: 'center',
    paddingLeft: 15
  },
  orderScalePricePreviewWrap: {
    flexDirection: 'row',
    height: 45,
    paddingLeft: 15,
    paddingBottom: 5,
    alignItems: 'stretch',
    borderColor: '#f0f0f0'
  },
  orderScalePricePreviewItem: {
    flex: 1,
    justifyContent: 'space-between'
  },
  fixPriceHistoryWrap: {
    marginTop: 10,
    backgroundColor: '#fff'
  },
  fixPriceHistoryTitle: {
    height: 38,
    justifyContent: 'center',
    borderColor: '#F7F7FA',
    borderBottomWidth: 1,
    paddingHorizontal: 15
  },
  fixPriceHistoryListHeader: {
    justifyContent:'space-between',
    flexDirection: 'row',
    height: 38,
    alignItems: 'center',
    paddingHorizontal: 15,
    borderColor: '#F7F7FA',
    borderBottomWidth: 1
  },
  fixPriceHistoryItem: {
    justifyContent:'space-between',
    paddingHorizontal: 15,
    flexDirection: 'row',
    height: 52,
    alignItems: 'center',
    borderColor: '#EAEAEA',
    borderBottomWidth: 1
  },
  fixPriceHistoryCol0: {
    width: 100,flex: 0
  },
  fixPriceHistoryCol: {
    flex: 1
  }
})
export default class ItemFixPrice extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      activeCityIndex: 0,
      pageLoading: true,
      itemSpecies: '',
      itemId: null,
      packagingType: '',
      productWeight: null,
      sellStock: null,
      predictionFirstNetProfit: null,
      predictionFirstNetProfitRate: null,
      itemPrice: null,//单位价格
      basePrice: null,
      purchasePrice: null,//最近一天采购价
      marketInquiryPrice: null,//市场询价
      purchaseInquiryPrice: null,//采购询价
      marketPricePrevieDTOs: [],//各市场价格预览
      fixPriceHistory: [],//历史定价
    };
    this.priceSavePageItems = [];//两个城市的不同的静态数据
    this.cityList = [];
  };
  componentDidMount(){
    InteractionManager.runAfterInteractions(() => {
      this._getData();
    });
  }
  _getData = (endRefresh) => {
    commonRequest({
      apiKey: 'queryItemFixPriceInfoKey',
      objectName: 'priceSavePageQueryDO',
      params: {
        skuId: this.props.route.data.skuId,
      }
    }).then((res) => {
      this.priceSavePageItems = res.data.priceSavePageItems;
      //公共数据
      const { itemSpecies, packagingType, productWeight, skuId } = res.data;
      this.cityList = [];
      this.priceSavePageItems.map((item,index) => {
        this.cityList.push({
          cityName: item.cityName,
          cityIndex: index
        });
      })
      //两个城市的数据
      this._dealCityData({productWeight,activeCityIndex: this.state.activeCityIndex});
      this.setState({ pageLoading: false, itemSpecies, packagingType, productWeight, skuId });
      endRefresh ? endRefresh() : null;
    }).catch( err => {
      endRefresh ? endRefresh() : null;
      this.setState({
        pageLoading: false
      });
    })
  }
  _dealCityData({productWeight=this.state.productWeight,activeCityIndex}){
    const {
      itemId, sellStock, predictionFirstNetProfit,
      predictionFirstNetProfitRate, basePrice, purchasePrice, marketInquiryPrice, purchaseInquiryPrice,fixPriceHistory,
      pricePreview
    } = this.priceSavePageItems[activeCityIndex];
    const { marketPricePrevieDTOs } = pricePreview;
    let itemPrice = (basePrice/productWeight).toFixed(2);
    this.setState({
      itemId,sellStock, predictionFirstNetProfit,
      predictionFirstNetProfitRate, basePrice, purchasePrice, marketInquiryPrice, purchaseInquiryPrice, fixPriceHistory,
      marketPricePrevieDTOs,itemPrice
    });
  }
  _judgeJumpPage = ()=> {
    // this._showJumpPageModal();
    // this.CalcModal._toggle();
    commonRequest({
      apiKey: 'needUpdateInquiryPriceKey',
      objectName: 'needUpdateInquiryPriceQueryDO',
      params: {
        skuId: this.props.route.data.skuId,
      }
    }).then((res) => {
      if(res.data){
        this._showJumpPageModal();
      }else{
        this.CalcModal._toggle();
      }
    }).catch((err)=> {
      __STORE.dispatch(UtilsAction.toast(err),1000);
    })
  }
  _showJumpPageModal = () => {
    this.refs['judgePageModal']._toggle();
  }
  _cityChange = (cityIndex) => {
    if(cityIndex != this.state.activeCityIndex){
      this.setState({
        activeCityIndex: cityIndex
      })
      this._dealCityData({activeCityIndex: cityIndex});
    }
  }
  _handleQueryPrice = () => {
    this.refs['judgePageModal']._toggle();
    InteractionManager.runAfterInteractions(() => {
      this.setRouteData({
        id: this.state.itemId,
        shouldPopback: true,
      }).push({
        component: SkuInquiryEdit,
        name: 'SkuInquiryEdit',
        callback: () => {
          this._getData();
        }
      });
    });
  }
  handleSave = ({ basePrice,itemPrice,predictionFirstNetProfit,predictionFirstNetProfitRate }) => {
    this.setState({ basePrice,itemPrice,predictionFirstNetProfit,predictionFirstNetProfitRate });
    this._getData();
  }
  _renderTitle(){
    return (
      <View style={s.title} >
        {this.cityList.length === 0 ?
          null
          :
          <View style={[s.titleWrap,{width: 57 * this.cityList.length}]}>
            {this.cityList.map((city) => {
              if(this.state.activeCityIndex === city.cityIndex){
                return (
                  <TouchableOpacity key={city.cityIndex} style={[s.titleItem,s.activeTitleItem]} onPress={this._cityChange.bind(this,city.cityIndex)}>
                    <SText fontSize='mini_p' color='blue'>{city.cityName}</SText>
                  </TouchableOpacity>
                )
              }else{
                return (
                  <TouchableOpacity key={city.cityIndex} style={s.titleItem}>
                    <SText fontSize='mini_p' color='white' onPress={this._cityChange.bind(this,city.cityIndex)}>{city.cityName}</SText>
                  </TouchableOpacity>
                )
              }
            })}
          </View>
        }
      </View>
    )
  }
  _renderGradient(){
    const { skuId, itemSpecies, packagingType, productWeight, sellStock, predictionFirstNetProfit,
      predictionFirstNetProfitRate, basePrice, purchasePrice, marketInquiryPrice, purchaseInquiryPrice,fixPriceHistory,
      itemPrice } = this.state;
    return(
      <View>
        <Svg height='314' width={windowWidth} >
          <Defs>
            <RadialGradient id='grad' cx="48.2572917%" cy="50%" fx="48.2572917%" fy="50%" r="52%" gradientTransform="translate(0.482573,0.452443),scale(1.000000,0.850340),rotate(-132.828916),translate(-0.482573,-0.452443)" >
              <Stop stopColor="#00ACDF" offset="0%"></Stop>
              <Stop stopColor="#1264D5" offset="100%"></Stop>
            </RadialGradient>
          </Defs>
          <Rect width={windowWidth} height='314'  fill='url(#grad)'/>
          {/* <Header
            title={this._renderTitle()}
            back={()=>this.navigator().pop()}
            headerStyle={{backgroundColor: 'transparent'}}
          ></Header> */}
          <View style={s.itemInfoTop}>
            <View style={{flexDirection: 'row',justifyContent: 'space-between'}}>
              <SText color='fff' fontSize='title'>{itemSpecies}</SText>
              <SText color='fff' fontSize='title'>{skuId}</SText>
            </View>
            <View style={{opacity: 0.8,flexDirection: 'row',marginTop: 5}}>
              <View style={{flexDirection: 'row',flex: 1}}>
                <SText color='fff' fontSize='mini_p' style={{marginRight: 20}}>{packagingType}</SText>
                <SText color='fff' fontSize='mini_p' style={{marginRight: 20}}>{productWeight} 斤装</SText>
                <SText color='fff' fontSize='mini_p' style={{marginRight: 20}}>库存 {sellStock} 件</SText>
              </View>
              <SText color='fff' fontSize='mini_p'>SKUID</SText>
            </View>
          </View>
          <View style={s.itemPredictionInfo}>
            <View style={{alignItems: 'center',marginRight: 40}}><SText color='fff' fontSize='title'>{predictionFirstNetProfit}</SText><SText color='fff' fontSize='mini_p' style={{opacity: 0.8}}>预估一毛净额(元)</SText></View>
            <View style={{alignItems: 'center'}}><SText color='fff' fontSize='title' >{predictionFirstNetProfitRate}%</SText><SText color='fff' fontSize='mini_p' style={{opacity: 0.8}}>预估一毛净率</SText></View>
          </View>
          <View style={s.itemOprationArea}>
            <TouchableOpacity onPress={this._judgeJumpPage}>
              <SText color='fff' fontSize='mini_p' style={{opacity: 0.9,textAlign: 'center'}}>{itemPrice} 元/斤</SText>
              <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize: 50,color: '#fff'}}>{basePrice}</Text>
                <View style={{justifyContent:'flex-end',paddingBottom: 10,marginLeft: 5}}>
                  <Svg width='17' height='17'>
                    <G  stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                      <G fill="#FFFFFF">
                        <Path d="M4.49027517,11.463532 L3.79495083,10.0609934 C3.79376981,10.0586631 3.79081727,10.0577892 3.78963625,10.055459 L10.7697478,3.1688925 L11.8382738,4.22276262 L4.49027517,11.463532 L4.49027517,11.463532 Z" id="15.-Pencil"></Path>
                        <Path d="M9.8529826,1.16077182 L9.85534464,1.16281082 C10.1851439,0.808025351 10.6545986,0.581987978 11.1804468,0.581987978 C12.1769307,0.581987978 12.9841565,1.3786532 12.9841565,2.36144972 C12.9841565,2.87848108 12.7568106,3.34016824 12.3998479,3.66524261 L12.4016194,3.66699032 L12.2460203,3.82049766 L9.7018123,1.31020116 L9.8529826,1.16077182 L9.8529826,1.16077182"></Path>
                        <Path d="M9.29406584,1.71275741 L10.3620014,2.76662754 L3.38188979,9.65319399 C3.37952775,9.65202885 3.37834673,9.649116 3.3759847,9.64795086 L1.95462955,8.96197404 L9.29406584,1.71275741 L9.29406584,1.71275741 Z" id="15.-Pencil"></Path>
                        <Path d="M1.67059472,9.45162458 L3.23751034,10.1909066 C3.23810085,10.2048883 3.99395236,11.7440397 3.99395236,11.7440397 L2.19083315,12.2514586 L1.15626139,11.230795 L1.67059472,9.45162458 L1.67059472,9.45162458 Z" id="15.-Pencil"></Path>
                      </G>
                    </G>
                  </Svg>
                </View>
              </View>
              <SText color='fff' fontSize='mini_p' style={{opacity: 0.9,textAlign: 'center'}}>基准定价(元)</SText>
            </TouchableOpacity>
          </View>
          <View style={s.itemHistoryTip}>
            <View style={{flexDirection: 'row',alignItems: 'center',paddingHorizontal: 10,height: 26,borderRadius: 13,backgroundColor: '#0F67C9'}}>
              {fixPriceHistory[0] ?
                <SText color='fff' fontSize='mini_p' style={{opacity: 0.9}}>{fixPriceHistory[0].operatorName} <SText color='fff' fontSize='mini_p' style={{opacity: 0.7}}>更新于</SText> {fixPriceHistory[0].gmtCreate}</SText>
                :
                <SText color='fff' fontSize='mini_p' style={{opacity: 0.9}}>暂无数据</SText>
              }
            </View>
          </View>
        </Svg>
        <Svg height='64' width={windowWidth}>
          <Rect width={windowWidth} height='64' fill='#1266D4' />
          <Rect width={windowWidth} height='64' fill='#424242' fillOpacity='0.05' />
          <View style={s.itemInfoBottom}>
            <View ><SText color='fff' fontSize='title'>{purchasePrice}</SText><SText color='fff' fontSize='mini_p' >最近一天采价(元)</SText></View>
            <View ><SText color='fff' fontSize='title'>{marketInquiryPrice}</SText><SText color='fff' fontSize='mini_p' >市场价(元)</SText></View>
            <View ><SText color='fff' fontSize='title'>{purchaseInquiryPrice}</SText><SText color='fff' fontSize='mini_p' >采购价(元)</SText></View>
          </View>
        </Svg>
      </View>
    )
  }
  _previewPrice(){
    return(
      <View style={s.previewPriceWrap}>
        <View style={s.previewPriceHeader}>
          <Text style={s.previewPriceHeaderFont}>价格预览</Text>
        </View>
        <View>
          {this.state.marketPricePrevieDTOs.map((marketPreviewItem,n) => {
            return (
              <View key={marketPreviewItem.marketId}>
                <View style={s.marketPreviewItemName}>
                  <SText fontSize='mini_p' color='666'>{marketPreviewItem.marketName}</SText>
                </View>
                <View style={[s.orderScalePricePreviewWrap,{borderBottomWidth: n === this.state.marketPricePrevieDTOs.length - 1 ? 0 : 1 }]}>
                  {marketPreviewItem.orderScalePricePreviewDTOs.map((orderScalePricePreviewItem,index) => {
                    const { orderScalePirce, scaleDescription } = orderScalePricePreviewItem;
                    return(
                      <View key={index} style={s.orderScalePricePreviewItem}>
                        <SText fontSize='title' color='000'>{orderScalePirce}</SText>
                        <SText fontSize='mini_p' color='999'>{scaleDescription}</SText>
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          })}
        </View>
      </View>
    )
  }
  _renderRecord(){
    return(
      <View style={s.fixPriceHistoryWrap}>
        <View style={s.fixPriceHistoryTitle}><SText color='000' fontSize='caption_p'>定价记录</SText></View>
        <View style={s.fixPriceHistoryListHeader}>
          <View style={s.fixPriceHistoryCol0}><SText color='666' fontSize='mini_p'>定价人</SText></View>
          <SText color='666' fontSize='mini_p' style={[s.fixPriceHistoryCol,{textAlign: 'center'}]}>规则改动</SText>
          <SText color='666' fontSize='mini_p' style={[s.fixPriceHistoryCol,{textAlign: 'right'}]}>调价前(元)</SText>
          <SText color='666' fontSize='mini_p' style={[s.fixPriceHistoryCol,{textAlign: 'right'}]}>调价后(元)</SText>
        </View>
        {this.state.fixPriceHistory.map((fixPriceHistoryItem,index) => {
          const { operatorName, isModifyRule, gmtCreate, oldBasePrice, basePrice } = fixPriceHistoryItem;
          return (
            <View key={index} style={s.fixPriceHistoryItem}>
              <View style={s.fixPriceHistoryCol0}>
                <SText fontSize='caption_p' color='000'>{operatorName}</SText>
                <SText fontSize='mini_p' color='999'>{gmtCreate}</SText>
              </View>
              <SText fontSize='caption_p' color='999' style={[s.fixPriceHistoryCol,{textAlign: 'center'}]}>{isModifyRule}</SText>
              <SText fontSize='caption_p' color='000' style={[s.fixPriceHistoryCol,{textAlign: 'right'}]}>{oldBasePrice}</SText>
              <SText fontSize='caption_p' color='000' style={[s.fixPriceHistoryCol,{textAlign: 'right'}]}>{basePrice}</SText>
            </View>
          )
        })}
      </View>
    )
  }
  _renderJudgeModalLeftBtn(){
    return(
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          borderWidth: 1,
          borderColor: '#fff',
          borderRadius: 10
        }}
        onPress={() => {this.refs['judgePageModal']._toggle();}}
      >
        <SText color='666' fontSize='body'>暂时不</SText>
      </TouchableOpacity>
    )
  }
  _renderJudgeModalRightBtn(){
    return(
      <TouchableOpacity
        style={{
          backgroundColor: '#fff',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          borderColor: '#fff',
          borderRadius: 10
        }}
        onPress={this._handleQueryPrice}
      >
        <SText color='blue' fontSize='body'>去询价</SText>
      </TouchableOpacity>
    )
  }
  render(){
    return (
      <Page
        pageName='编辑定价'
        title={this._renderTitle()}
        hideTitle={false}
        headerStyle={{backgroundColor: '#1264D5'}}
        pageLoading={this.state.pageLoading}
        loading={false}
        back={()=>this.navigator().pop()}
      >
        <SRefreshScroll
          startRequest={this._getData}
          enableBottomRefresh={false}
        >
          {this._renderGradient()}
          {this._previewPrice()}
          {this._renderRecord()}
        </SRefreshScroll>
        <Popover ref='judgePageModal' hideHeader={true}
          wrapperStyle={{borderWidth: 1,borderRadius: 10,overflow: 'hidden'}}
          leftBtn={this._renderJudgeModalLeftBtn()}
          rightBtn={this._renderJudgeModalRightBtn()}
        >
          <View style={{height: 110,justifyContent: 'space-between',paddingVertical: 35,borderBottomWidth:1, borderColor: '#eee'}}>
            <SText color='000' fontSize='body' style={{textAlign: 'center'}}>修改基准定价</SText>
            <SText color='000' fontSize='body' style={{textAlign: 'center',marginTop: 10}}>需在询价1小时内</SText>
          </View>
        </Popover>
        <CalcModal ref={ref => this.CalcModal = ref}
          itemId={this.state.itemId}
          basePrice={this.state.basePrice}
          itemPrice={this.state.itemPrice}
          productWeight={this.state.productWeight}
          predictionFirstNetProfit={this.state.predictionFirstNetProfit}
          predictionFirstNetProfitRate={this.state.predictionFirstNetProfitRate}
          onSave={this.handleSave}
        />
      </Page>
    )
  }
}
