/**
 *
 * 项目名称：caimi-rn
 * 文件描述：商品管理模块  首页 商品列表
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/5/12 11:08
 * 修改人：cfy
 * 修改时间：17/5/12 11:08
 * 修改备注：
 * @version
 */
import React from 'react';
import {
    View,
    TouchableOpacity,
    Platform,
    Image
} from 'react-native';
import {SStyle, SComponent, SText} from 'sxc-rn';
import {Page, Row, Button, SInput} from 'components';

let STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 20 : 25;

if(Platform.OS == 'android' && Platform.Version < 21)
    STATUS_BAR_HEIGHT = 0;

let  TITLE_CHECK_ID_0=0;
let  TITLE_CHECK_ID_1=1;
let ARROW_LEFT = require('../../image/arrow_left_green.png');
//商品列表-仓库中
import SkuListStored from './skuListStored';
import SkuList from './skuList';
let s = SStyle({
    head: {
        backgroundColor: '#2296F3',
        paddingTop: STATUS_BAR_HEIGHT,
        width: '@window.width',
        flexDirection:'row'
    },
    backIcon: {
        height: 17,
        width: 10
    },
    backContainer: {
        height: 45,
        paddingLeft: 10,
        paddingRight:20,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headTitle:{
        height: 45,
        marginRight:40,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        flex:1,
    },
    headTitleFontCheck:{
        fontSize:18,
        color:'#fff',
    },
    headTitleFontNor:{
        fontSize:14,
        color:'#8ccaff',
    }
});

module.exports = class CommodityList extends SComponent{
    constructor(props){
        super(props);
        this.state = {
            page: 0,
            //头部状态选择 默认选中售卖中
            titleCheckId:TITLE_CHECK_ID_0,
        }
        this._renderHeader=this._renderHeader.bind(this);
    }
    //自定义头部导航
    _renderHeader(){
        return(
            <View style={s.head}>
                <TouchableOpacity style={s.backContainer} onPress={()=>this.navigator().pop()}>
                    <Image source={ARROW_LEFT} style={s.backIcon} />
                </TouchableOpacity>
                <View style={s.headTitle}>
                    <TouchableOpacity style={{ height: 45,marginRight:10,justifyContent:'center'}}
                        onPress={()=>{
                            this.changeState({
                                titleCheckId:TITLE_CHECK_ID_0
                            })
                        }}>
                        <SText fontSize='body' color='white' style={this.state.titleCheckId==TITLE_CHECK_ID_0?s.headTitleFontCheck:s.headTitleFontNor}>售卖中</SText>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ height: 45,justifyContent:'center'}}
                        onPress={()=>{
                            this.changeState({
                                titleCheckId:TITLE_CHECK_ID_1
                            })
                        }}>
                        <SText fontSize='body' color='white' style={this.state.titleCheckId==TITLE_CHECK_ID_1?s.headTitleFontCheck:s.headTitleFontNor}>仓库中</SText>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    _renderBody(){
      switch (this.state.titleCheckId){
          case TITLE_CHECK_ID_0:
              return(
                  <SkuList {...this.props} />
              )
              break
          case TITLE_CHECK_ID_1:
              return(
                  <SkuListStored {...this.props} />
              )
              break
      }
    }
    render(){
        return(
            <Page
                pageName='商品管理'
                hideTitle={true}
                pageLoading={false}>
                {this._renderHeader()}
                {this._renderBody()}
            </Page>
        )
    }
}
