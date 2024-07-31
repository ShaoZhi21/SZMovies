import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [movies, setMovies] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [trendingMovies, setTrendingMovies] = useState(null)
  const [trendingTv, setTrendingTv] = useState(null)
  const [trendingAll, setTrendingAll] = useState(null)
  const [showInfo, setShowInfo] = useState(0)
  const [info, setInfo] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [favourites, setFavourites] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    getTrending("movie")
    getTrending("tv")
    getTrending("all")
    getNowPlaying()
    getUpcoming()
  }, [])

  const openMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const getNowPlaying = async () => {
    try {
      const response = await fetch("/api/now-playing")
      const data = await response.json()
      setNowPlaying(data.results)
    } catch(error){
      console.error('Error fetching now playing movies:', error);
    }
  }

  const getUpcoming = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/upcoming`)
      const data = await response.json()
      setUpcoming(data.results)
    } catch (error) {
      console.error('Error fetching upcoming movies:', error);
    }
  }

  const getTrending = async (type) => {
    try {
      const response = await fetch(`/api/trending?type=${type}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending movies');
      }
      const data = await response.json();
      if (type === "movie"){
        setTrendingMovies(data.results)
      }
      if (type === "tv"){
        setTrendingTv(data.results)
      }
      if (type === "all"){
        setTrendingAll(data.results)
      }
    } catch (error) {
      console.error('Error fetching trending movies:', error);
    }
  }

  const getMovies = async (search) => {
    try {
      const response = await fetch(`/api/movies?search=${encodeURIComponent(search)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      setMovies(data.results);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value)
    setShowInfo(0)
    getMovies(searchQuery)
    window.scrollTo({top: 0, behavior: "instant"})
  }

  const handleClick = () => {
    setShowInfo(0)
    setSearchQuery("")
  }

  const resetClick = () => {
    window.location.href = '/'
  }


  window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 200) { 
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

  return (
    <div id="body">
      <div id="navbar">
        <h1 onClick={resetClick} href="title" id="title">SZMovies</h1>
        <div id="navbarlinks">
          <a onClick={handleClick} className="head hidden" href="#section1">Now Playing</a>
          <a onClick={handleClick}className="head hidden" href="#section2">Upcoming</a>
          <a onClick={handleClick}className="head hidden" href="#section3">Trending Movies</a>
          <a onClick={handleClick} className="head hidden" href="#section4">Trending TV Shows</a>
        </div>
        <div>
          <button onClick={openMenu} id="togglebutton">Menu</button>
          {isMenuOpen && 
          <div className='dropdown'>
            <a className="dropdowntext" onClick={() => {openMenu(); handleClick();}} href="#section1">Now Playing</a>
            <a className="dropdowntext" onClick={() => {openMenu(); handleClick();}} href="#section2">Upcoming</a>
            <a className="dropdowntext" onClick={() => {openMenu(); handleClick();}} href="#section3">Trending Movies</a>
            <a className="dropdowntext" onClick={() => {openMenu(); handleClick();}} href="#section4">Trending TV Shows</a>
          </div>}
        </div>
        <div id="search">
          <input
          id = "searchbar"
          type = "text"
          value = {searchQuery}
          onChange = {handleSearchInputChange}
          placeholder = "Search Movies..."
          />
        </div>
      </div>
      {showInfo !== 0 ? (
        <div>
          <Movieinfo setFavourites={setFavourites} favourites={favourites} setInfo={setInfo} setSearchQuery={setSearchQuery} setShowInfo={setShowInfo} info={info}/>
        </div>
      ):(
        searchQuery.length > 0 ? (
          <DisplaySearch setInfo={setInfo} setShowInfo={setShowInfo} movies={movies} setMovies={setMovies} searchQuery={searchQuery}/>
        ) : (
          <div>
            <div>
              <FeaturedMain setInfo={setInfo} setShowInfo={setShowInfo} trendingAll={trendingAll}/>
            </div>
            <div id="favourites">
              {favourites.length > 0 && <HorizontalMovieScroll setInfo={setInfo} setShowInfo={setShowInfo} trending={favourites} text="Your Favourites"/>}
            </div>
            <div id="section1">
              <HorizontalMovieScroll setInfo={setInfo} setShowInfo={setShowInfo} trending={nowPlaying} text="Now Playing"/>
            </div>
            <div id="section2">
              <HorizontalMovieScroll setInfo={setInfo} setShowInfo={setShowInfo} trending={upcoming} text="Upcoming"/>
            </div>
            <div id="section3">
              <HorizontalMovieScroll setInfo={setInfo} setShowInfo={setShowInfo} trending={trendingMovies} text="Trending Movies"/>
            </div>
            <div id="section4">
              <HorizontalMovieScroll setInfo={setInfo} setShowInfo={setShowInfo} trending={trendingTv} text="Trending TV Shows"/>
            </div>
          </div>
        )
      )}
      <div id="credits">
        <p>Made by Soong Shao Zhi. <br/> Any resemblance between SZMovies and any existing websites is purely coincidental. <br/>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
    </div>
  );
}

const Movieinfo = ({favourites, setFavourites, setSearchQuery, setShowInfo, setInfo, info}) => {
  const [trailerKey, setTrailerKey] = useState("")
  const [loadingTrailer, setLoadingTrailer] = useState(true)
  const [cast, setCast] = useState("")
  const [userReviews, setUserReviews] = useState([])
  const [similar, setSimilar] = useState([])
  const [reviewIndex, setReviewIndex] = useState(3)
  const [showButton, setShowButton] = useState(false)
  
  useEffect(() => {
    if (info.id) { 
      fetchTrailer(info.media_type, info.id);
      fetchCast(info.id);
      fetchReviews(info.media_type, info.id);
      fetchSimilar(info.media_type, info.id);
    }
  }, [info.media_type, info.id]);

  const fetchTrailer = async (media, id) => {
    try {
      const response = await fetch(`/api/trailer?media=${media}&id=${id}`);
      const data = await response.json();
      const trailer = data.results.find(video => video.type === "Trailer");
      if (trailer) {
        setTrailerKey(trailer.key); 
      } else {
        setTrailerKey("")
      }

    } catch (error) {
      console.error('Error fetching trailer:', error);
    } finally {
      setLoadingTrailer(false)
    }
  };

  const fetchCast = async (id) => {
    try {
      const response = await fetch(`/api/cast?id=${id}`)
      const data = await response.json()
      setCast(data.cast.slice(0,10))
    } catch (error) {
      console.error('Error fetching cast', error)
    }
  }

  const fetchReviews = async (media, id) => {
    try {
      const response = await fetch(`/api/reviews?media=${media}&id=${id}`)
      const data = await response.json()
      setUserReviews(data.results)
    } catch (error){
      console.error("Error catching reviews", error)
    }
  }

  const fetchSimilar = async (media, id) => {
    try{
      const response = await fetch(`/api/similar?media=${media}&id=${id}`)
      const data = await response.json()
      setSimilar(data.results)
    } catch (error){
      console.error("Error catching similar", error)
    }
  }

  const handleClick = () => {
    setShowInfo(0)
    setSearchQuery("")
  }

  const favouriteClick = () => {
    if (favourites.length > 0){
      if (!favourites.some(fav => fav.id === info.id)){
        setFavourites([...favourites, info])
      }
    } else {
      setFavourites([info])
    }
  }

  const removeClick = () => {
    const updatedFavourites = favourites.filter(fav => fav.id !== info.id)
    setFavourites(updatedFavourites)
  }

  const showMoreReviews = () => {
    setReviewIndex(6)
    setShowButton(true)
  }

  const showLessReviews = () => {
    setReviewIndex(3)
    setShowButton(false)
  }

    return (
      <div className='movieinfoflex'>
        <div className="movieinfobackground">
          <div id="infotitle">
              {info.title && <h1 id="movieinfotitle">{info.title}</h1>}
              {info.name && <h1 id="movieinfotitle">{info.name}</h1>}
              <div id="releaserating">
                {info.release_date && <p id="movieinforelease">Release Date: {info.release_date}</p>}
                {info.first_air_date && <p id="movieinforelease">Release Date: {info.first_air_date}</p>}
                <p id="movieinforating">Rating: {info.vote_average} ({info.vote_count} votes)</p>
              </div>
          </div>
          <div className="moviemedia">
            <div>
              <img id="movieinfoimage" src={`https://image.tmdb.org/t/p/w300/${info.poster_path}`} alt="N/A"/>
            </div>
            {loadingTrailer  ? 
              <p>Loading Trailer...</p>
              : trailerKey ?
                <iframe
                  id="movietrailer"
                  width="1000"
                  height="600"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe> : <p>No Trailer Found</p>}
          </div>
          <div id="moviesypnosis">
              <h3 id="movieinfooverview">{info.overview}</h3>
              <div id="movieinfobuttons">
                {!favourites.some(fav => fav.id === info.id) && <button id="like" onClick={favouriteClick}>Like</button>}
                {favourites.some(fav => fav.id === info.id) && <button id="unlike" onClick={removeClick}>Like</button>}
                <button id="movieinfobutton" onClick={handleClick}>Back</button>
              </div>
          </div>
        </div>
        <div id="castreviewsflex">
          <div className='castdiv'>
            <h3>Cast</h3>
            <div className='castflex'>
              {cast.length > 0 ? (cast.slice(0,9).map(x => (
                <div className='cast'>
                  <img id="castimage" src={`https://image.tmdb.org/t/p/w300${x.profile_path}`} alt="N/A"></img>
                  <h3>{x.character}</h3>
                  <p>{x.name}</p>
                </div>
              ))) : <p>No Cast Found</p>}
            </div>
          </div>
          <div id="wholereviewsdiv">
            <div>
              <h3 id="reviewstext">Reviews</h3>
            </div>
            {userReviews ? 
            <div id="reviewsflex">
                {userReviews.slice(0,reviewIndex).map(x => {
                  const sentences = x.content.split(".").map(sentence => sentence.trim()).filter(Boolean)
                  const previewContent = sentences.slice(0,3).join('. ') + (sentences.length > 3 ? '...' : '')
                return(
                  <div className='reviews'>
                    <h3>{x.author}</h3>
                    <h4>{x.created_at.slice(0,10)}</h4>
                    <p>{previewContent}</p>
                  </div>)
              })}
              <div>
                {!showButton && <button className="reviewsbutton" onClick={showMoreReviews}>Show More</button>}
                {showButton && <button className="reviewsbutton" onClick={showLessReviews}>Show Less</button>}
              </div>
            </div>
            : <p>No User Reviews Found</p>}
          </div>
        </div>
        {similar ? <HorizontalMovieScroll setInfo={setInfo} setShowInfo={setShowInfo} trending={similar} text="Similar Shows"/>
        :<p>No Similar Movies</p>}
      </div>
    )
}

const HorizontalMovieScroll = ({setInfo, setShowInfo, text, trending }) => {
  const containerRef = useRef(null);
  const [hoveredItemIndex, setHoveredItemIndex] = useState(null)
  const [trailerKey, setTrailerKey] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsToShow, setItemsToShow] = useState(5)

  const getRating = (rating) => {
    if (rating > 7){
      return "goodmovie"
    } else if (rating > 5){
      return "midmovie"
    } else if (rating > 0){
      return "badmovie"
    } else {
      return "nonemovie"
    }
  } 

  const updateItemsToShow = () => {
    const width = window.innerWidth;
    if (width >= 1650){
      setItemsToShow(7)
    } else if (width >= 1420){
      setItemsToShow(6)
    } else if (width >= 1190){
      setItemsToShow(5)
    } else if (width >= 960){
      setItemsToShow(4)
    } else if (width >= 600){
      setItemsToShow(3)
    } else {
      setItemsToShow(3)
    }
  }

  useEffect(() => {
    updateItemsToShow()
    window.addEventListener("resize", updateItemsToShow)

    return () => window.removeEventListener("resize", updateItemsToShow)
  }, [])

  const handleMouseEnter = async(index) => {
    const trailerindex = currentIndex + index;
    setHoveredItemIndex(index);
    const mediaType = trending[trailerindex].media_type || 'movie';
    await fetchTrailer(mediaType, trending[trailerindex].id);
  }

  const handleMouseLeave = () => {
    setHoveredItemIndex(null)
    setTrailerKey(null)
  }

  const showNext = () => {
    if (currentIndex + itemsToShow < trending.length){
      setCurrentIndex(currentIndex + itemsToShow)
    }
  }

  const showPrevious = () => {
    if (currentIndex - itemsToShow >= 0){
      setCurrentIndex(currentIndex - itemsToShow)
    }
  }
  
  const fetchTrailer = async (media, id) => {
    try {
      const response = await fetch(`/api/hovertrailer?media=${media}&id=${id}`);
      const data = await response.json();
      const trailer = data.results.find(video => video.type === "Trailer");
      
      if (trailer) {
        setTrailerKey(trailer.key); 
      } else {
        setTrailerKey(""); 
      }
    } catch (error) {
      console.error('Error fetching trailer:', error);
      setTrailerKey(""); 
    }
  };

  if (trending === null){
    return <div>Loading...</div>
  }

  const handleClick = (id) => {
    window.scrollTo({top: 0, behavior: "instant"})
    setShowInfo(1)
    const mediaType = trending[id].media_type || 'movie'
    const movieindex = currentIndex + id
    setInfo({...trending[movieindex], media_type: mediaType})
  }

  const sliceTitle = (text) => {
    const words = text.split(/\s+/);
    if (words.length > 6){
      const slicedTitle = words.slice(0, 6).join(' ');
      return `${slicedTitle}...`;
    } else {
      return text
    }
}

  return (
    <div id="horizontalmoviescroll">
      <h2 id="trendingscrolltext">{text}</h2>
      <div className="movie-scroll-container">
        <div className="scroll-arrow" onClick={showPrevious} disabled={currentIndex === 0}>
          &lt;
        </div>
        <div className="movielist" ref={containerRef}>
          {trending.slice(currentIndex, currentIndex + itemsToShow).map((x, index) => 
          <div>
            <div className="moviebox">
              {hoveredItemIndex === index && trailerKey && (
              <iframe
                className="trailer-iframe"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>)}
              <img id="scrollimage" className="popup" onMouseEnter={() => handleMouseEnter(index)} alt="N/A" 
              onMouseLeave={handleMouseLeave}
              onClick={() => {handleClick(index)}} src={`https://image.tmdb.org/t/p/w300/${x.poster_path}`} />
              {x.vote_average !== 0 ? <h3 className={getRating(x.vote_average)} id="vote">{x.vote_average.toFixed(1)}</h3> : <h3 id="vote2">NA</h3>}
              {x.title && x.release_date ? <h3 className='horizontalmovietitle'>{sliceTitle(x.title)}<br />({x.release_date && x.release_date.slice(0,4)})</h3>
              : <h3 className='horizontalmovietitle'>{x.name}<br />({x.first_air_date && x.first_air_date.slice(0,4)})</h3>}
            </div>
          </div>
          )}
        </div>
        <div className="scroll-arrow" onClick={showNext} disabled={currentIndex + itemsToShow >= trending.length}>
          &gt;
        </div>
      </div> 
    </div>
  );
};

const FeaturedMain = ({setInfo, setShowInfo, trendingAll}) => {
  const [index, setIndex] = useState(0)
  const [trailerKey, setTrailerKey] = useState("")
  const [loadingTrailer, setLoadingTrailer] = useState(true)

  useEffect(() => {
    if (trendingAll && trendingAll.length > 0){
      fetchTrailer(trendingAll[index].media_type, trendingAll[index].id)
    }
  }, [index, trendingAll]) 

  const fetchTrailer = async (media, id) => {
    try {
      const response = await fetch(`/api/featuredtrailer?media=${media}&id=${id}`);
      const data = await response.json();
      const trailer = data.results.find(video => video.type === "Trailer");
      
      if (trailer) {
        setTrailerKey(trailer.key); 
      } else {
        setTrailerKey("")
      }

    } catch (error) {
      console.error('Error fetching trailer:', error);
    } finally {
      setLoadingTrailer(false)
    }
  };

  if (trendingAll === null){
    return <div>Loading...</div>
  }

  const showNext = () => {
    if (index === 19){
      setIndex(19)
    } else {
      setIndex(index + 1)
    }
  }
  const showPrevious = () => {
    if (index === 0){
      setIndex(0)
    } else {
      setIndex(index - 1)
    }
  }

  return (
    <div id="mainpageflex">
      <div id="featured">
        <button className="featuredscroll" onClick={showPrevious}>&lt;</button>
        <div id="featuredtext">
            {trendingAll[index].title && <h3 id="trendingtext">{trendingAll[index].title}</h3>}
            {trendingAll[index].name && <h3 id="trendingtext">{trendingAll[index].name}</h3>}
            {trendingAll[index].release_date && <h3>({trendingAll[index].release_date.slice(0,4)})</h3>}
            {trendingAll[index].first_air_date && <h3>({trendingAll[index].first_air_date.slice(0,4)})</h3>}
        </div>
        <button className="featuredscroll" onClick={showNext}>&gt;</button>
      </div>
      {loadingTrailer  ? 
            <p>Loading Trailer...</p>
            : trailerKey ?
              <iframe
                id="mainpagetrailer"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe> : <p>No Trailer Found</p>}
      <div className="fade-out"></div>
    </div>
  );
};

const DisplaySearch = ({setInfo, setShowInfo, movies, setMovies}) => {
  const [counter,setCounter] = useState(0)
  const [counterTwo,setCounterTwo] = useState(0)
  const [originalMovies, setOriginalMovies] = useState([])
  const [sortRating, setSortRating] = useState("Rating")
  const [sortRelease, setSortRelease] = useState("Release")
  const [isRatingEnlarged, setIsRatingEnlarged] = useState(false);
  const [isReleaseEnlarged, setIsReleaseEnlarged] = useState(false);


  const handleClick = (id) => {
    setShowInfo(1)
    setInfo(movies[id])
    window.scrollTo({top: 0, behavior: "instant"})
  }

  const getRating = (rating) => {
    if (rating > 7){
      return "goodmovie"
    } else if (rating > 5){
      return "midmovie"
    } else if (rating > 0){
      return "badmovie"
    } else {
      return "nonemovie"
    }
  } 

  const filterRating = () => {
    if (counter === 0){
      setOriginalMovies([...movies])
      const sorted = [...movies].sort((a,b) => b.vote_average - a.vote_average)
      setSortRating("Descending")
      setMovies(sorted)
      setCounter(1)
      setIsRatingEnlarged(true)
    }
    if (counter === 1){
      const sorted = [...movies].sort((a,b) => a.vote_average - b.vote_average)
      setMovies(sorted)
      setSortRating("Ascending")
      setCounter(2)
      setIsRatingEnlarged(true)
    }
    if (counter === 2){
      setMovies(originalMovies)
      setSortRating("Rating")
      setCounter(0)
      setIsRatingEnlarged(false)
    }
  }
  
  const filterRelease = () => {
    if (counterTwo === 0){
      setOriginalMovies([...movies])
      const sorted = [...movies].sort((a,b) => {
        const dateA = a.release_date || a.first_air_date
        const dateB = b.release_date || b.first_air_date
        return new Date(dateB) - new Date(dateA)
      })
      setSortRelease("Latest")
      setCounterTwo(1)
      setMovies(sorted)
      setIsReleaseEnlarged(true)
    }
    if (counterTwo === 1){
      const sorted = [...movies].sort((a,b) => {
        const dateA = a.release_date || a.first_air_date
        const dateB = b.release_date || b.first_air_date
        return new Date(dateA) - new Date(dateB)
      })
      setSortRelease("Earliest")
      setCounterTwo(2)
      setMovies(sorted)
      setIsReleaseEnlarged(true)
    } 
    if (counterTwo === 2) {
      setSortRelease("Release")
      setCounterTwo(0)
      setMovies(originalMovies)
      setIsReleaseEnlarged(false)
    }
  }

  return (
    <div id="searchresultflex">
      <div id="filterflex">
        <button onClick={filterRating} className='filter'>{sortRating}</button>
        <button onClick={filterRelease} className='filter'>{sortRelease}</button>
      </div>
      {movies.length > 1 ? (
        movies.map((x, index) =>
          <div id="searchflex"> 
            <img className="popup" id ="searchresultimage" onClick={() => {handleClick(index)}} src={`https://image.tmdb.org/t/p/w300/${x.poster_path}`} alt="N/A"/>
            <div id="textsearch">
              <h3 id="searchtitle">{x.title ? x.title : x.name} <span className={isReleaseEnlarged ? "enlargerelease" : ""}>({x.release_date ? x.release_date.slice(0,4) : x.first_air_date ? x.first_air_date.slice(0,4) : "N/A"})</span></h3>  
              <p id="moviesearchrating" className={`${getRating(x.vote_average)} ${isRatingEnlarged ? "enlargerating" : ''}`}>{x.vote_average ? x.vote_average.toFixed(1) : "NA"}</p>
            </div>
          </div>
      )) : (
        <h2 id="nothing">No Movies Found</h2>
      )}
    </div>
  )
}


export default App;

