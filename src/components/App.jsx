import React from 'react';
import { observer } from 'mobx-react';
import Signer from './Signer';
import { Header, Navbar, Alert, Tabs, Tab, Grid, Row, Col } from 'react-bootstrap';
import logo from '../../images/logo.svg';


@observer
class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {

    let store = this.store;

    return (

      <Grid>
        <Row>
          <Col md={12}>

              <header>
                <Navbar>
                  <Navbar.Header>
                    <Navbar.Brand>
                      <div className="logo-container">
                        <div className="logo-badge">
                          <img className="logo" src={logo} alt="Ethereum TX Builder Logo" />
                          <span className="badge-text">TXBuilder</span>
                        </div>
                        <span className="logo-text">Ethereum TX Builder</span>
                      </div>
                    </Navbar.Brand>
                  </Navbar.Header>
                </Navbar>
              </header>

           </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Signer />
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <footer>
              <hr />
              <p className="text-center text-muted">
                Ethereum TX Builder
              </p>
            </footer>
          </Col>
        </Row>
      </Grid>
    );
  }
}

App.propTypes = {
  store: React.PropTypes.object,
};

export default App;
