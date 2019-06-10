'use strict';
import {SStyle} from 'sxc-rn';

module.exports = SStyle({
    header: {
        backgroundColor: 'white',
        marginTop: 15,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    cell: {
        flex: 1,
        flexDirection: 'row',
    },
    left: {
        flex: 1,
    },
    right: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    image: {
        width: '@window.width*(150/720)',
        height: '@window.width*(150/720)',
        borderColor: 'e5',
        borderWidth: 'slimLine',
        marginLeft: 10,
    },
    containerStyle: {
        height: '@window.width*(150/720)',
        marginBottom: 10
    },
    container: {
        padding: 10,
        backgroundColor: 'fa',
    },
});
