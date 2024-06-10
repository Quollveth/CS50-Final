import type { Order } from '../scripts/helpers/orders';
import { capitalize } from '../scripts/helpers/helpers';

//// Orders carousel
let orderIndex = 0;
let slides = $('.carousel-item');
const ordersPerSlide = 4;

const showSlide = (index: number, animate = true) => {
  const carouselInner = $('.carousel-inner');
  const translateX = -index * 100;

  if (animate) {
    carouselInner.css('transition', 'transform 0.5s ease');
  } else {
    carouselInner.css('transition', 'none');
  }

  carouselInner.css('transform', `translateX(${translateX}%)`);

  slides.removeClass('active');
  slides.eq(index).addClass('active');

  if (!animate) {
    requestAnimationFrame(() => {
      carouselInner.css('transition', 'transform 0.5s ease');
    });
  }
};

$('.next').on('click', () => {
  orderIndex++;
  if (orderIndex >= slides.length) {
    orderIndex = 0;
    showSlide(slides.length - 1, false); // Snap to last slide
    requestAnimationFrame(() => {
      showSlide(orderIndex);
    });
  } else {
    showSlide(orderIndex);
  }
});

$('.prev').on('click', () => {
  orderIndex--;
  if (orderIndex < 0) {
    orderIndex = slides.length - 1;
    showSlide(0, false); // Snap to first slide
    requestAnimationFrame(() => {
      showSlide(orderIndex);
    });
  } else {
    showSlide(orderIndex);
  }
});

/**
 * Creates a single card representing an order
 * @param order Order object data
 * @returns Top level card element
 */
const createCard = (order: Order) => {
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
    text: 'For ' + order.recipient,
  });
  const deadline = $('<p>', {
    text: 'Deadline: ' + order.deadline.substring(0,order.deadline.indexOf('T')),
  });



  cardContent.append(recipient, deadline);
  cardBody.append(cardTitle, cardContent);

  return cardBody;
};

/**
 * Creates a new item on the carousel with the given content and updates carousel slides
 * @param content Item body
 * @param append Appends item to carousel body
 * @returns Created card
 */
const addCarouselItem = (
  content: JQuery<HTMLElement> | null,
  append: boolean = true
) => {
  const card = $('<div>', {
    class: 'carousel-item',
  });
  slides = $('.carousel-item');

  if (content != null) {
    card.append(content);
  }

  if (slides.length == 1) {
    card.addClass('active');
  }

  if (append) {
    $('.carousel-inner').append(card);
  }

  return card;
};

const buildCarousel = (orderList: Order[]) => {
  let ordersInSlide = 0;
  let currentSlide = addCarouselItem(null, false);

  orderList.forEach((order) => {
    // Create card
    const currentCard = createCard(order);

    currentSlide.append(currentCard);
    ordersInSlide++;

    // If card is full create a new one
    if (ordersInSlide == ordersPerSlide) {
        $('.carousel-inner').append(currentSlide);
        currentSlide = addCarouselItem(null, false);
        ordersInSlide = 0;
    }
  });
  // Append last slide
  if(ordersInSlide > 0){
    $('.carousel-inner').append(currentSlide);
  }
};

// Fake data
const getFakeOrders = async (): Promise<Order[]> => {
  let promises: Promise<Order>[] = [];

  for (let i = 0; i < 10; i++) {
    if (i >= 10) {
      alert('theres only 10 dumbass');
      throw new Error('Index out of bounds');
    }

    const promise = new Promise<Order>((resolve, reject) => {
      $.get(`../orders/order-${i}.json`)
        .done((data) => resolve(data as Order))
        .fail((jqXHR, status, e) => reject(e));
    });
    promises.push(promise);
  }

  const orders = await Promise.all(promises);
  return orders;
};

$(async () => {
  const fakeOrders = await getFakeOrders();

  buildCarousel(fakeOrders);
  showSlide(0);


  slides = $('.carousel-item');
  console.log(slides);
});
