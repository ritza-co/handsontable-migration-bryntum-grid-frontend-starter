import { BryntumGridProps } from '@bryntum/grid-react';
import { AjaxStore } from '@bryntum/grid';
import { API_BASE_URL } from './constants';

export const gridProps: BryntumGridProps = {
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

    onCellMenuItem : async ({ source, item, record }) => {
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

        // Get the index value from the row BEFORE the insertion point
        let newRecordIndex: number;
        if (insertionIndex === 0) {
            // Inserting at the very beginning
            const firstRec = store.getAt(0);
            const firstIndex = firstRec ? (firstRec.get('index') as number) : 0;
            newRecordIndex = firstIndex;
        } else {
            // Get index from the record at position insertionIndex - 1, then add 1
            const prevRec = store.getAt(insertionIndex - 1);
            const prevIndex = prevRec ? (prevRec.get('index') as number) : insertionIndex - 1;
            newRecordIndex = prevIndex + 1;
        }

        // Update indices of all rows from insertion point onwards
        const recordsToUpdate = [];
        for (let i = insertionIndex; i < store.count; i++) {
            const rec = store.getAt(i);
            if (rec) {
                const currentRecordIndex = rec.get('index') as number;
                // Set new sequential index starting from newRecordIndex + 1
                recordsToUpdate.push({
                    id: rec.id,
                    index: newRecordIndex + 1 + (i - insertionIndex)
                });
            }
        }

        // Update existing rows' indices on the backend
        if (recordsToUpdate.length > 0) {
            try {
                await fetch(`${API_BASE_URL}/api/products/bulk-update`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ updates: recordsToUpdate })
                });

                // Update local store indices
                recordsToUpdate.forEach(update => {
                    const rec = store.getById(update.id);
                    if (rec) {
                        rec.set('index', update.index);
                    }
                });
            } catch (error) {
                console.error('Error updating row indices:', error);
                return;
            }
        }

        // Now create the new record with the correct index
        const newRecord = {
            index: newRecordIndex,
            productName: 'New Product',
            companyName: '',
            country: '',
            sellDate: new Date().toLocaleDateString('en-GB'),
            orderId: '',
            inStock: false,
            qty: 0
        };

        // Insert the new record - autoCommit will handle sending to server
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
        autoLoad   : true,
        autoCommit : true,
        useRestfulMethods : true,
        httpMethods : {
            create  : 'POST',
            read    : 'GET',
            update  : 'PATCH',
            delete  : 'DELETE'
        },
        fields: [
            { name: 'id', type: 'number' },
            { name: 'index', type: 'number' },
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
