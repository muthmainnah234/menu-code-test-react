import React from 'react';
import { render } from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import {Jumbotron, Container, Row, Col, Input, FormGroup, Label, Button} from 'reactstrap';
import menuData from '../menu-data.json';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: {
        diner1: {
          starter: '',
          main: '',
          dessert: ''
        },
        diner2: {
          starter: '',
          main: '',
          dessert: ''
        },
      },
      menu: '',
      selectedMenu: 0,
      selectedDiner: 0,
    };
  }

  componentDidMount() {
    let menu = [];
    for (var key in menuData) {
      menuData[key].forEach(dish => {
        dish.course = key.slice(0,-1);
        menu.push(dish);
      });
    }
    console.log(menu);
    this.setState({menu});
  }

  getMenuById = (id) => {
    let dish = this.state.menu.find(item => (item.id == id));
    if (dish) {
      return dish;
    } else {
      return null;
    }
  }

  handleSelectDish = (e) => {
    if (this.state.selectedMenu != e.target.name) {
      this.setState({selectedMenu: e.target.name});
    } else {
      this.setState({selectedMenu: 0});
    }
  }

  handleSelectDiner = (e) => {
    if (this.state.selectedDiner != e.target.name) {
      this.setState({selectedDiner: e.target.name});
    } else {
      this.setState({selectedDiner: 0});
    }
  }

  handleAddOrder = (e) => {
    e.preventDefault();
    const {selectedMenu, selectedDiner} = this.state;
    if (selectedMenu==0) {
      alert('Please select a menu to add');
    } else if (selectedDiner==0) {
      alert('Please select a specific diner for the menu');
    } else {
      console.log(selectedMenu + ' for ' + selectedDiner);
      let dish = this.getMenuById(selectedMenu);
      if (dish) {
        let newOrder = this.state.order;
        newOrder[selectedDiner][dish.course] = selectedMenu;
        this.setState({order: newOrder});
      } else {
        alert('Invalid menu');
      }
    }
  }

	render() {
		return(
			<Container>
        <Row>
          <Col>
            <Jumbotron>
              <h1>Open Table</h1>
            </Jumbotron>
          </Col>
        </Row>

        <Row className="my-3">
          <Col>
            <h2>Select Menu</h2>
            <Row>
            {
              Object.keys(menuData).map(course => {
                return(
                  <Col key={course}>
                    <FormGroup tag="fieldset">
                    <legend>{course}</legend>
                      {
                        menuData[course].map(item => {
                          return(
                            <FormGroup check key={item.id}>
                              <Label check>
                              <Input type="radio" name={item.id} checked={this.state.selectedMenu==item.id} onClick={this.handleSelectDish}/> {item.name} (${item.price})
                              </Label>
                            </FormGroup>
                          );
                        })
                      }
                    </FormGroup>
                  </Col>
                );
              })
            }
            </Row>
          </Col>
        </Row>

        <Row className="my-3">
          <Col>
            <h2>Select Diner</h2>
            <FormGroup tag="fieldset">
              <FormGroup check>
                <Label check>
                <Input type="radio" name="diner1" checked={this.state.selectedDiner=='diner1'} onClick={this.handleSelectDiner}/>Diner 1
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                <Input type="radio" name="diner2" checked={this.state.selectedDiner=='diner2'} onClick={this.handleSelectDiner}/>Diner 2
                </Label>
              </FormGroup>
            </FormGroup>
          </Col>
        </Row>

        <Row className="my-3">
          <Col>
            <Button onClick={this.handleAddOrder}>Add Order</Button>
          </Col>
        </Row>

        <Row className="my-3">
          <Col>
            <h2>Order</h2>
            <Row>
              <Col md={6}>
                <legend>Diner 1</legend>
                <ul>
                {
                  Object.keys(this.state.order.diner1).map((course) => {
                    const dish = this.state.order.diner1[course];
                    if (dish != '') return <li key={course}>{course}: {this.getMenuById(dish).name}</li>;
                  })
                }
                </ul>
              </Col>
              <Col md={6}>
                <legend>Diner 2</legend>
                <ul>
                {
                  Object.keys(this.state.order.diner2).map((course) => {
                    const dish = this.state.order.diner2[course];
                    if (dish != '') return <li key={course}>{course}: {this.getMenuById(dish).name}</li>;
                  })
                }
                </ul>
              </Col>
            </Row>
          </Col>
        </Row>
			</Container>
		);
	}
}

render(<App />, document.getElementById('root'));
