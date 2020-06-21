## NSW Toll Calculator Demo App

This is a toll calculator demo app using the TfNSW Toll Calculator V2 API, built with React.  You can see a demo version running at [demotollcalc.jxeeno.com](https://demotollcalc.jxeeno.com/).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and is deployed on Netlify.

Since the TfNSW API Gateway doesn't support CORS requests, API calls are routed through a CORS proxy hosted on Heroku, based on [cors-anywhere](https://github.com/Rob--W/cors-anywhere).

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The hosted CORS proxy will accept requests with origin https://localhost:3000.

## Learn More

* [Toll Calculator OpenAPI](https://opendata.transport.nsw.gov.au/node/7407/exploreapi)
* [Toll Calculator Dataset](https://opendata.transport.nsw.gov.au/dataset/toll-calculator-api)
* [Toll Calculator Documentation](https://opendata.transport.nsw.gov.au/dataset/toll-calculator-api/resource/d27d1a15-7693-4ebf-988a-b27abcae4a75)
