import type { Order } from '../scripts/helpers/orders';
import { getAvailableOrders } from '../scripts/helpers/server-talker';
import { capitalize } from '../scripts/helpers/helpers';
import { timeSince } from '../scripts/helpers/helpers';

const addOrderCard = (order: Order) => {
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
      text: 'By:  ' + order.recipient,
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


  orders.forEach((order) => {
    console.log(order);
    $('#hiring-orders').append(addOrderCard(order));
  });
};

$(() => {
  console.log('subpage-hire loaded!');
  populateOrdersPage();
});
