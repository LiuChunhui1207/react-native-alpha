'use strict';
import React from 'react';
import {Page, ListSelect, Button, Toast} from 'components';
import {SComponent, SStyle, SText} from 'sxc-rn';

let s = SStyle({
  header: {
    marginTop: 10,
    marginBottom: 5,
    marginLeft: 15
  }
});

module.exports = class SelectCategory extends SComponent{
  constructor(props){
    super(props);
  }
  _renderHeader(){
    return (
      <SText style={s.header} color='666' fontSize='caption'>可多选</SText>
    )
  }
  _goToNextStep(){
    // let result = [];
    // this.refs.ListSelect.state.selectedId.map((id)=>{
    //   result.push(this.state.allCats[id]);
    // });
    this.navigator().pop();
    this.props.route.callback(this.refs.ListSelect.state.selectedId);
  }
  
  render(){
    return (
      <Page loading={false} pageLoading={false} title='供货商-选择品类' scrollEnabled={true} back={this.navigator().pop}>
        <ListSelect
          ref='ListSelect'
          dataSource={this.props.route.data}
          multiple={true}
          renderHeader={this._renderHeader.bind(this)} />
        <Button type='green' size='large' onPress={this._goToNextStep.bind(this)}>添加</Button>
      </Page>
    )
  }
}
