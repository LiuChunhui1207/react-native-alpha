'use strict';
import {SStyle} from 'sxc-rn';

module.exports = SStyle({
    header: {
        marginTop: 15,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        padding: 10,
        paddingBottom: 15,
        paddingTop: 15,
        borderBottomColor: 'e5',
        borderBottomWidth: 'slimLine',
        backgroundColor: 'white',
    },
    left: {

    },
    right: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    img: {
        height: 8,
        width: 15,
        marginLeft: 5
    },
    tabbar: {
        backgroundColor: 'white',
        borderBottomWidth: 'slimLine',
        borderColor: 'e5',
        width: '@window.width',
    },
    uploadContainer: {
        marginTop: 10,
        backgroundColor: 'white'
    },
    uploadHeader: {
        padding: 10,
        paddingBottom: 5,
        paddingTop: 5,
        backgroundColor: 'e5'
    },
    uploadSubHeader: {
        padding: 10,
    },
    items: {
        fontSize: 'body'
    }

});
