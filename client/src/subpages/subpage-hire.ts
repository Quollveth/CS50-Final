import type { Order } from '../scripts/helpers/orders';
import { getAvailableOrders, getUserName } from '../scripts/helpers/server-talker';
import { capitalize,timeSince,loadComponent } from '../scripts/helpers/helpers';

const cachedNames: { [key: number]: string } = {};

const addOrderCard = async (order: Order) => {

    if(cachedNames[order.recipient] === undefined){
      const name = await getUserName(order.recipient);
      cachedNames[order.recipient] = name;
    }
    const recipientName = cachedNames[order.recipient];

    const cardBody = $('<div>', {
      id: 'order-' + order.id,
      class: 'card-body',
    });
    const cardTitle = $('<h5>', {
      class: 'card-title',
      text: capitalize(order.name),
    });
    const cardContent = $('<div>', {
      class: 'card-content',
    });
    const recipient = $('<p>', {
      text: 'By:   ' + capitalize(recipientName),
    });
    const deadline = $('<p>', {
      text: 'Deadline: ' + order.deadline,
    });
    const time = $('<p>', {
      class: 'order-time',
      text: timeSince(new Date(order.placed)) + ' ago',
    })

    cardContent.append(recipient, deadline);
    cardBody.append(cardTitle, cardContent, time);

    return cardBody;
};

const populateOrdersPage = async () => {
  const orders = await getAvailableOrders();
  if (orders.length === 0) {
    const noOrders = $('<h2>', {
      id: 'empty-orders-banner',
      class: 'banner',
      text: 'There are no available orders at the moment. Please check back later.',
    });
    $('#hiring-orders').append(noOrders);
    return;
  }

  orders.forEach(async (order) => {
    const toAdd = await addOrderCard(order)
    toAdd.on('click',(e)=>{
      $('.selected-order').removeClass('selected-order');
      toAdd.addClass('selected-order');
      loadComponent('./components/order-view.html',$('#modal-holder'));
    });
    $('#hiring-orders').append(toAdd);
  });
};

$(() => {
  console.log('subpage-hire loaded!');
  populateOrdersPage();
});
