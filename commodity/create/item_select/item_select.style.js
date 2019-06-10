'use strict';
import {SStyle} from 'sxc-rn';

module.exports = SStyle({
    container: {
        flexDirection: 'row',
        padding: 10,
        paddingBottom:5,
        paddingTop: 15,
        marginBottom: 5,
    },
    row: {
        flexDirection: 'column',
        backgroundColor: 'white',
        borderColor: 'ccc',
        borderBottomWidth: 'slimLine',
        marginBottom:10,
    },
    left: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    right: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'flex-start'
    },
    icon: {
        height: 15,
        width: 10,
    },
    contentRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height:40,
        width:80,
    },
    addNewItem: {
      padding:10,
      backgroundColor:'white',
      alignItems:'center',
      justifyContent:'center',
      borderBottomWidth:'slimLine',
      borderColor:'blue',
      marginBottom:10,
    },
    selected: {
      width:24,
      height:24,
      justifyContent: 'center',
    },
    containerRow:{
      flex:1,
      flexDirection:'row',
      marginTop:5,
    },
    partA:{

    },
    partB:{
        marginLeft: 5,
        marginRight: 5
    },
    partC:{
      flex:1,
    },
    propertyList:{
       flex:1,
       marginTop:10,
       flexWrap:'wrap',
       flexDirection:'row',
    },
    property:{
        height: 20,
        alignItems:'center',
      flexDirection:'row',
      marginRight: 15,
    },
    empty:{
      width:24,
      height:24,
      borderRadius:20,
      borderWidth: 'slimLine',
      borderColor:'999',
    },
    msg:{
      padding:10,
      borderTopWidth: 'slimLine',
      borderBottomWidth: 'slimLine',
      borderColor: 'f0',
      flexDirection:'row',
    },
    image: {
        width: 50,
        height: 50,
        borderColor: 'e5',
        borderWidth: 'slimLine',
        marginLeft: 10,
    },
    containerStyle: {
        backgroundColor: 'white',
        height: 50,
    },
    addbtn: {
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: 'blue',
        borderBottomWidth: 'slimLine'
    },
    collBtn: {
        padding: 10,
        justifyContent:'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: 'e5',
        borderWidth: 'slimLine',
        flexDirection: 'row'
    },
    collIcon: {
        height: 9,
        width: 15,
        marginLeft: 5,
    },
    rowSelected: {
        backgroundColor: 'fa'
    }
});
