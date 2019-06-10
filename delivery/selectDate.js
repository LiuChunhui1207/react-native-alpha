'use strict';
import React from 'react';
import {SComponent} from 'sxc-rn';
import {Page, Button, SXCDatePicker} from 'components';

/**
 * 选择日期
 * @type {[type]}
 */
module.exports = class Index extends SComponent{
  constructor(props){
    super(props);
    this._ok = this._ok.bind(this);
    if(props.route.startDate){
      let now = new Date();
      let startDate = new Date(now.getMonth() > 2 ? now.getFullYear() : now.getFullYear() - 1, now.getMonth() > 2 ? now.getMonth() - 2 : now.getMonth() + 9);
      this._startDate = props.route.startDate || startDate;
    }
    this._renderFooter = this._renderFooter.bind(this);
  }

  _ok(){
    this.navigator().pop();
    this.props.route.callback(this._SXCDatePicker._getChosenDate().selected);
  }
  _renderFooter(){
    return <Button type='green' size='large' onPress={this._ok} >确定</Button>
  }

  render(){
    return (
      <Page title='选择日期' pageLoading={false} back={()=>this.navigator().pop()}>
        <SXCDatePicker
          range={false} 
          selectDate={this.props.route.selectDate}
          startDate={this._startDate}
          endDate={this.props.route.endDate}
          renderFooter={this._renderFooter}
          ref={view => this._SXCDatePicker = view} 
        />
      </Page>
    )
  }
}
