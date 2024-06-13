import type { Order } from '../scripts/helpers/orders';
import { capitalize } from '../scripts/helpers/helpers';
import type { Document } from '../scripts/helpers/documents';

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

  // Update slides
  slides.removeClass('active');
  slides.eq(index).addClass('active');

  // Update navigator
  $('.carousel-nav-item').removeClass('active');
  $('#car-nav-'+index).addClass('active');

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


const createNavigator = () => {
  const navigator = $('<ul>',{
    class: 'carousel-navigator'
  });
  slides = $('.carousel-item');
  slides.each((i,e)=>{
    const navItem = $('<li>',{
      class: 'carousel-nav-item',
      id: 'car-nav-'+i,
    })
    navigator.append(navItem);

    if(i == 0){
      navItem.addClass('active');
    }

    navItem.on('click',()=>{
      orderIndex = i;
      showSlide(i);
    });
  })

  $('#orders-carousel').append(navigator);
}


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

  createNavigator();
};

// Fake data for carousel
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


//// Document list
const createDocumentCard = (document:Document) => {
  const docCard = $('<div>',{
    class:'document',
    id:'document'+document.id,
  });
  const docTitle = $('<p>',{
    class:'document-title',
    text: document.title
  });
  const docImg = $('<img>',{
    src: document.thumbnail,
  });
  const docBtn = $('<button>',{
    class:'settings-btn'
  });
  const darken = $('<div>',{
    class: 'document-darken'
  });
  const bottom = $('<div>',{
    class: 'document-bottom'
  })
  docBtn.html('<img style="width: 25px; height: 25px" src="./assets/dots-horizontal-svgrepo-com.svg"/>');

  docBtn.on('click',(e)=>{
    showEditMenu(e);
  })

  bottom.append(docTitle,docBtn);
  docCard.append(docImg,darken,bottom);

  return docCard;
}


const editMenu = $('#document-edit-menu');
editMenu.on('mouseleave',()=>{
  editMenu.hide();
})

const showEditMenu = (e:JQuery.ClickEvent) => {
  const x = e.pageX;
  const y = e.pageY;

  editMenu.css('top',y);
  editMenu.css('left',x);

  editMenu.show();
}



$(async () => {
  const fakeOrders = await getFakeOrders();

  buildCarousel(fakeOrders);
  showSlide(0);

  for(let i = 0; i < 20; i++){
    const doc = createDocumentCard({
      id: i,
      title: 'Document '+(i+1),
      thumbnail: 'https://placehold.co/150x200',
      created: '2021-09-01',
    } as Document)
    $('#documents').append(doc);
  };

  slides = $('.carousel-item');
});
