'use strict'
/**
 * 点击货品管理的代办事项进入，品类调研的首页，选择用户
 */
import React from 'react';
import {
  ListView,
  View,
  ActionSheetIOS, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  InteractionManager
} from 'react-native';
import {SComponent, SText, SToast, SRefreshScroll, HtmlText} from 'sxc-rn';
import {str, obj} from 'tools';
import s from './item_select.style';
import {UtilsAction} from 'actions';
import {Page, Button, Collapsible} from 'components';
import ScreenModal from './screen_modal/screen_modal';
import EditSKUInfo1 from '../../editSKUInfo1';
//新建商品页面
import ItemAdd from '../item_add/item_add';
//供应商-供应信息
import AddSupplierSPUInfo from '../../../supplier/addSupplierSPUInfo';
import {
  ICON_DROPDOWN,
  ICON_DROPUP,
  ICON_SCREEN_W_EDIT,
  ICON_OK
} from 'config';

module.exports = class ItemSelect extends SComponent {

    constructor(props){
      super(props);
      this._ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.state = {
        pageLoading: true,
        title: '选择商品',
        filtrateDetailList: [],
        screenList: null,
        dataList: [],
        catId:'',
        spuIds:'',
        touchable: false,
        loading: false
      }
      this.filtrateDetailList = []
      // this.selectedData = this.getRouteData('items')? this.getRouteData('items') : {};
    }
    componentDidMount() {
      InteractionManager.runAfterInteractions(() => {
        this._getData();
      })
    }

    /**
     * 商品列表数据
     * @return {[type]} [description]
     */
    _getData = () =>{
      commonRequest({
        apiKey: 'querySelectSpuKey',
        objectName: 'wcSelectSpuQueryDO',
        params: {
          sourceType: this.props.route.from === 'SupplyInfo' ? 2 : 1,  //查询来源 1:发布商品 2:市调
          catId: this.props.route.data.catId
        }
      }).then( (res) => {
        let data = res.data;
        this.changeState({
          pageLoading: false,
          dataList: data.selectSpuVOList,
          filtrateDetailList: data.filtrateDetailList
        })
      }).catch(err => {})
    }

    /**
     * 单个商品数据
     * @return {[type]} [description]
     */
    _getItemData(spuId){
      return commonRequest({
        apiKey: 'querySaleItemDetailKey',
        withLoading: true,
        objectName: 'wcItemQueryDO',
        params: {
          spuId
        }
      })
    }

    //
    _renderSelect():Element{
      return(
        <TouchableOpacity
            onPress={this._showRightModal.bind(this)}
            style={s.contentRowRight}
        >
            <Image source={ICON_SCREEN_W_EDIT} style={s.icon}/>
            <SText fontSize='caption' color='white'> 筛选</SText>
        </TouchableOpacity>
      )
    }
    render(){
        return (
          <View style={{flex:1}}>
            <Page
                title={this.state.title}
                pageName='品类调研-筛选商品'
                trackViewName='品类调研-筛选商品'
                pageLoading={this.state.pageLoading}
                back={() => this.navigator().jumpBack()}
                rightContent={this._renderSelect()}
            >
            <TouchableOpacity style={s.addbtn} onPress={this._goAddItem}>
                <SText fontSize='body' color='blue'>+ 新建商品</SText>
            </TouchableOpacity>
              <ListView
                ref='ListView'
                initialListSize={15}
                pageSize={15}
                enableEmptySections={true}
                dataSource={this._ds.cloneWithRows(this.state.dataList || [])}
                renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, sectionID, rowID)}
              />
              <Button type='green' disable={!this.state.touchable} size='large' onPress={this._onSelectSubmit} >确定</Button>
            </Page>
              <ScreenModal
                ref='ScreenModal'
                dataList={this.state.filtrateDetailList}
                onChange={this._onChange.bind(this)}
                reset={this._onReset.bind(this)}
                showLoading={this._showLoading.bind(this)}
              />
          </View>
        )
    }

    _goAddItem = () => {
      //供应商-供应信息跳转至此页面 回调方法为刷新当前列表 从商品管理调至此页面则 回调方法刷新商品列表数据 
      this.navigator().push({
        name: 'ItemAdd',
        from: this.props.route.from,
        callback: this.props.route.from === 'SupplyInfo' ? this._getData : this.props.route.callback,
        component: ItemAdd,
        data: {
          catId: this.props.route.data.catId,
          title: this.props.route.data.catName,          
        }
      })
    }
    /**
     * 万只神兽奔腾而过
     * @method
     * @return {[type]} [description]
     * @author jimmy
     */
    _onSelectSubmit = () => {
      let selectedArray = [];
      this.state.dataList.map((value)=>{
        if(value.selected){
          selectedArray.push(value);
        }
      });
      if(selectedArray.length === 0){
        return __STORE.dispatch(UtilsAction.toast('请选择一件商品', 1000));
      }
      //如果是从巡场中添加商品而来
      if(this.props.route.from === 'EditSupplierGoods'){
          this.navigator().pop();
          this.props.route.callback && this.props.route.callback(selectedArray);
          return;
      }
      if(selectedArray.length > 1){
        return __STORE.dispatch(UtilsAction.toast('只能选择一件商品', 1000));
      }
      //如果是从供应商 供应信息页面跳入 则点击时调至填写供应信息详情页面
      if(this.props.route.from === 'SupplyInfo'){
        this.navigator().push({
          component: AddSupplierSPUInfo,
          name: 'AddSupplierSPUInfo',
          callback: this.props.route.callback,
          from: this.props.route.from,
          data: {
            spuName: selectedArray[0].spuName,
            supplierId: this.props.route.data.supplierId,
            spuId: selectedArray[0].spuId
          }
        })
      }
      else{
        this._getItemData(selectedArray[0].spuId).then(res=>{
          this.navigator().push({
            component: EditSKUInfo1,
            name: 'EditSKUInfo1',
            callback: this.props.route.callback,
            data: {
              ...res.data
            }
          })
        }).catch(err => {
          __STORE.dispatch(UtilsAction.toast('查询商品信息出错', 1000));
        })
      }
    }

    // pageSize={1}
    // initialListSize={1}
    _renderRow(rowData,sectionID,rowID){
      return(
        <Row
          key={rowData.spuId}
          rowData = {rowData}
          // dataList = {this.state.dataList}
          changeTouchable = {this.changeTouchable.bind(this)}
        ></Row>
      )
    }
    changeTouchable(bool: Boolean){
        if (bool) {
            this.changeState({
              touchable:bool
            });
        } else {
            let touchable = false;
            for (let v in this.state.dataList) {
                if (this.state.dataList.hasOwnProperty(v)) {
                    if (this.state.dataList[v].selected) {
                        touchable = true;
                        break;
                    }
                }
            }
            this.changeState({
                touchable: touchable
            })
        }

    }
    //展示筛选
    _showRightModal(){
      if(this.filtrateDetailList){
        this.getRef('ScreenModal')('show')();
      }
    }


    //取交集并进行判断
    _onChange(value,key){
      this.state.filtrateDetailList[key].selectedValue=value?value.concat():false;
      let returnSet = null;
      this.state.filtrateDetailList.map((value,key)=>{
        if(value.selectedValue){
          let spuIds = value.selectedValue;
          let tempSet = new Set(spuIds);
          returnSet?returnSet = returnSet.filter(x => tempSet.has(x)):
          returnSet = spuIds;
        }
      })
      if (!returnSet) {
          for(let listValue of this.state.dataList){
            listValue.show=true;
          }
        this.changeState({
            dataList: this.state.dataList,
            loading: false
        })
        return;
      }
      let mySet = new Set(returnSet);
        for(let listValue of this.state.dataList){
          if(mySet.has(listValue.spuId)){
              listValue.show = true;
            } else {
              listValue.show = false;
            }
        }
      this.changeState({
        dataList: this.state.dataList,
        loading: false
      })
    }

    _showLoading(){
        this.changeState({
            loading: true
        })
    }

    _onReset(){
        InteractionManager.runAfterInteractions(() => {
            this.filtrateDetailList.map((value,key)=>{
              value.selectedValue = false;
            })
        })

      this.state.dataList.map((value,key)=>{
        value.show=true;
      })
      this.changeState({
          dataList: this.state.dataList,
          loading: false
      })
    }

    _onModalHide(){
      this.getRef('ScreenModal')('hide')();
    }
    _onReturnBack(){
      this.props.getSelected()
    }

}

class Row extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      selected: this.props.rowData.selected ? this.props.rowData.selected : false,
      coll: false,
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.props.rowData.selected != nextProps.rowData.selected || this.state.selected != nextState.selected;
  // }

  componentWillReceiveProps(nextProps) {
    if (this.state.selected != nextProps.rowData.selected) {
      this.setState({
        selected: nextProps.rowData.selected
      })
    }
  }

  render(){
    let rowData=this.props.rowData;
    let unvisiableProp = [];
    let visibleProp = this._renderProperty(rowData.propertyList, unvisiableProp);
    if(rowData.show === false){
      return null
    }
    return(
      <View style={[s.row, this.state.selected? s.rowSelected : null]}>
          <HtmlText style={s.msg}>
            {rowData.msg}
          </HtmlText>
        <TouchableOpacity style={s.container} activeOpacity={1} onPress={()=>this._selectItem(rowData)}>
          <View style={s.partA}>
          {
            this.state.selected?
              <Image source={ICON_OK} style={s.selected}></Image>:
              <View style={s.empty}></View>
          }
          </View>
          <View style={s.partB}>
            <Image style={{height:50,width:50}} source={{uri:rowData.images[0].img}}></Image>
          </View>
          <View style={s.partC}>
              <SText fontSize='body' color='333'>{rowData.spuName}</SText>
              <View style={s.propertyList}>
                      {visibleProp}
                {
                    this.state.coll && !str.arrIsEmpty(unvisiableProp)?
                         unvisiableProp
                        :null
                }
              </View>

          </View>
        </TouchableOpacity>
        {
            str.arrIsEmpty(unvisiableProp)?
            null:
            <View style={{marginTop: 5}}>
                <TouchableOpacity
                    style={s.collBtn}
                    onPress={() => this.setState({
                        coll: !this.state.coll
                    })}>
                    <SText fontSize='caption' color='999'>{this.state.coll? '收起' : '展开'}</SText>
                    {
                        this.state.coll?
                        <Image source={ICON_DROPUP} style={s.collIcon}></Image>
                        :
                        <Image source={ICON_DROPDOWN} style={s.collIcon}></Image>
                    }
                    </TouchableOpacity>
            </View>
        }
      </View>
    )
  }


  _selectItem(rowData){
      if (rowData.selected) {
          this.setState({
              selected: false,
          });
      } else {
          this.setState({
              selected: true,
          });
      }
    rowData.selected=rowData.selected?false:true;
    if (rowData.selected) {
        this.props.changeTouchable(true);
    } else {
        this.props.changeTouchable(false);
    }

  }
   //渲染属性
  _renderProperty(list: Array, unvisiableProp: Array){
      let dom = [];
      list.map((value,key)=>{
          if (key <= 4) {
              dom.push(
                <View key={key} style={s.property}>
                  <SText fontSize='mini' color='ccc'>{value.propertyName} </SText>
                  <SText fontSize='mini' color='orange'>{value.propertyValue}</SText>
                </View>
              )
          } else {
              unvisiableProp.push(
                  <View key={key} style={s.property}>
                    <SText fontSize='mini' color='ccc'>{value.propertyName} </SText>
                    <SText fontSize='mini' color='orange'>{value.propertyValue}</SText>
                </View>);
          }
      })
      return dom;
  }
}
