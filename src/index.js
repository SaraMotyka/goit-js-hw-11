import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');

let page = 1;
let query = searchForm.searchQuery.value;
let simpleLightbox;
let perPage = 40;
let galleryCard;

const API_URL = 'https://pixabay.com/api/';
const API_KEY = '36940182-0da281a971cf517379f0112d8';
const PARAMS = {
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
};

async function fetchImages(query, page, perPage) {
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

    const { hits: photos } = await response.json();

    return photos;
  } catch (e) {
    return { error: e.toString() };
  }
}

function createGallery(query) {
  const galleryCard = query
    .map(card => {
      const {
        webFormatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = card;
      return `<a class="gallery-link" href="${largeImageURL}">
        <div class="photo-card">
          <img class="gallery-photo" src="${webFormatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes</b>${likes}</p>
            <p class="info-item"><b>Views</b>${views}</p>
            <p class="info-item"><b>Comments</b>${comments}</p>
            <p class="info-item"><b>Downloads</b>${downloads}</p>
          </div>
        </div>
      </a>`;
    })
    .join('');
  gallery.insertAdjacentHTML('beforeend', galleryCard);
}

loadBtn.addEventListener(
  'click',
  () => {
    query = searchQuery.value;
    page += 1;
    fetchImages(query, page, perPage).then(query => {
      let totalPages = query.totalHits / perPage;
      renderGallery(query);
      new SimpleLightbox('.gallery');
      if (page >= totalPages) {
        loadBtn.style.display = 'none';
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    });
  },
  true
);

function loading() {
  page += 1;
  simpleLightbox.destroy();
  fetchImages(query, page, perPage)
    .then(({ data }) => {
      createGallery(data.hits);
      simpleLightbox = new SimpleLightbox('.gallery').refresh();
      const allPages = Math.ceil(data.totalHits / perPage);

      if (page >= allPages) {
        loadBtn.classList.add('hidden');
        return Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => console.log(error));
}
function handleSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.searchQuery.value;
  gallery.innerHTML = '';
  loadBtn.classList.add('hidden');
}

searchForm.addEventListener('submit', handleSearchForm);
loadBtn.addEventListener('click', loading);
