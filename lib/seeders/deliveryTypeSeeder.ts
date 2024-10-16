import deliveryTypeServices from '@/lib/services/deliveryType.services'

export default async function seedDeliveryTypes() {
    await deliveryTypeServices.bulkInsert([
        {
            delivery_type: 'Not required',
        },
        {
            delivery_type: 'Shipment',
        },
        {
            delivery_type: 'Reimbursement',
        },
    ])
}
