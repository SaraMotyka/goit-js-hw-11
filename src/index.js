import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');

let page = 1;
let simpleLightbox;
let perPage = 40;
let q = '';

const API_URL = 'https://pixabay.com/api/';
const API_KEY = '36940182-0da281a971cf517379f0112d8';
const PARAMS = {
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
};

async function fetchImages(q, page, perPage) {
  try {
    const response = await axios(
      //`${API_URL}?key=${API_KEY}&${PARAMS}&q=${query}&page=${page}&per_page=${perPage}`
      {
        method: 'get',
        baseURL: API_URL,
        params: {
          key: API_KEY,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          per_page: perPage,
          page,
          q,
        },
      }
    );
    console.log(response);
    return response;
  } catch (error) {
    return error;
  }
}

function loading() {
  page += 1;
  simpleLightbox.destroy();
  q = searchForm.searchQuery.value;
  fetchImages(q, page, perPage).then(response => {
    const galleryCard = data.hits
      .map(
        card =>
          `<a class="gallery-link" href="${card.largeImageURL}">
        <div class="photo-card">
          <img class="gallery-photo" src="${card.webFormatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes</b>${card.likes}</p>
            <p class="info-item"><b>Views</b>${card.views}</p>
            <p class="info-item"><b>Comments</b>${card.comments}</p>
            <p class="info-item"><b>Downloads</b>${card.downloads}</p>
          </div>
        </div>
      </a>`
      )
      .join('');
    gallery.insertAdjacentHTML('beforeend', galleryCard);
    simpleLightbox = new SimpleLightbox('.gallery').refresh();
    const allPages = Math.ceil(data.totalHits / perPage);

    if (page >= allPages) {
      loadBtn.classList.add('hidden');
      return Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  });
}
function createGallery(e) {
  e.preventDefault();
  page = 1;
  q = searchForm.searchQuery.value;
  gallery.innerHTML = '';
  loadBtn.classList.add('hidden');

  fetchImages(q, page, perPage)
    .then(response => {
      console.log(response.data);
      if (response.data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        // const galleryCards = response.data.hits
        //   .map(cards => {
        //     return `<a class="gallery-link" href="${cards.largeImageURL}">
        //       <div class="photo-card">
        //         <img class="gallery-photo" src="${cards.webFormatURL}" alt="${tags}" loading="lazy" />
        //         <div class="info">
        //           <p class="info-item"><b>Likes</b>${cards.likes}</p>
        //           <p class="info-item"><b>Views</b>${cards.views}</p>
        //           <p class="info-item"><b>Comments</b>${cards.comments}</p>
        //           <p class="info-item"><b>Downloads</b>${cards.downloads}</p>
        //         </div>
        //       </div>
        //     </a>`;
        //   })
        //   .join('');
        let galleryItem = [];
        for (const image of response.data.hits) {
          const {
            webformatURL,
            largeImageURL,
            tags,
            likes,
            views,
            comments,
            downloads,
          } = image;
          galleryItem.push(`
          <div class="photo-card">
          <div class="gallery__pictureholder">
          <a  href="${largeImageURL}">
          <img class="gallery__picture" src="${webformatURL}" alt="${
            tags + ' - from pixabay'
          }" loading="lazy" />
          </a>
          </div>
          <div class="info">
            <p class="info-item">
              <b>Likes</b><span> ${likes}</span>
            </p>
            <p class="info-item">
              <b>Views</b><span> ${views}</span>
            </p>
            <p class="info-item">
              <b>Comments</b><span> ${comments}</span>
            </p>
            <p class="info-item">
              <b>Downloads</b><span> ${downloads}</span>
            </p>
          </div>
        </div>
          `);
        }
        let galleryToPublish = galleryItem.map(image => image).join(''); //building one string from array
        // console.log(galleryCards);
        gallery.insertAdjacentHTML('beforeend', galleryToPublish);
        simpleLightbox = new SimpleLightbox('.gallery').refresh();
        if (response.data.totalHits > 40) {
          loadBtn.classList.remove('hidden');
        }
      }
    })
    .catch(error => {
      console.log(error);
      Notiflix.Notify.failure(`${error}`);
      // const errorMn = error.toJSON();
      // Notiflix.Notify.failure(`${errorMn}`);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        Notiflix.Notify.failure(`${error.response.data}`);
        Notiflix.Notify.failure(`${error.response.status}`);
        Notiflix.Notify.failure(`${error.response.headers}`);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        Notiflix.Notify.failure(`${error.request}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        Notiflix.Notify.failure(`Error ${error.message}`);
      }
      Notiflix.Notify.failure(`${error.config}`);
    });
}

searchForm.addEventListener('submit', createGallery);
loadBtn.addEventListener('click', loading);
