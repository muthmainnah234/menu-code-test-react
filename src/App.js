import React from 'react';
import { render } from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import {Jumbotron, Container, Row, Col, Input, FormGroup, Label, Button, Alert, Toast, ToastBody, ToastHeader} from 'reactstrap';
import menuData from '../menu-data.json';
import './App.css';

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
      billAmount: 0,
      alert1: {
        message: '',
        color: 'danger'
      },
      alert2: {
        message: '',
        color: 'danger'
      },
      bills: []
    };
  }

  componentDidMount() {
    let menu = [];
    for (var key in menuData) {
      menuData[key].forEach(dish => {
        dish.course = key.slice(0,-1);
        if (dish.id==11) {
          dish.stock = 1;
        } else {
          dish.stock = 2;
        }
        menu.push(dish);
      });
    }
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

  getOrderRulesViolation = (order) => {
    let rulesViolation = [];
    for (var diner in order) {
      let numCourses = 0;
      for (var course in order[diner]) {
        if (order[diner][course]!='') {
          numCourses++;
        } 
      }
      if (numCourses < 2) {
        rulesViolation.push(`Minimal 2 courses must be selected for ${diner}.`)
      }
      if (order[diner].main=='') {
        rulesViolation.push(`Main course must be selected for ${diner}.`);          
      }
      if (order[diner].starter==4 && order[diner].main==7) {
        rulesViolation.push('You cannot have Prawn Cocktail and Salmon Fillet at the same meal.');
      }
    }
    return rulesViolation;
  }

  sendAlert = (message, type, color='danger') => {
    let alertStatus = {
      message,
      color
    }

    if (type=='add') {
      this.setState({alert1: alertStatus});
    } else if (type='submit') {
      this.setState({alert2: alertStatus});
    }
  }

  updateBills = (order) => {
    let bills = []
    let billAmount = 0;
    for (var diner in order) {
      for (var course in order[diner]) {
        const dishId = order[diner][course];
        if (dishId != '') {
          var dishData = this.getMenuById(dishId);
          var idx = bills.findIndex(item => (item.id==dishData.id));
          if (bills[idx]) {
            bills[idx].count += 1;
            billAmount += bills[idx].price;
          } else {
            let bill = Object.assign({},dishData);
            bill.count = 1;
            bills.push(bill);
            billAmount += dishData.price;
          }
        }
      }
    }
    this.setState({bills, billAmount});
  }

  handleAddOrder = (e) => {
    e.preventDefault();
    const {selectedMenu, selectedDiner} = this.state;
    if (selectedMenu==0) {
      this.sendAlert('Please select a menu to add.','add');
    } else if (selectedDiner==0) {
      this.sendAlert('Please select a specific diner for the menu.','add');
    } else {
      let dish = this.getMenuById(selectedMenu);
      if (dish) {
        if (this.state.order[selectedDiner][dish.course]!='') {
          this.sendAlert('You cannot choose more than one of the same course per diner.','add');
        } else if (dish.stock<1) {
          this.sendAlert('Insufficient stock for '+dish.name,'add');
        } else {
          let newOrder = this.state.order;
          newOrder[selectedDiner][dish.course] = selectedMenu;
          let updatedMenu = this.state.menu;
          const idx = updatedMenu.findIndex(item => (item.id==dish.id));
          updatedMenu[idx].stock -= 1;
          this.setState({
            order: newOrder, 
            menu: updatedMenu
          }, () => {
            this.sendAlert('','add');
            this.updateBills(newOrder);
          });
        }
      } else {
        this.sendAlert('Invalid menu','add');
      }
    }
  }

  handleSubmitOrder = (e) => {
    e.preventDefault();
    const messages = this.getOrderRulesViolation(this.state.order);
    if (messages.length>0) {
      this.sendAlert(messages.join('\n'),'submit');
    } else {
      this.sendAlert('','add');
      this.sendAlert(`Order submitted with total bill amount of $${this.state.billAmount}`,'submit','success');
    }
  }

  handleRemoveOrder = (diner,course) => {
    let newOrder = this.state.order;
    const dishId = newOrder[diner][course];
    newOrder[diner][course] = '';
    let updatedMenu = this.state.menu;
    const idx = updatedMenu.findIndex(item => (item.id==dishId));
    updatedMenu[idx].stock += 1;
    
    this.setState({order: newOrder, menu: updatedMenu}, () => this.updateBills(newOrder));
  }

	render() {
		return(
			<Container>
        <Jumbotron className="text-center">
          <div className="blur-layer">
            
            <h1 className="display-3">Open Table</h1>
          </div>
        </Jumbotron>

        <Row className="section my-5 mx-1">
          <Col>
            <Row className="my-3">
              <Col>
                <h2>Select Menu</h2>
                <Row>
                {
                  Object.keys(menuData).map(course => {
                    return(
                      <Col key={course} md={4}>
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
            <Alert isOpen={this.state.alert1.message!=''} className="my-3" color={this.state.alert1.color}>{this.state.alert1.message}</Alert>
          </Col>
        </Row>

        <Row className="section my-5 mx-1">
          <Col>
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
                        if (dish != '') return <li key={course}><span>({course}) {this.getMenuById(dish).name} <span className="delete" onClick={() => this.handleRemoveOrder('diner1',course)}>x</span></span></li>;
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
                        if (dish != '') return <li key={course}><span>({course}) {this.getMenuById(dish).name} <span className="delete" onClick={() => this.handleRemoveOrder('diner2',course)}>x</span></span></li>;
                      })
                    }
                    </ul>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        
        <Row className="section my-5 mx-1">
          <Col>
            <Row className="my-3">
              <Col>
                <h2>Bill Amount</h2>
                <ul>
                  {
                    this.state.bills.map(item => {
                      return(
                        <li key={item.id}>
                          {item.name} (${item.price}) x {item.count} = ${item.price*item.count}
                        </li>
                      );
                    })
                  }
                </ul>
                <h3>Total : ${this.state.billAmount}</h3>
              </Col>
            </Row>

            <Row className="my-3">
              <Col>
                <Button onClick={this.handleSubmitOrder}>Submit Order</Button>
              </Col>
            </Row>
            <Alert isOpen={this.state.alert2.message!=''} className="my-3" color={this.state.alert2.color}>{this.state.alert2.message}</Alert>
          </Col>
        </Row>
			</Container>
		);
	}
}

render(<App />, document.getElementById('root'));
