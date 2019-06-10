import React from 'react';
import{
  View,
  ListView,
  InteractionManager,
  TouchableOpacity,
} from 'react-native';
import { SComponent, SStyle, SText } from 'sxc-rn';
import { UtilsAction } from 'actions'
import { Page } from 'components';
import { 
  IconCheckedRed,
  IconCheckedYellow,
  IconCheckedGreen,
  IconCheckedCyan,
  IconCheckedBlue,
  IconCheckedDarkblue,
  IconCheckedPurple,
  IconUncheckGray 
} from 'config';
import Echarts from 'native-echarts';
import CheckBox from './checkBox';
import DeepCopy from 'lodash';

const width = require('Dimensions').get('window');
const colors = ['#FF7043','#FFC343','#02BF02','#02BFBF','#4A90E2','#4E4AE2','#9E02BF'];
function generateSeries(index, data ,name) {
  const i = index >= 7 ? index % 7 : index;
  return {
    type: 'line',
    data: data,
    name,
    symbolSize: 7,
    itemStyle: {
      normal: {
        color: colors[i]
      },
      lineStyle: {
        normal: {
          color: colors[i]
        }
      }
    }
  }
}

const s = SStyle({
	skuContainer: {
		width: '@window.width',
		paddingLeft: 15,
		paddingTop: 6,
		paddingBottom: 6,
		backgroundColor: '#fff',
	},
	skuName: {
    lineHeight: 22,
    color: '#021D33'
	},
	skuCity: {
		fontSize: 13,
    lineHeight: 20,
    color: 'rgba(2, 29, 51, .54)'
	},
	chartTabContainer: {
		width: '@window.width',
		backgroundColor: '#fff',
		marginTop: 10,
	},
	buttonChoice: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 20,
		marginBottom: 27,
	},
  leftNormal: {
    width: 82,
    height: 30,
    borderWidth: 1,
    borderColor: '#2296F3',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleNormal: {
  	width: 82,
  	height: 30,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#2296F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightNormal: {
    width: 82,
    height: 30,
    borderWidth: 1,
    borderColor: '#2296F3',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
  	fontSize: 13,
  	color: '#fff',
  },
  normalText: {
  	fontSize: 13,
  	color: '#0C90FF',
  },
  chartContainer: {
    backgroundColor: '#fff',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 30,
  },
  unit: {
  	fontSize: 10,
  	lineHeight: 14,
  	color: '#C4C6CF',
  },
  row: {
  	width: '@window.width',
  	backgroundColor: '#fff',
  	flexDirection: 'row',
  	justifyContent: 'space-between',
  	alignItems: 'center',
  	borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingLeft: 15,
    paddingRight: 15,
    height: 52,
  },
  rowLeft: {
  	flexDirection: 'row',
  	justifyContent: 'flex-start',
  	alignItems: 'center',
  },
  checked: {
  	width: 22,
  	height: 22,
  	marginRight: 10,
  },
  rowLeftText: {
  	flexDirection: 'column',
  },
  supplierName: {
  	fontSize: 15,
  	lineHeight: 22,
  },
});
//图表样式
const mOption = {
  backgroundColor:'#fff',
  //是否显示提示框组件，包括提示框浮层
  tooltip:{
    show: true,
    trigger: 'axis',
    // formatter: '{c}'
  },
  grid:{
    left: 5,
    top: 20,
    rigth: 0,
    bottom: 0,
    width: width,
    containLabel: true
  },
  xAxis: {
    axisLine:{
      show: true
    },
    //坐标轴刻度
    axisTick:{
      show: true,
    },
    //刻度标签
    axisLabel:{
      textStyle:{
        fontSize: 10,
        color: '#C4C6CF'
      }
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    axisLine:{
      show: false
    },
    //坐标轴刻度
    axisTick:{
      show: true,
    },
    //刻度标签
    axisLabel:{
      textStyle:{
        fontSize: 13,
        color: '#C4C6CF'
      }
    }
  },
  series: []
};


/**
 * 询价编辑页面
 */
module.exports = class MarketTrend extends SComponent {
  constructor(props){
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1,r2) => r1 !== r2});
 		this.state = {
      pageLoading: true,
      isDisabled: false,

      active: 1, // 当前选中tab值: 索引值index+1

      lspuName: '', // 原料name
			originPurchasePlace: '', // 原料产地
			supplierQuotations: [], // 供应商行情列表
			timePeriods: [], // tab时间段数组
			trendLineChart: {},
      chartDates: [],
      chartDataVOs: [],
      _chartDataVOs: [], // chartDataVOs副本
      timePeriod: 1
		};
    
  }

	componentDidMount () {
		InteractionManager.runAfterInteractions(async () => {
      this.changeState({
        pageLoading: true
      })
      await this._getData();
      this.changeState({
        pageLoading: false
      })
		})
	}

	_getData () {
    const id = this.getRouteData('id'); // 对应原料的id
    this.changeState({
      _chartDataVOs: [],
      supplierQuotations: []
    });
		commonRequest({
			apiKey: 'getLspuQuotationTrendKey',
			objectName: 'quotationTrendQueryDO',
			params: {
				lspuId: id,
				timePeriod: this.state.timePeriod
			}
		}).then(res => {
      console.log(res.data)
      const { lspuName, originPurchasePlace, supplierQuotations, timePeriods, trendLineChart } = res.data
      if (res.success) {
        this.changeState({
          lspuName,
          originPurchasePlace,
          supplierQuotations,
          timePeriods,
          trendLineChart,
          chartDates: trendLineChart.chartDates,
          chartDataVOs: trendLineChart.chartDataVOs,
          _chartDataVOs: trendLineChart.chartDataVOs.slice(0, 4),
          isDisabled: trendLineChart.chartDataVOs.length > 4
        });
      } else {
        this._showMsg('异常错误!')
      }
		})
	}

  //顶端SKU
	_renderSkuView () {
		return (
			<View style={s.skuContainer}>
				<SText style={s.skuName} fontSize="caption_p">{this.state.lspuName}</SText>
				<SText style={s.skuCity}>{this.state.originPurchasePlace}</SText>
			</View>
		)
	}

	// 渲染tabs
	_renderChartTabs = () => {
    if (!this.state.timePeriods || this.state.timePeriod.length) return null;
    const arr = this.state.timePeriods.map(e => {
      const { key, value } = e
      return {
        style: key === 1 ? s.leftNormal : key === 2 ? s.middleNormal : s.rightNormal,
        key,
        value
      }
    })
		return(
			<View style={s.chartTabContainer}> 
        <View style={s.buttonChoice}>
          {
            arr.map((e, i) => {
              const { style, key, value } = e;
              return (
                <TouchableOpacity
                  style={this.state.active === key ? [style, {backgroundColor: '#0C90FF'}] : style} 
                  onPress={() => {this._chooseDays(key)}}
                  key={i}
                >
                  <SText style={this.state.active === key ? s.activeText : s.normalText}>{value}</SText>
                </TouchableOpacity>
              )
            })
          }
				</View>
			</View>
		)
	}

	// 选择tab时切换折线视图
	_chooseDays = (d) => {
    this.changeState({
      active: d,
      timePeriod: d,
    }, this._getData);
	}
  
  // 渲染折线图
	_renderCharts = () => {
		return(
      <View  style={s.chartContainer}>
      	<SText style={s.unit}>{this.state.trendLineChart.unitStr}</SText>
      	<View style={s.chartView}>
      		<Echarts option={this._getOption()} height={216}  />
      	</View>
      </View>
		)
	}

  // 获取图标数据
  _getOption = () => {
    const option= DeepCopy.cloneDeep(mOption)
    if (this.state._chartDataVOs.length){
      option.xAxis.data = this.state.chartDates
      option.series = this.state._chartDataVOs.map(e => {
        const i = this.state.chartDataVOs.findIndex(c => c.uniqueIdentify === e.uniqueIdentify)
        return generateSeries(i, e.chartDatas, e.uniqueIdentify)
      });
    } else {
      option.series = [generateSeries(0, [])]
    }
    return option;
  }
  
  // 供应商选择列表
	_renderSuppliers = () => {
		return(
      <ListView 
        dataSource={this.ds.cloneWithRows(this.state.supplierQuotations)}
        renderRow={this._renderRow}
        enableEmptySections={true}
        removeClippedSubviews={false}
      />
    )
  }

	_renderRow = (rowData, sectionID, rowID) => {
    // 是否选中状态标志
    const isChecked = this.state._chartDataVOs.findIndex(e => e.uniqueIdentify === rowData.supplierCityName) >= 0;
    return (
      <View style={s.row}>
        <View style={s.rowLeft}>
          <CheckBox changeCheck={this._changeCheck} isDisabled={this.state.isDisabled} showMsg={this._showMsg} rowData={rowData} defaultChecked={isChecked} imgSource={[this._activateIcon(rowID), IconUncheckGray]} checkedStyle={s.checked} />
        	<View style={s.rowLeftText}>
      	    <SText style={s.supplierName}>{rowData.supplierCityName}</SText>
      	    {/*
      	    	rowData.quotationDesc ? 
      	    	<SText style={[s.skuCity,{lineHeight: 13}]}>{rowData.quotationDesc}</SText>
      	    	: null
            */}
      	  </View>
        </View>
        {/*<SText style={[s.skuCity,{fontSize: 15}]}>{rowData.currentQuotation}</SText>*/}
      </View>
    )
	}

  // icon图片
  _activateIcon = (id) => {
    return [IconCheckedRed, IconCheckedYellow, IconCheckedGreen, IconCheckedCyan, IconCheckedBlue, IconCheckedDarkblue, IconCheckedPurple][id > 7 ? id % 7 : id]
  }

  // 更改CheckBox状态
  _changeCheck = (rowData, status) => {
    const { supplierCityName } = rowData;
    let arr = this.state._chartDataVOs.slice();
    if (status) {
      const item = this.state.chartDataVOs.find(e => e.uniqueIdentify === supplierCityName);
      arr.push(item)
    } else {
      const index = this.state._chartDataVOs.findIndex(e => e.uniqueIdentify === supplierCityName);
      if (index > -1) arr.splice(index, 1);
    }
    this.changeState({
      _chartDataVOs: arr,
      isDisabled: arr.length >= 4
    });
  }

  // toast提示
  _showMsg = (str) => {
    __STORE.dispatch(UtilsAction.toast(str, 1000));
  }

  render(){
    return (
      <Page 
        title='上游行情走势'
        pageName='上游行情'
        pageLoading={this.state.pageLoading} 
        back={() => {
          this.navigator().pop();
          this.props.route.callback();
        }}
      >
        {this._renderSkuView()}
        {this._renderChartTabs()}
        {this._renderCharts()}
        {this._renderSuppliers()}
      </Page>
    )
  }
}
