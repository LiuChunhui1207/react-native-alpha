import React from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
  ScrollView,
  Image
} from 'react-native'
import { SStyle, SComponent, SText } from 'sxc-rn'
import { Page, Row } from 'components'
import { UtilsAction } from 'actions'
// market列表
import QuotationList from './quotationList'

import { Icon_Arrow_Down_White, Icon_Arrow_Up_White } from 'config'

const s = SStyle({
  dialog: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  dialog_item: {
    justifyContent: 'center',
    backgroundColor: 'fff',
    flex: 1,
    width: '@window.width',
    height: 45,
    borderBottomWidth: 1,
    borderColor: '#E7E7E8',
    paddingLeft: 15
  },
  arrow: {
    width: 8,
    height: 5,
    marginLeft: 3
  }
})

module.exports = class Index extends SComponent{
  constructor (props) {
    super(props)
    this.state = {
      selectedCat: {
        catId: -1,
        catName: '全部'
      },
      showCatDialog: false,
      catList: []
    }
  }
  componentDidMount () {
    InteractionManager.runAfterInteractions(() => {
      this._getCatList()
      this.refs.quotationList._getData(this.state.selectedCat ? this.state.selectedCat.catId : '')
    })
  }

  _getCatList = () => {
    commonRequest({
      apiKey: 'queryQuotationCatListKey',
      objectName: 'userQueryDO',
      params: {}
    }).then(res => {
      let { chargeCats } = res.data
      let { selectedCat } = this.state
      if (chargeCats) {
        chargeCats = chargeCats.reduce((t, e) => {
          t.push({
            catId: e.key,
            catName: e.value,
            checked: e.key == selectedCat.catId ? true : false
          })
          return t
        }, [{ catId: -1, catName: '全部', checked: true }])
        this.changeState({
          catList: chargeCats
        })
      }
    }).catch(err => {})
  }

  // 渲染页面头部右侧 筛选框
  _renderHeaderRight = () => {
    return (
      <Row style={{alignItems: 'center'}}>
        <SText fontSize='caption' color='white'>{this.state.selectedCat.catName}</SText>
        {
          this.state.showCatDialog
          ? <Image source={Icon_Arrow_Up_White} style={s.arrow}/>
          : <Image source={Icon_Arrow_Down_White} style={s.arrow}/>
        }
      </Row>
    )
  }

  // 渲染品类列表
  _renderCatDialog = () => {
    if (!this.state.showCatDialog || this.state.catList.length === 0) return null
    let dialogHeight = this.state.catList.length >= 5 ? 250 : this.state.catList.length * 45
    return (
      <TouchableOpacity
        style={s.dialog}
        onPress={() => {
          this.changeState({
            showCatDialog: !this.state.showCatDialog,
          })
        }}
      >
        <View style={{backgroundColor:'#fff', height: dialogHeight}}>
          <ScrollView>
            {
              this.state.catList.map(item => {
                return (
                  <TouchableOpacity
                    onPress={()=>{
                      //如果点了当前已选中的品类 则不请求数据
                      if (item.checked) {
                        this.changeState({
                          showCatDialog: false,
                          selectedCat: item
                        })
                      } else {
                        this.state.catList.map(e => {
                          if (e.catId == item.catId){
                            e.checked = true
                          } else {
                            e.checked = false
                          }
                        })
                        this.changeState({
                          showCatDialog: false,
                          selectedCat: item
                        })
                        this.refs.quotationList._getData(item.catId);
                      }
                    }}
                    style={s.dialog_item}
                    key={item.catId}>
                    <SText fontSize='body' color={item.checked ? 'blue' : '000'} >{item.catName}</SText>
                  </TouchableOpacity>
                )
              })
            }
          </ScrollView>
        </View>
      </TouchableOpacity>
    )
  }

  // toast 控制
  _showMsg = (str) => {
    __STORE.dispatch(UtilsAction.toast(str, 1000));
  }

  render(){
    return (
      <Page 
        title='上游行情' 
        pageName='上游行情'
        pageLoading={false} 
        back={() => this.navigator().pop()} 
        rightContent={this._renderHeaderRight()}
        rightEvent={() => {
            if (this.state.catList.length > 0) {
              this.changeState({
                showCatDialog: !this.state.showCatDialog
              })
            } else {
              this._showMsg('品类列表为空')
            }
          }
        }>
        <QuotationList ref="quotationList" route={this.props.route} navigator={this.props.navigator} />
        {this._renderCatDialog()}
      </Page>
    )
  }
}
