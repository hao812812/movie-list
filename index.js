const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies/" //是movie資料api
const POSTER_URL = BASE_URL + "/posters/"//是image的api
const movies = []
let filteredMovies = []
let page = 1
const MOVIES_PER_PAGE = 12

const searchFrom = document.querySelector('#search-form')
const dataPanel = document.querySelector('#data-panel')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changStyle = document.querySelector('#change-style')



//list頁面
function renderMovieToBarList(data){
    let rawHTML = ''
    console.log(data)
    data.forEach(item =>{

      rawHTML += `<hr><div class="row">
          <div class="card-body col-10">
              <h5 class="card-title col-10">${item.title}</h5>
          </div>
          <div class="col-2">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${item.id}"> More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
      </div>`
    })
    dataPanel.innerHTML = rawHTML
}

//card頁面
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {

    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card" >
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${item.id}"> More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div> 
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML

}

//分頁器
function renderPaginator(amount) {
  //有小數則無條件進位

  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 0; page < numberOfPages; page++) {

    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page ='${page + 1}'>${page + 1}</a></li>`

  }
  paginator.innerHTML = rawHTML
}

//換頁
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  if(style === 'bar' ){
    renderMovieToBarList(getMoviesByPage(page))

  } else if (style === "card") {
    renderMovieList(getMoviesByPage(page))
  }
})

//每頁顯示的電影有哪些
function getMoviesByPage(page) {
  //movies有兩種 :(1)80種全部的電影 (2.)filtered 的電影

  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieList(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(function (response) {

    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster">`
  })

}

//加入收藏清單
function addToFavorite(id) {

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id) //找出id與+號id相符的資料

  if (list.some((movie) => movie.id === id)) {

    return alert('此電影已經在電影清單中')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//監聽器 ( button / +)
dataPanel.addEventListener('click', function onPanelClicked(event) {

  if (event.target.matches('.btn-show-movie')) {

    showMovieList(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {

    addToFavorite(Number(event.target.dataset.id))
  }

})


//監聽器，電影可以切換list / card模式
changStyle.addEventListener('click',function(event){
  if (event.target.matches(".bar-style")){
    renderMovieToBarList(getMoviesByPage(page));
    style = "bar"
  }
  else if (event.target.matches(".table-style")){
    renderMovieList(getMoviesByPage(page))
    style = "card"
  }

})

// 搜尋電影
searchFrom.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(function searchWord(movie) {
    return movie.title.toLowerCase().includes(keyword)  //輸入空陣列 ，所有資料都會includes

  })
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})



// 接收電影API
axios.get(INDEX_URL).then((response) => {

  for (const movie of response.data.results) {

    movies.push(movie)

  }
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))

})

