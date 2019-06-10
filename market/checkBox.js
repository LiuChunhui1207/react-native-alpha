import React, { Component } from 'react';
import { Image, TouchableOpacity } from 'react-native';

class CheckBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: Boolean(this.props.defaultChecked),
    };
  }
  _renderImg = () => {
    const source = this.props.imgSource[this.state.isChecked ? 0 : 1];
    return <Image source={source} style={this.props.checkedStyle}/>;
  }
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          const isChecked = !this.state.isChecked;
          if (isChecked && this.props.isDisabled) {
            this.props.showMsg('只能选择4个哦~')
            return
          }
          this.setState({
            isChecked
          }, () => {
            this.props.changeCheck(this.props.rowData, isChecked)
          })
        }}
      >
        {this._renderImg()}
      </TouchableOpacity>
    );
  }
}

export default CheckBox;