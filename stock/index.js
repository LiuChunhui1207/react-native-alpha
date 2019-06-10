'use strict';
import React from 'react';
import ReactNative, {
  InteractionManager,
  Image,
  ListView,
  TextInput,
  RefreshControl,
  View
} from 'react-native';
import {connect} from 'react-redux';
import {SStyle, SComponent, SText, SRefreshScroll} from 'sxc-rn';
import {Page} from 'components';
import {UtilsAction} from 'actions';
import {ICON_WARN} from 'config';
import KeyboardSpacer from 'react-native-keyboard-spacer';

let s = SStyle({
  row: {
    flexDirection: 'row'
  },
  header: {
    backgroundColor: 'f0',
    alignItems: 'center',
    height: 30
  },
  flex17: {
    flex: 17,
    textAlign: 'center'
  },
  flex33: {
    flex: 33,
  },
  rowTitle: {
    width: '@window.width * 0.7'
  },
  rowTitleWrap: {
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 'slimLine',
    borderColor: '#e5e5e5'
  },
  border: {
    height: 15,
    width: 'slimLine',
    backgroundColor: 'f0',
    marginLeft: 5,
    marginRight: 5
  },
  rowItem: {
    backgroundColor: '#fff',
    height: 45, 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingLeft: 15, 
    paddingRight: 15,
    borderBottomWidth: 'slimLine',
    borderColor: 'f0'
  },
  marginL10: {
    marginLeft: 10
  },
  stockInput: {
    padding: 0,
    paddingRight: 4,
    width: 70, 
    textAlign: 'right', 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#E5E5E5', 
    height: 35
  },
  itemWrap: {
    marginBottom: 10
  },
  iconWran: {
    position: 'absolute',
    right: 100,
    left: 5,
    top: 20,
    width: 13,
    height: 13
  }
});

class Index extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      pageLoading: true,
      refreshing: true,
      dataSource: []
    }

    this._renderRow = this._renderRow.bind(this);
    this._adjustSellStock = this._adjustSellStock.bind(this);
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions( () => {
      this._getData();
    })
  }
  /**
   * 获取库存列表
   * @return {[type]} [description]
   */
  _getData(){
    this.changeState({
      refreshing: true
    })
    commonRequest({
      apiKey: 'stockListKey', 
      objectName: 'spuSellStockQueryDO',
      params: {}
    }).then( (res) => {
      let data = res.data;
      this.changeState({
        pageLoading: false,
        refreshing: false,
        dataSource: data.sellStockDetails
      });
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }
  /**
   * 设置库存
   * @param  {[type]} param [description]
   * @return {[type]}       [description]
   */
  _adjustSellStock(param){
    param.cityCode = this.props.userState.cityCode;
    param.userId = this.props.userState.userId;
    commonRequest({
      apiKey: 'adjustSellStockKey', 
      objectName: 'adjustSellStockDO',
      withLoading: true,
      params: param
    }).then( (res) => {
      if(res.data){
        __STORE.dispatch(UtilsAction.toast('设置库存成功', 1000));
        this._getData();
      }
    }).catch( err => {
    })
  }
  _renderRow(rowData, sectionID, rowID){
    return <Row data={rowData} save={this._adjustSellStock} />
  }
  render(){
    return (
      <Page title='库存设置' pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        <View style={[s.row, s.header]}>
            <SText style={s.flex17} fontSize="mini" color="999">城市</SText>
            <SText style={s.flex33} fontSize="mini" color="999">截单时间</SText>
            <SText style={[s.flex33, {textAlign: 'right'}]} fontSize="mini" color="999">订单量</SText>
            <SText style={s.flex17} fontSize="mini" color="999">库存</SText>
        </View>
        <ListView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._getData.bind(this)}
              tintColor="#54bb40"
              title="加载中..."
              titleColor="#999"
              colors={['#2296f3']}
              progressBackgroundColor="#fff"
            />
          }
          initialListSize={7}
          enableEmptySections={true}
          dataSource={this._ds.cloneWithRows(this.state.dataSource)}
          renderRow={this._renderRow} 
          renderFooter={()=><KeyboardSpacer />}
        />
      </Page>
    )
  }
}

/**
 * 商品
 */
class Row extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      editBtn: true,
      data: props.data
    }
    this._submitObj = {
      totalStockNum: props.data.totalStockNum
    };
    //预警为true时的样式信息
    if(props.data.warnFlag){
      this.titleIcon = <Image source={ICON_WARN} style={s.iconWran} />
      this.bgStyle = {backgroundColor: '#FFFBEF'};
      this.fontColor = {color: '#FF5700'};
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data != this.props.data){
      this.setState({
        data: nextProps.data
      })
    }
  }

  /**
   * 切换编辑状态
   * @return {[type]} [description]
   */
  _toggleEdit(){
    this.setState({
      editBtn: !this.state.editBtn
    })
  }

  /**
   * 失去焦点 修改边框颜色
   * @param  {[type]} refName [description]
   * @param  {[type]} e       [description]
   * @return {[type]}         [description]
   */
  onBlur(refName, e){
    this[refName].setNativeProps({
      borderColor: '#E5E5E5'
    })
  }

  /**
   * 获得焦点 修改边框颜色
   * @param  {[type]} refName [description]
   * @param  {[type]} e       [description]
   * @return {[type]}         [description]
   */
  onFocus(refName, e){
    this[refName].setNativeProps({
      borderColor: '#2296F3'
    })
  }

  /**
   * 完成按钮
   * @return {[type]} [description]
   */
  _complete(){
    if(!this._submitObj['totalStockNum']){
      //总库存不能为空
      __STORE.dispatch(UtilsAction.toast('总库存不能为空', 1000));
      return;
    }
    let num = 0,
      param = {
        spuId: this.state.data.spuId,
        adjustSellStocks: [],
        totalPreStockNum: this._submitObj['totalStockNum'] * 1
      };
    for(let key in this._submitObj){
      if(key != 'totalStockNum'){
        param.adjustSellStocks.push({preStockNum: this._submitObj[key], itemId: key})
        num += this._submitObj[key];
      }
    }
    if(num > this._submitObj['totalStockNum']){
      //设置库存不能超过总库存
      __STORE.dispatch(UtilsAction.toast('设置库存不能超过总库存', 1000));
      return;
    }
    //当只显示有总库存显示时 实质上是只有一个城市
    if(param.adjustSellStocks.length == 0){
      param.adjustSellStocks.push({preStockNum: this._submitObj['totalStockNum'] * 1, itemId: this.state.data.sellStocks[0].itemId})
    }
    this.props.save(param);
    this._toggleEdit();
  }

  /**
   * 库存变化
   * @param  {[type]} value  [description]
   * @param  {[type]} itemId [description]
   * @return {[type]}        [description]
   */
  _onChange(value, itemId){
    if(!itemId) {
      //总库存
      this._submitObj['totalStockNum'] = value;
    }
    else {
      this._submitObj[itemId] = value;
    }
  }

  /**
   * 行标题渲染方法
   * @return {[type]} [description]
   */
  _renderHeader(){
    if(this.state.editBtn){
      return (
        <View style={[s.row, s.rowTitleWrap, this.bgStyle]}>
          <SText fontSize="body" color="333" style={[s.rowTitle, this.fontColor]} >
          {this.state.data.itemTitle + ' '}
          {this.titleIcon}
          </SText>
          <SText onPress={()=> this._toggleEdit()} fontSize="caption" color="blue">编辑</SText>
        </View>
      )
    }
    return (
      <View style={[s.row, s.rowTitleWrap, this.bgStyle]}>
        <SText fontSize="body" color="333" style={[s.rowTitle, this.fontColor]} >
        {this.state.data.itemTitle + ' '}
        {this.titleIcon}
        </SText>
        <View style={s.row}>
          <SText onPress={()=> this._toggleEdit()} fontSize="caption" color="999">取消</SText>
          <View style={s.border} />
          <SText onPress={()=> this._complete()} fontSize="caption" color="blue">完成</SText>
        </View>
      </View>
    )
  }

  /**
   * 各个城市的库存以及订单量 如果sellStocks 的长度为1 则只显示总库存
   * @return {[type]} [description]
   */
  _renderCityStock(){
    let sellStocks = this.state.data.sellStocks;
    if(sellStocks.length > 1){
      return sellStocks.map( (item, index) => {
        return (
          <View key={item.itemId} style={[s.row, s.rowItem, this.bgStyle]}>
            <View style={[s.row, {alignItems: 'center'}]}>
              <SText fontSize="caption" color="666">{item.cityDes}</SText>
              <SText style={s.marginL10} fontSize="caption" color="666">{item.cutoffTime}</SText>
            </View>
            <View style={[s.row, {alignItems: 'center'}]}>
              <SText fontSize="body" color="666">{item.orderNum}</SText>
              <View style={s.border} />
              {
                this.state.editBtn ? 
                <SText fontSize="body" style={{width: 70}} color="333">{item.stockNum}</SText> : 
                <TextInput 
                  ref={(view)=> this['inputRef' + index] = view}
                  onBlur={this.onBlur.bind(this, 'inputRef' + index)}
                  onFocus={this.onFocus.bind(this, 'inputRef' + index)} 
                  onChangeText={(text)=> this._onChange(text, item.itemId)}
                  style={s.stockInput} 
                  placeholder={'—'}
                  defaultValue={item.stockNum + ''} />
              }
            </View>
          </View>
        )
      })
    }
    return null;
  }

  render(){
    return (
      <View style={s.itemWrap}>
        {this._renderHeader()}
        <View style={[s.row, s.rowItem, this.bgStyle]}>
          <SText fontSize="caption" color="666">总库存</SText>
          <View style={[s.row, {alignItems: 'center'}]}>
            <SText fontSize="body" color="666">{this.state.data.totalOrderNum}</SText>
            <View style={s.border} />
            {
              this.state.editBtn ? 
              <SText fontSize="body" style={{width: 70}} color="333">{this.state.data.totalStockNum}</SText> 
              :
              <TextInput 
                ref={(view)=> this['inputRef'] = view} 
                onBlur={this.onBlur.bind(this, 'inputRef')}
                onFocus={this.onFocus.bind(this, 'inputRef')} 
                style={s.stockInput} 
                keyboardType={'numeric'}
                placeholder={'—'}
                onChangeText={(text)=> this._onChange(text)}
                defaultValue={this.state.data.totalStockNum + ''} />
            }
          </View>
        </View>
        {this._renderCityStock()}
      </View>
    )
  }
}

let setState = (state) => {
  return {
    userState: state.userState
  }
};

module.exports = connect(setState)(Index);
