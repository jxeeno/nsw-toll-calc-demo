import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import ReactMapboxGl, {GeoJSONLayer} from 'react-mapbox-gl';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import { toGeoJSON } from "@mapbox/polyline";

import 'bootstrap/dist/css/bootstrap.min.css';

const Map = ReactMapboxGl({
  accessToken: null
});

const App = () => {
  const [excludeToll, setExcludeToll] = useState(false);
  const [data, setData] = useState();
  const [selectedRoute, setSelectedRoute] = useState();
  const [clickPoint, setClickPoint] = useState();
  const [origin, setOrigin] = useState();
  const [departureTime, setDepartureTime] = useState(new Date());
  const [vehicleClass, setVehicleClass] = useState();
  const [destination, setDestination] = useState();

  useEffect(() => {
    if(!clickPoint){return;}
    if(!origin || (origin && destination)){
      setOrigin(clickPoint)
      setDestination(null)
    }else if(!destination){
      setDestination(clickPoint)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickPoint]);

  useEffect(() => {
    if(origin && destination){
      axios.post('https://nsw-toll-calc-proxy.herokuapp.com/https://api.transport.nsw.gov.au/v2/roads/toll_calc/route', {
        origin, destination, excludeToll,
        vehicleClass: vehicleClass !== '' ? vehicleClass : undefined,
        departureTime: departureTime ? new Date(departureTime).toISOString() : undefined
      }).then(({data}) => {
        setData(data);
        setSelectedRoute(data.routes[0]);
      });
    }
  }, [origin, destination, excludeToll, vehicleClass, departureTime]);

  return (
    <div className="App" style={{display: 'flex', width: '100%', height: '100%'}}>
      <Map
        // eslint-disable-next-line react/style-prop-object
        style="https://static.anytrip.com.au/tiles/basic.json"
        containerStyle={{
          height: '100%',
          flex: 1
        }}
        onClick={(map, event) => {
          setClickPoint(event.lngLat);
        }}
        center={[151.1799323558, -33.8120828603]}
      >
        {selectedRoute && selectedRoute.geometry && <GeoJSONLayer
          data={toGeoJSON(selectedRoute.geometry)}linePaint={{
            "line-color": ['get', 'line-color'],
            'line-width': ['number', ['get', 'line-width'], 3]
          }}/>
        }
        
      </Map>
      <div className="sidebar">
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="#home">
          NSW Toll Calculator
        </Navbar.Brand>
      </Navbar>
      <div className="p-2">
        <div className="alert alert-info">
          This site is a demo app using the <a href="https://opendata.transport.nsw.gov.au/dataset/toll-calculator-api">TfNSW Toll Calculator V2 API</a>.  The source code for this demo app can be found on <a href="https://github.com/jxeeno/nsw-toll-calc-demo">GitHub</a>.
        </div>
        <Form>
          <Form.Group as={Row} className={"no-gutters"} controlId="formPlaintextOrigin">
            <Form.Label size="sm" column sm="4">
              <b>Origin</b>
            </Form.Label>
            <Col sm="8">
              <Form.Control size="sm" plaintext readOnly value={origin ? `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}` : 'click on map to select'} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className={"no-gutters"} controlId="formPlaintextDestination">
            <Form.Label size="sm" column sm="4">
              <b>Destination</b>
            </Form.Label>
            <Col sm="8">
              <Form.Control size="sm" plaintext readOnly value={destination ? `${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}` : 'click on map to select'} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className={"no-gutters"} controlId="formPlaintextDeparture">
            <Form.Label size="sm" column sm="4">
              <b>Departure time</b>
            </Form.Label>
            <Col sm="8">
              <Form.Control size="sm" plaintext value={departureTime} type="datetime-local" onChange={(event) => {setDepartureTime(event.target.value)}} />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className={"no-gutters"} controlId="formSelectClass">
            <Form.Label size="sm" column sm="4">
              <b>Vehicle Class</b>
            </Form.Label>
            <Col sm="8">
              <Form.Control size="sm" as="select" custom onChange={(event) => {setVehicleClass(event.target.value)}} value={vehicleClass}>
                <option value="">None selected</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </Form.Control>
            </Col>
          </Form.Group>

          <Form.Group controlId="formExcludeToll">
            <Form.Check type="checkbox" label="Exclude toll roads" onChange={(event) => {setExcludeToll(event.target.checked)}} checked={excludeToll} />
          </Form.Group>
        </Form>
      </div>

        <ListGroup variant="flush">
          {data && data.routes.map((data, i) => 
            <React.Fragment key={i}>
              <ListGroup.Item action onClick={() => {
                if(selectedRoute && selectedRoute === data){
                  setSelectedRoute(null)
                }else{
                  setSelectedRoute(data)
                }
              }} variant={selectedRoute && selectedRoute === data ? 'secondary' : undefined}>
                <div className="d-flex flex-row">
                  <div className="flex-fill">
                    <div className="text-truncate">
                      <b>{data.summary}</b>
                    </div>
                    <div>
                      {data.minChargeInCents === data.maxChargeInCents ? <span className="text-muted text-small">
                        ${(data.minChargeInCents/100).toFixed(2)}
                      </span> : <span className="text-muted text-small">
                        ${(data.minChargeInCents/100).toFixed(2)} - ${(data.maxChargeInCents/100).toFixed(2)}
                      </span>}
                      {data.isCheapest && <span className="ml-1 badge badge-success">Cheapest</span>}
                      {data.isQuickest && <span className="ml-1 badge badge-info">Quickest</span>}
                      {data.isShortest && <span className="ml-1 badge badge-secondary">Shortest</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-success text-small">{Math.round(data.duration/60)} mins</div>
                    <div className="text-muted text-small">{(data.distance/1000).toFixed(1)} km</div>
                  </div>
                </div>
              </ListGroup.Item>
              {selectedRoute && selectedRoute === data && <ListGroup.Item>
                <table className="table table-bordered table-sm">
                  {selectedRoute.tollsCharged && selectedRoute.tollsCharged.map((t, i) => <tbody key={i}>
                    <tr>
                      <th>{t.gantryVisits[0].gantry.motorwayName}</th>
                      <td rowSpan="2">${(t.charges[0].chargeInCents/100).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td><ul>
                        {t.gantryVisits.map((gantryVisit, i) => {
                          return <li key={i}>{gantryVisit.gantry.gantryName}</li>
                        })}
                        </ul></td>
                    </tr>
                  </tbody>)}
                </table>
              </ListGroup.Item>}
            </React.Fragment>
          )}
        </ListGroup>
      </div>
    </div>
  );
}

export default App;
