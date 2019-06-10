'use strict';
import React from 'react';
import {
  View,
  Image,
  TextInput,
  PanResponder,
  ListView,
  ScrollView,
  LayoutAnimation,
  InteractionManager,
  TouchableOpacity
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Button, Row} from 'components';
import {UtilsAction} from 'actions';
import {str} from 'tools';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {
  ICON_ADD_BLUE,
} from 'config';
//填写送货信息页面
import AddDeliveryInfo from './addDeliveryInfo';

let s = SStyle({
  select_purchase: {
    height: 40,
    backgroundColor: 'fa',
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon_add:{
    marginLeft: 8,
    width: 13,
    height: 14
  },
  flex1: {
    flex: 1
  },
  marginT8: {
    marginTop: 8
  },
  item: {
    marginTop: 10,
    backgroundColor: '#fff'
  },
  header_wrap: {
    paddingTop: 15,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 15
  },
  border_bottom: {
    borderBottomWidth: 1,
    borderColor: 'f0'
  },
  sku_wrap: {
    paddingLeft: 12,
    paddingRight: 12
  },
  sku_info: {
    width: '@window.width - 24',
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 7,
    alignItems: 'center'
  },
  input: {
    textAlign: 'right',
    padding: 0,
    marginRight: 10,
    paddingRight: 10,
    width: 80,
    height: 30,
    borderColor: 'e5',
    borderWidth: 'slimLine',
  },
  del_btn: {
    marginLeft: 12,
    width: 50,
    height: 44,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0
  },
  submit_btn: {
    width: 110,
    height: 50,
  },
  bottom_wrap: {
    flex: 1,
    backgroundColor: 'fff',
    justifyContent: 'center',
    paddingLeft: 15
  },
  lineH20:{
    lineHeight: 20
  }
});
/**
 * 创建物流单-输入sku实发数量
 * @type {[type]}
 */
module.exports = class AddSKUInfo extends SComponent{
  constructor(props){
    super(props);
    this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    //计算待发总件数
    let totalWaitNum = 0;
    if(!props.route.data.edit){
      try{
        props.route.data.purchaseOrders.map(item =>{
          item.deliverySKUInfos.map(sku =>{
            if(sku.checked){
              totalWaitNum += sku.deliveryNum;
            }
          })
        })
      }
      catch(err){
        console.log(err);
      }
    }
    this.state = {
      purchaseOrders: [],
      pageLoading: props.route.data.edit ? true : false,
      scrollEnabled: true,
      totalWaitNum:   totalWaitNum,
      totalActualNum: totalWaitNum,
      ...props.route.data,
    };
  }

  componentDidMount() {
    if(this.props.route.data.edit){
      InteractionManager.runAfterInteractions( () => {
        this._getData();
      })
    }
  }

  _getData(){
    commonRequest({
      apiKey: 'queryDeliveryOrderUpdateInfoKey', 
      objectName: 'deliveryOrderQueryDO',
      params: {
        parentDeliveryOrderId: this.props.route.data.id
      }
    }).then( (res) => {
      let data = res.data;
      //计算待发/实发数量
      let totalWaitNum = 0;
      data.purchaseOrders.map(item =>{
        item.deliverySKUInfos.map(sku =>{
          //给每个sku打上选中标签
          sku.checked = true;
          totalWaitNum += sku.deliveryNum;
        })
      })
      this.changeState({
        pageLoading: false,
        currentDeliveryTime: data.currentDeliveryTime,
        currentExportTime:   data.currentExportTime,
        drivers:             data.drivers,
        feeUnitsSelector:    data.feeUnitsSelector,
        driverName:          data.currentDriver.driverName,
        driverPhone:         data.currentDriver.driverPhone,
        driverCarId:         data.currentDriver.driverCarId,
        feePrice:            data.currentFeePrice,
        feeUnit:             data.currentFeeUnit,
        totalWaitNum:   totalWaitNum,
        totalActualNum: totalWaitNum,
        purchaseOrders: data.purchaseOrders
      });
    }).catch( err => {
      this.changeState({
        refreshing: false
      })
    })
  }

  _onStart = (purchaseOrderId, callback) =>{
    if (this.state.purchaseOrderId && this.state.purchaseOrderId != purchaseOrderId) {
      this.closeRow(this.state.purchaseOrderId);
      this.changeState({hasOpenRow: true, purchaseOrderId: purchaseOrderId});
      callback(true);
    } else {
      callback(true);
    }
  }

  _onMove = (id) =>{
    if (this.state.scrollEnabled) {
      this.changeState({
        scrollEnabled: false,
        purchaseOrderId: id,
      });
    }
  }

  _onMoveEnd = (justTouch, isOpen) =>{
    if (justTouch && !this.state.hasOpenRow) {
      return
      // this.props.onTouch(id, rowData);
    }

    if (!this.state.scrollEnabled && !isOpen) {
      this.changeState({scrollEnabled: true});
    }
    if (!isOpen) {
      this.changeState({hasOpenRow: false, purchaseOrderId: null});
    }
  }

  /**
   * 列表滚动时 关闭已展开列
   * @return {[type]} [description]
   */
  onScrolls = () =>{
    if (this.state.purchaseOrderId) {
      this.closeRow(this.state.purchaseOrderId);
      this.changeState({
        purchaseOrderId: null,
        scrollEnabled: true
      });
    }
  }

  /**
   * 关闭已经展开的列
   * @param  {[type]} purchaseOrderId [description]
   * @return {[type]}                 [description]
   */
  closeRow = (purchaseOrderId) =>{
    let openedRow = this[`listRow_${this.state.purchaseOrderId}`];
    openedRow && openedRow.closeRow();
    this.changeState({scrollEnabled: true, rowId: null});
  }

  /**
   * 删除SKU
   * index 不传入 代表删除当前供应商下所有商品
   * @param  {[type]} rowID [description]
   * @param  {[type]}       [description]
   * @return {[type]}       [description]
   */
  _deleteSKU = (rowID, index)=>{
    try{
      let purchaseOrders = this.state.purchaseOrders;
      if(index === undefined){
        purchaseOrders[rowID].selectedNum = 0;
        purchaseOrders[rowID].deliverySKUInfos.map(item => {
          item.checked = false
        });
      }
      else{
        let deliverySKUInfos = this.state.purchaseOrders[rowID].deliverySKUInfos;
        purchaseOrders[rowID].deliverySKUInfos[index].checked = false;
        purchaseOrders[rowID].selectedNum--;
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.changeState({
        purchaseOrders
      })
    }
    catch(err){
      console.log(err);
    }
  }

  /**
   * 添加采购单回调
   */
  _addPurchaseOrderCallback = (purchaseOrders) =>{
    let totalWaitNum = 0,
      totalActualNum = 0;
    try{
      purchaseOrders.map(item =>{
        if(item.selectedNum > 0){
          item.deliverySKUInfos.map(sku =>{
            if(sku.checked){
              totalWaitNum += sku.deliveryNum;
              if(sku.actualNum === undefined){
                totalActualNum += sku.deliveryNum;
              }
              else{
                totalActualNum += Number(sku.actualNum);
              }
            }
          })
        }
      })
    }
    catch(err){
      console.log(err);
    }
    this.changeState({
      purchaseOrders,
      totalActualNum,
      totalWaitNum
    })
  }
  /**
   * 修改采购订单
   */
  _addPurchaseOrder = () =>{
    this.navigator().push({
      data: {
        purchaseOrders: this.state.purchaseOrders,
      },
      from: 'AddSKUInfo',
      callback: this._addPurchaseOrderCallback,
      ...routeMap['ChoosePurchaseOrder'],
    })
  }

  _onChangeText(index, text){
    let oldState = this.state;
    oldState.deliverySkuList[index].num = text;
    oldState.skuNameList[index].num = text;
    this.changeState(oldState);
  }

  /**
   * 计算待发件数和实发件数
   * @return {[type]} [description]
   */
  _countNums = () =>{
    let purchaseOrders = this.state.purchaseOrders,
      totalWaitNum = 0,
      totalActualNum = 0;
    purchaseOrders.map(item =>{
      //编辑状态或者selectedNum 数量大于0 则计算sku数量
      if(item.selectedNum > 0 || this.props.route.data.edit){
        item.deliverySKUInfos.map(sku =>{
          if(sku.checked){
            totalWaitNum += sku.deliveryNum;
            if(sku.actualNum === undefined){
              totalActualNum += sku.deliveryNum;
            }
            else{
              totalActualNum += Number(sku.actualNum);
            }
          }
        })
      }
    })
    this.changeState({
      totalActualNum,
      totalWaitNum
    })
  }

  /**
   * 下一步按钮 跳转至填写本次送货信息页面
   * 筛选出已选择商品列表
   * @return {[type]} [description]
   */
  _nextStep = ()=>{
    let purchaseOrders = this.state.purchaseOrders,
      storehouseName,
      orderSkus = [];
    purchaseOrders.map(item =>{
      item.deliverySKUInfos.map(sku =>{
        if(sku.checked){
          storehouseName = item.storehouseName;
          //编辑时数据结构与新建不一致 特殊处理
          if(this.props.route.data.edit){
            orderSkus.push({
              deliveryNum: sku.actualNum !== undefined ? sku.actualNum : sku.deliveryNum,  //发货数量
              subDeliveryOrderId: sku.deliveryOrderSubId,   //物流子单id
            })
          }
          else{
            orderSkus.push({
              deliveryNum: sku.actualNum !== undefined ? sku.actualNum : sku.deliveryNum,  //发货数量
              parentPurchaseOrderId: item.parentPurchaseOrderId,   //采购订单主单id
              purchaseOrderId: sku.purchaseOrderId    //采购单子单ID
            })
          }
        }
      })
    })
    if(orderSkus.length === 0){
      return __STORE.dispatch(UtilsAction.toast('请选择采购单！', 1000));
    }
    this.navigator().push({
      data:{
        edit: this.props.route.data.edit,
        deliveryOrderParentId: this.props.route.data.id,
        orderSkus,
        storehouseName,
        driverName:          this.state.driverName,
        driverPhone:         this.state.driverPhone,
        driverCarId:         this.state.driverCarId,
        feePrice:            this.state.feePrice ? str.toYuan(this.state.feePrice) : '',
        feeUnit:             this.state.feeUnit,
        currentDeliveryTime: this.state.currentDeliveryTime,
        currentExportTime:   this.state.currentExportTime,
        drivers:             this.state.drivers,
        feeUnitsSelector:    this.state.feeUnitsSelector,
        totalActualNum:      this.state.totalActualNum,
        totalWaitNum:        this.state.totalWaitNum
      },
      callback: this.props.route.callback,
      name: 'AddDeliveryInfo',
      component: AddDeliveryInfo
    })
  }

  /**
   * list 列渲染方法
   * @param  {[type]} rowData   [description]
   * @param  {[type]} sectionID [description]
   * @param  {[type]} rowID     [description]
   * @return {[type]}           [description]
   */
  _renderRow = (rowData, sectionID, rowID) =>{
    //this.props.route.data.edit 表示编辑状态
    if(rowData.selectedNum > 0 || this.props.route.data.edit){
      return (
        <View style={s.item}>
          <View style={[s.header_wrap, s.border_bottom]}>
            <Row>
              <SText style={s.flex1} fontSize="title" color="333">
                {rowData.purchaserName}
                <SText fontSize="title" color="999">  供应</SText>
              </SText>
              {
                this.props.route.data.edit ? null :
                  <TouchableOpacity onPress={()=>this._deleteSKU(rowID)}>
                    <SText fontSize="title" color="red">删除</SText>
                  </TouchableOpacity>
              }
            </Row>
            <Row style={s.marginT8}>
              <SText fontSize="caption" color="333">
                {rowData.exportTime}
                <SText fontSize="caption" color="999">  送达</SText>
                <SText fontSize="caption" color="333">  {rowData.storehouseName}</SText>
              </SText>
            </Row>
          </View>
          <View style={s.sku_wrap}>
            {
              rowData.deliverySKUInfos.map((item, index) =>{
                if(item.checked){
                  return <ListRow 
                    key={index} 
                    edit={this.props.route.data.edit}
                    index={index}
                    ref={v => this[`listRow_${item.purchaseOrderId}`] = v}
                    countNums={this._countNums}
                    onStart={this._onStart} 
                    onMove={this._onMove}
                    onMoveEnd={this._onMoveEnd}
                    delete={this._deleteSKU} 
                    rowID={rowID}
                    data={item} 
                  />
                }
                return null;
              })
            }
          </View>
        </View>
      )
    }
    return null
  }

  /**
   * 添加采购单按钮
   * @return {[type]} [description]
   */
  _renderAddPurchaseOrder(){
    if(!this.props.route.data.edit){
      return (
        <Row 
          onPress={this._addPurchaseOrder}
          style={s.select_purchase}
        >
          <SText fontSize="caption" color="blue">选择采购单</SText>
          <Image source={ICON_ADD_BLUE} style={s.icon_add}/>
        </Row>
      )
    }
    return null
  }

  render(){
    return (
      <Page
          pageName='创建物流单-添加sku信息'
          title='创建物流单' pageLoading={this.state.pageLoading} back={()=>this.navigator().pop()}>
        {this._renderAddPurchaseOrder()}
        <ListView
          enableEmptySections
          style={s.flex1}
          onScroll={this.onScrolls}
          removeClippedSubviews={false}
          scrollEnabled={this.state.scrollEnabled}
          // initialListSize={10}
          dataSource={this._ds.cloneWithRows(this.state.purchaseOrders)}
          renderRow={this._renderRow} 
        />
        <KeyboardSpacer />
        <Row style={{height: 50}}>
          <View style={s.bottom_wrap}>
            <SText style={s.lineH20} fontSize="caption" color="666">
              待发件数：
              <SText fontSize="caption" color="blue">{this.state.totalWaitNum}</SText>
            </SText>
            <SText style={s.lineH20} fontSize="caption" color="666">
              实发件数：
              <SText fontSize="caption" color="orange">{this.state.totalActualNum}</SText>
            </SText>
          </View>
          <Button onPress={this._nextStep} style={s.submit_btn} type="green" size="large">
            下一步
          </Button>
        </Row>
      </Page>
    )
  }
}

class ListRow extends React.Component {
  constructor(props){
    super(props);
    //滑出的宽度
    this._buttonWidth = 62;
    this.state = {
      data: props.data,
      left: 0,
      stop: 0,
      canMove: true
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(JSON.stringify(nextProps) != JSON.stringify(this.props) || JSON.stringify(nextState) != JSON.stringify(this.state)){
      return true;
    }
    return false;
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderStart: (event, gestureState) => this.onPanStart(event, gestureState),
      onPanResponderMove: (event, gestureState) => this.onPanMove(event, gestureState),
      onPanResponderEnd: (event, gestureState) => this.onPanEnd(event, gestureState),
    });
  }

  closeRow() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({left: 0, stop: 0});
  }

  onPanStart = (event, gestureState) => {
    this.props.onStart( this.props.data.purchaseOrderId, state => this.setState({canMove: state}));
  }

  onPanMove = (event, gestureState) => {
    if (!this.state.canMove) {
      return;
    }
    if (Math.abs(gestureState.dx) < 2 && Math.abs(gestureState.dy) < 2) {
      return;
    }
    if (Math.abs(gestureState.dx)>=Math.abs(gestureState.dy)) {
      // var {id} = this.props;
      this.props.onMove(this.props.data.purchaseOrderId);
    }
    var dis = this.state.stop + gestureState.dx;
    if (dis > 10) {
      //max left
      this.setState({left: 10});
    } else if (dis < -this._buttonWidth - 10) {
      //max right
      this.setState({left: -this._buttonWidth - 10});
    } else {
      //normal
      this.setState({left: dis});
    }
  }

  onPanEnd = (event, gestureState) => {
    var justTouch = false;
    var isOpen = false;
    if (this.state.left == 0 && Math.abs(gestureState.dx) <= 2) {
      justTouch = true;
    }
    //Animated
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

    if (this.state.left > -this._buttonWidth / 2 || Math.abs(gestureState.dx) <= 2) {
      this.setState({stop: 0, left: 0});
    } else {
      isOpen = true;
      this.setState({stop: -this._buttonWidth, left: -this._buttonWidth});
    }
    this.props.onMoveEnd(justTouch, isOpen);
  }

  /**
   * 输入框内容变化回调
   * @param  {[type]} text [description]
   * @return {[type]}      [description]
   */
  _onChangeText = (text) =>{
    let data = this.state.data;
    if(Number(text) > data.deliveryNum){
      text = data.deliveryNum + '';
      __STORE.dispatch(UtilsAction.toast('实发件数不能大于待发件数', 1000));
    }
    data.actualNum = text;
    this.forceUpdate();
    this.props.countNums();
  }

  render(){
    let data = this.state.data;
    if(this.props.edit){
      return (
        <View>
          <View style={[s.sku_info, s.border_bottom, {left: this.state.left}]}>
            <View style={s.flex1} >
              <SText fontSize="mini" color="333">{data.skuId}</SText>
              <SText fontSize="caption" color="999">{data.skuName}</SText>
            </View>
            <Row style={{alignItems: 'center'}}>
              <TextInput 
                underlineColorAndroid={'transparent'}
                keyboardType="numeric"
                value={data.actualNum}
                onChangeText={this._onChangeText}
                defaultValue={data.deliveryNum + ''}
                style={s.input} 
              />
              <SText fontSize="caption" color="999">件</SText>
            </Row>
          </View>
        </View>
      )
    }
    return (
      <View>
        <TouchableOpacity
          onPress={()=>{
            this.props.delete(this.props.rowID, this.props.index);
          }}
          style={s.del_btn}
        >
          <SText fontSize="body" color="white">删除</SText>
        </TouchableOpacity>
        <View style={[s.sku_info, s.border_bottom, {left: this.state.left}]}>
          <View style={s.flex1} {...this._panResponder.panHandlers}>
            <SText fontSize="mini" color="333">{data.skuId}</SText>
            <SText fontSize="caption" color="999">{data.skuName}</SText>
          </View>
          <Row style={{alignItems: 'center'}}>
            <TextInput 
              underlineColorAndroid={'transparent'}
              keyboardType="numeric"
              value={data.actualNum}
              onChangeText={this._onChangeText}
              defaultValue={data.deliveryNum + ''}
              style={s.input} 
            />
            <SText fontSize="caption" color="999">件</SText>
          </Row>
        </View>
      </View>
    )
  }
}

