import location from './location';

const minRequestIntervalMs = 100;
const maxRequestIntervalMs = 1000;
const requestIntervalStepMs = 100;

export default class DirectionsLoader {
  constructor(directionsService) {
    this.directionsService = directionsService;

    this.requestQueue = [];
    this.loadTimeout = null;
    this.requestIntervalMs = minRequestIntervalMs;
    this.numSuccessfulRequests = 0;
  }

  clear() {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
      this.requestQueue = [];
    }
  }

  loadRouteAtDate(date, navigateToWork, loadFn) {
    this.loadRoute(date, 'bestguess', navigateToWork, loadFn);
    this.loadRoute(date, 'pessimistic', navigateToWork, loadFn);
    this.loadRoute(date, 'optimistic', navigateToWork, loadFn);
  }

  loadRoute(date, trafficModel, navigateToWork, loadFn) {
    const home = location.home;
    const work = location.work;

    const request = {
      destination: navigateToWork ? work : home,
      origin: navigateToWork ? home : work,
      travelMode: 'DRIVING',
      drivingOptions: {
        departureTime: date,
        trafficModel: trafficModel
      },
    };

    this.queueRequest(date, trafficModel, request, loadFn);
  }

  queueRequest(date, trafficModel, request, loadFn) {
    const parameters = { date: date, trafficModel: trafficModel, request: request, loadFn: loadFn };
    this.requestQueue.push(parameters);

    this.scheduleRequest();
  }

  scheduleRequest() {
    if (this.requestQueue.length && !this.loadTimeout) {
      this.loadTimeout = setTimeout(this.drainQueue.bind(this), this.requestIntervalMs)
    }
  }

  drainQueue() {
    if (this.requestQueue.length === 0) {
      return;
    }

    const request = this.requestQueue[0];

    const wrappedLoadFn = (response, status) => {
      this.loadTimeout = null;
      if (status === 'OK') {
        this.numSuccessfulRequests++;
        if (this.requestIntervalMs > minRequestIntervalMs && this.numSuccessfulRequests > 3) {
          this.requestIntervalMs -= requestIntervalStepMs;
        }
        this.requestQueue = this.requestQueue.slice(1);
        request.loadFn(request.date, request.trafficModel, response, status);
      } else {
        this.numSuccessfulRequests = 0;
        if (this.requestIntervalMs < maxRequestIntervalMs) {
          this.requestIntervalMs += requestIntervalStepMs;
        }
        console.log(`retrying: ${status}`);
      }

      this.scheduleRequest();
    };

    console.log(`loading for ${request.request.drivingOptions.departureTime}, ${request.request.drivingOptions.trafficModel}`);
    this.directionsService.route(request.request, wrappedLoadFn);
  }
};
