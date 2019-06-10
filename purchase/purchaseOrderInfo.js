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
import {Page, Button, CommonSelect, Row, Upload} from 'components';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { UtilsAction} from 'actions';
import {
  ARROW_DOWN_S,
  UPLOAD_PIC5,
  UPLOAD_PIC6,
  ICON_ADD
} from 'config';

let uploadUrl = 'http://218.244.135.116:8080/frmLossH5/imageUpload.do';;

if(__DEV__){
  uploadUrl = 'http://218.244.135.116:8080/frmLossH5/imageUpload.do';
}else{
  uploadUrl = 'http://erp.songxiaocai.com/frmLossH5/imageUpload.do';
}

let s = SStyle({
  title: {
    height: 40,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  item: {
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    justifyContent: 'space-between'
  },
  arrow_down_s: {
    marginLeft: 5,
    height: 8,
    width: 13
  },
  card: {
    marginBottom: 10
  },
  border: {
    height: 30,
    width: 1,
    backgroundColor: 'e5'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  row_item: {
    backgroundColor: 'fff',
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 45
  },
  add_purchase_order: {
    marginLeft: 15,
    flexDirection: 'row',
    height: 45,
    alignItems: 'center'
  },
  add_img: {
    width: 20,
    height: 20
  },
  left_wrap: {
    flex: 1, 
    textAlign: 'center'
  },
  right_wrap: {
    width: 80, 
    textAlign: 'right'
  },
  add_pic: {
    width: 100,
    height: 100,
    marginLeft: 15
  }
});

/**
 * 目前已废弃
 * 创建采购单
 * @type {[type]}
 */
module.exports = class PurchaseOrderInfo extends SComponent{
  constructor(props){
    super(props);
    this.state = {
      spuName: props.route.spuName,
      productWeight: props.route.productWeight,
      currentDataSource: [],
      currentSelected: [],
      num: 0,
      weight: 0,
      unitFee: 0, //货品单价
      skuTotalFee: 0, //sku总价 不带手续费
      totalFee: 0, //总费用
      factorage: 0, //手续费
      weightUnitsSelected: [{
        id: 1,
        name: '斤'
      }],
      priceUnitesSelected: [{
        id: 15,
        name: '元/斤'
      }],
      weightUnitsList: [{
        id: 1,
        name: '斤'
      },{
        id: 2,
        name: '公斤'
      },{
        id: 3,
        name: '吨'
      }],
      priceUnitesList: [{
        id: 15,
        name: '元/斤'
      },{
        id: 16,
        name: '元/百斤'
      },{
        id: 4,
        name: '元/百公斤'
      },{
        id: 17,
        name: '元/件'
      }]
    }
   // categoryId  type unit feeList 都为前端写死参数 
    this._submitObj = {
      ...props.route.submitObj,
      categoryId: 0,
      type: 1,
      unit: 0,
      feeList: [{
        feeRecordId: 0,
        feeType: 15,
        num: 1,
        totalFee: '',  //  手续费
        unitFee: ''  //   手续费
      }]
    }

    this._id = 2;
    this.billImg = (
      <Upload
        {...props}
        picStyle={s.add_pic}
        showMsg={this._showMsg.bind(this)}
        changeData={this._photoChange.bind(this, 'billImg')}
        style={s.upload}
        key={'0'}
        tag={'0'}
        defaultPic={UPLOAD_PIC5}
        delete={this._photoDelete.bind(this, 'billImg')}
        uploadUrl={uploadUrl}
      />
    );

    this.sampleImg = (
      <Upload
        {...props}
        picStyle={s.add_pic}
        showMsg={this._showMsg.bind(this)}
        changeData={this._photoChange.bind(this, 'sampleImg')}
        style={s.upload}
        key={'1'}
        tag={'1'}
        defaultPic={UPLOAD_PIC6}
        delete={this._photoDelete.bind(this, 'sampleImg')}
        uploadUrl={uploadUrl}
      />
    );

    this._commonSelectCallback = this._commonSelectCallback.bind(this);
  }

  /**
   * 上传图片后 提示回调方法
   * @param  {[type]} msg: String        [description]
   * @return {[type]}      [description]
   */
  _showMsg(msg: String){
    __STORE.dispatch(UtilsAction.toast(msg, 1000));
  }

  _photoChange(name,photoUrl){
    this._submitObj[name] = photoUrl;
  }

  /**
   * 图片删除后的回调
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  _photoDelete(name){
    this._id++;
    this[name] = (
      <Upload
        {...this.props}
        picStyle={s.add_pic}
        showMsg={this._showMsg.bind(this)}
        changeData={this._photoChange.bind(this, name)}
        style={s.upload}
        key={this._id + ''}
        tag={this._id + ''}
        defaultPic={name == 'billImg' ? UPLOAD_PIC5 : UPLOAD_PIC6}
        delete={this._photoDelete.bind(this, name)}
        uploadUrl={uploadUrl}
      />
    );
    this.forceUpdate();
  }

  /**
   * 显示modal框
   * @return {[type]} [description]
   */
  _showCommonSelect(type, keyName){
    let currentObj = {
      keyName: keyName,
      currentName: type,
      currentSelected: this.state[type + 'Selected'] || [],
      currentDataSource: this.state[type + 'List'] || []
    }
    this.changeState(currentObj, ()=>{
      this._commonSelect._toggle()
    })
  }

  /**
   * modal框回调方法
   * @return {[type]} [description]
   */
  _commonSelectCallback(data, name){
    this.changeState({
      [name + 'Selected']: data
    })
  }

  /**
   * 计算货品总价以及总金额
   * @return {[type]} [description]
   */
  _calculateFeeOrWeight(type){
    let oldState = this.state, weight;
    //根据采购重量单位将重量换算为斤
    switch(oldState.weightUnitsSelected[0].id) {
      //斤
      case 1:
        weight = oldState.weight;
        break;
      //公斤
      case 2:
        weight = oldState.weight * 2;
        break;
      //吨
      case 3:
        weight = oldState.weight * 2000;
        break;
      default:
        break;
    }
    //计算货品总费用 
    if(type == 'fee'){
      switch(oldState.priceUnitesSelected[0].id) {
        //元/斤
        case 15:
          oldState.skuTotalFee = weight * oldState.unitFee;
          break;
        //元/百斤
        case 16:
          oldState.skuTotalFee = weight * oldState.unitFee / 100;
          break;
        //元/百公斤
        case 4:
          oldState.skuTotalFee = weight * oldState.unitFee / 200;
          break;
        //元/件
        case 17:
          oldState.skuTotalFee = oldState.num * oldState.unitFee;
          break;
        default:
          break;
      }
    }
    //计算单价
    else {
      switch(oldState.priceUnitesSelected[0].id) {
        //元/斤
        case 15:
          oldState.unitFee = (oldState.skuTotalFee / weight).toFixed(2);
          break;
        //元/百斤
        case 16:
          oldState.unitFee = (oldState.skuTotalFee / weight * 100).toFixed(2);
          break;
        //元/百公斤
        case 4:
          oldState.unitFee = (oldState.skuTotalFee / weight * 200).toFixed(2);
          break;
        //元/件
        case 17:
          oldState.unitFee = (oldState.skuTotalFee / oldState.num).toFixed(2);
          break;
        default:
          break;
      }
    }
    oldState.totalFee = oldState.skuTotalFee * 1 + oldState.factorage * 1;
  }

  /**
   * 输入框内容变化回调方法
   * @param  {[type]} value [description]
   * @param  {[type]} name  [description]
   * @return {[type]}       [description]
   */
  _onChangeText(value, name){
    let oldState = this.state;
    switch(name){
      //数量变化时 重量需要变化 重量变化时 如果有单价 价格应该变化
      case 'num':
        oldState.num = value;
        oldState.weight = value * this.state.productWeight;
        this._calculateFeeOrWeight('fee');
        break;
      //货品单价
      case 'unitFee':
        oldState.unitFee = value;
        this._calculateFeeOrWeight('fee');
        break;
      //重量
      case 'weight':
        oldState.weight = value;
        this._calculateFeeOrWeight('fee');
        break;
      //总价格
      case 'skuTotalFee':
        oldState.skuTotalFee = value;
        this._calculateFeeOrWeight('weight');
        break;
      //手续费
      case 'factorage':
        oldState.factorage = value;
        this._submitObj.feeList[0].totalFee = value * 100;
        this._submitObj.feeList[0].unitFee = value * 100;
        oldState.totalFee = oldState.skuTotalFee * 1 + value * 1;
        break;
      default:
        break;
    }
    this.changeState(oldState);
  }

  /**
   * 提交数据
   * @return {[type]} [description]
   */
  _submit(){
    this._submitObj['weightUnit'] = this.state.weightUnitsSelected[0].id;
    this._submitObj['weight'] = this.state.weight;
    this._submitObj['unitFee'] = this.state.unitFee * 100;
    this._submitObj['feeUnit'] = this.state.priceUnitesSelected[0].id;
    this._submitObj['totalFee'] = this.state.totalFee * 100;
    this._submitObj['skuTotalFee'] = this.state.skuTotalFee * 100;
    this._submitObj['num'] = Number(this.state.num);
    commonRequest({
      apiKey: 'createPurchaseOrderKey', 
      objectName: 'purchaseOrderQueryDO',
      withLoading: true,
      params: this._submitObj
    }).then( (res) => {
      if(res.data){
        //调回至列表页
        let route = this.navigator().getRoute('name', 'TodayReport');
        this.navigator().popToRoute(route);
        this.props.route.callback();
      }
      else{
        __STORE.dispatch(UtilsAction.toast(res.errorMessage, 1000));
      }
    }).catch( err => {})
  }

  render(){
    return (
      <Page title='创建采购单' pageLoading={false} back={()=>this.navigator().pop()}>
        <ScrollView>
        <View style={s.title}>
          <SText fontSize="body" color="greenFont">{this.state.spuName}</SText>
        </View>
        <View style={s.card}>
          <View style={s.row_item}>
            <SText fontSize="body" color="666">采购数量</SText>
            <TextInput 
              keyboardType="numeric"
              value={this.state.num + ''}
              onChangeText={ text => this._onChangeText(text, 'num')}
              style={s.left_wrap} 
            />
            <SText style={s.right_wrap} fontSize="body" color="666">件</SText>
          </View>
          <View style={s.row_item}>
            <SText fontSize="body" color="666">采购重量</SText>
            <TextInput 
              keyboardType="numeric"
              value={this.state.weight + ''}
              onChangeText={ text => this._onChangeText(text, 'weight')}
              style={s.left_wrap} 
            />
            <View style={s.border} />
            <TouchableOpacity 
              onPress={()=>this._showCommonSelect('weightUnits', 'name')}
              style={s.row}
            >
              <SText style={s.right_wrap} fontSize="body" color="666">{this.state.weightUnitsSelected[0].name}</SText>
              <Image style={s.arrow_down_s} source={ARROW_DOWN_S} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.card}>
          <View style={s.row_item}>
            <SText fontSize="body" color="666">货品单价</SText>
            <TextInput 
              keyboardType="numeric"
              value={this.state.unitFee + ''}
              onChangeText={ text => this._onChangeText(text, 'unitFee')}
              style={s.left_wrap} 
            />
            <View style={s.border} />
            <TouchableOpacity 
              onPress={()=>this._showCommonSelect('priceUnites', 'name')}
              style={s.row}
            >
              <SText style={s.right_wrap} fontSize="body" color="666">{this.state.priceUnitesSelected[0].name}</SText>
              <Image style={s.arrow_down_s} source={ARROW_DOWN_S} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={s.card}>
          <View style={s.row_item}>
            <SText fontSize="body" color="666">货品总价</SText>
            <TextInput 
              keyboardType="numeric"
              onChangeText={ text => this._onChangeText(text, 'skuTotalFee')}
              value={this.state.skuTotalFee + ''}
              style={s.left_wrap} 
            />
            <SText style={s.right_wrap} fontSize="body" color="666">元</SText>
          </View>
        </View>
        <View style={s.card}>
          <View style={s.row_item}>
            <SText fontSize="body" color="666">手续费</SText>
            <TextInput 
              keyboardType="numeric"
              onChangeText={ text => this._onChangeText(text, 'factorage')}
              value={this.state.factorage + ''}
              style={s.left_wrap} 
            />
            <SText style={s.right_wrap} fontSize="body" color="666">元</SText>
          </View>
        </View>
        <View style={s.card}>
          <View style={s.row_item}>
            <SText fontSize="body" color="666">总金额</SText>
            <SText style={s.left_wrap} fontSize="body" color="666">{this.state.totalFee}</SText>
            <SText style={s.right_wrap} fontSize="body" color="666">元</SText>
          </View>
        </View>
        <View style={s.card}>
          <SText style={{marginLeft: 15}} fontSize="body" color="666">上传图片</SText>
          <Row style={{marginTop: 5}}>
            {this.billImg}
            {this.sampleImg}
          </Row>
        </View>
        </ScrollView>
        <KeyboardSpacer />
        <Button onPress={()=>this._submit()} type='green' size='large'>确定</Button>
        <CommonSelect 
          keyName={this.state.keyName}
          ref={ view => this._commonSelect = view}
          selectCallback={this._commonSelectCallback}
          dataSource={this.state.currentDataSource}
          name={this.state.currentName}
          selected={this.state.currentSelected}
          multiple={false}
        />
      </Page>
    )
  }
}
