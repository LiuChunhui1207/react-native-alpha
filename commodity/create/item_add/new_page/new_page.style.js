'use strict';
import {SStyle} from 'sxc-rn';

module.exports = SStyle({
    header: {
        marginTop: 15,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        padding: 10,
        paddingBottom: 7,
        paddingTop: 7,
        borderBottomColor: 'e5',
        borderBottomWidth: 'slimLine',
        backgroundColor: 'white',
        alignItems: 'center'
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
    tabbar: {
        backgroundColor: 'white',
        borderBottomWidth: 'slimLine',
        borderColor: 'e5',
        width: '@window.width',
    },
    labelHeader: {
        padding: 5,
        paddingLeft: 10,
        backgroundColor: 'e5'
    },
    img: {
        height: 8,
        width: 15,
        marginLeft: 5
    },
    smallInput: {
        height: 30,
        width: 90,
        textAlign: 'right',
        borderWidth: 'slimLine',
        borderColor: 'e5'
    }
});
