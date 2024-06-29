import { showNotification, capitalize, timeSince, dateFormat, loadComponent } from '../scripts/helpers/helpers';
import type { Order } from '../scripts/helpers/orders';
import { getUserPlacedOrders } from '../scripts/helpers/server-talker';


// Load the subpage
const initWindow = async () => {
    const userOrders = await getUserPlacedOrders();





};

$(() => {
    initWindow();
});
