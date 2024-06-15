import { getOrderDetails, getUserName } from "../scripts/helpers/server-talker";
import { timeSince,capitalize } from "../scripts/helpers/helpers";

const closeWindow = () => {
    $('.selected-order').removeClass('selected-order');
    $('#order-view-page').parent().empty();
}

const initWindow = async () => {
    $('#darken').on('click', () => {closeWindow();});

    const selectedOrder = $('.selected-order').first();
    const elementId = selectedOrder.attr('id');
    if (elementId == undefined) { closeWindow(); }

    const selectedId = parseInt(elementId!.split('-')[1]);
    const orderDetails = await getOrderDetails(selectedId);    
    if (orderDetails == null) { closeWindow(); }

    const orderCard = $('<div>').addClass('order-card');
    orderCard.attr('id', 'order-card-' + orderDetails.id);

    const orderTitle = $('<h2>').text(capitalize(orderDetails.name));
    const description = $('<p>').text(orderDetails.description).attr('id', 'description');
    const time = $('<p>', {
        class: 'order-time',
        text: timeSince(new Date(orderDetails.placed)) + ' ago',
    });
    const name = await getUserName(orderDetails.recipient);

    const recipient = $('<h5>').text(`By:: ${capitalize(name)}`);
    const deadline = $('<p>').text(`Deadline: ${orderDetails.deadline}`).attr('id', 'deadline');

    const timeSpacer = $('<div>').addClass('time-spacer');

    const acceptButton = $('<button>').text('Accept').addClass('accept-button');

    timeSpacer.append(time,deadline);
    orderCard.append(orderTitle, description, recipient, timeSpacer,acceptButton);

    $('#order-view-page').append(orderCard);
}

$('#reset-button').on('click', () => {
    initWindow();
});
