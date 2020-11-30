import React, {Component} from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo.js';
import Footer from './components/Footer/Footer.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js'
import SignIn from './components/SignIn/SignIn.js';
import Register from './components/Register/Register.js';


const particlesParam = {
  "particles": {
      "number": {
          "value": 30,
          "density":{
            "enable": true,
            "value_area": 200
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: '',
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: '',
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height= Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: (1-clarifaiFace.right_col) * width,
      bottomRow: (1-clarifaiFace.bottom_row) * height
    };
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://safe-sea-22701.herokuapp.com/imageurl',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      if (response) {
        fetch('https://safe-sea-22701.herokuapp.com/image',{
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
         .then(response => response.json())
         .then(count => {
           this.setState(Object.assign(this.state.user, { entries: count} ))
         })
         .catch(console.log);
      }
      this.displayFaceBox(this.calculateFaceLocation(response));
    })
    .catch(err => console.log(err));
    this.setState({input: ''});
  }

  onRouteChange = (route) => {
    if(route === 'signin'){
      this.setState(initialState)
    }else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render() {
   const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className="App">
        <div className='maincontent'>
        <Particles className='particles' params={particlesParam} />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
          {route === 'home' ?  
            <div>
              <Logo />
              <Rank 
                name={this.state.user.name} 
                entries={this.state.user.entries}/>
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} formReset={this.state.input} />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div> 
            : 
            route ==='signin' ? 
            <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            :
            <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          }
         
        </div>
        <Footer className='mainfooter' />
      </div>
    );
  }
}

export default App;
