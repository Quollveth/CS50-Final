import type { Order } from '../scripts/helpers/orders';
import { getAvailableOrders, getUserName } from '../scripts/helpers/server-talker';
import { capitalize,timeSince,loadComponent, dateFormat, showNotification } from '../scripts/helpers/helpers';

const addOrderCard = async (order: Order) => {
    const recipientName = await getUserName(order.recipient);

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
      text: 'Deadline: ' + dateFormat(order.deadline),
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
  let orders:Order[] = [];
  try {
    orders = await getAvailableOrders();
  }
  catch(e) {
    showNotification('Failed to load orders. Please try again later.', 'ERROR');
  }
  if (orders.length === 0) {
    const noOrders = $('<h2>', {
      id: 'empty-orders-banner',
      text: 'There are no available orders at the moment. Please check back later.',
    });
    $('#hiring-orders').append($('<div>').addClass('banner').append(noOrders));
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
