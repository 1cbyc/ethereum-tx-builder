import React from 'react';
import { observer } from 'mobx-react';
import Signer from './Signer';
import { Header, Navbar, Alert, Tabs, Tab, Grid, Row, Col } from 'react-bootstrap';
import logo from '../../images/logo.svg';
import { getTheme, setTheme, applyTheme } from '../theme';


@observer
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: getTheme(),
    };
  }

  componentDidMount() {
    applyTheme(this.state.theme);
  }

  toggleTheme = () => {
    const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    this.setState({ theme: newTheme });
  }

  render() {

    let store = this.store;

    return (

      <Grid>
        <button
          className="theme-toggle"
          onClick={this.toggleTheme}
          title={`Switch to ${this.state.theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {this.state.theme === 'light' ? '🌙' : '☀️'}
        </button>
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
