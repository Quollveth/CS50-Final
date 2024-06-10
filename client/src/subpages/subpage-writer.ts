import type { Order } from "../scripts/helpers/orders";

//// Orders carousel
let orderIndex = 0;
let slides = $('.carousel-item');

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
}
showSlide(orderIndex);

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


const createCard = (order:Order) => {
    const card = $('<div>',{
        id: 'order-' + order.id,
        class: 'carousel-item'
    })
    const cardBody = $('<div>',{
        class: 'card-body'
    })
    const cardTitle = $('<h5>',{
        class: 'card-title',
        text: order.name
    })
    const cardContent = $('<div>',{
        class: 'card-content',
    })
    const recipient = $('<p>',{
        text: 'For ' + order.recipient
    })
    const deadline = $('<p>',{
        text: 'Deadline: ' + order.deadline
    })
    const detailsButton = $('<button>',{
        class: 'order-carousel-details-btn',
        text: 'Details'
    })
    cardContent.append(recipient, deadline);
    cardBody.append(cardTitle, cardContent, detailsButton);
    card.append(cardBody);

    return card;
}



// Fake data
for (let i = 0; i < 8; i++) {
    if(i > 10) break;
    $.get(`../orders/order-${i}.json`).then((order) => {
        console.log(order);
        const card = createCard(order);
        if (i === 0) {
            card.addClass('active');
        }
        $('.carousel-inner').append(card);
        slides = $('.carousel-item');
    });
}

// Carousel item template
'\
<div id="order-1" class="carousel-item">\
<div class="card-body">\
  <h5 class="card-title">Order 1</h5>\
  <div class="card-content">\
    <p>For John Doe</p>\
    <p>Deadline: 2021-01-01</p>\
  </div>\
  <button class="btn btn-primary">Details</button>\
</div>\
</div>'