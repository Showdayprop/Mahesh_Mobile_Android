export const environment = {
  production: false, // set TRUE before you build and release a prod version.
  // Set your app configurations here.
  // For the list of config options, please refer to https://ionicframework.com/docs/api/config/Config/
  config: {
    autoFocusAssist: false,
    menuType: 'overlay',
    apiEndPoint: 'https://api.showday.com/index.php/',
    apiWebEndPoint: 'https://www.showday.com/',
    gApiKey: 'AIzaSyDgvg_c1t2I9Ft6eWvXrL1cqbr7uxpvKF8',
    storagePath: "https://www.showday.com/storage/",
    deepLinkPrefix: "https://showday.page.link",
    appIdentifier: 'com.properties.showday',
    iosAppStoreId: "1508554476",
    baseStorageUrl: 'https://www.showday.com',
    nodeServerEndPoint: 'https://node.showday.com'
  },
  client_id: "74844896399-f24hhdnp9578ojmaikvelds9gcfu0661.apps.googleusercontent.com",
  firebase: {
    apiKey: "AIzaSyDgvg_c1t2I9Ft6eWvXrL1cqbr7uxpvKF8",
    authDomain: "showday-a4b59.firebaseapp.com",
    databaseURL: "https://showday-a4b59.firebaseio.com",
    projectId: "showday-a4b59",
    storageBucket: "showday-a4b59.appspot.com",
    messagingSenderId: "74844896399",
    appId: "1:74844896399:web:644d09990d4f260f13c4fa",
  },
  loggingEnabled: true,
  inDeviceLogging: false,
  // Set language to use.
  language: 'en',
  // Loading Configuration.
  // Please refer to the official Loading documentation here: https://ionicframework.com/docs/api/components/loading/LoadingController/
  loading: {
    spinner: 'circles'
  },
  // Toast Configuration.
  // Please refer to the official Toast documentation here: https://ionicframework.com/docs/api/components/toast/ToastController/
  toast: {
    position: 'bottom' // Position of Toast, top, middle, or bottom.
  },
  toastDuration: 3000, // Duration (in milliseconds) of how long toast messages should show before they are hidden.
  defaultFilters: {
    "requirement": "sale",
    "areas": [
      "10", "31", "9", "65", "217", "218","51","57","33","38"
    ],
    "selectedAreas": [
      {
        "area": "Sunninghill",
        "area_id": "10",
        "city_id": "48348",
        "city": "Sandton",
        "state_id": "4123",
        "state": "Gauteng",
        "country_id": "202",
        "c_code": "ZA",
        "country": "South Africa"
      },
      {
        "area": "Morningside",
        "area_id": "31",
        "c_code": "ZA",
        "city": "Sandton",
        "city_id": "48348",
        "country": "South Africa",
        "country_id": "202",
        "state": "Gauteng",
        "state_id": "4123"
      },
      {
        "area": "Morningside Manor",
        "area_id": "9",
        "c_code": "ZA",
        "city": "Sandton",
        "city_id": "48348",
        "country": "South Africa",
        "country_id": "202",
        "state": "Gauteng",
        "state_id": "4123"
      },
      {
        "area": "Rivonia",
        "area_id": "65",
        "c_code": "ZA",
        "city": "Sandton",
        "city_id": "48348",
        "country": "South Africa",
        "country_id": "202",
        "state": "Gauteng",
        "state_id": "4123"
      },
      {
        "area": "Sandown",
        "area_id": "217",
        "c_code": "ZA",
        "city": "Sandton",
        "city_id": "48348",
        "country": "South Africa",
        "country_id": "202",
        "state": "Gauteng",
        "state_id": "4123"
      },
      {
        "area": "Gallo Manor",
        "area_id": "218",
        "c_code": "ZA",
        "city": "Sandton",
        "city_id": "48348",
        "country": "South Africa",
        "country_id": "202",
        "state": "Gauteng",
        "state_id": "4123"
      },{
        "area": "Khyber Rock",
        "area_id": "51",
        "city_id": "48348",
        "city": "Sandton",
        "state_id": "4123",
        "state": "Gauteng",
        "country_id": "202",
        "c_code": "ZA",
        "country": "South Africa"
      },{
        "area": "Barbeque Downs",
        "area_id": "57",
        "city_id": "48348",
        "city": "Sandton",
        "state_id": "4123",
        "state": "Gauteng",
        "country_id": "202",
        "c_code": "ZA",
        "country": "South Africa"
      },{
        "area": "Woodmead",
        "area_id": "33",
        "city_id": "48348",
        "city": "Sandton",
        "state_id": "4123",
        "state": "Gauteng",
        "country_id": "202",
        "c_code": "ZA",
        "country": "South Africa"
      },{
        "area": "Kyalami",
        "area_id": "38",
        "city_id": "48354",
        "city": "Midrand",
        "state_id": "4123",
        "state": "Gauteng",
        "country_id": "202",
        "c_code": "ZA",
        "country": "South Africa"
      }
    ],
    "is_active": true
  },
  // Angular Google Maps Styles Config
  agmStyles: [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#1d2c4d'
        }
      ]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#8ec3b9'
        }
      ]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1a3646'
        }
      ]
    },
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#4b6878'
        }
      ]
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#64779e'
        }
      ]
    },
    {
      featureType: 'administrative.province',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#4b6878'
        }
      ]
    },
    {
      featureType: 'landscape.man_made',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#334e87'
        }
      ]
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [
        {
          color: '#023e58'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        {
          color: '#283d6a'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#6f9ba5'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#023e58'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#3C7680'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#304a7d'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#98a5be'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [
        {
          color: '#2c6675'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#255763'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#b0d5ce'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#023e58'
        }
      ]
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#98a5be'
        }
      ]
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#1d2c4d'
        }
      ]
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry.fill',
      stylers: [
        {
          color: '#283d6a'
        }
      ]
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [
        {
          color: '#3a4762'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#0e1626'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#4e6d70'
        }
      ]
    }
  ]
  // //
}