import type { Order } from "../scripts/helpers/orders";
import { getAvailableOrders } from "../scripts/helpers/server-talker";







const populateOrdersPage = async () => {
    const orders = await getAvailableOrders();
    if(orders.length === 0){
        const noOrders = $('<h2>',{
            id: 'empty-orders-banner',
            class: 'banner',
            text: 'There are no available orders at the moment. Please check back later.'
          });
          $('#hiring-orders').append(noOrders);
        return;
    }
}

$(()=>{
    console.log('subpage-hire loaded!');
    populateOrdersPage();
})