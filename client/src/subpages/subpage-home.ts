import { showNotification } from "../scripts/helpers/helpers";
import type { Order } from "../scripts/helpers/orders";
import { placeNewOrder } from "../scripts/helpers/server-talker";

const submitNewOrder = async () => {
    // Check if all fields are present
    const name = $('#order-name').val() as string;
    const description = $('#order-description').val() as string;
    const deadline = $('#order-deadline').val() as string;

    if (!name || !description || !deadline) {
        showNotification('Please fill in all fields','ERROR');
        return;
    }

    const order:Order = {
        name: name,
        description: description,
        deadline: deadline,

        placed: new Date().toISOString(),
        recipient: 'NONE',
        taken: false,
        completed: false,

        id: 0 // Will be assigned by the server
    }
    placeNewOrder(order).then((success) => {
        if(success){
            showNotification('Order placed successfully','SUCCESS');
            $('#order-name').val('');
            $('#order-description').val('');
            $('#order-deadline').val('');
        } else {
            showNotification('Order placement failed','ERROR');
        }
    });
}


$(()=>{
    $('#order-submit').on('click',submitNewOrder);
})