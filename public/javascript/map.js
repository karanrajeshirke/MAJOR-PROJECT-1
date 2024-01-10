
    mapboxgl.accessToken =mapToken;
    const map = new mapboxgl.Map({
    container: 'map', // container ID
    style:"mapbox://styles/mapbox/dark-v11",
    center: coordinates, // starting position [lng, lat]
    zoom: 11 // starting zoom
    });

    console.log(coordinates)

const marker1 = new mapboxgl.Marker({ color: 'red'})
.setLngLat(coordinates)
.addTo(map);