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
    const response = await axios.get(
      `${API_URL}?key=${API_KEY}&${PARAMS}&q=${query}&page=${page}&per_page=${perPage}`
    );
    if (!response.ok) {
      if (response.status === 400) {
        return [];
      }
      return { error: response.status };
    }
    return response.data.json();
  } catch (e) {
    return { error: e.toString() };
  }
}
function loading() {
  page += 1;
  simpleLightbox.destroy();
  q = searchForm.searchQuery.value;
  fetchImages(q, page, perPage).then(response => {
    const galleryCard = response.hits
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
    const allPages = Math.ceil(response.totalHits / perPage);

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

  fetchImages(q, page, perPage).then(response => {
    if (response.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      const galleryCards = response.hits
        .map(
          cards => `<a class="gallery-link" href="${cards.largeImageURL}">
        <div class="photo-card">
          <img class="gallery-photo" src="${cards.webFormatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes</b>${cards.likes}</p>
            <p class="info-item"><b>Views</b>${cards.views}</p>
            <p class="info-item"><b>Comments</b>${cards.comments}</p>
            <p class="info-item"><b>Downloads</b>${cards.downloads}</p>
          </div>
        </div>
      </a>`
        )
        .join('');
      gallery.insertAdjacentHTML('beforeend', galleryCards);
      simpleLightbox = new SimpleLightbox('.gallery').refresh();
      if (response.totalHits > 40) {
        loading.classList.remove('hidden');
      }
    }
  });
}

searchForm.addEventListener('submit', createGallery);
loadBtn.addEventListener('click', loading);
