/*
 * @Author: senze.fan
 * @Date: 2017-09-11 15:15:30
 * @Last Modified by: senze.fan
 * @Last Modified time: 2017-09-11 17:56:47
 * @Description: chart
 */
import React, { Component } from 'react'
import {
  View,
  Text,
  Dimensions,
  StyleSheet
} from 'react-native'
import Echarts from 'native-echarts'
import DeepCopy from 'lodash'
const { width } = Dimensions.get('window')

const colors = ['#FF7043','#FFC343','#02BF02','#02BFBF','#4A90E2','#4E4AE2','#9E02BF']
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
const option = {
  backgroundColor:'#fff',
  //是否显示提示框组件，包括提示框浮层
  tooltip:{
    show: true,
    trigger: 'axis',
    // formatter: '{c}'
  },
  grid:{
    left: 5,
    top: 40,
    rigth: 0,
    bottom: 0,
    width: width - 50,
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
      show: true
    },
    //刻度标签
    axisLabel:{
      textStyle:{
        fontSize: 10,
        color: '#C4C6CF'
      }
    },
    nameTextStyle:{
      fontSize: 10,
      color: '#C4C6CF'
    }
  },
  series: []
};

export default class Chart extends Component {
  constructor (props) {
    super(props)
    this.state = {
      ...this.initState(this.props)
    }
  }
  
  initState = (props) => {
    //console.log(props)
    const { chartDataVOS, chartDataVOs, chartDates, baseLine, unitStr } = props
    return {
      chartDataVOS: chartDataVOS || chartDataVOs || [], // 所有数据
      chartDates: chartDates || [], // x轴数据
      baseLine: baseLine || [], // y轴数据
      unitStr: unitStr || '' // y轴名称位置
    }
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      ...this.initState(nextProps)
    })
  }

  /**
   * @desc 处理生成表格数据
   */
  _getOption = () => {
    const _option = DeepCopy.cloneDeep(option)
    const { chartDataVOS, chartDates, baseLine, unitStr } = this.state
    if (this.state.chartDataVOS.length){
      _option.xAxis.data = chartDates
      // _option.yAxis.data = baseLine
      _option.yAxis.name = unitStr
      _option.series = chartDataVOS.map((e, i) => {
        return generateSeries(i, e.chartDatas, e.uniqueIdentify)
      });
    } else {
      _option.series = [generateSeries(0, [])]
    }
    return _option;
  }
  /**
   * @desc 渲染底部栏目
   */
  _renderBottomFlag = () => {
    const { chartDataVOS } = this.state
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
        {
          chartDataVOS.map((e, i) => {
            const color = colors[i >= 7 ? i % 7 : i]
            return (
              <View style={{ flexDirection: 'row', alignItems: 'center' }} key={i}>
                <View style={{ width: 8, height: 8, borderColor: color, borderWidth: 1, borderRadius: 4 }}></View>
                <Text style={{ fontSize: 13, marginLeft: 3, marginRight: 10 }}>{e.uniqueIdentify}</Text>
              </View>
            )
          })
        }
      </View>
    )
  }

  render () {
    return (
      <View style={{ flexDirection: 'column', alignItems: 'center', padding: 15, backgroundColor: '#fff', marginBottom: 10 }}>
        <Echarts option={this._getOption()} height={200}  />
        {this._renderBottomFlag()}
      </View>
    )
  }
}
