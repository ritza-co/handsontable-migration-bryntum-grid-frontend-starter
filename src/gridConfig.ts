import { BryntumGridProps } from '@bryntum/grid-react';
import { AjaxStore } from '@bryntum/grid';
import { API_BASE_URL } from './constants';

export const gridProps: BryntumGridProps = {
    rowReorderFeature : {
        showGrip : true
    },
    cellMenuFeature : {
        items : {
            insertRowAbove : {
                text   : 'Insert row above',
                icon   : 'fa fa-arrow-up',
                weight : 200
            },
            insertRowBelow : {
                text   : 'Insert row below',
                icon   : 'fa fa-arrow-down',
                weight : 200
            }
        }
    },

    onCellMenuItem : ({ source, item, record }) => {
        const store = source.store as AjaxStore;
        const currentIndex = store.indexOf(record);

        let insertionIndex: number;

        if (item.ref === 'insertRowAbove') {
            insertionIndex = currentIndex;
        }
        else if (item.ref === 'insertRowBelow') {
            insertionIndex = currentIndex + 1;
        }
        else {
            return;
        }

        const newRecord = {
            productName : 'New Product',
            companyName : '',
            country     : '',
            sellDate    : new Date().toLocaleDateString('en-GB'),
            orderId     : '',
            inStock     : false,
            qty         : 0
        };

        // sparseIndex is automatically calculated by the store on insert
        store.insert(insertionIndex, newRecord);
    },
    columns : [
        { type : 'rownumber', width : 80 },
        {
            text   : 'Product name',
            field  : 'productName',
            width  : 300,
            editor : {
                type     : 'textfield',
                required : true
            }
        }, {
            text   : 'Company name',
            field  : 'companyName',
            flex   : 1,
            editor : {
                type     : 'textfield',
                required : true
            }
        }, {
            text   : 'Country',
            field  : 'country',
            width  : 300,
            editor : 'textfield'
        }, {
            text   : 'Sell date',
            field  : 'sellDate',
            width  : 180,
            type   : 'date',
            editor : 'datefield'
        }, {
            text   : 'Order ID',
            field  : 'orderId',
            width  : 150,
            editor : 'textfield'
        }, {
            text   : 'In stock',
            field  : 'inStock',
            width  : 120,
            type   : 'check',
            align  : 'center'
        }, {
            text   : 'Qty',
            field  : 'qty',
            width  : 120,
            type   : 'number',
            align  : 'right',
            editor : {
                type : 'numberfield',
                min  : 0
            }
        }
    ],

    store: {
        createUrl  : `${API_BASE_URL}/api/create`,
        readUrl    : `${API_BASE_URL}/api/read`,
        updateUrl  : `${API_BASE_URL}/api/update`,
        deleteUrl  : `${API_BASE_URL}/api/delete`,
        autoLoad      : true,
        autoCommit    : true,
        useSparseIndex : true,
        useRestfulMethods : true,
        httpMethods : {
            create  : 'POST',
            read    : 'GET',
            update  : 'PATCH',
            delete  : 'DELETE'
        },
        fields: [
            { name: 'id', type: 'number' },
            { name: 'productName', type: 'string' },
            { name: 'companyName', type: 'string' },
            { name: 'country', type: 'string' },
            { name: 'sellDate', type: 'date', format: 'DD/MM/YYYY' },
            { name: 'orderId', type: 'string' },
            { name: 'inStock', type: 'boolean' },
            { name: 'qty', type: 'number' }
        ]
    }
};
