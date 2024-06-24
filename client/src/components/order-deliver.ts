import { getOrderDetails, getUserName, takeInOrder } from "../scripts/helpers/server-talker";
import { timeSince,capitalize } from "../scripts/helpers/helpers";

const closeWindow = () => {
    $('.selected-order').removeClass('selected-order');
    $('#order-deliver-page').parent().empty();
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

    const recipient = $('<h5>').text(`By: ${capitalize(name)}`);
    const deadline = $('<p>').text(`Deadline: ${orderDetails.deadline}`).attr('id', 'deadline');

    const timeSpacer = $('<div>').addClass('time-spacer');

    const cancelButton = $('<button>').text('Cancel').addClass('cancel-button');
    const cancelConfirm = $('<p>').addClass('cancel-confirm').addClass('hidden').html('You are about to cancel this request.<br>Press again to confirm.');

    const closeButton = $('<button>').addClass('close-button');
    closeButton.append($('<img>').attr('src','./assets/close-svgrepo-com.svg').css('width','20px'));


    const uploadFile = $('<input>').attr('type','file').attr('id','file-upload').attr('id','order-upload').addClass('hidden');
    const submitButton = $('<button>').text('Submit').addClass('submit-button');

    const uploadTrigger = $('<button>').addClass('upload-trigger');
    uploadTrigger.on('click',()=>{
        uploadFile.trigger('click');
    });
    uploadTrigger.append(
        $('<img>').attr('src','./assets/upload-svgrepo-com.svg').css('width','20px')
    );

    const fileInfo = $('<div>').addClass('file-info').text('No file uploaded').append(uploadTrigger);

    timeSpacer.append(time,deadline);
    const submitSpacer = $('<div>').addClass('submit-spacer');

    const submitConfirm = $('<p>').addClass('submit-confirm').addClass('hidden').text('Press again to confirm.');
    submitSpacer.append(uploadFile,fileInfo,$('<div>').append(submitButton,submitConfirm));

    orderCard.append(orderTitle, description, recipient, submitSpacer, timeSpacer,cancelButton,cancelConfirm,closeButton);
    $('#order-deliver-page').append(orderCard);

    closeButton.on('click',()=>{
        closeWindow();
    });

    cancelButton.on('click',()=>{
        if(cancelConfirm.hasClass('hidden')){
            cancelConfirm.removeClass('hidden');
            return;
        }
        //TODO: Cancel order
        closeWindow();
    });

    submitButton.on('click',()=>{
        if(submitConfirm.hasClass('hidden')){
            submitConfirm.removeClass('hidden');
            return;
        }
        //TODO: Submit file
        closeWindow();
    })
}



$('#reset-button').on('click', () => {
    initWindow();
});
